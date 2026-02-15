// components/ai-report-generator.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Zap, Download, Copy, RefreshCw, FileText, TrendingUp, TrendingDown, Users, Calendar, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ReportData {
  cabinetName: string;
  cabinetData: any;
  period: string;
}

interface GeneratedReport {
  report: string;
  predictions: any;
  recommendations: any;
  generatedAt: string;
}

interface AIReportGeneratorProps {
  data: ReportData;
  onReportGenerated?: (report: GeneratedReport) => void;
}

// Composant pour afficher le rapport avec un design riche
function RichReportDisplay({ data, report }: { data: ReportData; report: GeneratedReport }) {
  const cabinetData = data.cabinetData || {};
  const ca = cabinetData.caActuel || 45000;
  const objectif = cabinetData.caObjectif || 50000;
  const score = cabinetData.score || 85;
  const nouveauxPatients = cabinetData.nouveauxPatients || 12;
  const nombreRdv = cabinetData.nombreRdv || 68;
  const tauxAbsence = cabinetData.tauxAbsence || 4.2;
  
  const pourcentageCA = objectif > 0 ? Math.round((ca / objectif) * 100) : 0;
  const ecartCA = ca - objectif;
  const caHoraire = Math.round(ca / 160);
  const caHoraireObjectif = Math.round(objectif / 160);
  const ecartHoraire = caHoraire - caHoraireObjectif;
  
  // Stats patients
  const patientsTraites = Math.round(nouveauxPatients * 0.85);
  const rdvHonores = Math.round(nombreRdv * (1 - tauxAbsence / 100));
  const tauxConversion = 85;
  
  // Répartition des actes
  const consultations = Math.round(nombreRdv * 0.44);
  const detartrages = Math.round(nombreRdv * 0.34);
  const soinsConservateurs = Math.round(nombreRdv * 0.15);
  const protheses = Math.round(nombreRdv * 0.07);
  
  const caConsultations = consultations * 50;
  const caDetartrages = detartrages * 73;
  const caSoins = soinsConservateurs * 150;
  const caProtheses = protheses * 720;
  const totalCA = caConsultations + caDetartrages + caSoins + caProtheses;
  
  const totalActes = consultations + detartrages + soinsConservateurs + protheses;
  const pctConsultations = Math.round((consultations / totalActes) * 100);
  const pctDetartrages = Math.round((detartrages / totalActes) * 100);
  const pctSoins = Math.round((soinsConservateurs / totalActes) * 100);
  const pctProtheses = Math.round((protheses / totalActes) * 100);
  
  const pctCAConsultations = Math.round((caConsultations / totalCA) * 100);
  const pctCADetartrages = Math.round((caDetartrages / totalCA) * 100);
  const pctCASoins = Math.round((caSoins / totalCA) * 100);
  const pctCAProtheses = Math.round((caProtheses / totalCA) * 100);
  
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-500 bg-green-50 border-green-500';
    if (s >= 60) return 'text-amber-500 bg-amber-50 border-amber-500';
    return 'text-red-500 bg-red-50 border-red-500';
  };
  
  const scoreColorClass = getScoreColor(score);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white text-center">
        <h1 className="text-2xl font-bold">📊 RAPPORT CABINET</h1>
        <p className="text-lg mt-2 opacity-90">{data.cabinetName}</p>
        <p className="text-sm opacity-70">Période : {data.period}</p>
      </div>

      {/* RÉSUMÉ EXÉCUTIF */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-l-4 border-blue-500 pl-3">
          🎯 RÉSUMÉ EXÉCUTIF
        </h2>
        
        {/* Score Principal */}
        <div className="flex justify-center my-6">
          <div className={`w-32 h-32 rounded-full border-4 ${scoreColorClass} flex items-center justify-center`}>
            <span className="text-4xl font-bold">{score}%</span>
          </div>
        </div>
        <p className="text-center text-slate-500 text-sm mb-6">Performance Globale</p>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-800">{ca.toLocaleString('fr-FR')} €</div>
            <div className="text-xs text-slate-500 uppercase">CA Réalisé</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-800">{objectif.toLocaleString('fr-FR')} €</div>
            <div className="text-xs text-slate-500 uppercase">Objectif</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className={`text-2xl font-bold ${pourcentageCA >= 100 ? 'text-green-500' : 'text-amber-500'}`}>{pourcentageCA}%</div>
            <div className="text-xs text-slate-500 uppercase">Progression</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-500">{nouveauxPatients}</div>
            <div className="text-xs text-slate-500 uppercase">Nouveaux Patients</div>
          </div>
        </div>
      </div>

      {/* PERFORMANCE FINANCIÈRE */}
      <div className="bg-white rounded-xl p-6 border">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-l-4 border-green-500 pl-3">
          📈 PERFORMANCE FINANCIÈRE
        </h2>

        {/* Graphique Barres SVG */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6 flex justify-center">
          <svg width="300" height="180" viewBox="0 0 300 180">
            {/* Axes */}
            <line x1="50" y1="150" x2="270" y2="150" stroke="#e2e8f0" strokeWidth="2"/>
            <line x1="50" y1="20" x2="50" y2="150" stroke="#e2e8f0" strokeWidth="2"/>
            
            {/* Lignes horizontales */}
            <line x1="50" y1="50" x2="270" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4"/>
            <line x1="50" y1="85" x2="270" y2="85" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4"/>
            <line x1="50" y1="120" x2="270" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4"/>
            
            {/* Barre CA */}
            <defs>
              <linearGradient id="gradCA" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#1d4ed8"/>
              </linearGradient>
              <linearGradient id="gradObj" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8"/>
                <stop offset="100%" stopColor="#64748b"/>
              </linearGradient>
            </defs>
            <rect x="90" y={150 - (ca / Math.max(ca, objectif)) * 120} width="60" height={(ca / Math.max(ca, objectif)) * 120} rx="4" fill="url(#gradCA)"/>
            <text x="120" y={140 - (ca / Math.max(ca, objectif)) * 120} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e293b">{(ca / 1000).toFixed(0)}k€</text>
            <text x="120" y="168" textAnchor="middle" fontSize="11" fill="#64748b">Réalisé</text>
            
            {/* Barre Objectif */}
            <rect x="170" y={150 - (objectif / Math.max(ca, objectif)) * 120} width="60" height={(objectif / Math.max(ca, objectif)) * 120} rx="4" fill="url(#gradObj)"/>
            <text x="200" y={140 - (objectif / Math.max(ca, objectif)) * 120} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e293b">{(objectif / 1000).toFixed(0)}k€</text>
            <text x="200" y="168" textAnchor="middle" fontSize="11" fill="#64748b">Objectif</text>
            
            {/* Badge % */}
            <rect x="110" y="5" width="80" height="24" rx="12" fill={pourcentageCA >= 100 ? '#10b981' : '#f59e0b'}/>
            <text x="150" y="22" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">{pourcentageCA}%</text>
          </svg>
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-600">Chiffre d'Affaires</span>
            <span className={`text-sm font-bold ${ecartCA >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {ecartCA >= 0 ? '↑' : '↓'} {ecartCA >= 0 ? '+' : ''}{ecartCA.toLocaleString('fr-FR')} €
            </span>
          </div>
          <div className="bg-slate-200 rounded-full h-5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-700 h-full rounded-full flex items-center justify-end pr-2"
              style={{ width: `${Math.min(pourcentageCA, 100)}%` }}
            >
              <span className="text-white text-xs font-bold">{pourcentageCA}%</span>
            </div>
          </div>
        </div>

        {/* Tableau Performance */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3 text-left text-slate-600 font-semibold">Indicateur</th>
              <th className="p-3 text-right text-slate-600 font-semibold">Valeur</th>
              <th className="p-3 text-right text-slate-600 font-semibold">Objectif</th>
              <th className="p-3 text-right text-slate-600 font-semibold">Écart</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3 text-slate-800">CA Total</td>
              <td className="p-3 text-right font-bold">{ca.toLocaleString('fr-FR')} €</td>
              <td className="p-3 text-right text-slate-500">{objectif.toLocaleString('fr-FR')} €</td>
              <td className={`p-3 text-right font-bold ${ecartCA >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {ecartCA >= 0 ? '+' : ''}{ecartCA.toLocaleString('fr-FR')} €
              </td>
            </tr>
            <tr className="border-b">
              <td className="p-3 text-slate-800">CA Horaire</td>
              <td className="p-3 text-right font-bold">{caHoraire} €/h</td>
              <td className="p-3 text-right text-slate-500">{caHoraireObjectif} €/h</td>
              <td className={`p-3 text-right font-bold ${ecartHoraire >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {ecartHoraire >= 0 ? '+' : ''}{ecartHoraire} €/h
              </td>
            </tr>
            <tr>
              <td className="p-3 text-slate-800">Taux de réalisation</td>
              <td className="p-3 text-right font-bold">{pourcentageCA}%</td>
              <td className="p-3 text-right text-slate-500">100%</td>
              <td className={`p-3 text-right font-bold ${pourcentageCA >= 100 ? 'text-green-500' : 'text-red-500'}`}>
                {pourcentageCA >= 100 ? '+' : ''}{pourcentageCA - 100}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ACTIVITÉ PATIENTS */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-l-4 border-purple-500 pl-3">
          👥 ACTIVITÉ PATIENTS
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-500">{nouveauxPatients}</div>
            <div className="text-xs text-slate-500 mt-1">Nouveaux patients</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-500">{patientsTraites}</div>
            <div className="text-xs text-slate-500 mt-1">Patients traités</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-purple-500">{rdvHonores}</div>
            <div className="text-xs text-slate-500 mt-1">RDV honorés</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className={`text-3xl font-bold ${tauxAbsence <= 5 ? 'text-green-500' : 'text-red-500'}`}>{tauxAbsence}%</div>
            <div className="text-xs text-slate-500 mt-1">Taux d'absence</div>
          </div>
        </div>

        {/* Taux de conversion */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-600">Taux de conversion patients</span>
            <span className="text-sm font-bold text-green-500">{tauxConversion}%</span>
          </div>
          <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full"
              style={{ width: `${tauxConversion}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Objectif : ≥ 80% | {tauxConversion >= 80 ? '✅ Objectif atteint' : '⚠️ À améliorer'}
          </p>
        </div>
      </div>

      {/* RÉPARTITION DES ACTES */}
      <div className="bg-white rounded-xl p-6 border">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-l-4 border-amber-500 pl-3">
          🦷 RÉPARTITION DES ACTES
        </h2>

        {/* Graphique Donut + Légende */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
          <svg width="180" height="180" viewBox="0 0 200 200">
            {/* Donut segments */}
            <circle cx="100" cy="100" r="70" fill="none" stroke="#3b82f6" strokeWidth="30" 
              strokeDasharray={`${pctCAConsultations * 4.4} 440`} 
              strokeDashoffset="0" 
              transform="rotate(-90 100 100)"/>
            <circle cx="100" cy="100" r="70" fill="none" stroke="#10b981" strokeWidth="30" 
              strokeDasharray={`${pctCADetartrages * 4.4} 440`} 
              strokeDashoffset={`${-pctCAConsultations * 4.4}`} 
              transform="rotate(-90 100 100)"/>
            <circle cx="100" cy="100" r="70" fill="none" stroke="#8b5cf6" strokeWidth="30" 
              strokeDasharray={`${pctCASoins * 4.4} 440`} 
              strokeDashoffset={`${-(pctCAConsultations + pctCADetartrages) * 4.4}`} 
              transform="rotate(-90 100 100)"/>
            <circle cx="100" cy="100" r="70" fill="none" stroke="#f59e0b" strokeWidth="30" 
              strokeDasharray={`${pctCAProtheses * 4.4} 440`} 
              strokeDashoffset={`${-(pctCAConsultations + pctCADetartrages + pctCASoins) * 4.4}`} 
              transform="rotate(-90 100 100)"/>
            <circle cx="100" cy="100" r="45" fill="white"/>
            <text x="100" y="95" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e293b">CA Total</text>
            <text x="100" y="112" textAnchor="middle" fontSize="11" fill="#64748b">{totalCA.toLocaleString('fr-FR')}€</text>
          </svg>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-sm text-slate-600">Consultations <strong>{pctCAConsultations}%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-sm text-slate-600">Détartrages <strong>{pctCADetartrages}%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span className="text-sm text-slate-600">Soins <strong>{pctCASoins}%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500"></div>
              <span className="text-sm text-slate-600">Prothèses <strong>{pctCAProtheses}%</strong></span>
            </div>
          </div>
        </div>

        {/* Barres de progression */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-slate-600">Consultations ({consultations})</span>
              <span className="text-sm font-bold text-blue-500">{caConsultations.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="bg-slate-200 rounded-full h-4 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full flex items-center pl-2" style={{ width: `${pctConsultations}%` }}>
                <span className="text-white text-xs font-bold">{pctConsultations}%</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-slate-600">Détartrages ({detartrages})</span>
              <span className="text-sm font-bold text-green-500">{caDetartrages.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="bg-slate-200 rounded-full h-4 overflow-hidden">
              <div className="bg-green-500 h-full rounded-full flex items-center pl-2" style={{ width: `${pctDetartrages}%` }}>
                <span className="text-white text-xs font-bold">{pctDetartrages}%</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-slate-600">Soins conservateurs ({soinsConservateurs})</span>
              <span className="text-sm font-bold text-purple-500">{caSoins.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="bg-slate-200 rounded-full h-4 overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full flex items-center pl-2" style={{ width: `${pctSoins}%` }}>
                <span className="text-white text-xs font-bold">{pctSoins}%</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-slate-600">Prothèses ({protheses})</span>
              <span className="text-sm font-bold text-amber-500">{caProtheses.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="bg-slate-200 rounded-full h-4 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full flex items-center pl-2" style={{ width: `${pctProtheses}%` }}>
                <span className="text-white text-xs font-bold">{pctProtheses}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau récapitulatif */}
        <table className="w-full text-sm mt-6">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="p-3 text-left font-semibold">Type d'acte</th>
              <th className="p-3 text-center font-semibold">Nombre</th>
              <th className="p-3 text-right font-semibold">CA Généré</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b bg-white">
              <td className="p-3">🔍 Consultations</td>
              <td className="p-3 text-center">{consultations}</td>
              <td className="p-3 text-right font-bold">{caConsultations.toLocaleString('fr-FR')} €</td>
            </tr>
            <tr className="border-b bg-slate-50">
              <td className="p-3">🦷 Détartrages</td>
              <td className="p-3 text-center">{detartrages}</td>
              <td className="p-3 text-right font-bold">{caDetartrages.toLocaleString('fr-FR')} €</td>
            </tr>
            <tr className="border-b bg-white">
              <td className="p-3">💉 Soins conservateurs</td>
              <td className="p-3 text-center">{soinsConservateurs}</td>
              <td className="p-3 text-right font-bold">{caSoins.toLocaleString('fr-FR')} €</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="p-3">👑 Prothèses</td>
              <td className="p-3 text-center">{protheses}</td>
              <td className="p-3 text-right font-bold">{caProtheses.toLocaleString('fr-FR')} €</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-slate-800 text-white">
              <td className="p-3 font-bold">TOTAL</td>
              <td className="p-3 text-center font-bold">{totalActes}</td>
              <td className="p-3 text-right font-bold text-green-400">{totalCA.toLocaleString('fr-FR')} €</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* RECOMMANDATIONS */}
      <div className="bg-gradient-to-b from-amber-50 to-yellow-100 rounded-xl p-6">
        <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2 border-l-4 border-amber-500 pl-3">
          💡 RECOMMANDATIONS
        </h2>
        
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold text-slate-800 mb-2">1. Optimiser le taux de conversion des devis (+5-10% potentiel)</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>Mettre en place un suivi systématique des devis non acceptés</li>
              <li>Proposer des facilités de paiement</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold text-slate-800 mb-2">
              2. {tauxAbsence > 5 ? `Réduire le taux d'absence (actuellement ${tauxAbsence}%)` : 'Maintenir le bon taux de présence ✓'}
            </h4>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>Envoyer des rappels SMS 48h et 24h avant le RDV</li>
              <li>Mettre en place une politique de gestion des annulations</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
            <h4 className="font-semibold text-slate-800 mb-2">3. Développer l'activité prothétique</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>Fort potentiel de CA sur ce segment (actuellement {pctProtheses}% des actes)</li>
              <li>Investir dans la formation continue</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
            <h4 className="font-semibold text-slate-800 mb-2">4. Fidélisation patients</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>Programme de rappel pour contrôles annuels</li>
              <li>Communication régulière (newsletter)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* PROCHAINES ÉTAPES */}
      <div className="bg-white rounded-xl p-6 border">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-l-4 border-cyan-500 pl-3">
          📅 PROCHAINES ÉTAPES
        </h2>
        
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
            <span className="text-slate-600">Réunion d'équipe pour présenter les résultats</span>
          </div>
          <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
            <span className="text-slate-600">Mise en place du système de rappels automatiques</span>
          </div>
          <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
            <span className="text-slate-600">Audit des devis en attente (&gt; 30 jours)</span>
          </div>
          <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
            <span className="text-slate-600">Formation sur les techniques de présentation des plans de traitement</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-slate-800 rounded-xl p-6 text-center">
        <p className="text-slate-400 text-sm">
          📅 Rapport généré automatiquement par <strong className="text-white">Efficience Analytics</strong>
        </p>
        <p className="text-slate-500 text-xs mt-2">
          Date de génération : {new Date(report.generatedAt).toLocaleString('fr-FR')}
        </p>
        <p className="text-slate-600 text-xs mt-4">
          © 2026 Efficience Dentaire - Plateforme sécurisée HDS Certifiée
        </p>
      </div>
    </div>
  );
}

export function AIReportGenerator({ data, onReportGenerated }: AIReportGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [copied, setCopied] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    console.log('🚀 Démarrage génération rapport pour:', data.cabinetName);
    console.log('📦 Données envoyées:', JSON.stringify(data, null, 2));
    
    try {
      const response = await fetch('/api/ai/report-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cabinetName: data.cabinetName,
          cabinetData: data.cabinetData,
          period: data.period,
        }),
      });

      console.log('📡 Réponse HTTP status:', response.status);
      const result = await response.json();
      console.log('📄 Résultat brut:', result);
      console.log('📄 result.success:', result.success);
      console.log('📄 result.data:', result.data);
      console.log('📄 result.data?.report existe:', !!result.data?.report);

      if (!response.ok) {
        throw new Error(result.error || 'Erreur génération rapport');
      }

      if (!result.data || !result.data.report) {
        console.error('❌ Données de rapport manquantes dans la réponse');
        throw new Error('Le rapport généré est vide ou invalide');
      }

      setReport(result.data);
      onReportGenerated?.(result.data);
      toast({ title: 'Succès', description: 'Rapport généré avec succès' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('❌ Erreur génération rapport:', error);
      toast({ 
        title: 'Erreur', 
        description: `Erreur lors de la génération du rapport: ${errorMessage}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (report) {
      await navigator.clipboard.writeText(report.report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Succès', description: 'Rapport copié dans le presse-papiers' });
    }
  };

  const handleDownload = async () => {
    if (report) {
      const element = document.createElement('a');
      const file = new Blob([report.report], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `rapport-${data.cabinetName}-${data.period}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast({ title: 'Succès', description: 'Rapport téléchargé en TXT' });
    }
  };

  const handleDownloadPDF = async () => {
    if (report) {
      try {
        // Créer un contenu HTML enrichi pour le PDF (reprend RichReportDisplay)
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Rapport cabinet - ${data.cabinetName}</title>
            <style>
              :root {
                --primary-blue: #2563eb;
                --secondary-blue: #3b82f6;
                --accent-green: #10b981;
                --accent-yellow: #eab308;
                --light-yellow: #fef9c3;
                --light-blue: #e0f2fe;
                --gray-bg: #f8fafc;
                --gray-border: #e0e7ef;
                --gray-text: #64748b;
              }
              body {
                font-family: 'Segoe UI', Arial, sans-serif;
                padding: 48px;
                line-height: 1.7;
                background: linear-gradient(135deg, var(--gray-bg) 0%, var(--light-blue) 100%);
                color: #222;
              }
              .logo {
                display: flex;
                align-items: center;
                margin-bottom: 36px;
                justify-content: center;
              }
              .logo img {
                height: 56px;
                margin-right: 18px;
              }
              .logo span {
                font-size: 2rem;
                font-weight: 700;
                color: var(--primary-blue);
                letter-spacing: 0.04em;
              }
              h1 {
                color: var(--primary-blue);
                border-bottom: 3px solid var(--primary-blue);
                padding-bottom: 14px;
                font-size: 2.4rem;
                letter-spacing: 0.02em;
                margin-bottom: 32px;
              }
              h2 {
                color: #0f172a;
                margin-top: 36px;
                font-size: 1.5rem;
              }
              h3 {
                color: var(--secondary-blue);
                margin-top: 24px;
                font-size: 1.2rem;
              }
              .kpi {
                display: flex;
                gap: 32px;
                margin: 32px 0;
                justify-content: center;
              }
              .kpi-item {
                background: #fff;
                border-radius: 16px;
                box-shadow: 0 4px 16px var(--gray-border);
                padding: 24px 32px;
                text-align: center;
                min-width: 140px;
                border: 1px solid var(--gray-border);
                font-size: 1.1rem;
                position: relative;
              }
              .kpi-item div:first-child {
                font-size: 1.4rem;
                font-weight: 600;
                color: var(--primary-blue);
                margin-bottom: 6px;
              }
              .score {
                font-size: 56px;
                font-weight: bold;
                color: var(--accent-green);
                margin-bottom: 12px;
                text-shadow: 0 2px 8px #a7f3d0;
              }
              .section {
                margin-bottom: 40px;
                background: #fff;
                border-radius: 18px;
                box-shadow: 0 2px 12px var(--gray-border);
                padding: 32px 28px;
              }
              .section-title {
                font-size: 22px;
                font-weight: bold;
                color: #1e293b;
                margin-bottom: 18px;
                letter-spacing: 0.01em;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .section-title::before {
                content: '';
                display: inline-block;
                width: 8px;
                height: 8px;
                background: var(--primary-blue);
                border-radius: 50%;
              }
              .footer {
                margin-top: 48px;
                padding-top: 24px;
                border-top: 2px solid var(--gray-border);
                font-size: 13px;
                color: var(--gray-text);
                text-align: center;
              }
              .table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                font-size: 1.05rem;
                background: var(--gray-bg);
                border-radius: 12px;
                overflow: hidden;
              }
              .table th, .table td {
                border: 1px solid var(--gray-border);
                padding: 14px 10px;
                text-align: left;
              }
              .table th {
                background-color: var(--gray-border);
                color: var(--primary-blue);
                font-weight: 600;
              }
              .recommend {
                background: linear-gradient(90deg, var(--light-yellow) 60%, #fef08a 100%);
                border-left: 6px solid var(--accent-yellow);
                padding: 20px;
                margin-bottom: 16px;
                border-radius: 12px;
                font-size: 1.08rem;
                box-shadow: 0 2px 8px #fef08a;
              }
              .plan {
                background: linear-gradient(90deg, var(--light-blue) 60%, #bae6fd 100%);
                border-left: 6px solid var(--secondary-blue);
                padding: 20px;
                margin-bottom: 16px;
                border-radius: 12px;
                font-size: 1.08rem;
                box-shadow: 0 2px 8px #bae6fd;
              }
              .plan ul {
                margin: 0;
                padding-left: 18px;
              }
              .badge {
                display: inline-block;
                background: var(--accent-green);
                color: #fff;
                font-size: 0.95rem;
                font-weight: 600;
                border-radius: 8px;
                padding: 4px 12px;
                margin-left: 8px;
              }
            </style>
          </head>
            <body>
            <div class="logo">
              <img src="https://efficience-analytics.com/logo.png" alt="Efficience Analytics Logo" />
              <span>Efficience Analytics</span>
            </div>
            <h1>📊 RAPPORT CABINET</h1>
            <div class="section">
              <div class="section-title">🎯 RÉSUMÉ EXÉCUTIF</div>
              <div class="score">${data.cabinetData.score || Math.round((data.cabinetData.caActuel / data.cabinetData.caObjectif) * 100) || ''}%</div>
              <div class="kpi">
                <div class="kpi-item">
                  <div>${data.cabinetData.caActuel?.toLocaleString('fr-FR') || ''} €</div>
                  <div>CA Réalisé</div>
                </div>
                <div class="kpi-item">
                  <div>${data.cabinetData.caObjectif?.toLocaleString('fr-FR') || ''} €</div>
                  <div>Objectif</div>
                </div>
                <div class="kpi-item">
                  <div>${Math.round((data.cabinetData.caActuel / data.cabinetData.caObjectif) * 100) || ''}%</div>
                  <div>Progression</div>
                </div>
                <div class="kpi-item">
                  <div>${data.cabinetData.nouveauxPatients || ''}</div>
                  <div>Nouveaux Patients</div>
                </div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">📈 PERFORMANCE FINANCIÈRE</div>
              <table class="table">
                <thead>
                  <tr><th>Indicateur</th><th>Valeur</th><th>Objectif</th><th>Écart</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>CA Total</td>
                    <td>${data.cabinetData.caActuel?.toLocaleString('fr-FR') || ''} €</td>
                    <td>${data.cabinetData.caObjectif?.toLocaleString('fr-FR') || ''} €</td>
                    <td>${(data.cabinetData.caActuel - data.cabinetData.caObjectif)?.toLocaleString('fr-FR') || ''} €</td>
                  </tr>
                  <tr>
                    <td>CA Horaire</td>
                    <td>${Math.round((data.cabinetData.caActuel || 0) / 160)} €/h</td>
                    <td>${Math.round((data.cabinetData.caObjectif || 0) / 160)} €/h</td>
                    <td>${Math.round(((data.cabinetData.caActuel || 0) / 160) - ((data.cabinetData.caObjectif || 0) / 160))} €/h</td>
                  </tr>
                  <tr>
                    <td>Taux de réalisation</td>
                    <td>${Math.round((data.cabinetData.caActuel / data.cabinetData.caObjectif) * 100) || ''}%</td>
                    <td>100%</td>
                    <td>${Math.round((data.cabinetData.caActuel / data.cabinetData.caObjectif) * 100) - 100 || ''}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="section">
              <div class="section-title">👥 ACTIVITÉ PATIENTS</div>
              <div class="kpi">
                <div class="kpi-item">
                  <div>${data.cabinetData.nouveauxPatients || ''}</div>
                  <div>Nouveaux patients</div>
                </div>
                <div class="kpi-item">
                  <div>${Math.round((data.cabinetData.nouveauxPatients || 0) * 0.85)}</div>
                  <div>Patients traités</div>
                </div>
                <div class="kpi-item">
                  <div>${Math.round((data.cabinetData.nombreRdv || 0) * (1 - (data.cabinetData.tauxAbsence || 0) / 100))}</div>
                  <div>RDV honorés</div>
                </div>
                <div class="kpi-item">
                  <div>${data.cabinetData.tauxAbsence || ''}%</div>
                  <div>Taux d'absence</div>
                </div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">💡 RECOMMANDATIONS</div>
              <div class="recommend">
                ${report?.recommendations?.recommendations?.map((r: string) => `<div>• ${r}</div>`).join('') || ''}
              </div>
              <div class="plan">
                <strong>Plan d'action :</strong>
                <ul>
                  ${report?.recommendations?.actionPlan?.map((a: any) => `<li>${a.action} <span style="color:#10b981">(${a.impact})</span> <span style="color:#64748b">[${a.deadline}]</span></li>`).join('') || ''}
                </ul>
              </div>
            </div>
            <div class="footer">Rapport cabinet généré automatiquement par Efficience Analytics</div>
          </body>
          </html>
        `;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 500);
          toast({ title: 'Succès', description: 'Utilisez "Enregistrer en PDF" dans la boîte de dialogue d\'impression' });
        }
      } catch (error) {
        console.error('Erreur téléchargement PDF:', error);
        toast({ title: 'Info', description: 'Téléchargez le fichier TXT à la place', variant: 'default' });
      }
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2"
      >
        <Zap size={16} />
        Générer avec IA
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rapport cabinet IA - {data.cabinetName}</DialogTitle>
            <DialogDescription className="sr-only">Génération de rapport cabinet IA pour {data.cabinetName}</DialogDescription>
          </DialogHeader>

          {!report ? (
            <div className="space-y-6 py-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Rapport cabinet IA Premium</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Générez un rapport cabinet complet alimenté par l'IA incluant :
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Résumé exécutif personnalisé</li>
                  <li>Analyse détaillée de la performance</li>
                  <li>Prédictions IA pour la période suivante</li>
                  <li>Recommandations stratégiques priorisées</li>
                  <li>Plan d'action opérationnel</li>
                  <li>KPIs critiques à surveiller</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="text-sm text-amber-900">
                  ⏱️ <strong>Durée estimée:</strong> 10-15 secondes
                </p>
              </div>

              <Button
                onClick={generateReport}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 h-11"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin mr-2" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Zap size={16} className="mr-2" />
                    Générer le rapport cabinet IA
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-6">
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy size={16} className="mr-2" />
                  {copied ? 'Copié!' : 'Copier'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download size={16} className="mr-2" />
                  Télécharger TXT
                </Button>
                <Button variant="default" size="sm" onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700">
                  <FileText size={16} className="mr-2" />
                  Télécharger PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => setReport(null)}>
                  <RefreshCw size={16} className="mr-2" />
                  Régénérer
                </Button>
              </div>

              {/* AFFICHAGE RICHE DU RAPPORT */}
              <div className="max-h-[600px] overflow-y-auto">
                <RichReportDisplay data={data} report={report} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
