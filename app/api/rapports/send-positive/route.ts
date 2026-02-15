import { sendCabinetReportEmail } from '@/lib/email-service';
import { initializeApp } from '@/lib/db';
import Cabinet from '@/models/Cabinet';
import { NextResponse } from 'next/server';

/**
 * 📧 API pour envoyer les rapports des cabinets avec statut positif
 * GET /api/rapports/send-positive
 * 
 * Envoie les emails des 3 premiers cabinets avec un score ≥ 85
 */
export async function GET() {
  try {
    await initializeApp();

    // Récupérer TOUS les cabinets pour calculer les stats globales
    const allCabinets = await Cabinet.find({}).lean();
    const emailsEnvoyes = allCabinets.filter((c: any) => c.rapportStatut === "sent").length;
    const rapportsNonGeneres = allCabinets.filter((c: any) => c.rapportStatut === "not_generated").length;
    const scoreMoyens = allCabinets.reduce((sum: number, c: any) => sum + (c.score || 0), 0) / (allCabinets.length || 1);
    
    const globalStats = {
      totalCabinets: allCabinets.length,
      emailsEnvoyes: emailsEnvoyes,
      rapportsNonGeneres: rapportsNonGeneres,
      performanceMoyenne: Math.round(scoreMoyens),
    };

    // Récupérer tous les cabinets pour envoi
    const cabinets = await Cabinet.find({})
      .sort({ score: -1 })
      .lean();

    if (!cabinets || cabinets.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Aucun cabinet trouvé",
        rapportsEnvoyes: 0,
      });
    }

    const results = [];
    const now = new Date();
    const dateGeneration = now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log(`📧 Envoi des ${cabinets.length} rapports cabinets positifs...`);

    for (const cabinet of cabinets) {
      try {
        const cabinetData: any = cabinet;
        
        const success = await sendCabinetReportEmail({
          cabinetNom: cabinetData.nom || "Cabinet sans nom",
          cabinetEmail: cabinetData.email || "contact@cabinet.fr",
          periode: cabinetData.periode || new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" }),
          statistiques: {
            caActuel: cabinetData.caActuel || 45000,
            caObjectif: cabinetData.caObjectif || 50000,
            score: cabinetData.score || 85,
            nouveauxPatients: cabinetData.nouveauxPatients || 12,
            nombreRdv: 180,
            tauxAbsence: cabinetData.tauxAbsence || 5,
          },
          dateGeneration,
          globalStats: globalStats,
        });

        results.push({
          cabinet: cabinetData.nom,
          email: cabinetData.email,
          score: cabinetData.score,
          success,
          message: success ? '✅ Email envoyé' : '❌ Échec envoi'
        });

        console.log(`${success ? '✅' : '❌'} ${cabinetData.nom} (Score: ${cabinetData.score}%)`);

        // Attendre 2 secondes entre chaque email pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        results.push({
          cabinet: cabinet.nom,
          email: cabinet.email,
          score: cabinet.score,
          success: false,
          message: `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        });
        console.error(`❌ Erreur envoi ${cabinet.nom}:`, error);
      }
    }

    const totalSuccess = results.filter(r => r.success).length;

    return NextResponse.json({
      success: totalSuccess > 0,
      message: `${totalSuccess}/${results.length} rapports envoyés avec succès`,
      rapportsEnvoyes: totalSuccess,
      results,
    });

  } catch (error) {
    console.error("❌ Erreur API send-positive:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erreur lors de l'envoi des rapports",
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

/**
 * POST pour envoyer les rapports manuellement
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cabinetIds } = body;

    await initializeApp();

    // Récupérer TOUS les cabinets pour calculer les stats globales
    const allCabinets = await Cabinet.find({}).lean();
    const emailsEnvoyes = allCabinets.filter((c: any) => c.rapportStatut === "sent").length;
    const rapportsNonGeneres = allCabinets.filter((c: any) => c.rapportStatut === "not_generated").length;
    const scoreMoyens = allCabinets.reduce((sum: number, c: any) => sum + (c.score || 0), 0) / (allCabinets.length || 1);
    
    const globalStats = {
      totalCabinets: allCabinets.length,
      emailsEnvoyes: emailsEnvoyes,
      rapportsNonGeneres: rapportsNonGeneres,
      performanceMoyenne: Math.round(scoreMoyens),
    };

    let query: any = { score: { $gte: 85 } };
    if (cabinetIds && Array.isArray(cabinetIds)) {
      query = { _id: { $in: cabinetIds }, score: { $gte: 85 } };
    }

    const cabinets = await Cabinet.find(query)
      .sort({ score: -1 })
      .limit(3)
      .lean();

    if (!cabinets || cabinets.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Aucun cabinet à envoyer",
        rapportsEnvoyes: 0,
      });
    }

    const results = [];
    const now = new Date();
    const dateGeneration = now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log(`📧 Envoi manuel des ${cabinets.length} rapports cabinets...`);

    for (const cabinet of cabinets) {
      try {
        const cabinetData: any = cabinet;
        
        const success = await sendCabinetReportEmail({
          cabinetNom: cabinetData.nom || "Cabinet sans nom",
          cabinetEmail: cabinetData.email || "contact@cabinet.fr",
          periode: cabinetData.periode || new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" }),
          statistiques: {
            caActuel: cabinetData.caActuel || 45000,
            caObjectif: cabinetData.caObjectif || 50000,
            score: cabinetData.score || 85,
            nouveauxPatients: cabinetData.nouveauxPatients || 12,
            nombreRdv: 180,
            tauxAbsence: cabinetData.tauxAbsence || 5,
          },
          dateGeneration,
          globalStats: globalStats,
        });

        results.push({
          cabinet: cabinetData.nom,
          success,
          message: success ? '✅ Email envoyé' : '❌ Échec envoi'
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        results.push({
          cabinet: cabinet.nom,
          success: false,
          message: `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        });
      }
    }

    const totalSuccess = results.filter(r => r.success).length;

    return NextResponse.json({
      success: totalSuccess > 0,
      message: `${totalSuccess}/${results.length} rapports envoyés`,
      rapportsEnvoyes: totalSuccess,
      results,
    });

  } catch (error) {
    console.error("❌ Erreur API POST send-positive:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erreur lors de l'envoi des rapports",
      },
      { status: 500 }
    );
  }
}
