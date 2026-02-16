"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChevronDown } from "lucide-react"

// Données mock pour un cabinet détaillé
const cabinetDetail = {
  nom: "Cabinet Dr. Martin",
  email: "dr.martin@cabinet.fr",
  score: 92,
  statut: "Performant",
  periode: "Tous les mois",
}

const dataCADirect = [
  { month: "01", ca: 8, ca_h: 10 },
  { month: "02", ca: 9.5, ca_h: 12 },
  { month: "03", ca: 10.8, ca_h: 13.5 },
  { month: "04", ca: 9.2, ca_h: 11.5 },
  { month: "05", ca: 12, ca_h: 15 },
  { month: "06", ca: 11.5, ca_h: 14.3 },
  { month: "07", ca: 13, ca_h: 16.2 },
  { month: "08", ca: 10.3, ca_h: 12.8 },
  { month: "09", ca: 14.2, ca_h: 17.8 },
  { month: "10", ca: 13.5, ca_h: 16.9 },
  { month: "11", ca: 14.8, ca_h: 18.5 },
  { month: "12", ca: 11.4, ca_h: 14.2 },
]

const dataHeuresEtPatients = [
  { month: "01", heures: 8, hp: 2 },
  { month: "02", heures: 9, hp: 2.5 },
  { month: "03", heures: 10, hp: 3 },
  { month: "04", heures: 9, hp: 2.8 },
  { month: "05", heures: 11, hp: 3.2 },
  { month: "06", heures: 10.5, hp: 3 },
  { month: "07", heures: 12, hp: 3.5 },
  { month: "08", heures: 9.5, hp: 2.9 },
  { month: "09", heures: 13, hp: 3.8 },
  { month: "10", heures: 12.5, hp: 3.6 },
  { month: "11", heures: 13.5, hp: 3.9 },
  { month: "12", heures: 10.5, hp: 3.1 },
]

const dataAgenda = [
  { month: "01", new: 8, treated: 7, scheduled: 15 },
  { month: "02", new: 10, treated: 9, scheduled: 18 },
  { month: "03", new: 12, treated: 11, scheduled: 20 },
  { month: "04", new: 9, treated: 8, scheduled: 16 },
  { month: "05", new: 15, treated: 14, scheduled: 25 },
  { month: "06", new: 13, treated: 12, scheduled: 22 },
  { month: "07", new: 16, treated: 15, scheduled: 28 },
  { month: "08", new: 11, treated: 10, scheduled: 19 },
  { month: "09", new: 18, treated: 17, scheduled: 30 },
  { month: "10", new: 14, treated: 13, scheduled: 24 },
  { month: "11", new: 19, treated: 18, scheduled: 32 },
  { month: "12", new: 12, treated: 11, scheduled: 21 },
]

const dataDevis = [
  { month: "01", proposed: 12, accepted: 8 },
  { month: "02", proposed: 14, accepted: 10 },
  { month: "03", proposed: 16, accepted: 12 },
  { month: "04", proposed: 13, accepted: 9 },
  { month: "05", proposed: 18, accepted: 14 },
  { month: "06", proposed: 16, accepted: 12 },
  { month: "07", proposed: 19, accepted: 15 },
  { month: "08", proposed: 14, accepted: 10 },
  { month: "09", proposed: 21, accepted: 17 },
  { month: "10", proposed: 17, accepted: 13 },
  { month: "11", proposed: 22, accepted: 18 },
  { month: "12", proposed: 15, accepted: 11 },
]

