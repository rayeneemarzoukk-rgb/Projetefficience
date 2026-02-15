import { NextRequest, NextResponse } from 'next/server'
import { getUsersCollection } from '@/lib/db-admin'
import { comparePassword, generateToken, verifyToken } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    const usersCollection = await getUsersCollection()
    const user = await usersCollection.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est actif et admin
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Compte désactivé' },
        { status: 403 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès administrateur requis' },
        { status: 403 }
      )
    }

    // Comparer les mots de passe
    const passwordMatch = await comparePassword(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // 🔒 SÉCURITÉ: Ne plus donner de token directement - 2FA obligatoire
    // Rediriger vers le flux 2FA standard
    return NextResponse.json(
      {
        success: true,
        message: 'Identifiants corrects. Authentification 2FA requise.',
        requiresTwoFactor: true,
        redirectTo: '/api/auth/login-2fa',
        admin: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Erreur de connexion:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
