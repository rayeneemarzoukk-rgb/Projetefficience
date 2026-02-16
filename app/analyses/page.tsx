"use client"

import React, { useState } from "react"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"

// Données mock pour les analyses globales
const dataCAMoyenParCabinet = [
  { month: "Jan", "Dr. Marzouk": 12, "Dr Burnier": 10, "Dr Laroche": 9, "Dr Mocanu": 8, "Dr Pinard": 13 },
  { month: "Feb", "Dr. Marzouk": 14, "Dr Burnier": 12, "Dr Laroche": 11, "Dr Mocanu": 10, "Dr Pinard": 15 },
  { month: "Mar", "Dr. Marzouk": 16, "Dr Burnier": 14, "Dr Laroche": 13, "Dr Mocanu": 12, "Dr Pinard": 17 },
  { month: "Apr", "Dr. Marzouk": 18, "Dr Burnier": 16, "Dr Laroche": 15, "Dr Mocanu": 14, "Dr Pinard": 19 },
  { month: "May", "Dr. Marzouk": 20, "Dr Burnier": 18, "Dr Laroche": 17, "Dr Mocanu": 16, "Dr Pinard": 21 },
  { month: "Jun", "Dr. Marzouk": 22, "Dr Burnier": 20, "Dr Laroche": 19, "Dr Mocanu": 18, "Dr Pinard": 23 },
  { month: "Jul", "Dr. Marzouk": 21, "Dr Burnier": 19, "Dr Laroche": 18, "Dr Mocanu": 17, "Dr Pinard": 22 },
  { month: "Aug", "Dr. Marzouk": 19, "Dr Burnier": 17, "Dr Laroche": 16, "Dr Mocanu": 15, "Dr Pinard": 20 },
  { month: "Sep", "Dr. Marzouk": 23, "Dr Burnier": 21, "Dr Laroche": 20, "Dr Mocanu": 19, "Dr Pinard": 24 },
  { month: "Oct", "Dr. Marzouk": 24, "Dr Burnier": 22, "Dr Laroche": 21, "Dr Mocanu": 20, "Dr Pinard": 25 },
  { month: "Nov", "Dr. Marzouk": 22, "Dr Burnier": 20, "Dr Laroche": 19, "Dr Mocanu": 18, "Dr Pinard": 23 },
  { month: "Dec", "Dr. Marzouk": 20, "Dr Burnier": 18, "Dr Laroche": 17, "Dr Mocanu": 16, "Dr Pinard": 21 },
]

const dataRepartitionScores = [
  { name: "Performants (>85%)", value: 45, color: "#10b981" },
  { name: "À surveiller (70-85%)", value: 30, color: "#f59e0b" },
  { name: "En difficulté (<70%)", value: 25, color: "#ef4444" },
]

const dataNouveauPatient = [
  { cabinet: "Dr. Marzouk", traites: 145, existants: 280 },
  { cabinet: "Dr. Burnier", traites: 122, existants: 245 },
  { cabinet: "Dr. Laroche", traites: 110, existants: 210 },
  { cabinet: "Dr. Mocanu", traites: 98, existants: 185 },
  { cabinet: "Dr. Pinard", traites: 87, existants: 150 },
]

// Données pour consultations par cabinet
const dataConsultationsParCabinet = [
  { cabinet: "Dr. Marzouk", consultations: 145, heuresTravaillees: 160 },
  { cabinet: "Dr. Burnier", consultations: 122, heuresTravaillees: 148 },
  { cabinet: "Dr. Laroche", consultations: 110, heuresTravaillees: 140 },
  { cabinet: "Dr. Mocanu", consultations: 98, heuresTravaillees: 135 },
  { cabinet: "Dr. Pinard", consultations: 87, heuresTravaillees: 120 },
]

const dataCAHoraires = [
  { month: "01", ca: 45, objectif: 55 },
  { month: "02", ca: 52, objectif: 55 },
  { month: "03", ca: 58, objectif: 55 },
  { month: "04", ca: 50, objectif: 55 },
  { month: "05", ca: 65, objectif: 55 },
  { month: "06", ca: 62, objectif: 55 },
  { month: "07", ca: 68, objectif: 55 },
  { month: "08", ca: 55, objectif: 55 },
  { month: "09", ca: 72, objectif: 55 },
  { month: "10", ca: 68, objectif: 55 },
  { month: "11", ca: 75, objectif: 55 },
  { month: "12", ca: 58, objectif: 55 },
]

