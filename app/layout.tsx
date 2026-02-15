// IMPORTATION DES STYLES
import "./globals.css" 

import { ClientLayout } from "@/components/layout/client-layout"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { Activity } from "lucide-react"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Efficience Dentaire | Gestion de Cabinet AI',
  description: 'Plateforme d\'analyse et de gestion pour cabinets dentaires augmentée par l\'intelligence artificielle.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased bg-[#030712]">
        <ClientLayout>
          {children}
        </ClientLayout>
        <SpeedInsights />
      </body>
    </html>
  )
}