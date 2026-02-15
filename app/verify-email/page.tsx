"use client"

import React, { useState, useEffect } from "react"
import { Activity, Mail, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const name = searchParams.get('name') || ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerify = async () => {
    const verificationCode = code.join('')
    
    if (verificationCode.length !== 6) {
      setError('Veuillez entrer les 6 chiffres')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Code invalide')
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      setError('Erreur de vérification')
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      })
      alert('Nouveau code envoyé !')
    } catch (error) {
      alert('Erreur lors de l\'envoi')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen w-full bg-[#030712] flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-[600px] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-white relative z-10 p-12">
        {!success ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
                <Mail className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">
                Vérifiez votre email
              </h1>
              <p className="text-slate-600">
                Nous avons envoyé un code à <strong>{email}</strong>
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-600 ml-1 mb-3 block">
                  Code de vérification (6 chiffres)
                </label>
                <div className="flex gap-3 justify-center">
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleVerify}
                disabled={isLoading}
                className="w-full h-16 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-3"
              >
                {isLoading ? 'Vérification...' : 'Vérifier le code'}
                <ArrowRight className="w-5 h-5" />
              </Button>

              <div className="text-center">
                <button
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-sm text-blue-600 font-semibold hover:underline"
                >
                  Renvoyer le code
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">
              Email vérifié ! ✅
            </h1>
            <p className="text-slate-600 mb-6">
              Redirection vers la page de connexion...
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
