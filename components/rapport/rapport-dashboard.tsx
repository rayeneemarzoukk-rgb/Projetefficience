"use client";
import React, { useState } from "react";
import { Download, Mail, TrendingUp, TrendingDown } from "lucide-react";

interface KPI {
  caActuel: number;
  caObjectif: number;
  progression: number;
  nouveauxPatients: number;
  score: number;
  tauxAbsence?: number;
}

interface Acte {
  type: string;
  nombre: number;
  ca: number;
  couleur: string;
  pourcentage: number;
}

interface RapportDashboardProps {
  cabinet: {
    id?: string;
    nom: string;
    email?: string;
    score: number;
    caActuel: number;
    caObjectif: number;
    progression: number;
    nouveauxPatients: number;
    tauxAbsence?: number;
    actes: Acte[];
    periode?: string;
    statut?: string;
  };
  patients?: any[];
}

export default function RapportDashboard({ cabinet, patients }: RapportDashboardProps) {
  const [sending, setSending] = useState(false);
  
  const {
    nom,
    score,
    caActuel,
    caObjectif,
    progression,
    nouveauxPatients,
    tauxAbsence = 5,
    actes = [],
    periode = new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" }),
    statut = "OK",
    email,
  } = cabinet;

  // Calculer le taux de réussite
  const tauxReussite = ((caActuel / caObjectif) * 100).toFixed(1);
  const isObjectifAtteint = caActuel >= caObjectif;

  // Générer les données pour le graphique simple
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    return "text-orange-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-gradient-to-r from-green-100 to-green-50";
    if (score >= 70) return "bg-gradient-to-r from-blue-100 to-blue-50";
    return "bg-gradient-to-r from-orange-100 to-orange-50";
  };

  const sendReport = async () => {
    try {
      setSending(true);
      const response = await fetch("/api/rapport/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cabinetId: cabinet.id,
          cabinetEmail: email,
          cabinetNom: nom,
          rapport: {
            periode,
            score,
            caActuel,
            caObjectif,
            progression,
            nouveauxPatients,
            tauxAbsence,
            actes,
          },
        }),
      });

      if (response.ok) {
        alert("✅ Rapport envoyé avec succès à " + email);
      } else {
        alert("❌ Erreur lors de l'envoi du rapport");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("❌ Erreur lors de l'envoi du rapport");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* En-tête avec boutons d'action */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Rapport Cabinet</h1>
            <p className="text-gray-600">{nom}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={sendReport}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {sending ? "Envoi..." : "Envoyer par email"}
            </button>
          </div>
        </div>

        {/* En-tête du rapport */}
        <div className={`${getScoreBgColor(score)} rounded-lg p-8 mb-6 border border-gray-200`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Score global */}
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(score)} mb-2`}>{score}%</div>
              <div className="text-sm font-semibold text-gray-700">Score Global</div>
              <div className="text-xs text-gray-500 mt-1">Performance générale</div>
            </div>

            {/* CA */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {caActuel.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}€
              </div>
              <div className="text-sm font-semibold text-gray-700">CA Réalisé</div>
              <div className="text-xs text-gray-500">vs {caObjectif.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}€</div>
            </div>

            {/* Taux de réussite */}
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${isObjectifAtteint ? "text-green-600" : "text-orange-600"}`}>
                {tauxReussite}%
              </div>
              <div className="text-sm font-semibold text-gray-700">Objectif CA</div>
              <div className="flex items-center justify-center text-xs text-gray-500 mt-1">
                {isObjectifAtteint ? (
                  <>
                    <TrendingUp className="w-3 h-3 mr-1 text-green-600" /> Atteint
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3 mr-1 text-orange-600" /> Manquant
                  </>
                )}
              </div>
            </div>

            {/* Progression */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">+{progression}%</div>
              <div className="text-sm font-semibold text-gray-700">Progression</div>
              <div className="text-xs text-gray-500 mt-1">vs période précédente</div>
            </div>
          </div>

          {/* Info supplémentaires */}
          <div className="mt-6 pt-6 border-t border-gray-300 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-lg">{nouveauxPatients}</div>
              <div className="text-xs text-gray-600">Nouveaux patients</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-lg">{tauxAbsence}%</div>
              <div className="text-xs text-gray-600">Taux d'absence</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-lg">{periode}</div>
              <div className="text-xs text-gray-600">Période analysée</div>
            </div>
          </div>
        </div>

        {/* Répartition des actes */}
        {actes && actes.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-3">🦷</span> Répartition des Actes Dentaires
            </h2>

            <div className="space-y-3">
              {actes.map((acte) => (
                <div key={acte.type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700">{acte.type}</span>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900 mr-4">
                        {acte.ca.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}€
                      </span>
                      <span className="text-sm text-gray-500">{acte.pourcentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${acte.pourcentage}%`,
                        backgroundColor: acte.couleur || "#3b82f6",
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{acte.nombre} actes</div>
                </div>
              ))}
            </div>

            {/* Graphique simple (barre horizontale cumulée) */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Vue d'ensemble</h3>
              <div className="flex h-8 rounded-lg overflow-hidden bg-gray-100">
                {actes.map((acte, index) => (
                  <div
                    key={index}
                    className="transition-all hover:opacity-80"
                    style={{
                      width: `${acte.pourcentage}%`,
                      backgroundColor: acte.couleur || "#3b82f6",
                      minWidth: `${acte.pourcentage > 5 ? 0 : 2}px`,
                    }}
                    title={`${acte.type}: ${acte.pourcentage}%`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                {actes.map((acte) => (
                  <div key={acte.type} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: acte.couleur || "#3b82f6" }}
                    />
                    <span className="text-gray-600">{acte.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activité patients */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-3">👥</span> Activité Patients
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-3xl font-bold text-blue-700 mb-1">{nouveauxPatients}</div>
              <div className="text-sm text-gray-600">Nouveaux patients</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-3xl font-bold text-green-700 mb-1">{patients?.length ?? 0}</div>
              <div className="text-sm text-gray-600">Patients traités</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-3xl font-bold text-purple-700 mb-1">
                {patients?.length ? Math.round(caActuel / (patients.length || 1)) : 0}€
              </div>
              <div className="text-sm text-gray-600">CA moyen/patient</div>
            </div>
          </div>
        </div>

        {/* Recommandations */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-3">💡</span> Recommandations
          </h2>

          <ul className="space-y-2 text-sm text-gray-700">
            {score >= 90 ? (
              <>
                <li>✅ Performance excellente - Maintenir le cap</li>
                <li>✅ Objectif CA atteint - Augmenter les objectifs si possible</li>
                <li>✅ Taux d'absence faible - Continuer le suivi</li>
              </>
            ) : score >= 70 ? (
              <>
                <li>⚠️ Performance correcte - Amélioration possible</li>
                <li>⚠️ Objectif CA {isObjectifAtteint ? "atteint" : "non atteint"} - Action requise</li>
                <li>⚠️ Analyser les actes les moins productifs</li>
              </>
            ) : (
              <>
                <li>🔴 Performance faible - Intervention recommandée</li>
                <li>🔴 Objectif CA loin d'être atteint</li>
                <li>🔴 Contacter le support pour un plan d'action</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}