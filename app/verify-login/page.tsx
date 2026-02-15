"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import { Activity, Shield, ArrowLeft, CheckCircle, AlertCircle, Mail } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"

function VerifyOTPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [timeLeft])

  // Formatage du temps restant
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Gestion du code OTP
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Seulement les chiffres
    
    const newCode = [...code]
    newCode[index] = value.slice(-1) // Un seul chiffre
    setCode(newCode)
    
    // Auto-focus sur le prochain input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Gestion du backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Coller le code complet
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...code]
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newCode[i] = char
    })
    setCode(newCode)
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
  }

  // Vérification du code
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError("Veuillez entrer le code complet à 6 chiffres")
      return
    }
    
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Code incorrect")
        setIsLoading(false)
        return
      }

      // ✅ Succès
      setSuccess(true)
      
      // Sauvegarder le token
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user_role", data.user.role)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Rediriger après un délai
      setTimeout(() => {
        if (data.user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }, 1500)

    } catch (error) {
      setError("Erreur de vérification")
      console.error(error)
      setIsLoading(false)
    }
  }

  // Renvoyer le code
  const handleResendCode = async () => {
    setError("")
    setTimeLeft(300)
    // Rediriger vers login pour recommencer
    router.push('/login')
  }

  if (!email) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen w-full bg-[#030712] flex items-center justify-center p-4 md:p-10 relative overflow-hidden font-sans">
      
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-[600px] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-white relative z-10 p-12">
        
        {success ? (
          // État de succès
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
              <CheckCircle className="w-14 h-14 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-3">
              Connexion Réussie ! 🎉
            </h1>
            <p className="text-slate-600 text-lg">
              Redirection en cours...
            </p>
            <div className="mt-4 flex justify-center">
              <Activity className="w-6 h-6 text-emerald-600 animate-spin" />
            </div>
          </div>
        ) : (
          // Formulaire de vérification
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
                <Mail className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">
                Vérification par Email
              </h1>
              <p className="text-slate-600">
                Un code de sécurité a été envoyé à :
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Email: <strong>maarzoukrayan3@gmail.com</strong>
              </p>
            </div>

            {/* Timer */}
            <div className={`text-center mb-6 ${timeLeft <= 60 ? 'text-red-600' : 'text-slate-600'}`}>
              <span className="font-mono text-2xl font-bold">
                {formatTime(timeLeft)}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Temps restant pour entrer le code
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 font-medium text-sm">{error}</p>
              </div>
            )}

            {/* OTP Input */}
            <form onSubmit={handleSubmit}>
              <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading || timeLeft <= 0}
                    className="w-14 h-16 text-center text-2xl font-bold rounded-xl bg-slate-100 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                  />
                ))}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || code.join('').length !== 6 || timeLeft <= 0}
                className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black uppercase text-sm tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin mr-2" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Vérifier le Code
                  </>
                )}
              </Button>
            </form>

            {/* Actions secondaires */}
            <div className="mt-6 space-y-3">
              {timeLeft <= 0 && (
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  className="w-full h-12 rounded-xl"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Renvoyer un code
                </Button>
              )}
              
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
                className="w-full h-12 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Button>
            </div>

            {/* Info sécurité */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-900 font-semibold text-sm">
                    Authentification à 2 Facteurs
                  </p>
                  <p className="text-blue-700 text-xs mt-1">
                    Ce code de sécurité protège votre compte. Un email de notification sera envoyé à l'administrateur.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <VerifyOTPContent />
    </Suspense>
  )
}
