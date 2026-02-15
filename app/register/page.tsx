"use client"

import React, { useState } from "react"
import { Activity, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, Phone, UserCog, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"admin" | "user" | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  // Suggestions d'emails basées sur le nom
  const emailSuggestions = [
    `${formData.fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
    `${formData.fullName.toLowerCase().replace(/\s+/g, '.')}@cabinet-dentaire.fr`,
    `dr.${formData.fullName.toLowerCase().split(' ')[1] || 'exemple'}@dentiste.fr`,
    `contact@${formData.fullName.toLowerCase().replace(/\s+/g, '-')}.fr`
  ].filter(email => email.includes('@') && formData.fullName.length > 3)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'email' && value.includes('@')) {
      setShowEmailSuggestions(false)
    } else if (field === 'email' && value.length > 0) {
      setShowEmailSuggestions(true)
    }
  }

  const handleEmailSuggestionClick = (email: string) => {
    setFormData(prev => ({ ...prev, email }))
    setShowEmailSuggestions(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas")
      return
    }
    
    if (!selectedRole) {
      alert("Veuillez sélectionner un rôle")
      return
    }
    
    setIsLoading(true)
    
    try {
      // Étape 1: Créer le compte (sans l'activer)
      const resRegister = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: selectedRole,
          requireVerification: true
        })
      })

      const dataRegister = await resRegister.json()

      if (!resRegister.ok) {
        alert(dataRegister.error || "Erreur lors de l'inscription")
        setIsLoading(false)
        return
      }

      // Étape 2: Envoyer le code de vérification par email
      const resVerif = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.fullName
        })
      })

      if (!resVerif.ok) {
        alert("Erreur lors de l'envoi du code de vérification")
        setIsLoading(false)
        return
      }

      // Rediriger vers la page de vérification
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.fullName)}`)
    } catch (error) {
      console.error(error)
      alert("Erreur lors de l'inscription")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#030712] flex items-center justify-center p-4 md:p-10 relative overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-[1400px] min-h-[850px] rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl bg-[#090E1A]/60 backdrop-blur-3xl relative z-10 grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-5 p-12 md:p-20 flex flex-col justify-between border-r border-white/5 relative">
          <div className="space-y-16">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                <Activity className="text-white w-8 h-8" />
              </div>
              <span className="text-white text-xl font-black italic uppercase tracking-tighter">TEMPS RÉEL</span>
            </div>
            <div className="relative">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.85] mb-8">
                EFFICIENCE <br /><span className="text-blue-500">DENTAIRE.</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 w-fit">
            <ShieldCheck className="text-emerald-500 w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">HDS Certifié v2</span>
          </div>
        </div>

        <div className="md:col-span-7 bg-white m-5 rounded-[3.5rem] p-8 md:p-16 lg:p-20 flex flex-col justify-center shadow-2xl relative overflow-hidden">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-50 rounded-full">
               <Sparkles className="w-4 h-4 text-blue-600" />
               <span className="text-blue-600 font-black uppercase text-[10px] tracking-widest">Inscription</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-2">
              Inscription
            </h2>
            <p className="text-slate-500 text-sm">
              Welcome to <span className="text-blue-600 font-bold">Efficience Dentaire</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom complet et Téléphone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <label className="text-xs font-semibold text-slate-600 ml-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Dr. Martin Durand" 
                    className="h-14 rounded-xl bg-slate-50 border-slate-200 pl-12 font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 ml-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="06 12 34 56 78" 
                    className="h-14 rounded-xl bg-slate-50 border-slate-200 pl-12 font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* Email avec autocomplete */}
            <div className="space-y-2 relative">
              <label className="text-xs font-semibold text-slate-600 ml-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <Input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onFocus={() => formData.fullName.length > 3 && setShowEmailSuggestions(true)}
                  placeholder="votre.adresse@email.com" 
                  className="h-14 rounded-xl bg-slate-50 border-slate-200 pl-12 font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all relative z-0" 
                />
                
                {/* Suggestions dropdown */}
                {showEmailSuggestions && emailSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    {emailSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEmailSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors text-sm font-medium text-slate-700 flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4 text-slate-400" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sélection de rôle */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600 ml-1">
                J'accepte les conditions du rôle <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`h-16 rounded-xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2 ${
                    selectedRole === 'admin' 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                >
                  <UserCog className="w-5 h-5" />
                  Administrateur
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('user')}
                  className={`h-16 rounded-xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2 ${
                    selectedRole === 'user' 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  Utilisateur
                </button>
              </div>
            </div>

            {/* Mots de passe */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 ml-1">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••" 
                  className="h-14 rounded-xl bg-slate-50 border-slate-200 pl-12 font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 ml-1">
                Confirmer mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  required
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="••••••••" 
                  className="h-14 rounded-xl bg-slate-50 border-slate-200 pl-12 font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                />
              </div>
            </div>

            {/* Bouton d'inscription */}
            <Button 
              disabled={isLoading} 
              className="w-full h-16 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-3 mt-6 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 disabled:opacity-50"
            >
              <Users className="w-5 h-5" />
              {isLoading ? "Inscription en cours..." : "Inscription"}
            </Button>

            {/* Lien vers login */}
            <div className="text-center mt-4">
              <p className="text-sm text-slate-600">
                Déjà inscrit ?{' '}
                <a href="/login" className="text-blue-600 font-bold hover:underline">
                  Se connecter
                </a>
              </p>
            </div>
          </form>

          {/* Footer text */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 font-medium">
              An automated AI candidate screening
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}