import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'efficience-jwt-secret-key-2026-production-secure'
)

export interface AuthUser {
  userId: string
  role: string
  twoFactorVerified: boolean
}

/**
 * 🔐 Vérifie l'authentification côté serveur
 * Retourne l'utilisateur si authentifié avec 2FA, sinon null
 */
export async function verifyServerAuth(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      console.log('🔒 Auth: Pas de token')
      return null
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Vérifier que la 2FA a été validée
    if (!payload.twoFactorVerified) {
      console.log('🔒 Auth: 2FA non validée')
      return null
    }
    
    console.log('✅ Auth: Utilisateur authentifié', payload.userId)
    return {
      userId: payload.userId as string,
      role: payload.role as string,
      twoFactorVerified: payload.twoFactorVerified as boolean,
    }
  } catch (error) {
    console.log('🔒 Auth: Token invalide', error)
    return null
  }
}
