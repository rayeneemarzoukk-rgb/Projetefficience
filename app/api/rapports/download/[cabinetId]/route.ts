import { initializeApp } from '@/lib/db';
import Cabinet from '@/models/Cabinet';
import { NextResponse } from 'next/server';

/**
 * API pour télécharger un rapport en PDF
 * GET /api/rapports/download/[cabinetId]
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
      return NextResponse.json(
        { error: 'Cabinet non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer tous les cabinets pour les stats globales
    const allCabinets = await Cabinet.find({}).lean();
    const emailsEnvoyes = allCabinets.filter((c: any) => c.rapportStatut === "sent").length;
    const rapportsNonGeneres = allCabinets.filter((c: any) => c.rapportStatut === "not_generated").length;
    const scoreMoyens = allCabinets.reduce((sum: number, c: any) => sum + (c.score || 0), 0) / (allCabinets.length || 1);

    // Construire le contenu HTML du rapport
    const caActuel = (cabinet as any).caActuel || 45000;
    const caObjectif = (cabinet as any).caObjectif || 50000;
    const score = (cabinet as any).score || 85;
    const periode = (cabinet as any).periode || new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" });
    const nom = (cabinet as any).nom || "Cabinet sans nom";
    
    // Détermer le statut du cabinet
    const getCabinetStatut = () => {
      if (caActuel >= caObjectif) return "OK";
      if (caActuel >= caObjectif * 0.85) return "À suivre";
      return "À surveiller";
    };
    
    const cabinetStatut = getCabinetStatut();
    const pourcentageCA = caObjectif > 0 ? Math.round((caActuel / caObjectif) * 100) : 0;

    // HTML du rapport pour PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rapport de Performance - ${nom}</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background-color: #f0f4f8;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          padding: 35px 40px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0;
          opacity: 0.9;
          font-size: 16px;
        }
        .content {
          padding: 30px 40px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #1e293b;
          font-size: 18px;
          margin: 0 0 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }
        .status-box {
          text-align: center;
          padding: 20px;
          background: ${cabinetStatut === 'OK' ? '#d1fae5' : cabinetStatut === 'À suivre' ? '#fef3c7' : '#fee2e2'};
          border: 2px solid ${cabinetStatut === 'OK' ? '#10b981' : cabinetStatut === 'À suivre' ? '#f59e0b' : '#ef4444'};
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .status-box .icon {
          font-size: 32px;
          margin-bottom: 10px;
        }
        .status-box .status-text {
          font-size: 18px;
          font-weight: bold;
          color: ${cabinetStatut === 'OK' ? '#10b981' : cabinetStatut === 'À suivre' ? '#f59e0b' : '#ef4444'};
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .stat-card {
          padding: 12px;
          background: #f1f5f9;
          border-radius: 8px;
          text-align: center;
        }
        .stat-card .value {
          font-size: 24px;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 4px;
        }
        .stat-card .label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
        }
        .progress-bar {
          background: #e2e8f0;
          border-radius: 10px;
          height: 24px;
          overflow: hidden;
          margin-top: 10px;
        }
        .progress-fill {
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          height: 100%;
          width: ${pourcentageCA}%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 10px;
        }
        .progress-fill span {
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        table th {
          background: #1e293b;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        table td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        table tr:nth-child(even) {
          background: #f8fafc;
        }
        .footer {
          background: #f8fafc;
          padding: 20px 40px;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
          border-top: 1px solid #e2e8f0;
        }
        .page-break {
          page-break-after: always;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- HEADER -->
        <div class="header">
          <h1>📊 RAPPORT DE PERFORMANCE</h1>
          <p>${nom}</p>
          <p>Période : ${periode}</p>
        </div>

        <!-- CONTENU -->
        <div class="content">
          <!-- SYNTHÈSE GLOBALE -->
          <div class="section">
            <h2>📋 Synthèse Globale</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="value">${allCabinets.length}</div>
                <div class="label">Cabinets Suivis</div>
              </div>
              <div class="stat-card">
                <div class="value">${allCabinets.length}</div>
                <div class="label">Rapports Générés</div>
              </div>
              <div class="stat-card">
                <div class="value">${emailsEnvoyes}</div>
                <div class="label">📧 Emails Envoyés</div>
              </div>
              <div class="stat-card">
                <div class="value">${Math.round(scoreMoyens)}%</div>
                <div class="label">Performance Moyenne</div>
              </div>
            </div>
          </div>

          <!-- STATUT DU CABINET -->
          <div class="section">
            <h2>🎯 Statut du Cabinet</h2>
            <div class="status-box">
              <div class="icon">
                ${cabinetStatut === 'OK' ? '✅' : cabinetStatut === 'À suivre' ? '⚠️' : '🔴'}
              </div>
              <div class="status-text">${cabinetStatut}</div>
              <p style="margin-top: 8px; font-size: 14px;">
                ${cabinetStatut === 'OK' ? 'Objectif atteint' : cabinetStatut === 'À suivre' ? 'Vérification requise' : 'Actions urgentes'}
              </p>
            </div>
          </div>

          <!-- PERFORMANCE FINANCIÈRE -->
          <div class="section">
            <h2>📈 PERFORMANCE FINANCIÈRE</h2>
            <table>
              <thead>
                <tr>
                  <th>Indicateur</th>
                  <th>Valeur</th>
                  <th>Objectif</th>
                  <th>Écart</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CA Total</td>
                  <td><strong>${caActuel.toLocaleString('fr-FR')} €</strong></td>
                  <td>${caObjectif.toLocaleString('fr-FR')} €</td>
                  <td style="color: ${caActuel >= caObjectif ? '#10b981' : '#ef4444'};"><strong>
                    ${caActuel >= caObjectif ? '+' : ''}${(caActuel - caObjectif).toLocaleString('fr-FR')} €
                  </strong></td>
                </tr>
                <tr>
                  <td>Score Performance</td>
                  <td><strong>${score}%</strong></td>
                  <td>≥ 85%</td>
                  <td style="color: ${score >= 85 ? '#10b981' : '#ef4444'};"><strong>
                    ${score >= 85 ? '✓' : '✗'}
                  </strong></td>
                </tr>
              </tbody>
            </table>
            <div class="progress-bar">
              <div class="progress-fill"><span>${pourcentageCA}%</span></div>
            </div>
          </div>

          <!-- DONNÉES SUPPLÉMENTAIRES -->
          <div class="section">
            <h2>📊 Données Détaillées</h2>
            <table>
              <tr>
                <td><strong>Chiffre d'affaires horaire</strong></td>
                <td>${Math.round(caActuel / 160)} € / heure</td>
              </tr>
              <tr>
                <td><strong>Objectif horaire</strong></td>
                <td>${Math.round(caObjectif / 160)} € / heure</td>
              </tr>
              <tr>
                <td><strong>Progression</strong></td>
                <td>${pourcentageCA}%</td>
              </tr>
              <tr>
                <td><strong>Nouveaux patients</strong></td>
                <td>${(cabinet as any).nouveauxPatients || 0}</td>
              </tr>
              <tr>
                <td><strong>Taux d'absence</strong></td>
                <td>${(cabinet as any).tauxAbsence || 0}%</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <p>📅 Rapport généré automatiquement par Efficience Analytics</p>
          <p>Date: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          <p>© 2026 Efficience Dentaire - Plateforme sécurisée HDS Certifiée</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Retourner le HTML pour que le navigateur le télécharge en PDF
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="rapport_${nom.replace(/\s+/g, '_')}_${periode.replace(/\s+/g, '_')}.html"`,
      },
    });
  } catch (error) {
    console.error('❌ Erreur download rapport:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement du rapport' },
      { status: 500 }
    );
  }
}
