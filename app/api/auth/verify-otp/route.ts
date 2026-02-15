import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { generateToken } from "@/lib/auth-utils"
import { sendLoginNotificationEmail } from "@/lib/email-service"

const MONGODB_URI = process.env.MONGODB_URI || ''
const DB_NAME = process.env.MONGODB_DB || 'rayan_dev2'

// 📧 Email admin pour recevoir les notifications
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "maarzoukrayan3@gmail.com"

// 🔐 ÉTAPE 2: Vérification du code OTP
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ 
        success: false, 
        error: "Email et code requis" 
      }, { status: 400 })
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db(DB_NAME)

    // Récupérer le code OTP
    const otpRecord = await db.collection('login_otp').findOne({
      email: email.toLowerCase(),
    })

    if (!otpRecord) {
      await client.close()
      return NextResponse.json({ 
        success: false, 
        error: "Session expirée. Veuillez vous reconnecter." 
      }, { status: 401 })
    }

    // Vérifier le nombre de tentatives
    if (otpRecord.attempts >= 3) {
      await db.collection('login_otp').deleteOne({ email: email.toLowerCase() })
      await client.close()
      return NextResponse.json({ 
        success: false, 
        error: "Trop de tentatives. Veuillez vous reconnecter." 
      }, { status: 429 })
    }

    // Vérifier l'expiration
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await db.collection('login_otp').deleteOne({ email: email.toLowerCase() })
      await client.close()
      return NextResponse.json({ 
        success: false, 
        error: "Code expiré. Veuillez vous reconnecter." 
      }, { status: 401 })
    }

    // Vérifier le code
    if (otpRecord.code !== code) {
      // Incrémenter les tentatives
      await db.collection('login_otp').updateOne(
        { email: email.toLowerCase() },
        { $inc: { attempts: 1 } }
      )
      await client.close()
      return NextResponse.json({ 
        success: false, 
        error: `Code incorrect. ${2 - otpRecord.attempts} tentatives restantes.` 
      }, { status: 401 })
    }

    // ✅ Code correct - Récupérer les infos utilisateur
    const user = await db.collection('users').findOne({ _id: otpRecord.userId })

    if (!user) {
      await client.close()
      return NextResponse.json({ 
        success: false, 
        error: "Utilisateur non trouvé" 
      }, { status: 404 })
    }

    // Supprimer le code OTP utilisé
    await db.collection('login_otp').deleteOne({ email: email.toLowerCase() })

    // Enregistrer la connexion dans l'historique
    const loginInfo = {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      loginAt: new Date(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }

    await db.collection('login_history').insertOne(loginInfo)

    // Mettre à jour la dernière connexion de l'utilisateur
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    )

    await client.close()

    // 📧 Envoyer notification email à Rayene
    try {
      await sendLoginNotificationEmail(
        ADMIN_NOTIFICATION_EMAIL,
        {
          userName: user.name || 'Utilisateur',
          userEmail: user.email,
          userRole: user.role,
          loginTime: new Date().toLocaleString('fr-FR', { 
            timeZone: 'Europe/Paris',
            dateStyle: 'full',
            timeStyle: 'medium'
          }),
          ipAddress: loginInfo.ip,
        }
      )
      console.log(`📧 Notification de connexion envoyée à ${ADMIN_NOTIFICATION_EMAIL}`)
    } catch (emailError) {
      console.error("❌ Erreur envoi notification:", emailError)
      // Ne pas bloquer la connexion si l'email échoue
    }

    // Générer le token avec flag 2FA vérifié
    const token = generateToken(user._id.toString(), user.role, true)

    console.log(`✅ Connexion 2FA réussie: ${user.email} (${user.role})`)

    // Réponse avec token
    const response = NextResponse.json({
      success: true,
      message: "Authentification réussie",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || 'Utilisateur',
        role: user.role,
      },
    })

    // Ajouter le token dans un cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 jours
    })

    return response

  } catch (error) {
    console.error("Erreur vérification OTP:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Erreur serveur" 
    }, { status: 500 })
  }
}
