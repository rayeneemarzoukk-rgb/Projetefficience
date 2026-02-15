"use client";

import React from "react";

interface ReportGeneratorProps {
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
    actes?: Array<{
      type: string;
      nombre: number;
      ca: number;
      couleur: string;
      pourcentage: number;
    }>;
    periode?: string;
    statut?: string;
  };
  patients?: any[];
  globalStats?: {
    totalCabinets?: number;
    emailsEnvoyes?: number;
    rapportsNonGeneres?: number;
    performanceMoyenne?: number;
  };
}

export default function ReportGenerator({ cabinet, patients, globalStats }: ReportGeneratorProps) {
  const {
    nom = "Cabinet sans nom",
    score = 85,
    caActuel = 50000,
    caObjectif = 45000,
    progression = 5,
    nouveauxPatients = 12,
    tauxAbsence = 5,
    actes = [],
    periode = new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" }),
  } = cabinet;

  // Calculer les statuts et couleurs
  const getCabinetStatut = () => {
    if (caActuel >= caObjectif) return "OK";
    if (caActuel >= caObjectif * 0.85) return "À suivre";
    return "Alerte";
  };

  const getStatutDetails = (statut: string) => {
    switch (statut) {
      case "OK":
        return { color: "#10b981", bgColor: "#d1fae5", icon: "✅", message: "Objectif atteint" };
      case "À suivre":
        return { color: "#f59e0b", bgColor: "#fef3c7", icon: "⚠️", message: "Vérification requise" };
      case "Alerte":
        return { color: "#ef4444", bgColor: "#fee2e2", icon: "🔴", message: "Actions urgentes" };
      default:
        return { color: "#64748b", bgColor: "#f1f5f9", icon: "❓", message: "Inconnu" };
    }
  };

  const cabinetStatut = getCabinetStatut();
  const statutDetails = getStatutDetails(cabinetStatut);
  const pourcentageCA = caObjectif > 0 ? Math.round((caActuel / caObjectif) * 100) : 0;
  const ecartCA = caActuel - caObjectif;
  const caHoraire = Math.round(caActuel / 160);
  const caHoraireObjectif = Math.round(caObjectif / 160);
  const ecartHoraire = caHoraire - caHoraireObjectif;

  const getStatutColor = () => {
    if (score >= 90) return "#10b981";
    if (score >= 70) return "#f59e0b";
    return "#ef4444";
  };

  const getStatutPhrase = () => {
    if (cabinetStatut === "OK") return "Félicitations, votre cabinet a atteint ses objectifs ce mois-ci !";
    if (cabinetStatut === "À suivre") return "Attention, votre cabinet est proche de l'objectif mais nécessite un suivi.";
    return "Alerte : le chiffre d'affaires est loin de l'objectif, des actions sont recommandées.";
  };

  const getTendanceColor = (ecart: number) => {
    if (ecart > 0) return "#10b981";
    if (ecart < 0) return "#ef4444";
    return "#64748b";
  };

  const getStatutBgColor = (score: number) => {
    if (score >= 90) return "#dbeafe";
    if (score >= 70) return "#fef3c7";
    return "#fee2e2";
  };

  // Calculer les stats
  const nombreRdv = actes.reduce((sum, a) => sum + (a.nombre || 0), 0) || 180;
  const patientsTraites = Math.round(nombreRdv * 0.75);
  const rdvHonores = Math.round(nombreRdv * (1 - tauxAbsence / 100));
  const tauxConversion = 85;

  // Répartition des actes si pas fournie
  const finalActes = actes.length > 0 ? actes : [
    { type: "Consultations", nombre: 45, ca: 9000, couleur: "#3b82f6", pourcentage: 44 },
    { type: "Détartrages", nombre: 38, ca: 9500, couleur: "#10b981", pourcentage: 34 },
    { type: "Soins conservateurs", nombre: 22, ca: 6600, couleur: "#8b5cf6", pourcentage: 15 },
    { type: "Prothèses", nombre: 18, ca: 7200, couleur: "#f59e0b", pourcentage: 7 },
  ];

  const totalCA = finalActes.reduce((sum, a) => sum + a.ca, 0);
  const pctCAConsultations = finalActes[0] ? Math.round((finalActes[0].ca / totalCA) * 100) : 25;
  const pctCADetartrages = finalActes[1] ? Math.round((finalActes[1].ca / totalCA) * 100) : 25;
  const pctCASoins = finalActes[2] ? Math.round((finalActes[2].ca / totalCA) * 100) : 25;
  const pctCAProtheses = finalActes[3] ? Math.round((finalActes[3].ca / totalCA) * 100) : 25;

  return (
    <div style={{ 
      backgroundColor: "#f0f4f8",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      margin: 0,
      padding: "20px",
    }}>
      <div style={{
        maxWidth: "700px",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}>
        {/* HEADER */}
        <div style={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
          padding: "35px 40px",
          textAlign: "center",
          color: "white",
        }}>
          <h1 style={{ margin: "0", fontSize: "26px", fontWeight: 700 }}>
            📊 RAPPORT DE PERFORMANCE
          </h1>
          <p style={{ margin: "10px 0 0", fontSize: "18px" }}>{nom}</p>
          <p style={{ margin: "5px 0 0", fontSize: "14px", opacity: 0.7 }}>
            Période : {periode}
          </p>
        </div>

        {/* SYNTHÈSE GLOBALE */}
        {globalStats && (globalStats.totalCabinets || globalStats.emailsEnvoyes) && (
          <div style={{
            padding: "30px 40px",
            background: "linear-gradient(180deg, #f8fafc 0%, white 100%)",
            borderBottom: "1px solid #e2e8f0",
          }}>
            <h2 style={{
              color: "#1e293b",
              fontSize: "18px",
              margin: "0 0 20px",
              borderLeft: "4px solid #3b82f6",
              paddingLeft: "12px",
            }}>
              📋 Synthèse Globale
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "15px",
            }}>
              {/* Cabinets Suivis */}
              <div style={{
                background: "#dbeafe",
                border: "1px solid #93c5fd",
                borderRadius: "10px",
                padding: "16px",
                textAlign: "center",
                minHeight: "100px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#0369a1",
                  marginBottom: "4px",
                }}>
                  {globalStats.totalCabinets || 0}
                </div>
                <div style={{
                  fontSize: "13px",
                  color: "#0369a1",
                  fontWeight: 600,
                }}>
                  📊 Cabinets Suivis
                </div>
              </div>

              {/* Rappor Générés */}
              <div style={{
                background: "#fce7f3",
                border: "1px solid #fbcfe8",
                borderRadius: "10px",
                padding: "16px",
                textAlign: "center",
                minHeight: "100px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#be185d",
                  marginBottom: "4px",
                }}>
                  {globalStats.totalCabinets || 0}
                </div>
                <div style={{
                  fontSize: "13px",
                  color: "#be185d",
                  fontWeight: 600,
                }}>
                  📋 Rapports Générés
                </div>
              </div>

              {/* Emails Envoyés */}
              <div style={{
                background: "#dcfce7",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                padding: "16px",
                textAlign: "center",
                minHeight: "100px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#15803d",
                  marginBottom: "4px",
                }}>
                  {globalStats.emailsEnvoyes || 0}
                </div>
                <div style={{
                  fontSize: "13px",
                  color: "#15803d",
                  fontWeight: 600,
                }}>
                  Emails Envoyés
                </div>
              </div>

              {/* Performance Moyenne */}
              <div style={{
                background: "#fce7f3",
                border: "1px solid #fbcfe8",
                borderRadius: "10px",
                padding: "16px",
                textAlign: "center",
                minHeight: "100px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#be185d",
                  marginBottom: "4px",
                }}>
                  {globalStats.performanceMoyenne || 0}%
                </div>
                <div style={{
                  fontSize: "13px",
                  color: "#be185d",
                  fontWeight: 600,
                }}>
                  📈 Performance Moyenne
                </div>
              </div>
            </div>
          </div>
        )}        {/* RÉSUMÉ EXÉCUTIF */}
        <div style={{ padding: "30px 40px", background: "linear-gradient(180deg, #f8fafc 0%, white 100%)" }}>
          <h2 style={{
            color: "#1e293b",
            fontSize: "18px",
            margin: "0 0 20px",
            borderLeft: "4px solid #3b82f6",
            paddingLeft: "12px",
          }}>
            🎯 RÉSUMÉ EXÉCUTIF
          </h2>

          <div style={{ marginBottom: "18px" }}>
            <span style={{ fontSize: "16px", color: "#3b82f6", fontWeight: "bold" }}>
              Statut du cabinet :{" "}
            </span>
            <span style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: cabinetStatut === "OK" ? "#10b981" : cabinetStatut === "À suivre" ? "#f59e0b" : "#ef4444",
            }}>
              {cabinetStatut}
            </span>
            <div style={{ marginTop: "8px", fontSize: "15px", color: "#64748b" }}>
              {getStatutPhrase()}
            </div>
          </div>

          {/* Score Principal */}
          <div style={{ textAlign: "center", margin: "25px 0" }}>
            <div style={{
              display: "inline-block",
              background: `${getStatutColor()}15`,
              border: `3px solid ${getStatutColor()}`,
              borderRadius: "50%",
              width: "140px",
              height: "140px",
              lineHeight: "140px",
            }}>
              <span style={{
                fontSize: "52px",
                fontWeight: "bold",
                color: getStatutColor(),
              }}>
                {score}%
              </span>
            </div>
            <p style={{ color: "#64748b", marginTop: "10px", fontSize: "14px" }}>
              Performance Globale
            </p>
          </div>

          {/* Statut du Cabinet */}
          <div style={{
            textAlign: "center",
            marginBottom: "25px",
            padding: "16px",
            background: statutDetails.bgColor,
            borderRadius: "12px",
            border: `2px solid ${statutDetails.color}`,
          }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>
              {statutDetails.icon}
            </div>
            <div style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: statutDetails.color,
              marginBottom: "4px",
            }}>
              {cabinetStatut}
            </div>
            <div style={{
              fontSize: "13px",
              color: statutDetails.color,
            }}>
              {statutDetails.message}
            </div>
          </div>

          {/* Points Clés */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "20px" }}>
            <div style={{
              padding: "12px",
              background: "#f1f5f9",
              borderRadius: "8px 0 0 8px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>
                {(caActuel / 1000).toFixed(0)}k€
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>
                CA Réalisé
              </div>
            </div>

            <div style={{ padding: "12px", background: "#f1f5f9", textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>
                {(caObjectif / 1000).toFixed(0)}k€
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>
                Objectif
              </div>
            </div>

            <div style={{ padding: "12px", background: "#f1f5f9", textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: getTendanceColor(ecartCA) }}>
                {pourcentageCA}%
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>
                Progression
              </div>
            </div>

            <div style={{
              padding: "12px",
              background: "#f1f5f9",
              borderRadius: "0 8px 8px 0",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#3b82f6" }}>
                {nouveauxPatients}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>
                Nouveaux Patients
              </div>
            </div>
          </div>
        </div>

        {/* PERFORMANCE FINANCIÈRE */}
        <div style={{ padding: "25px 40px" }}>
          <h2 style={{
            color: "#1e293b",
            fontSize: "18px",
            margin: "0 0 20px",
            borderLeft: "4px solid #10b981",
            paddingLeft: "12px",
          }}>
            📈 PERFORMANCE FINANCIÈRE
          </h2>

          {/* Barre de progression CA */}
          <div style={{ marginBottom: "25px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#475569", fontSize: "14px" }}>Chiffre d'Affaires</span>
              <span style={{ color: getTendanceColor(ecartCA), fontWeight: "bold", fontSize: "14px" }}>
                {ecartCA >= 0 ? "+" : ""}{ecartCA.toLocaleString("fr-FR")} €
              </span>
            </div>
            <div style={{
              background: "#e2e8f0",
              borderRadius: "10px",
              height: "24px",
              overflow: "hidden",
              position: "relative",
            }}>
              <div style={{
                background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
                height: "100%",
                width: `${Math.min(pourcentageCA, 100)}%`,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: "10px",
              }}>
                <span style={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>
                  {pourcentageCA}%
                </span>
              </div>
            </div>
          </div>

          {/* Tableau Performance */}
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{
                  padding: "12px",
                  textAlign: "left",
                  color: "#64748b",
                  fontWeight: 600,
                  borderBottom: "2px solid #e2e8f0",
                }}>
                  Indicateur
                </th>
                <th style={{
                  padding: "12px",
                  textAlign: "right",
                  color: "#64748b",
                  fontWeight: 600,
                  borderBottom: "2px solid #e2e8f0",
                }}>
                  Valeur
                </th>
                <th style={{
                  padding: "12px",
                  textAlign: "right",
                  color: "#64748b",
                  fontWeight: 600,
                  borderBottom: "2px solid #e2e8f0",
                }}>
                  Objectif
                </th>
                <th style={{
                  padding: "12px",
                  textAlign: "right",
                  color: "#64748b",
                  fontWeight: 600,
                  borderBottom: "2px solid #e2e8f0",
                }}>
                  Écart
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9", color: "#1e293b" }}>
                  CA Total
                </td>
                <td style={{
                  padding: "12px",
                  borderBottom: "1px solid #f1f5f9",
                  textAlign: "right",
                  fontWeight: "bold",
                  color: "#1e293b",
                }}>
                  {caActuel.toLocaleString("fr-FR")} €
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9", textAlign: "right", color: "#64748b" }}>
                  {caObjectif.toLocaleString("fr-FR")} €
                </td>
                <td style={{
                  padding: "12px",
                  borderBottom: "1px solid #f1f5f9",
                  textAlign: "right",
                  fontWeight: "bold",
                  color: ecartCA >= 0 ? "#10b981" : "#ef4444",
                }}>
                  {ecartCA >= 0 ? "+" : ""}{ecartCA.toLocaleString("fr-FR")} €
                </td>
              </tr>
              <tr>
                <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9", color: "#1e293b" }}>
                  CA Horaire
                </td>
                <td style={{
                  padding: "12px",
                  borderBottom: "1px solid #f1f5f9",
                  textAlign: "right",
                  fontWeight: "bold",
                  color: "#1e293b",
                }}>
                  {caHoraire} €/h
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9", textAlign: "right", color: "#64748b" }}>
                  {caHoraireObjectif} €/h
                </td>
                <td style={{
                  padding: "12px",
                  borderBottom: "1px solid #f1f5f9",
                  textAlign: "right",
                  fontWeight: "bold",
                  color: ecartHoraire >= 0 ? "#10b981" : "#ef4444",
                }}>
                  {ecartHoraire >= 0 ? "+" : ""}{ecartHoraire} €/h
                </td>
              </tr>
              <tr>
                <td style={{ padding: "12px", color: "#1e293b" }}>Taux de réalisation</td>
                <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold", color: "#1e293b" }}>
                  {pourcentageCA}%
                </td>
                <td style={{ padding: "12px", textAlign: "right", color: "#64748b" }}>100%</td>
                <td style={{
                  padding: "12px",
                  textAlign: "right",
                  fontWeight: "bold",
                  color: pourcentageCA >= 100 ? "#10b981" : "#ef4444",
                }}>
                  {pourcentageCA >= 100 ? "+" : ""}{pourcentageCA - 100}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ACTIVITÉ PATIENTS */}
        <div style={{ padding: "25px 40px", background: "#f8fafc" }}>
          <h2 style={{
            color: "#1e293b",
            fontSize: "18px",
            margin: "0 0 20px",
            borderLeft: "4px solid #8b5cf6",
            paddingLeft: "12px",
          }}>
            👥 ACTIVITÉ PATIENTS
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            <div style={{
              background: "white",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#3b82f6" }}>
                {nouveauxPatients}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "5px" }}>
                Nouveaux patients
              </div>
            </div>

            <div style={{
              background: "white",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#10b981" }}>
                {patientsTraites}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "5px" }}>
                Patients traités
              </div>
            </div>

            <div style={{
              background: "white",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#8b5cf6" }}>
                {rdvHonores}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "5px" }}>
                RDV honorés
              </div>
            </div>

            <div style={{
              background: "white",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <div style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: tauxAbsence <= 5 ? "#10b981" : "#ef4444",
              }}>
                {tauxAbsence}%
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "5px" }}>
                Taux d'absence
              </div>
            </div>
          </div>

          {/* Taux de conversion */}
          <div style={{
            marginTop: "20px",
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ color: "#475569", fontSize: "14px" }}>
                Taux de conversion patients
              </span>
              <span style={{ color: "#10b981", fontWeight: "bold" }}>{tauxConversion}%</span>
            </div>
            <div style={{ background: "#e2e8f0", borderRadius: "6px", height: "12px", overflow: "hidden" }}>
              <div style={{
                background: "linear-gradient(90deg, #10b981, #059669)",
                height: "100%",
                width: `${tauxConversion}%`,
                borderRadius: "6px",
              }}></div>
            </div>
            <p style={{ color: "#64748b", fontSize: "12px", marginTop: "8px" }}>
              Objectif : ≥ 80% | {tauxConversion >= 80 ? "✅ Objectif atteint" : "⚠️ À améliorer"}
            </p>
          </div>
        </div>

        {/* RÉPARTITION DES ACTES */}
        <div style={{ padding: "25px 40px" }}>
          <h2 style={{
            color: "#1e293b",
            fontSize: "18px",
            margin: "0 0 20px",
            borderLeft: "4px solid #f59e0b",
            paddingLeft: "12px",
          }}>
            🦷 RÉPARTITION DES ACTES
          </h2>

          {/* Graphique à barres horizontales */}
          <div style={{ marginBottom: "25px" }}>
            {finalActes.map((acte) => (
              <div key={acte.type} style={{ marginBottom: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ color: "#475569", fontSize: "13px" }}>{acte.type} ({acte.nombre})</span>
                  <span style={{ color: acte.couleur, fontWeight: "bold", fontSize: "13px" }}>
                    {acte.ca.toLocaleString("fr-FR")} €
                  </span>
                </div>
                <div style={{
                  background: "#e2e8f0",
                  borderRadius: "6px",
                  height: "20px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    background: acte.couleur,
                    height: "100%",
                    width: `${acte.pourcentage}%`,
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "8px",
                  }}>
                    <span style={{ color: "white", fontSize: "11px", fontWeight: "bold" }}>
                      {acte.pourcentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tableau récapitulatif */}
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
            background: "#f8fafc",
            borderRadius: "8px",
            overflow: "hidden",
          }}>
            <thead>
              <tr style={{ background: "#1e293b" }}>
                <th style={{
                  padding: "12px",
                  textAlign: "left",
                  color: "white",
                  fontWeight: 600,
                }}>
                  Type d'acte
                </th>
                <th style={{
                  padding: "12px",
                  textAlign: "center",
                  color: "white",
                  fontWeight: 600,
                }}>
                  Nombre
                </th>
                <th style={{
                  padding: "12px",
                  textAlign: "right",
                  color: "white",
                  fontWeight: 600,
                }}>
                  CA Généré
                </th>
              </tr>
            </thead>
            <tbody>
              {finalActes.map((acte, idx) => (
                <tr key={acte.type} style={{ background: idx % 2 === 0 ? "white" : "#f8fafc" }}>
                  <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                    {acte.type}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>
                    {acte.nombre}
                  </td>
                  <td style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: "bold",
                    borderBottom: "1px solid #e2e8f0",
                  }}>
                    {acte.ca.toLocaleString("fr-FR")} €
                  </td>
                </tr>
              ))}
              <tr style={{ background: "#1e293b" }}>
                <td style={{ padding: "12px", color: "white", fontWeight: "bold" }}>
                  TOTAL
                </td>
                <td style={{ padding: "12px", textAlign: "center", color: "white", fontWeight: "bold" }}>
                  {finalActes.reduce((sum, a) => sum + a.nombre, 0)}
                </td>
                <td style={{
                  padding: "12px",
                  textAlign: "right",
                  color: "#10b981",
                  fontWeight: "bold",
                }}>
                  {totalCA.toLocaleString("fr-FR")} €
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* RECOMMANDATIONS */}
        <div style={{
          padding: "25px 40px",
          background: "linear-gradient(180deg, #fefce8 0%, #fef9c3 100%)",
        }}>
          <h2 style={{
            color: "#854d0e",
            fontSize: "18px",
            margin: "0 0 20px",
            borderLeft: "4px solid #eab308",
            paddingLeft: "12px",
          }}>
            💡 RECOMMANDATIONS
          </h2>

          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "15px",
            borderLeft: "4px solid #3b82f6",
          }}>
            <h4 style={{ color: "#1e293b", margin: "0 0 8px", fontSize: "14px" }}>
              1. Optimiser le taux de conversion des devis (+5-10% potentiel)
            </h4>
            <ul style={{ color: "#64748b", margin: "0", paddingLeft: "20px", fontSize: "13px", lineHeight: 1.8 }}>
              <li>Mettre en place un suivi systématique des devis non acceptés</li>
              <li>Proposer des facilités de paiement</li>
            </ul>
          </div>

          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "15px",
            borderLeft: "4px solid #10b981",
          }}>
            <h4 style={{ color: "#1e293b", margin: "0 0 8px", fontSize: "14px" }}>
              2. {tauxAbsence > 5 ? `Réduire le taux d'absence (actuellement ${tauxAbsence}%)` : "Maintenir le bon taux de présence ✓"}
            </h4>
            <ul style={{ color: "#64748b", margin: "0", paddingLeft: "20px", fontSize: "13px", lineHeight: 1.8 }}>
              <li>Envoyer des rappels SMS 48h et 24h avant le RDV</li>
              <li>Mettre en place une politique de gestion des annulations</li>
            </ul>
          </div>

          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "15px",
            borderLeft: "4px solid #8b5cf6",
          }}>
            <h4 style={{ color: "#1e293b", margin: "0 0 8px", fontSize: "14px" }}>
              3. Développer l'activité prothétique
            </h4>
            <ul style={{ color: "#64748b", margin: "0", paddingLeft: "20px", fontSize: "13px", lineHeight: 1.8 }}>
              <li>Fort potentiel de CA sur ce segment</li>
              <li>Investir dans la formation continue</li>
            </ul>
          </div>

          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            borderLeft: "4px solid #f59e0b",
          }}>
            <h4 style={{ color: "#1e293b", margin: "0 0 8px", fontSize: "14px" }}>
              4. Fidélisation patients
            </h4>
            <ul style={{ color: "#64748b", margin: "0", paddingLeft: "20px", fontSize: "13px", lineHeight: 1.8 }}>
              <li>Programme de rappel pour contrôles annuels</li>
              <li>Communication régulière (newsletter)</li>
            </ul>
          </div>
        </div>

        {/* PROCHAINES ÉTAPES */}
        <div style={{ padding: "25px 40px" }}>
          <h2 style={{
            color: "#1e293b",
            fontSize: "18px",
            margin: "0 0 20px",
            borderLeft: "4px solid #06b6d4",
            paddingLeft: "12px",
          }}>
            📅 PROCHAINES ÉTAPES
          </h2>

          <table style={{ width: "100%", fontSize: "14px" }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px 0", color: "#475569" }}>
                  ☐ Réunion d'équipe pour présenter les résultats
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px 0", color: "#475569" }}>
                  ☐ Mise en place du système de rappels automatiques
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px 0", color: "#475569" }}>
                  ☐ Audit des devis en attente (&gt; 30 jours)
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px 0", color: "#475569" }}>
                  ☐ Formation sur les techniques de présentation
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div style={{
          background: "#1e293b",
          padding: "30px 40px",
          textAlign: "center",
        }}>
          <p style={{ color: "#94a3b8", margin: "0", fontSize: "13px" }}>
            📅 Rapport généré automatiquement par <strong style={{ color: "white" }}>Efficience Analytics</strong>
          </p>
          <p style={{ color: "#64748b", margin: "10px 0 0", fontSize: "12px" }}>
            © 2026 Efficience Dentaire - Plateforme sécurisée HDS Certifiée
          </p>
        </div>
      </div>
    </div>
  );
}
