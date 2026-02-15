// lib/auth-utils.ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'efficience-jwt-secret-key-2026-production-secure'

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// 🔐 Génère un token JWT avec flag 2FA obligatoire
export function generateToken(userId: string, role: string, twoFactorVerified: boolean = false) {
  return jwt.sign(
    { 
      userId, 
      role,
      twoFactorVerified, // Flag indiquant que la 2FA a été validée
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  )
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string; twoFactorVerified: boolean }
  } catch (error) {
    return null
  }
}
