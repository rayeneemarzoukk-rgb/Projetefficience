// ============================================================
// 🔒 API AUTH GUARD — Double protection côté serveur
// ============================================================
// Ce module vérifie le cookie auth_token JWT + 2FA sur chaque API route protégée.
// Le middleware Next.js fait déjà la première vérification, mais ce guard
// ajoute une DEUXIÈME couche de sécurité au niveau de chaque route.
// ============================================================

import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'efficience-jwt-secret-key-2026-production-secure'
)

export interface AuthUser {
  userId: string
  role: string
  twoFactorVerified: boolean
}

export interface AuthResult {
  authenticated: boolean
  user: AuthUser | null
  error?: string
}

/**
 * 🔐 Vérifie l'authentification JWT + 2FA depuis le cookie auth_token.
 * Utiliser dans chaque API route protégée :
 * 
 * ```ts
 * export async function GET() {
 *   const auth = await requireAuth()
 *   if (!auth.authenticated) return auth.response!
 *   // ... logique protégée
 * }
 * ```
 */
export async function verifyApiAuth(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return {
        authenticated: false,
        user: null,
        error: 'Pas de token d\'authentification',
      }
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)

    if (!payload.userId) {
      return {
        authenticated: false,
        user: null,
        error: 'Token invalide - userId manquant',
      }
    }

    if (!payload.twoFactorVerified) {
      return {
        authenticated: false,
        user: null,
        error: 'Authentification 2FA non validée',
      }
    }

    return {
      authenticated: true,
      user: {
        userId: payload.userId as string,
        role: (payload.role as string) || 'user',
        twoFactorVerified: true,
      },
    }
  } catch (error) {
    return {
      authenticated: false,
      user: null,
      error: 'Token expiré ou invalide',
    }
  }
}

/**
 * 🔒 Guard qui retourne directement une Response 401 si non authentifié.
 * Usage simplifié dans les routes :
 * 
 * ```ts
 * export async function GET() {
 *   const auth = await requireAuth()
 *   if (auth.response) return auth.response  // 401 auto
 *   const user = auth.user!                  // Utilisateur garanti
 *   // ... suite
 * }
 * ```
 */
export async function requireAuth(): Promise<{
  user: AuthUser | null
  response?: NextResponse
}> {
  const result = await verifyApiAuth()

  if (!result.authenticated) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: result.error || 'Non authentifié',
          redirectTo: '/login',
        },
        { status: 401 }
      ),
    }
  }

  return { user: result.user }
}

/**
 * 🛡️ Guard admin — Vérifie l'auth + que l'utilisateur a le rôle admin
 */
export async function requireAdmin(): Promise<{
  user: AuthUser | null
  response?: NextResponse
}> {
  const auth = await requireAuth()
  
  if (auth.response) return auth

  if (auth.user?.role !== 'admin') {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: 'Accès réservé aux administrateurs',
        },
        { status: 403 }
      ),
    }
  }

  return auth
}
