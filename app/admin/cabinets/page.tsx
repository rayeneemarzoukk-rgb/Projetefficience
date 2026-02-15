"use client"

import React, { useState, useEffect } from "react"
import { Building2, Plus, Trash2, Edit2, X, Mail, CheckCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AdminSidebar from "@/components/admin-sidebar"

export default function AdminCabinets() {
  const [cabinets, setCabinets] = useState([
    { id: 1, nom: "Cabinet Dentaire A", adresse: "123 Rue de Paris, 75001", contact: "contact@cabinetA.fr", patients: 45, active: true },
    { id: 2, nom: "Cabinet Dentaire B", adresse: "456 Avenue des Champs, 75008", contact: "contact@cabinetB.fr", patients: 62, active: true },
    { id: 3, nom: "Cabinet Dentaire C", adresse: "789 Boulevard Saint Germain, 75006", contact: "contact@cabinetC.fr", patients: 38, active: true },
    { id: 4, nom: "Cabinet Dentaire D", adresse: "321 Rue de Lyon, 75012", contact: "contact@cabinetD.fr", patients: 51, active: true },
    { id: 5, nom: "Cabinet Dentaire E", adresse: "654 Avenue Montaigne, 75008", contact: "contact@cabinetE.fr", patients: 42, active: true },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ nom: "", adresse: "", contact: "", patients: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleAddCabinet = () => {
    setEditingId(null)
    setFormData({ nom: "", adresse: "", contact: "", patients: 0 })
    setSuccessMessage("")
    setShowModal(true)
  }

  const handleEditCabinet = (cabinet: any) => {
    setEditingId(cabinet.id)
    setFormData(cabinet)
    setSuccessMessage("")
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.nom || !formData.adresse || !formData.contact) {
      alert("Tous les champs sont requis")
      return
    }

    setIsLoading(true)
    setSuccessMessage("")

    try {
      if (editingId) {
        // Mode édition - mise à jour locale
        setCabinets(cabinets.map(c => c.id === editingId ? { ...formData, id: editingId, active: true } : c))
        setShowModal(false)
      } else {
        // Mode création - appel API avec génération automatique de rapport
        const response = await fetch('/api/cabinets/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom: formData.nom,
            email: formData.contact,
            adresse: formData.adresse,
            telephone: '',
          })
        })

        const data = await response.json()

        if (data.success) {
          // Ajouter le cabinet à la liste locale
          setCabinets([...cabinets, { 
            ...formData, 
            id: Math.max(...cabinets.map(c => c.id)) + 1, 
            active: true 
          }])
          
          setSuccessMessage(data.message)
          
          // Fermer après 3 secondes
          setTimeout(() => {
            setShowModal(false)
            setSuccessMessage("")
          }, 3000)
        } else {
          alert(data.error || "Erreur lors de la création")
        }
      }
    } catch (error) {
      console.error("Erreur:", error)
      // En cas d'erreur API, ajouter quand même localement
      setCabinets([...cabinets, { ...formData, id: Math.max(...cabinets.map(c => c.id)) + 1, active: true }])
      setShowModal(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce cabinet?")) {
      setCabinets(cabinets.filter(c => c.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <AdminSidebar />
      
      <main className="flex-1 ml-72 p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <Building2 size={40} className="text-green-600" />
              Gestion des Cabinets
            </h1>
            <p className="text-slate-600">Ajouter un cabinet = Rapport généré + Email envoyé automatiquement</p>
          </div>
          <button
            onClick={handleAddCabinet}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Nouveau Cabinet
          </button>
        </div>

        {/* Cabinets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cabinets.map(cabinet => (
            <Card key={cabinet.id} className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900">{cabinet.nom}</h3>
                    <p className="text-sm text-slate-600 mt-1">{cabinet.adresse}</p>
                    <p className="text-sm text-slate-600">📧 {cabinet.contact}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="text-green-600" size={20} />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-slate-600">
                    <strong>{cabinet.patients}</strong> patients enregistrés
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCabinet(cabinet)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Edit2 size={16} />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(cabinet.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white rounded-2xl max-w-md w-full">
              <CardHeader className="flex justify-between items-center border-b border-slate-200 p-6">
                <CardTitle className="text-2xl font-black">
                  {editingId ? "Modifier le Cabinet" : "Nouveau Cabinet"}
                </CardTitle>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nom du Cabinet</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={e => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 focus:border-green-500 outline-none"
                    placeholder="Cabinet Dentaire..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={e => setFormData({ ...formData, adresse: e.target.value })}
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 focus:border-green-500 outline-none"
                    placeholder="123 Rue de Paris, 75001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contact</label>
                  <input
                    type="email"
                    value={formData.contact}
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 focus:border-green-500 outline-none"
                    placeholder="contact@cabinet.fr"
                  />
                </div>

                {/* Message de succès */}
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-green-800 font-semibold text-sm">{successMessage}</p>
                      <p className="text-green-600 text-xs mt-1">
                        📧 Un email avec le rapport a été envoyé à maarzoukrayan3@gmail.com
                      </p>
                    </div>
                  </div>
                )}

                {/* Info automatisation */}
                {!editingId && !successMessage && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <Mail className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-blue-800 font-semibold text-sm">Rapport automatique</p>
                      <p className="text-blue-600 text-xs mt-1">
                        À la création, un rapport de statistiques sera généré et envoyé automatiquement par email.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        {editingId ? 'Enregistrer' : '+ Créer et envoyer rapport'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={isLoading}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-lg font-bold transition disabled:opacity-50"
                  >
                    Annuler
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
