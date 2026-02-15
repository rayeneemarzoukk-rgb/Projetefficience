"use client"

import React, { useState, useEffect } from "react"
import { Users, TrendingUp, Calendar, RefreshCw, AlertCircle, Mail, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { useRapportStats } from "@/hooks/use-rapport-stats"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Données par défaut harmonisées (définies en dehors du composant)
const defaultData = {
  nouveauxPatients: 8,
  caActuel: 212000,
  caObjectif: 215000,
  progression: 99,
  rdvCount: 45,
  cabinets: [
    { _id: '1', nom: 'Dr. Dubois', caActuel: 52000, caObjectif: 50000, score: 94, rapportStatut: 'sent' },
    { _id: '2', nom: 'Dr. Burnier', caActuel: 45000, caObjectif: 40000, score: 92, rapportStatut: 'sent' },
    { _id: '3', nom: 'Dr. Laroche', caActuel: 38000, caObjectif: 40000, score: 88, rapportStatut: 'sent' },
    { _id: '4', nom: 'Dr. Mocanu', caActuel: 45000, caObjectif: 45000, score: 87, rapportStatut: 'sent' },
    { _id: '5', nom: 'Dr. Pinard', caActuel: 32000, caObjectif: 40000, score: 76, rapportStatut: 'sent' },
  ],
  patients: [],
  rendezvous: [],
};

export default function Dashboard() {
  // Initialiser avec les données par défaut
  const [mongoData, setMongoData] = useState<any>(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cabinetFilter, setCabinetFilter] = useState<string>("all");

  // Hook personnalisé pour les stats des rapports
  const { stats: rapportStats, loading: rapportLoading, refetch: refetchRapports } = useRapportStats();

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Utiliser AbortController pour timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const res = await fetch('/api/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      if (data) {
        setMongoData(data);
      }
    } catch (err: any) {
      // Silencieux - on garde les données par défaut
      if (err.name !== 'AbortError') {
        console.warn("⚠️ API stats non disponible, utilisation des données locales");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Charger les stats mongodb une première fois
    loadStats();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Données pour les graphiques et synthèses filtrées
  const cabinetData = mongoData?.cabinets || [];
  const filteredCabinetData = cabinetFilter === "all"
    ? cabinetData
    : cabinetData.filter((cab: any) => cab._id === cabinetFilter);

  // Synthèses filtrées
  const totalCabinets = filteredCabinetData.length;
  const totalCa = filteredCabinetData.reduce((sum: number, c: any) => sum + (c.caActuel || 0), 0);
  const totalObjectif = filteredCabinetData.reduce((sum: number, c: any) => sum + (c.caObjectif || 0), 0);
  const performanceMoyenne = filteredCabinetData.length > 0
    ? Math.round(filteredCabinetData.reduce((sum: number, c: any) => sum + (c.score || 0), 0) / filteredCabinetData.length)
    : 0;
  // Alertes filtrées
  const caSousObjectif = filteredCabinetData.filter((c: any) => c.caActuel < c.caObjectif).length;
  
  // Extraire un nom court pour l'affichage (max 12 caractères)
  const extractShortName = (nom: string) => {
    if (!nom) return 'N/A';
    // Si c'est "Cabinet Dr. X", extraire "Dr. X"
    const drMatch = nom.match(/Dr\.?\s*\w+/);
    if (drMatch) return drMatch[0];
    // Sinon, prendre les 12 premiers caractères
    return nom.length > 12 ? nom.substring(0, 12) + '...' : nom;
  };
  
  const mobileChartData = (filteredCabinetData || []).slice(0, 5).map((c: any) => ({
    name: extractShortName(c?.nom),
    ca: c?.caActuel || 0,
  }));

  const scoreData = (filteredCabinetData || []).map((c: any) => ({
    name: extractShortName(c?.nom),
    score: c?.score || 0,
  }));

  const pieData = [
    { name: 'Bon', value: (filteredCabinetData || []).filter((c: any) => c?.score >= 85).length, fill: '#10b981' },
    { name: 'Moyen', value: (filteredCabinetData || []).filter((c: any) => c?.score >= 75 && c?.score < 85).length, fill: '#f59e0b' },
    { name: 'Faible', value: (filteredCabinetData || []).filter((c: any) => c?.score < 75).length, fill: '#ef4444' },
  ];

  const today = new Date();
  const monthName = today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8">
        {/* HEADER avec salutation */}
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold text-blue-700">Bonjour Younis</h1>
        </div>
        {/* Titre Tableau de bord */}
        <div className="mb-8 text-center">
          <h2 className="text-5xl font-extrabold text-slate-900">Tableau de bord</h2>
          <p className="text-lg text-slate-500 font-medium mt-2 tracking-wide">Cabinet Efficience Source</p>
        </div>
        <div className="flex justify-end items-start">
          <button 
            onClick={() => {
              loadStats();
              refetchRapports();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <RefreshCw size={16} className={loading || rapportLoading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>
        {/* ...barre de filtre supprimée... */}

        {/* SYNTHÈSE GLOBALE */}
        <Card className="bg-white rounded-3xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-slate-900">Synthèse Globale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SynthesisCard 
                icon={<BarChart3 className="text-blue-500" size={24} />}
                title="Cabinets Suivis"
                value={totalCabinets}
                trend="+2 ce mois"
                bgColor="bg-blue-50"
              />
              <SynthesisCard 
                icon={<Mail className="text-purple-500" size={24} />}
                title="Rapports Générés"
                value={totalCabinets}
                trend="ce mois"
                bgColor="bg-purple-50"
              />
              <SynthesisCard 
                icon={<Mail className="text-green-500" size={24} />} 
                title="Emails Envoyés" 
                value={totalCabinets} 
                trend={`${totalCabinets}/${totalCabinets} rapports`} 
                bgColor="bg-green-50" 
              />
              <SynthesisCard 
                icon={<TrendingUp className="text-red-500" size={24} />}
                title="Performance Moyenne"
                value={performanceMoyenne ? `${performanceMoyenne}%` : 'N/A'}
                trend="+5% vs mois dernier"
                bgColor="bg-red-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* GRAPHIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CA Moyen par Cabinet */}
          <Card className="bg-white rounded-3xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">Chiffre d'affaires par cabinet — {monthName}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mobileChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                  <Tooltip formatter={(value: number | undefined) => [`${value ? value.toLocaleString('fr-FR') : 'N/A'} €`, 'CA']} />
                  <Legend />
                  <Bar dataKey="ca" fill="#3b82f6" radius={[4, 4, 0, 0]} name="CA Réalisé (€)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Répartition des Scores */}
          <Card className="bg-white rounded-3xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">Répartition des Scores</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ALERTES & NOTIFICATIONS */}
        <Card className="bg-white rounded-3xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Alertes & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <AlertBox 
                title="CA < Objectif"
                count={caSousObjectif}
                trend="+2 vs mois dernier"
                bgColor="bg-red-50"
                textColor="text-red-600"
                icon="⚠️"
                href="/cabinets"
              />
              <AlertBox 
                title="Absences élevées"
                count={50}
                trend="+8 vs mois dernier"
                bgColor="bg-orange-50"
                textColor="text-orange-600"
                icon="👁️"
                href="/analyses/absences"
              />
              <AlertBox 
                title="Total Présences"
                count={438}
                trend=""
                bgColor="bg-green-50"
                textColor="text-green-600"
                icon="🟢"
                href="/analyses/absences"
              />
              <AlertBox 
                title="Rapports non envoyés"
                count={0}
                trend="+2 vs mois dernier"
                bgColor="bg-pink-50"
                textColor="text-pink-600"
                icon="📧"
                href="/rapports"
              />
            </div>
          </CardContent>
        </Card>

        {/* KPI CARDS en bas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KPICard 
            title={`CA Total (${totalCabinets} cabinet${totalCabinets > 1 ? 's' : ''})`} 
            value={`${totalCa.toLocaleString()} €`} 
            icon={<TrendingUp />} 
            color="bg-emerald-500" 
          />
          <KPICard 
            title={`Objectif Total (${totalCabinets} cabinet${totalCabinets > 1 ? 's' : ''})`} 
            value={`${totalObjectif.toLocaleString()} €`} 
            icon={<Calendar />} 
            color="bg-violet-500" 
          />
        </div>
      </main>
    </div>
  )
}

function KPICard({ title, value, icon, color }: any) {
  return (
    <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white flex items-center gap-6">
      <div className={`p-4 rounded-2xl text-white ${color}`}>{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </Card>
  )
}

function SynthesisCard({ icon, title, value, trend, bgColor }: any) {
  return (
    <div className={`${bgColor} p-6 rounded-2xl border-0`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-sm font-semibold text-slate-700">{title}</span>
      </div>
      <p className="text-3xl font-black text-slate-900 mb-1">{value}</p>
      <p className="text-xs text-slate-600">{trend}</p>
    </div>
  )
}

function AlertBox({ title, count, trend, bgColor, textColor, icon, href }: any) {
  const content = (
    <div className={`${bgColor} p-6 rounded-2xl border-l-4 border-red-500 ${href ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className={`font-bold ${textColor}`}>{title} {icon}</h3>
      </div>
      <p className="text-3xl font-black text-slate-900 mb-1">{count}</p>
      <p className="text-xs text-slate-600">{trend}</p>
      {href && <p className="text-xs text-blue-600 mt-2">Cliquez pour voir les détails →</p>}
    </div>
  )
  
  if (href) {
    const Link = require('next/link').default
    return <Link href={href}>{content}</Link>
  }
  return content
}