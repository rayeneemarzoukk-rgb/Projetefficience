import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'efficience-jwt-secret-key-2026-production-secure'
)

// ========================================
// 🔓 PAGES PUBLIQUES - Accès sans login
// ========================================
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/verify-login',
  '/unauthorized',
  '/setup',
  '/admin/login',
]

// ========================================
// 🔓 API PUBLIQUES - Accès sans login (auth endpoints)
// ========================================
const PUBLIC_API_PREFIXES = [
  // Auth endpoints (login flow)
  '/api/auth/login',
  '/api/auth/login-2fa',
  '/api/auth/register',
  '/api/auth/verify-otp',
  '/api/auth/verify-code',
  '/api/auth/send-verification',
  '/api/auth/check',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/auth/setup',
  '/api/init',
  // Admin auth endpoints
  '/api/admin/login',
  '/api/admin/logout',
  '/api/admin/verify',
  '/api/admin/init',
  // Webhooks N8N (protégés par leur propre token Bearer)
  '/api/admin/import',
  '/api/admin/webhook-n8n',
  '/api/admin/trigger-sync',
]

function isPublicPage(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname)
}

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js')
  )
}

// ========================================
// 🔐 VÉRIFICATION JWT + 2FA
// ========================================
async function verifyAuth(request: NextRequest): Promise<{ valid: boolean; payload?: any }> {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return { valid: false }
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Le token DOIT contenir userId ET twoFactorVerified = true
    if (!payload.userId || !payload.twoFactorVerified) {
      return { valid: false }
    }

    return { valid: true, payload }
  } catch {
    return { valid: false }
  }
}

// ========================================
// 🔒 MIDDLEWARE - Protection TOTALE (pages + API)
// ========================================
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // ✅ Fichiers statiques → passer
  if (isStaticAsset(path)) {
    return NextResponse.next()
  }

  // ✅ Pages publiques (login, register, etc.) → passer
  if (isPublicPage(path)) {
    return NextResponse.next()
  }

  // ✅ API publiques (auth endpoints) → passer
  if (isPublicApi(path)) {
    return NextResponse.next()
  }

  // ========================================
  // 🔒 TOUT LE RESTE EST PROTÉGÉ
  // ========================================
  const { valid } = await verifyAuth(request)

  if (!valid) {
    // --- API PROTÉGÉE → retourner 401 JSON ---
    if (path.startsWith('/api')) {
      console.log('🔒 API BLOQUÉE:', path, '- Non authentifié')
      return NextResponse.json(
        { success: false, error: 'Non authentifié. Connectez-vous via /login.' },
        { status: 401 }
      )
    }

    // --- PAGE PROTÉGÉE → rediriger vers /login ---
    console.log('🔒 PAGE BLOQUÉE:', path, '- Non authentifié')
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_token')
    return response
  }

  // ✅ Authentifié + 2FA valide → ajouter headers de sécurité
  const response = NextResponse.next()
  
  // Empêcher le cache des pages protégées
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}

// ========================================
// MATCHER - Intercepte TOUTES les routes (pages + API)
// ========================================
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}