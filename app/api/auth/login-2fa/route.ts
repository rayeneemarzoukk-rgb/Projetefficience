import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { comparePassword, generateToken } from "@/lib/auth-utils"
import { generateVerificationCode, sendOTPEmail } from "@/lib/email-service"

export const dynamic = 'force-dynamic'

const MONGODB_URI = process.env.MONGODB_URI || ''
const DB_NAME = process.env.MONGODB_DB || 'rayan_dev2'

// 📱 Numéro de téléphone autorisé pour validation (format international)
const AUTHORIZED_PHONE = process.env.AUTHORIZED_PHONE || "92360603"
// 📧 Email admin pour recevoir les codes OTP
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "maarzoukrayan3@gmail.com"

// 🔐 ÉTAPE 1: Vérification des identifiants + Génération code OTP
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation des données
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: "Email et mot de passe requis" 
      }, { status: 400 })
    }

    // Connexion MongoDB
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db(DB_NAME)

    // Chercher l'utilisateur
    const user = await db.collection('users').findOne({
      email: email.toLowerCase(),
    })

    if (!user) {
      await client.close()
      return NextResponse.json({ 
        success: false, 
        error: "Email ou mot de passe incorrect" 
      }, { status: 401 })
    }

    // Vérifier le mot de passe
    const passwordMatch = await comparePassword(password, user.password)

    if (!passwordMatch) {
      await client.close()
      return NextResponse.json({ 
        success: false, 
        error: "Email ou mot de passe incorrect" 
      }, { status: 401 })
    }

    // ✅ Identifiants corrects - Générer code OTP
    const otpCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Stocker le code OTP en base
    await db.collection('login_otp').updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          email: email.toLowerCase(),
          code: otpCode,
          phone: AUTHORIZED_PHONE,
          expiresAt,
          verified: false,
          userId: user._id,
          userName: user.name || 'Utilisateur',
          userRole: user.role,
          createdAt: new Date(),
          attempts: 0,
        },
      },
      { upsert: true }
    )

    await client.close()

    console.log(`🔐 Code OTP généré pour ${email}: ${otpCode}`)

    // 📧 Envoyer le code OTP par email à l'admin
    try {
      await sendOTPEmail(ADMIN_NOTIFICATION_EMAIL, otpCode, AUTHORIZED_PHONE)
      console.log(`📧 Code OTP envoyé à ${ADMIN_NOTIFICATION_EMAIL}`)
    } catch (emailError) {
      console.error("❌ Erreur envoi email OTP:", emailError)
      return NextResponse.json({ 
        success: false, 
        error: "Impossible d'envoyer le code de sécurité. Veuillez contacter l'administrateur." 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Identifiants vérifiés. Code de sécurité envoyé.",
      requiresOTP: true,
      email: email.toLowerCase(),
      // En dev, on renvoie le code (à retirer en prod!)
      ...(process.env.NODE_ENV === 'development' && { devCode: otpCode }),
    })

  } catch (error) {
    console.error("Erreur login 2FA:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Erreur serveur" 
    }, { status: 500 })
  }
}
