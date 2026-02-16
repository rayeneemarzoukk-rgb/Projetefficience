import { sendCabinetReportEmail } from '@/lib/email-service';
import { NextResponse } from 'next/server';

/**
 * 📧 API pour envoyer les rapports des 5 cabinets existants
 * GET /api/rapports/send-all
 */
export async function GET() {
  // Les 5 cabinets existants
  const cabinets = [
    {
      cabinetNom: "Cabinet Dr. Marzouk",
      cabinetEmail: "marzouk@cabinet.fr",
      periode: "Février 2026",
      statistiques: {
        caActuel: 52000,
        caObjectif: 50000,
        score: 94,
        nouveauxPatients: 15,
        nombreRdv: 180,
        tauxAbsence: 5.2,
      }
    },
    {
      cabinetNom: "Cabinet Dr. Burnier",
      cabinetEmail: "burnier@cabinet.fr",
      periode: "Février 2026",
      statistiques: {
        caActuel: 45000,
        caObjectif: 40000,
        score: 92,
        nouveauxPatients: 12,
        nombreRdv: 156,
        tauxAbsence: 4.8,
      }
    },
    {
      cabinetNom: "Cabinet Dr. Laroche",
      cabinetEmail: "laroche@cabinet.fr",
      periode: "Février 2026",
      statistiques: {
        caActuel: 38000,
        caObjectif: 40000,
        score: 88,
        nouveauxPatients: 10,
        nombreRdv: 142,
        tauxAbsence: 6.5,
      }
    },
    {
      cabinetNom: "Cabinet Dr. Mocanu",
      cabinetEmail: "mocanu@cabinet.fr",
      periode: "Février 2026",
      statistiques: {
        caActuel: 45000,
        caObjectif: 45000,
        score: 87,
        nouveauxPatients: 11,
        nombreRdv: 165,
        tauxAbsence: 7.2,
      }
    },
    {
      cabinetNom: "Cabinet Dr. Pinard",
      cabinetEmail: "pinard@cabinet.fr",
      periode: "Février 2026",
      statistiques: {
        caActuel: 32000,
        caObjectif: 40000,
        score: 76,
        nouveauxPatients: 8,
        nombreRdv: 128,
        tauxAbsence: 9.1,
      }
    },
  ];

  const results = [];
  const now = new Date();
  const dateGeneration = now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  console.log('📧 Envoi des 5 rapports cabinets à maarzoukrayan3@gmail.com...');

  for (const cabinet of cabinets) {
    try {
      const success = await sendCabinetReportEmail({
        ...cabinet,
        dateGeneration,
      });

      results.push({
        cabinet: cabinet.cabinetNom,
        success,
        message: success ? '✅ Email envoyé' : '❌ Échec envoi'
      });

      console.log(`${success ? '✅' : '❌'} ${cabinet.cabinetNom}`);

      // Attendre 1 seconde entre chaque email pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      results.push({
        cabinet: cabinet.cabinetNom,
        success: false,
        message: `❌ Erreur: ${error}`
      });
    }
  }

  const totalSuccess = results.filter(r => r.success).length;

  return NextResponse.json({
    success: true,
    message: `${totalSuccess}/5 rapports envoyés à maarzoukrayan3@gmail.com`,
    destinataire: 'maarzoukrayan3@gmail.com',
    results,
  });
}
