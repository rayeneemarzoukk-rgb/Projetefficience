"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

/**
 * 🔐 Hook de protection ABSOLUE des pages
 * ─────────────────────────────────────────
 * Condition : L'utilisateur DOIT être connecté via /login avec 2FA validée.
 * Si non authentifié → nettoyage complet + redirection vers /login.
 * Aucune page protégée ne s'affiche tant que la vérification n'est pas terminée.
 */
export function useRequireAuth(options?: { skip?: boolean }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const skip = options?.skip ?? false

  useEffect(() => {
    // Si skip est activé (page publique), autoriser directement
    if (skip) {
      setIsAuthorized(true)
      setIsLoading(false)
      return
    }

    // 🔒 Variable anti-contournement : empêche le rendu si le check n'est pas terminé
    let isMounted = true

    async function checkAuth() {
      try {
        // 🔐 Vérification côté SERVEUR uniquement (pas de localStorage seul)
        const res = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include', // Envoie les cookies auth_token
          cache: 'no-store',      // Jamais de cache pour la sécurité
        })

        if (!isMounted) return

        if (res.ok) {
          const data = await res.json()
          if (data.authenticated && data.twoFactorVerified) {
            setIsAuthorized(true)
          } else {
            // 🚨 Auth partielle (pas de 2FA) → nettoyage + redirection
            console.log('🔒 Non authentifié ou 2FA non validée - Redirection')
            cleanupAndRedirect()
          }
        } else {
          // 🚨 Pas de session valide → nettoyage + redirection
          console.log('🔒 Pas de session valide (status:', res.status, ') - Redirection')
          cleanupAndRedirect()
        }
      } catch (error) {
        // 🚨 Erreur réseau → nettoyage + redirection (principe de moindre privilège)
        console.log('🔒 Erreur vérification auth - Redirection')
        if (isMounted) {
          cleanupAndRedirect()
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    function cleanupAndRedirect() {
      // 🧹 Nettoyage COMPLET du localStorage pour empêcher toute manipulation
      try {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        localStorage.removeItem('auth_token')
        // Supprimer tout ce qui pourrait être lié à l'auth
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('token') || key.includes('auth') || key.includes('user'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      } catch (e) {
        // localStorage peut ne pas être disponible
      }
      
      // 🔄 Redirection forcée vers /login
      setIsAuthorized(false)
      router.replace('/login')
    }

    checkAuth()

    // Nettoyage si le composant est démonté pendant la vérification
    return () => {
      isMounted = false
    }
  }, [router, skip])

  return { isAuthorized, isLoading }
}
