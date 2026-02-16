"use client"

import React, { useState, useEffect } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { ArrowLeft, Users, UserX, UserCheck, TrendingDown, AlertTriangle } from "lucide-react"
import Link from "next/link"

// Données des absences par cabinet
const absencesParCabinet = [
  { 
    nom: "Dr. Marzouk", 
    totalRdv: 120, 
    presents: 112, 
    absents: 8, 
    tauxAbsence: 6.7,
    tendance: "stable",
    moisPrecedent: 7
  },
  { 
    nom: "Dr. Burnier", 
    totalRdv: 98, 
    presents: 89, 
    absents: 9, 
    tauxAbsence: 9.2,
    tendance: "hausse",
    moisPrecedent: 6
  },
  { 
    nom: "Dr. Laroche", 
    totalRdv: 95, 
    presents: 89, 
    absents: 6, 
    tauxAbsence: 6.3,
    tendance: "baisse",
    moisPrecedent: 10
  },
  { 
    nom: "Dr. Mocanu", 
    totalRdv: 110, 
    presents: 102, 
    absents: 8, 
    tauxAbsence: 7.3,
    tendance: "baisse",
    moisPrecedent: 12
  },
  { 
    nom: "Dr. Pinard", 
    totalRdv: 88, 
    presents: 82, 
    absents: 6, 
    tauxAbsence: 6.8,
    tendance: "baisse",
    moisPrecedent: 8
  },
]

// Données mensuelles d'absences
const evolutionAbsences = [
  { mois: "Jan", absences: 35, presences: 420 },
  { mois: "Fév", absences: 28, presences: 445 },
  { mois: "Mar", absences: 42, presences: 430 },
  { mois: "Avr", absences: 38, presences: 450 },
  { mois: "Mai", absences: 31, presences: 465 },
  { mois: "Jun", absences: 45, presences: 440 },
  { mois: "Jul", absences: 52, presences: 410 },
  { mois: "Aoû", absences: 48, presences: 380 },
  { mois: "Sep", absences: 39, presences: 455 },
  { mois: "Oct", absences: 36, presences: 470 },
  { mois: "Nov", absences: 44, presences: 460 },
  { mois: "Déc", absences: 50, presences: 438 },
]

// Données pour le graphique de comparaison
const comparaisonPresenceAbsence = absencesParCabinet.map(c => ({
  name: c.nom.replace("Dr. ", ""),
  Présents: c.presents,
  Absents: c.absents,
}))

// Répartition des raisons d'absence
const raisonsAbsences = [
  { name: "Non justifiée", value: 45, color: "#ef4444" },
  { name: "Maladie", value: 25, color: "#f59e0b" },
  { name: "Urgence personnelle", value: 15, color: "#3b82f6" },
  { name: "Report demandé", value: 10, color: "#10b981" },
  { name: "Autre", value: 5, color: "#8b5cf6" },
]

// Répartition des raisons d'absence PAR CABINET
const raisonsAbsencesParCabinet = [
  {
    nom: "Dr. Marzouk",
    color: "#3b82f6",
    raisons: [
      { name: "Non justifiée", value: 25, color: "#ef4444" },
      { name: "Maladie", value: 35, color: "#f59e0b" },
      { name: "Urgence personnelle", value: 20, color: "#3b82f6" },
      { name: "Report demandé", value: 15, color: "#10b981" },
      { name: "Autre", value: 5, color: "#8b5cf6" },
    ]
  },
  {
    nom: "Dr. Burnier",
    color: "#10b981",
    raisons: [
      { name: "Non justifiée", value: 55, color: "#ef4444" },
      { name: "Maladie", value: 20, color: "#f59e0b" },
      { name: "Urgence personnelle", value: 10, color: "#3b82f6" },
      { name: "Report demandé", value: 10, color: "#10b981" },
      { name: "Autre", value: 5, color: "#8b5cf6" },
    ]
  },
  {
    nom: "Dr. Laroche",
    color: "#f59e0b",
    raisons: [
      { name: "Non justifiée", value: 60, color: "#ef4444" },
      { name: "Maladie", value: 15, color: "#f59e0b" },
      { name: "Urgence personnelle", value: 12, color: "#3b82f6" },
      { name: "Report demandé", value: 8, color: "#10b981" },
      { name: "Autre", value: 5, color: "#8b5cf6" },
    ]
  },
  {
    nom: "Dr. Mocanu",
    color: "#8b5cf6",
    raisons: [
      { name: "Non justifiée", value: 30, color: "#ef4444" },
      { name: "Maladie", value: 40, color: "#f59e0b" },
      { name: "Urgence personnelle", value: 15, color: "#3b82f6" },
      { name: "Report demandé", value: 10, color: "#10b981" },
      { name: "Autre", value: 5, color: "#8b5cf6" },
    ]
  },
  {
    nom: "Dr. Pinard",
    color: "#ef4444",
    raisons: [
      { name: "Non justifiée", value: 70, color: "#ef4444" },
      { name: "Maladie", value: 10, color: "#f59e0b" },
      { name: "Urgence personnelle", value: 8, color: "#3b82f6" },
      { name: "Report demandé", value: 7, color: "#10b981" },
      { name: "Autre", value: 5, color: "#8b5cf6" },
    ]
  },
]