export default function CabinetDetailPage() {
  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{cabinetDetail.nom}</h1>
              <p className="text-slate-600">{cabinetDetail.email}</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 text-lg px-4 py-2">
              {cabinetDetail.score}% - {cabinetDetail.statut}
            </Badge>
          </div>

          {/* Période */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Période :</span>
            <button className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm flex items-center gap-2">
              {cabinetDetail.periode} <ChevronDown className="w-4 h-4" />
            </button>
            <button className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm flex items-center gap-2">
              Sélectionner année <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section Chiffre d'affaires */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">ANALYSE CHIFFRE D'AFFAIRES</h2>

          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Chiffre d'affaires */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Chiffre d'affaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">84 K€</div>
                  <div className="flex gap-4">
                    <Badge className="bg-blue-100 text-blue-600">Objectif : 100 K€</Badge>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-slate-900">CA : 84 K€</p>
                  <p className="text-slate-600">84 % de l'objectif</p>
                </div>
              </CardContent>
            </Card>

            {/* Chiffre d'affaires horaire */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Chiffre d'affaires horaire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="text-4xl font-bold text-slate-700 mb-2">654 €/h</div>
                  <div className="flex gap-4">
                    <Badge className="bg-slate-100 text-slate-600">Objectif : 600€</Badge>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-slate-900">CA/h : 654 €/h</p>
                  <p className="text-slate-600">Objectif atteint !</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques CA */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Chiffre d'affaires</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dataCADirect}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }} />
                    <Line type="monotone" dataKey="ca" stroke="#3b82f6" strokeWidth={2} name="CA (K€)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Chiffre d'affaires horaire</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dataCADirect}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }} />
                    <Line type="monotone" dataKey="ca_h" stroke="#8b5cf6" strokeWidth={2} name="CA/h (€)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Heures */}
          <div className="grid grid-cols-2 gap-8">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Nombre d'heures travaillés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-8">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">160 heures</p>
                    <p className="text-slate-600 text-sm">Stable vs mois dernier</p>
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={dataHeuresEtPatients.slice(-6)}>
                      <Bar dataKey="heures" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Nombre d'heures HP</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-8">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">130 h</p>
                    <p className="text-slate-600 text-sm">+5 h vs mois dernier</p>
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={dataHeuresEtPatients.slice(-6)}>
                      <Bar dataKey="hp" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section Agenda */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-green-600 mb-6">ANALYSE AGENDA</h2>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <p className="text-green-600 text-sm font-semibold mb-2">Nombre de nouveaux patient</p>
                <p className="text-3xl font-bold text-slate-900">45</p>
                <p className="text-slate-600 text-sm">↑ +12 % vs mois dernier</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <p className="text-green-600 text-sm font-semibold mb-2">Nombre de patients traités</p>
                <p className="text-3xl font-bold text-slate-900">320</p>
                <p className="text-slate-600 text-sm">↑ +4 % vs mois dernier</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <p className="text-green-600 text-sm font-semibold mb-2">Nombre de patients sur l'agenda</p>
                <p className="text-3xl font-bold text-slate-900">380</p>
                <p className="text-slate-600 text-sm">↑ +6 % vs mois dernier</p>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques Agenda */}
          <div className="grid grid-cols-3 gap-8">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900 text-sm">Nouveaux patients</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dataAgenda}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Bar dataKey="new" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900 text-sm">Patients traités</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dataAgenda}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Bar dataKey="treated" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900 text-sm">Sur l'agenda</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dataAgenda}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Bar dataKey="scheduled" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section En cours */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">ANALYSE EN COURS</h2>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <p className="text-purple-600 text-sm font-semibold mb-2">Nombre de patients en cours</p>
                <p className="text-3xl font-bold text-slate-900">110</p>
                <p className="text-slate-600 text-sm">↑ +10 % vs mois dernier</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <p className="text-purple-600 text-sm font-semibold mb-2">Montant total à facturer</p>
                <p className="text-3xl font-bold text-slate-900">120 000 €</p>
                <p className="text-slate-600 text-sm">↑ +15 % vs mois dernier</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Nombre de patients en cours</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataAgenda}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Bar dataKey="new" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Montant total à facturer</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataAgenda}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Bar dataKey="treated" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Durée totale à réaliser</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataAgenda}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Bar dataKey="scheduled" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Chiffre d'affaires horaire</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dataCADirect}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }} />
                    <Line type="monotone" dataKey="ca_h" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section Devis */}
        <div>
          <h2 className="text-2xl font-bold text-orange-600 mb-6">ANALYSE DEVIS</h2>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6">
                <p className="text-orange-600 text-sm font-semibold mb-2">Nombre de devis</p>
                <p className="text-3xl font-bold text-slate-900">60</p>
                <p className="text-slate-600 text-sm">↑ +9 % vs mois dernier</p>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6">
                <p className="text-orange-600 text-sm font-semibold mb-2">Montant moyen des devis proposés</p>
                <p className="text-3xl font-bold text-slate-900">4 800 €</p>
                <p className="text-slate-600 text-sm">↑ +5 % vs mois dernier</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Nombre devis proposés</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataDevis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Bar dataKey="proposed" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Nombre devis acceptés</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataDevis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Bar dataKey="accepted" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
