import { redirect } from 'next/navigation'
import { verifyServerAuth } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await verifyServerAuth()

  if (!user) {
    redirect('/login')
  }

  // Vérifier que l'utilisateur est admin
  if (user.role !== 'admin') {
    redirect('/unauthorized')
  }

  return <>{children}</>
}
