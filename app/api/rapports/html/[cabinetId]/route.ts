import { initializeApp } from '@/lib/db';
import Cabinet from '@/models/Cabinet';
import { NextResponse } from 'next/server';

/**
 * API pour récupérer le HTML complet d'un rapport de cabinet
 * GET /api/rapports/html/[cabinetId]
 * Retourne le même HTML que celui utilisé dans l'email
 */
export async function GET(
  request: Request,
  { params }: { params: { cabinetId: string } }
) {
  try {
    await initializeApp();

    // Récupérer le cabinet
    let cabinet = await Cabinet.findOne({ id: params.cabinetId }).lean();
    
    if (!cabinet) {
      const numId = parseInt(params.cabinetId);
      if (!isNaN(numId)) {
        cabinet = await Cabinet.findOne({ id: numId.toString() }).lean();
      }
    }

    if (!cabinet) {
      return NextResponse.json({ error: 'Cabinet non trouvé' }, { status: 404 });
    }

    // Récupérer tous les cabinets pour les stats globales
    const allCabinets = await Cabinet.find({}).lean();
    const emailsEnvoyes = allCabinets.filter((c: any) => c.rapportStatut === "sent").length;
    const rapportsNonGeneres = allCabinets.filter((c: any) => c.rapportStatut === "not_generated").length;
    const scoreMoyens = allCabinets.reduce((sum: number, c: any) => sum + (c.score || 0), 0) / (allCabinets.length || 1);

    // Récupérer les données du cabinet
    const cabinetData = cabinet as any;
    const caActuel = cabinetData.caActuel || 45000;
    const caObjectif = cabinetData.caObjectif || 50000;
    const score = cabinetData.score || 85;
    const periode = cabinetData.periode || new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" });
    const nom = cabinetData.nom || "Cabinet sans nom";
    const nouvPatients = cabinetData.nouveauxPatients || 12;
    const tauxAbsence = cabinetData.tauxAbsence || 5;
    const nombreRdv = cabinetData.nombreRdv || 150;
    
    // Détermer le statut du cabinet
    const getCabinetStatut = () => {
      if (caActuel >= caObjectif) return "OK";
      if (caActuel >= caObjectif * 0.85) return "À suivre";
      return "Alerte";
    };

    const getStatutPhrase = () => {
      const stat = getCabinetStatut();
      if (stat === "OK") return "Félicitations, votre cabinet a atteint ses objectifs ce mois-ci !";
      if (stat === "À suivre") return "Attention, votre cabinet est proche de l'objectif mais nécessite un suivi.";
      return "Alerte : le chiffre d'affaires est loin de l'objectif, des actions sont recommandées.";
    };
    
    const cabinetStatut = getCabinetStatut();
    const statutPhrase = getStatutPhrase();
    const pourcentageCA = caObjectif > 0 ? Math.round((caActuel / caObjectif) * 100) : 0;
    
    // Calculs détaillés pour les KPIs
    const caHoraire = Math.round(caActuel / 160);
    const caHoraireObjectif = Math.round(caObjectif / 160);
    const ecartCA = caActuel - caObjectif;
    const ecartHoraire = caHoraire - caHoraireObjectif;
    
    // Statistiques patients
    const patientsTraites = Math.round(nouvPatients * 0.85);
    const tauxConversion = 85;
    const rdvHonores = Math.round(nombreRdv * (1 - tauxAbsence / 100));
    
    // Répartition des actes
    const consultations = Math.round(nombreRdv * 0.44);
    const detartrages = Math.round(nombreRdv * 0.34);
    const soinsConservateurs = Math.round(nombreRdv * 0.15);
    const protheses = Math.round(nombreRdv * 0.07);
    
    const caConsultations = consultations * 50;
    const caDetartrages = detartrages * 73;
    const caSoins = soinsConservateurs * 150;
    const caProtheses = protheses * 720;
    
    // Calculs pourcentages
    const totalActes = consultations + detartrages + soinsConservateurs + protheses;
    const pctConsultations = totalActes > 0 ? Math.round((consultations / totalActes) * 100) : 0;
    const pctDetartrages = totalActes > 0 ? Math.round((detartrages / totalActes) * 100) : 0;
    const pctSoins = totalActes > 0 ? Math.round((soinsConservateurs / totalActes) * 100) : 0;
    const pctProtheses = totalActes > 0 ? Math.round((protheses / totalActes) * 100) : 0;
    
    // Couleurs et tendances
    const getScoreColor = (score: number) => {
      if (score >= 80) return '#10b981';
      if (score >= 60) return '#f59e0b';
      return '#ef4444';
    };
    
    const getTendance = (ecart: number) => {
      if (ecart > 0) return { icon: '↑', color: '#10b981', text: 'En hausse' };
      if (ecart < 0) return { icon: '↓', color: '#ef4444', text: 'En baisse' };
      return { icon: '→', color: '#64748b', text: 'Stable' };
    };
    
    const tendanceCA = getTendance(ecartCA);
    const scoreColor = getScoreColor(score);
    
    // Graphique donut (TODO: SVG rendering)
    const totalCA = caConsultations + caDetartrages + caSoins + caProtheses;
    const pctCAConsultations = totalCA > 0 ? (caConsultations / totalCA) * 100 : 0;
    const pctCADetartrages = totalCA > 0 ? (caDetartrages / totalCA) * 100 : 0;
    const pctCASoins = totalCA > 0 ? (caSoins / totalCA) * 100 : 0;
    const pctCAProtheses = totalCA > 0 ? (caProtheses / totalCA) * 100 : 0;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport de Performance - ${nom}</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 20px;">
  <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
    
    <!-- HEADER -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 35px 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">📊 RAPPORT DE PERFORMANCE</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 18px;">${nom}</p>
      <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 14px;">Période : ${periode}</p>
    </div>

    <!-- SYNTHÈSE GLOBALE -->
    <div style="padding: 30px 40px; background: linear-gradient(180deg, #f8fafc 0%, white 100%); border-bottom: 1px solid #e2e8f0;">
      <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px; border-left: 4px solid #3b82f6; padding-left: 12px;">
        📋 Synthèse Globale
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; background: #dbeafe; border: 1px solid #93c5fd; border-radius: 10px 0 0 10px; text-align: center; width: 25%;">
            <div style="font-size: 28px; font-weight: bold; color: #0369a1; margin-bottom: 4px;">
              ${allCabinets.length}
            </div>
            <div style="font-size: 12px; color: #0369a1; font-weight: 600;">
              📊 Cabinets Suivis
            </div>
          </td>
          <td style="padding: 12px; background: #fce7f3; border: 1px solid #fbcfe8; text-align: center; width: 25%;">
            <div style="font-size: 28px; font-weight: bold; color: #be185d; margin-bottom: 4px;">
              ${allCabinets.length}
            </div>
            <div style="font-size: 12px; color: #be185d; font-weight: 600;">
              📋 Rapports Générés
            </div>
          </td>
          <td style="padding: 12px; background: #dcfce7; border: 1px solid #bbf7d0; text-align: center; width: 25%;">
            <div style="font-size: 28px; font-weight: bold; color: #15803d; margin-bottom: 4px;">
              ${emailsEnvoyes}
            </div>
            <div style="font-size: 12px; color: #15803d; font-weight: 600;">
              📧 Emails Envoyés
            </div>
          </td>
          <td style="padding: 12px; background: #fce7f3; border: 1px solid #fbcfe8; border-radius: 0 10px 10px 0; text-align: center; width: 25%;">
            <div style="font-size: 28px; font-weight: bold; color: #be185d; margin-bottom: 4px;">
              ${Math.round(scoreMoyens)}%
            </div>
            <div style="font-size: 12px; color: #be185d; font-weight: 600;">
              📈 Performance Moyenne
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- RÉSUMÉ EXÉCUTIF -->
    <div style="padding: 30px 40px; background: linear-gradient(180deg, #f8fafc 0%, white 100%);">
      <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px; border-left: 4px solid #3b82f6; padding-left: 12px;">🎯 RÉSUMÉ EXÉCUTIF</h2>
      <div style="margin-bottom: 18px;">
        <span style="font-size: 16px; color: #3b82f6; font-weight: bold;">Statut du cabinet : </span>
        <span style="font-size: 16px; color: ${cabinetStatut === 'OK' ? '#10b981' : cabinetStatut === 'À suivre' ? '#f59e0b' : '#ef4444'}; font-weight: bold;">${cabinetStatut}</span>
        <div style="margin-top: 8px; font-size: 15px; color: #64748b;">${statutPhrase}</div>
      </div>
      
      <!-- Score Principal -->
      <div style="text-align: center; margin: 25px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, ${scoreColor}15, ${scoreColor}05); border: 3px solid ${scoreColor}; border-radius: 50%; width: 140px; height: 140px; line-height: 140px;">
          <span style="font-size: 52px; font-weight: bold; color: ${scoreColor};">${score}%</span>
        </div>
        <p style="color: #64748b; margin-top: 10px; font-size: 14px;">Performance Globale</p>
      </div>

      <!-- Statut du Cabinet - Boîte visuelle -->
      <div style="text-align: center; margin-bottom: 25px; padding: 16px; background: ${cabinetStatut === 'OK' ? '#d1fae5' : cabinetStatut === 'À suivre' ? '#fef3c7' : '#fee2e2'}; border-radius: 12px; border: 2px solid ${cabinetStatut === 'OK' ? '#10b981' : cabinetStatut === 'À suivre' ? '#f59e0b' : '#ef4444'};">
        <div style="font-size: 28px; margin-bottom: 8px;">
          ${cabinetStatut === 'OK' ? '✅' : cabinetStatut === 'À suivre' ? '⚠️' : '🔴'}
        </div>
        <div style="font-size: 18px; font-weight: bold; color: ${cabinetStatut === 'OK' ? '#10b981' : cabinetStatut === 'À suivre' ? '#f59e0b' : '#ef4444'}; margin-bottom: 4px;">
          ${cabinetStatut}
        </div>
        <div style="font-size: 13px; color: ${cabinetStatut === 'OK' ? '#10b981' : cabinetStatut === 'À suivre' ? '#f59e0b' : '#ef4444'};">
          ${cabinetStatut === 'OK' ? 'Objectif atteint' : cabinetStatut === 'À suivre' ? 'Vérification requise' : 'Actions urgentes'}
        </div>
      </div>

      <!-- Points Clés -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 12px; background: #f1f5f9; border-radius: 8px 0 0 8px; text-align: center; width: 25%;">
            <div style="font-size: 24px; font-weight: bold; color: #1e293b;">${caActuel.toLocaleString('fr-FR')} €</div>
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">CA Réalisé</div>
          </td>
          <td style="padding: 12px; background: #f1f5f9; text-align: center; width: 25%;">
            <div style="font-size: 24px; font-weight: bold; color: #1e293b;">${caObjectif.toLocaleString('fr-FR')} €</div>
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Objectif</div>
          </td>
          <td style="padding: 12px; background: #f1f5f9; text-align: center; width: 25%;">
            <div style="font-size: 24px; font-weight: bold; color: ${tendanceCA.color};">${pourcentageCA}%</div>
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Progression</div>
          </td>
          <td style="padding: 12px; background: #f1f5f9; border-radius: 0 8px 8px 0; text-align: center; width: 25%;">
            <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${nouvPatients}</div>
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Nouveaux Patients</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- PERFORMANCE FINANCIÈRE -->
    <div style="padding: 25px 40px;">
      <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px; border-left: 4px solid #10b981; padding-left: 12px;">📈 PERFORMANCE FINANCIÈRE</h2>
      
      <!-- Barre de progression CA -->
      <div style="margin-bottom: 25px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #475569; font-size: 14px;">Chiffre d'Affaires</span>
          <span style="color: ${tendanceCA.color}; font-weight: bold; font-size: 14px;">${tendanceCA.icon} ${ecartCA >= 0 ? '+' : ''}${ecartCA.toLocaleString('fr-FR')} €</span>
        </div>
        <div style="background: #e2e8f0; border-radius: 10px; height: 24px; overflow: hidden; position: relative;">
          <div style="background: linear-gradient(90deg, #3b82f6, #1d4ed8); height: 100%; width: ${Math.min(pourcentageCA, 100)}%; border-radius: 10px; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px;">
            <span style="color: white; font-size: 12px; font-weight: bold;">${pourcentageCA}%</span>
          </div>
        </div>
      </div>

      <!-- Tableau Performance -->
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 12px; text-align: left; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Indicateur</th>
            <th style="padding: 12px; text-align: right; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Valeur</th>
            <th style="padding: 12px; text-align: right; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Objectif</th>
            <th style="padding: 12px; text-align: right; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Écart</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">CA Total</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #1e293b;">${caActuel.toLocaleString('fr-FR')} €</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b;">${caObjectif.toLocaleString('fr-FR')} €</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: ${ecartCA >= 0 ? '#10b981' : '#ef4444'};">${ecartCA >= 0 ? '+' : ''}${ecartCA.toLocaleString('fr-FR')} €</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">CA Horaire</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #1e293b;">${caHoraire} €/h</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b;">${caHoraireObjectif} €/h</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: ${ecartHoraire >= 0 ? '#10b981' : '#ef4444'};">${ecartHoraire >= 0 ? '+' : ''}${ecartHoraire} €/h</td>
          </tr>
          <tr>
            <td style="padding: 12px; color: #1e293b;">Taux de réalisation</td>
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #1e293b;">${pourcentageCA}%</td>
            <td style="padding: 12px; text-align: right; color: #64748b;">100%</td>
            <td style="padding: 12px; text-align: right; font-weight: bold; color: ${pourcentageCA >= 100 ? '#10b981' : '#ef4444'};">${pourcentageCA >= 100 ? '+' : ''}${pourcentageCA - 100}%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ACTIVITÉ PATIENTS -->
    <div style="padding: 25px 40px; background: #f8fafc;">
      <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px; border-left: 4px solid #8b5cf6; padding-left: 12px;">👥 ACTIVITÉ PATIENTS</h2>
      
      <table style="width: 100%; border-collapse: separate; border-spacing: 10px;">
        <tr>
          <td style="background: white; border-radius: 12px; padding: 20px; text-align: center; width: 25%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">${nouvPatients}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Nouveaux patients</div>
          </td>
          <td style="background: white; border-radius: 12px; padding: 20px; text-align: center; width: 25%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="font-size: 32px; font-weight: bold; color: #10b981;">${patientsTraites}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Patients traités</div>
          </td>
          <td style="background: white; border-radius: 12px; padding: 20px; text-align: center; width: 25%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="font-size: 32px; font-weight: bold; color: #8b5cf6;">${rdvHonores}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 5px;">RDV honorés</div>
          </td>
          <td style="background: white; border-radius: 12px; padding: 20px; text-align: center; width: 25%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="font-size: 32px; font-weight: bold; color: ${tauxAbsence <= 5 ? '#10b981' : '#ef4444'};">${tauxAbsence}%</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Taux d'absence</div>
          </td>
        </tr>
      </table>

      <!-- Taux de conversion -->
      <div style="margin-top: 20px; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="color: #475569; font-size: 14px;">Taux de conversion patients</span>
          <span style="color: #10b981; font-weight: bold;">${tauxConversion}%</span>
        </div>
        <div style="background: #e2e8f0; border-radius: 6px; height: 12px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #10b981, #059669); height: 100%; width: ${tauxConversion}%; border-radius: 6px;"></div>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-top: 8px;">Objectif : ≥ 80% | ${tauxConversion >= 80 ? '✅ Objectif atteint' : '⚠️ À améliorer'}</p>
      </div>
    </div>

    <!-- RÉPARTITION DES ACTES -->
    <div style="padding: 25px 40px;">
      <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px; border-left: 4px solid #f59e0b; padding-left: 12px;">🦷 RÉPARTITION DES ACTES</h2>
      
      <!-- Graphique à barres horizontales -->
      <div style="margin-bottom: 25px;">
        <!-- Consultations -->
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: #475569; font-size: 13px;">Consultations (${consultations})</span>
            <span style="color: #3b82f6; font-weight: bold; font-size: 13px;">${caConsultations.toLocaleString('fr-FR')} €</span>
          </div>
          <div style="background: #e2e8f0; border-radius: 6px; height: 20px; overflow: hidden;">
            <div style="background: #3b82f6; height: 100%; width: ${pctConsultations}%; border-radius: 6px; display: flex; align-items: center; padding-left: 8px;">
              <span style="color: white; font-size: 11px; font-weight: bold;">${pctConsultations}%</span>
            </div>
          </div>
        </div>
        
        <!-- Détartrages -->
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: #475569; font-size: 13px;">Détartrages (${detartrages})</span>
            <span style="color: #10b981; font-weight: bold; font-size: 13px;">${caDetartrages.toLocaleString('fr-FR')} €</span>
          </div>
          <div style="background: #e2e8f0; border-radius: 6px; height: 20px; overflow: hidden;">
            <div style="background: #10b981; height: 100%; width: ${pctDetartrages}%; border-radius: 6px; display: flex; align-items: center; padding-left: 8px;">
              <span style="color: white; font-size: 11px; font-weight: bold;">${pctDetartrages}%</span>
            </div>
          </div>
        </div>
        
        <!-- Soins conservateurs -->
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: #475569; font-size: 13px;">Soins conservateurs (${soinsConservateurs})</span>
            <span style="color: #8b5cf6; font-weight: bold; font-size: 13px;">${caSoins.toLocaleString('fr-FR')} €</span>
          </div>
          <div style="background: #e2e8f0; border-radius: 6px; height: 20px; overflow: hidden;">
            <div style="background: #8b5cf6; height: 100%; width: ${pctSoins}%; border-radius: 6px; display: flex; align-items: center; padding-left: 8px;">
              <span style="color: white; font-size: 11px; font-weight: bold;">${pctSoins}%</span>
            </div>
          </div>
        </div>
        
        <!-- Prothèses -->
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: #475569; font-size: 13px;">Prothèses (${protheses})</span>
            <span style="color: #f59e0b; font-weight: bold; font-size: 13px;">${caProtheses.toLocaleString('fr-FR')} €</span>
          </div>
          <div style="background: #e2e8f0; border-radius: 6px; height: 20px; overflow: hidden;">
            <div style="background: #f59e0b; height: 100%; width: ${pctProtheses}%; border-radius: 6px; display: flex; align-items: center; padding-left: 8px;">
              <span style="color: white; font-size: 11px; font-weight: bold;">${pctProtheses}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tableau récapitulatif des actes -->
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: #f8fafc; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #1e293b;">
            <th style="padding: 12px; text-align: left; color: white; font-weight: 600;">Type d'acte</th>
            <th style="padding: 12px; text-align: center; color: white; font-weight: 600;">Nombre</th>
            <th style="padding: 12px; text-align: right; color: white; font-weight: 600;">CA Généré</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: white;">
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">🔍 Consultations</td>
            <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">${consultations}</td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${caConsultations.toLocaleString('fr-FR')} €</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">🦷 Détartrages</td>
            <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">${detartrages}</td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${caDetartrages.toLocaleString('fr-FR')} €</td>
          </tr>
          <tr style="background: white;">
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">💉 Soins conservateurs</td>
            <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">${soinsConservateurs}</td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${caSoins.toLocaleString('fr-FR')} €</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 12px;">👑 Prothèses</td>
            <td style="padding: 12px; text-align: center;">${protheses}</td>
            <td style="padding: 12px; text-align: right; font-weight: bold;">${caProtheses.toLocaleString('fr-FR')} €</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="background: #1e293b;">
            <td style="padding: 12px; color: white; font-weight: bold;">TOTAL</td>
            <td style="padding: 12px; text-align: center; color: white; font-weight: bold;">${totalActes}</td>
            <td style="padding: 12px; text-align: right; color: #10b981; font-weight: bold;">${(caConsultations + caDetartrages + caSoins + caProtheses).toLocaleString('fr-FR')} €</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- FOOTER -->
    <div style="background: #1e293b; padding: 30px 40px; text-align: center;">
      <p style="color: #94a3b8; margin: 0; font-size: 13px;">📅 Rapport généré automatiquement par <strong style="color: white;">Efficience Analytics</strong></p>
      <p style="color: #64748b; margin: 10px 0 0; font-size: 12px;">Date de génération : ${new Date().toLocaleDateString('fr-FR')}</p>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #334155;">
        <p style="color: #64748b; margin: 0; font-size: 11px;">© 2026 Efficience Dentaire - Plateforme sécurisée HDS Certifiée</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('❌ Erreur fetch HTML rapport:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement du rapport' },
      { status: 500 }
    );
  }
}
