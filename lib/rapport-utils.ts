// Fonction pour générer le HTML du rapport principal
export function generateRapportHTML({
  cabinetName,
  dateRange,
  executiveSummary,
  performance,
  kpis,
  comments
}: {
  cabinetName: string;
  dateRange: string;
  executiveSummary: string;
  performance: { revenue: number; patients: number; acts: number };
  kpis: { label: string; value: string | number }[];
  comments: string;
}) {
  const safeKpis = Array.isArray(kpis) ? kpis : [];
  return `
    <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 800px; margin: auto;">
      <style>
        .kpi-block { display: flex; flex-wrap: wrap; gap: 16px; }
        .kpi-item { flex: 1 1 200px; background: #f1f1f1; border-radius: 6px; padding: 12px; min-width: 180px; text-align: center; }
        .kpi-label { font-weight: bold; color: #0077b6; font-size: 1.1em; }
        .kpi-value { font-size: 1.3em; color: #222; margin-top: 4px; }
        .statut-suivre { color: #f59e0b; }
        .statut-alerte { color: #ef4444; }
        .perf { font-size: 48px; color: #10b981; font-weight: bold; margin: 24px 0 8px; }
        .perf-label { color: #64748b; }
        .kpi-label { color: #64748b; font-size: 14px; }
        .section-title { color: #2563eb; font-size: 18px; font-weight: bold; margin: 32px 0 12px; }
        .kpi-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .kpi-table th, .kpi-table td { padding: 8px 12px; text-align: left; }
        .kpi-table th { background: #f4f6fa; color: #2563eb; }
        .kpi-table td { background: #fff; color: #1e293b; }
      </style>
      <div style="border-bottom: 2px solid #0077b6; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #0077b6; margin: 0;">Rapport d'activité du cabinet</h1>
        <h2 style="margin: 0; color: #333;">${cabinetName}</h2>
        <div style="margin-top: 8px; color: #555;">${dateRange}</div>
      </div>
      <div style="background: #eaf4fb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #0077b6; margin-bottom: 8px;">Synthèse globale</h3>
        <p style="color: #333; font-size: 1.1em;">${executiveSummary}</p>
      </div>
      <div style="margin-bottom: 24px;">
        <h3 style="color: #0077b6; margin-bottom: 8px;">KPIs principaux</h3>
        <div class="kpi-block">
          ${safeKpis.map(kpi => `
            <div class="kpi-item">
              <div class="kpi-label">${kpi.label}</div>
              <div class="kpi-value">${kpi.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="margin-bottom: 24px;">
        <h3 style="color: #0077b6; margin-bottom: 8px;">Performance</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f1f1f1;">
            <th style="padding: 8px; border: 1px solid #ccc;">Indicateur</th>
            <th style="padding: 8px; border: 1px solid #ccc;">Valeur</th>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;">Chiffre d'affaires</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${performance.revenue} €</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;">Nombre de patients</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${performance.patients}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;">Actes réalisés</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${performance.acts}</td>
          </tr>
        </table>
      </div>
      <div style="margin-bottom: 24px;">
        <h3 style="color: #0077b6; margin-bottom: 8px;">Commentaires</h3>
        <p style="color: #333;">${comments}</p>
      </div>
    </div>
  `;
}

// Fonction pour "envoyer" le rapport par mail (mock)
export async function sendRapportMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // Ici tu peux intégrer un service réel (SendGrid, Nodemailer, etc.)
  // Exemple mock :
  console.log(`Envoi du rapport à ${to}...`);
  console.log(`Sujet : ${subject}`);
  // Affiche le HTML dans la console
  console.log(html);
  // Simule un délai
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
}