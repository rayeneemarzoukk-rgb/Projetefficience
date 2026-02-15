import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#030712] text-white p-4">
      <h2 className="text-4xl font-bold mb-4">404 - Page Non Trouvée</h2>
      <p className="text-slate-400 mb-8 text-center max-w-md">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Button asChild>
        <Link href="/">
          Retour à l'accueil
        </Link>
      </Button>
    </div>
  )
}
