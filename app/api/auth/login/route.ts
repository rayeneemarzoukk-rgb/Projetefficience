import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { comparePassword } from "@/lib/auth-utils"

const MONGODB_URI = process.env.MONGODB_URI || ''
const DB_NAME = process.env.MONGODB_DB || 'rayan_dev2'

// 🔐 ROUTE DE CONNEXION - DÉSACTIVÉE (2FA OBLIGATOIRE)
// ⚠️ Cette route ne donne plus de token directement
// Utilisez /api/auth/login-2fa puis /api/auth/verify-otp
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation des données
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email et mot de passe requis" }, { status: 400 })
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Format d'email invalide" }, { status: 400 })
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

    await client.close()

    // 🔒 SÉCURITÉ: Ne plus donner de token sans 2FA
    // Renvoyer un message indiquant que la 2FA est obligatoire
    return NextResponse.json({
      success: true,
      message: "Identifiants corrects. Authentification 2FA requise.",
      requiresTwoFactor: true,
      redirectTo: "/api/auth/login-2fa",
      hint: "Utilisez /api/auth/login-2fa pour recevoir le code de vérification"
    })

  } catch (error) {
    console.error("Erreur connexion:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur lors de la connexion" }, { status: 500 })
  }
}