export default function AbsencesPage() {
  const totalAbsences = absencesParCabinet.reduce((sum, c) => sum + c.absents, 0)
  const totalRdv = absencesParCabinet.reduce((sum, c) => sum + c.totalRdv, 0)
  const tauxGlobal = ((totalAbsences / totalRdv) * 100).toFixed(1)
  const cabinetsProblematiques = absencesParCabinet.filter(c => c.tauxAbsence > 10).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8">
        
        {/* Header avec retour */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Statistiques et comparaison des cabinets</h1>
              <p className="text-slate-600">Suivi détaillé des absences par cabinet - Décembre 2025</p>
            </div>
          </div>
          <Badge variant="destructive" className="text-lg px-4 py-2">
            <AlertTriangle className="mr-2" size={18} />
            {cabinetsProblematiques} cabinet(s) en alerte
          </Badge>
        </div>

        {/* KPIs Globaux */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <UserX className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Absences</p>
                  <p className="text-3xl font-black text-slate-900">{totalAbsences}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <UserCheck className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Présences</p>
                  <p className="text-3xl font-black text-slate-900">{totalRdv - totalAbsences}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <TrendingDown className="text-orange-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Taux d'absence global</p>
                  <p className="text-3xl font-black text-slate-900">{tauxGlobal}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total RDV</p>
                  <p className="text-3xl font-black text-slate-900">{totalRdv}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tableau détaillé par cabinet */}
        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Détail par Cabinet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-4 px-4 font-bold text-slate-700">Cabinet</th>
                    <th className="text-center py-4 px-4 font-bold text-slate-700">Total RDV</th>
                    <th className="text-center py-4 px-4 font-bold text-slate-700">Présents</th>
                    <th className="text-center py-4 px-4 font-bold text-slate-700">Absents</th>
                    <th className="text-center py-4 px-4 font-bold text-slate-700">Taux d'absence</th>
                    <th className="text-center py-4 px-4 font-bold text-slate-700">Tendance</th>
                    <th className="text-center py-4 px-4 font-bold text-slate-700">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {absencesParCabinet.map((cabinet, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {cabinet.nom.split(' ')[1]?.[0] || 'D'}
                          </div>
                          <span className="font-semibold text-slate-900">{cabinet.nom}</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4 font-medium">{cabinet.totalRdv}</td>
                      <td className="text-center py-4 px-4">
                        <span className="text-green-600 font-semibold">{cabinet.presents}</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="text-red-600 font-semibold">{cabinet.absents}</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className={`font-bold ${cabinet.tauxAbsence > 10 ? 'text-red-600' : cabinet.tauxAbsence > 7 ? 'text-orange-600' : 'text-green-600'}`}>
                          {cabinet.tauxAbsence.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        {cabinet.tendance === 'hausse' && (
                          <Badge variant="destructive">↑ Hausse</Badge>
                        )}
                        {cabinet.tendance === 'baisse' && (
                          <Badge className="bg-green-500">↓ Baisse</Badge>
                        )}
                        {cabinet.tendance === 'stable' && (
                          <Badge variant="secondary">→ Stable</Badge>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {cabinet.tauxAbsence > 10 ? (
                          <Badge className="bg-orange-500">👁️ À surveiller</Badge>
                        ) : cabinet.tauxAbsence > 7 ? (
                          <Badge className="bg-orange-500">👁️ À surveiller</Badge>
                        ) : (
                          <Badge className="bg-green-500">✅ OK</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Comparaison Présences/Absences par Cabinet */}
          <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">Comparaison Présences vs Absences des cabinets</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparaisonPresenceAbsence}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Présents" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Absents" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Répartition des raisons d'absence */}
          <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">Raisons des Absences (Global)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={raisonsAbsences}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {raisonsAbsences.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 5 Graphiques Raisons des Absences par Cabinet */}
        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">📊 Raisons des Absences par Docteur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {raisonsAbsencesParCabinet.map((cabinet, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-4">
                  <h3 className="text-center font-bold text-slate-800 mb-2" style={{ color: cabinet.color }}>
                    {cabinet.nom}
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={cabinet.raisons}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {cabinet.raisons.map((entry, index) => (
                          <Cell key={`cell-${idx}-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Légende compacte */}
                  <div className="text-xs space-y-1 mt-2">
                    {cabinet.raisons.slice(0, 3).map((r, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }}></div>
                        <span className="text-slate-600 truncate">{r.name}: {r.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Évolution mensuelle des présences */}
        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">📈 Évolution Mensuelle des Présences Patients - 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolutionAbsences}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mois" />
                <YAxis domain={[300, 500]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="presences" stroke="#10b981" strokeWidth={3} name="Présences patients" dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
