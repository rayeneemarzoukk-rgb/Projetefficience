import { redirect } from 'next/navigation'
import { verifyServerAuth } from '@/lib/server-auth'

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
