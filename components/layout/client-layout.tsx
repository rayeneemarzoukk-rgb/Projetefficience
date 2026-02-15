"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { AppProvider } from "@/context/AppContext" 
import { useRequireAuth } from "@/hooks/use-require-auth"

// 🔓 Pages publiques - PAS besoin d'authentification
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

function isPublicPath(pathname: string | null): boolean {
  if (!pathname) return false
  return PUBLIC_PATHS.some(p => pathname === p)
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Déterminer si la page est publique
  const isPublic = isPublicPath(pathname)
  
  // 🔐 Vérification auth - skip pour les pages publiques
  const { isAuthorized, isLoading } = useRequireAuth({ skip: isPublic })

  // Définition des pages sans sidebar (Login, Register, Landing, Admin pages)
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/" || pathname === "/admin/login"
  const isAdminPage = pathname?.startsWith("/admin")

  // Ne pas afficher la sidebar normale sur les pages auth ET les pages admin
  const hideSidebar = isAuthPage || isAdminPage

  // 🔒 Pour les pages protégées : afficher un loader pendant la vérification
  if (!isPublic && (isLoading || !isAuthorized)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  return (
    <AppProvider>
      <div className="flex min-h-screen">
        {/* Sidebar fixe à gauche - Affichée uniquement si ce n'est pas une page d'auth ou admin */}
        {!hideSidebar && <Sidebar />}
        
        {/* Zone de contenu : pl-72 pour ne pas chevaucher la sidebar sur desktop */}
        <main className={`flex-1 transition-all duration-300 ${!hideSidebar ? "md:pl-72" : ""}`}>
          <div className="h-full w-full">
            {children}
          </div>
        </main>
      </div>
    </AppProvider>
  )
}
