import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production'
const SALT_ROUNDS = 10

// Interface pour les utilisateurs
export interface User {
  id: string
  email: string
  password: string
  name: string
  role: 'admin' | 'user'
  cabinet?: string
  createdAt: Date
  isActive: boolean
}

export interface TokenPayload {
  id: string
  email: string
  role: 'admin' | 'user'
  twoFactorVerified: boolean
}

// Fonction pour hasher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// Fonction pour comparer un mot de passe avec son hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// 🔐 Fonction pour générer un JWT AVEC flag 2FA obligatoire
export function generateToken(user: User, twoFactorVerified: boolean = false): string {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    twoFactorVerified, // OBLIGATOIRE pour accéder aux pages protégées
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// Fonction pour vérifier et décoder un JWT
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    // Vérifier que le 2FA a été validé
    if (!decoded.twoFactorVerified) {
      console.log('🔒 Token sans 2FA validé - Accès refusé')
      return null
    }
    return decoded
  } catch (error) {
    return null
  }
}

// Fonction pour valider les données d'entrée
export function validateUserData(data: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email invalide')
  }

  if (!data.password || data.password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères')
  }

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères')
  }

  if (data.role && !['admin', 'user'].includes(data.role)) {
    errors.push('Le rôle doit être admin ou user')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Générateur de mot de passe temporaire
export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