const scoringData = [
  { nom: "Dr. Marzouk", score: 94 },
  { nom: "Dr Burnier", score: 92 },
  { nom: "Dr Laroche", score: 91 },
  { nom: "Dr Mocanu", score: 87 },
  { nom: "Dr Pinard", score: 90 },
]

export default function AnalysesPage() {
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
  const years = [2023, 2024, 2025, 2026]
  
  const [selectedMonth, setSelectedMonth] = useState("Décembre")
  const [selectedYear, setSelectedYear] = useState(2025)
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showYearDropdown, setShowYearDropdown] = useState(false)

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Analyses Globales des Cabinets</h1>
          <p className="text-slate-600">Comparatifs des performances des cabinets - {selectedMonth} {selectedYear}</p>
        </div>

        {/* Filtres */}
        <div className="flex gap-4 mb-8 flex-wrap items-center">
          <div className="flex items-center gap-2 relative">
            <span className="text-slate-600 text-sm font-semibold">Période :</span>
            <button 
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 text-sm flex items-center gap-2 shadow-sm"
            >
              {selectedMonth} <ChevronDown className="w-4 h-4" />
            </button>
            {showMonthDropdown && (
              <div className="absolute top-12 left-0 bg-white border border-slate-200 rounded-lg w-40 z-10 shadow-lg">
                {months.map((month) => (
                  <button
                    key={month}
                    onClick={() => {
                      setSelectedMonth(month)
                      setShowMonthDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-slate-900 hover:bg-blue-50 border-b border-slate-100 last:border-b-0"
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 text-sm flex items-center gap-2 shadow-sm"
            >
              {selectedYear} <ChevronDown className="w-4 h-4" />
            </button>
            {showYearDropdown && (
              <div className="absolute top-12 left-0 bg-white border border-slate-200 rounded-lg w-24 z-10 shadow-lg">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year)
                      setShowYearDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-slate-900 hover:bg-blue-50 border-b border-slate-100 last:border-b-0"
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cartes de résumé */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">94%</div>
              <p className="text-sm text-slate-600 font-semibold">Dr. Marzouk</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">92%</div>
              <p className="text-sm text-slate-600 font-semibold">Dr Burnier</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">88%</div>
              <p className="text-sm text-slate-600 font-semibold">Dr Laroche</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">87%</div>
              <p className="text-sm text-slate-600 font-semibold">Dr Mocanu</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">76%</div>
              <p className="text-sm text-slate-600 font-semibold">Dr Pinard</p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* CA Comparatif par Cabinet */}
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">📊 Chiffre d'Affaires Global des Cabinets</CardTitle>
              <p className="text-sm text-slate-600 mt-2">Performance mensuelle par cabinet (k€)</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dataCAMoyenParCabinet}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b" 
                    label={{ value: 'Mois', position: 'insideBottomRight', offset: -5 }} 
                  />
                  <YAxis 
                    stroke="#64748b" 
                    label={{ value: 'CA (k€)', angle: -90, position: 'insideLeft' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                    formatter={(value) => [`${value}k€`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Line type="monotone" dataKey="Dr. Marzouk" stroke="#3b82f6" strokeWidth={2.5} connectNulls dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Dr Burnier" stroke="#10b981" strokeWidth={2.5} connectNulls dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Dr Laroche" stroke="#f59e0b" strokeWidth={2.5} connectNulls dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Dr Mocanu" stroke="#8b5cf6" strokeWidth={2.5} connectNulls dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Dr Pinard" stroke="#06b6d4" strokeWidth={2.5} connectNulls dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <p className="text-blue-600 font-bold">52k€</p>
                  <p className="text-slate-600">Dr. Marzouk</p>
                </div>
                <div className="bg-green-50 p-2 rounded-lg">
                  <p className="text-green-600 font-bold">45k€</p>
                  <p className="text-slate-600">Dr Burnier</p>
                </div>
                <div className="bg-amber-50 p-2 rounded-lg">
                  <p className="text-amber-600 font-bold">38k€</p>
                  <p className="text-slate-600">Dr Laroche</p>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg">
                  <p className="text-purple-600 font-bold">45k€</p>
                  <p className="text-slate-600">Dr Mocanu</p>
                </div>
                <div className="bg-cyan-50 p-2 rounded-lg">
                  <p className="text-cyan-600 font-bold">32k€</p>
                  <p className="text-slate-600">Dr Pinard</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CA vs Objectif */}
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">🎯 CA Total vs Objectif Global</CardTitle>
              <p className="text-sm text-slate-600 mt-2">Suivi de la réalisation des objectifs mensuels</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataCAHoraires}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                    label={{ value: 'Mois', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    label={{ value: 'Montant (k€)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                    formatter={(value: any) => [`${value}k€`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar dataKey="ca" fill="#3b82f6" radius={[4, 4, 0, 0]} name="CA Réalisé" />
                  <Bar dataKey="objectif" fill="#10b981" radius={[4, 4, 0, 0]} name="Objectif" opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-600 font-bold text-lg">72k€</p>
                  <p className="text-slate-600 text-xs">CA Max réalisé</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-slate-700 font-bold text-lg">61k€</p>
                  <p className="text-slate-600 text-xs">CA Moyen (annuel)</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-600 font-bold text-lg">+10%</p>
                  <p className="text-slate-600 text-xs">Progression moyenne</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nb nouveau patient - REMPLACÉ */}
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">👥 Patients par Cabinet</CardTitle>
              <p className="text-sm text-slate-600 mt-2">Patients traités vs patients enregistrés</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataNouveauPatient}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="cabinet" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #3b82f6", borderRadius: "8px" }}
                  />
                  <Legend />
                  <Bar dataKey="traites" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Patients traités" />
                  <Bar dataKey="existants" fill="#10b981" radius={[4, 4, 0, 0]} name="Patients enregistrés" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-600 font-bold text-lg">{dataNouveauPatient.reduce((a, b) => a + b.traites, 0)}</p>
                  <p className="text-slate-600 text-xs">Total traités</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-600 font-bold text-lg">{dataNouveauPatient.reduce((a, b) => a + b.existants, 0)}</p>
                  <p className="text-slate-600 text-xs">Total enregistrés</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-purple-600 font-bold text-lg">{dataNouveauPatient.reduce((a, b) => a + b.traites + b.existants, 0)}</p>
                  <p className="text-slate-600 text-xs">Total patients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consultations par cabinet */}
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">📅 Activité par Cabinet (par mois)</CardTitle>
              <p className="text-sm text-slate-600 mt-2">Nombre de consultations et heures travaillées mensuelles</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataConsultationsParCabinet}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="cabinet" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #8b5cf6", borderRadius: "8px" }}
                  />
                  <Legend />
                  <Bar dataKey="consultations" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Consultations" />
                  <Bar dataKey="heuresTravaillees" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Heures travaillées" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-purple-600 font-bold text-lg">{dataConsultationsParCabinet.reduce((a, b) => a + b.consultations, 0)}</p>
                  <p className="text-slate-600 text-xs">Total consultations</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-orange-600 font-bold text-lg">{dataConsultationsParCabinet.reduce((a, b) => a + b.heuresTravaillees, 0)}h</p>
                  <p className="text-slate-600 text-xs">Total heures</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-600 font-bold text-lg">{Math.round(dataConsultationsParCabinet.reduce((a, b) => a + b.consultations, 0) / dataConsultationsParCabinet.length)}</p>
                  <p className="text-slate-600 text-xs">Moyenne/cabinet</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Performance */}
          <Card className="bg-white border-slate-200 col-span-2 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Scoring Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scoringData.map((item) => (
                  <div key={item.nom} className="flex items-center gap-4">
                    <span className="text-slate-700 w-32">{item.nom}</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${item.score >= 90 ? "bg-green-500" : item.score >= 80 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${item.score}%` }} />
                    </div>
                    <span className="text-slate-900 font-bold w-12 text-right">{item.score}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Répartition des scores */}
        <Card className="bg-white border-slate-200 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Répartition des Scores</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataRepartitionScores}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataRepartitionScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
