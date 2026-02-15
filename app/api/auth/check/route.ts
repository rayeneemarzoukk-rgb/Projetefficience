import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'efficience-jwt-secret-key-2026-production-secure'
)

// 🔐 API de vérification d'authentification + 2FA
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ 
        authenticated: false, 
        twoFactorVerified: false,
        error: 'Pas de token' 
      }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)

    if (!payload.userId || !payload.role) {
      return NextResponse.json({ 
        authenticated: false, 
        twoFactorVerified: false,
        error: 'Token invalide' 
      }, { status: 401 })
    }

    if (!payload.twoFactorVerified) {
      return NextResponse.json({ 
        authenticated: true, 
        twoFactorVerified: false,
        error: '2FA non validée' 
      }, { status: 403 })
    }

    return NextResponse.json({ 
      authenticated: true, 
      twoFactorVerified: true,
      user: {
        userId: payload.userId,
        role: payload.role,
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      authenticated: false, 
      twoFactorVerified: false,
      error: 'Token expiré ou invalide' 
    }, { status: 401 })
  }
}
