import { redirect } from 'next/navigation'
import { verifyServerAuth } from '@/lib/server-auth'

export default async function ConsultationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await verifyServerAuth()

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
