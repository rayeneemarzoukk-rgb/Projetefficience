import { sendCabinetReportEmail } from '@/lib/email-service';
import { initializeApp } from '@/lib/db';
import Cabinet from '@/models/Cabinet';
import { NextResponse } from 'next/server';

/**
 * POST /api/rapports/send/[cabinetId]
 * Envoie le rapport d'un cabinet spécifique par email
 */
export async function POST(
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
      // Try by ObjectId
      const mongoose = await import('mongoose');
      if (mongoose.Types.ObjectId.isValid(params.cabinetId)) {
        cabinet = await Cabinet.findById(params.cabinetId).lean();
      }
    }

    if (!cabinet) {
      return NextResponse.json({ error: 'Cabinet non trouvé' }, { status: 404 });
    }

    const cabinetData = cabinet as any;

    // Stats globales
    const allCabinets = await Cabinet.find({}).lean();
    const emailsEnvoyes = allCabinets.filter((c: any) => c.rapportStatut === "sent").length;
    const rapportsNonGeneres = allCabinets.filter((c: any) => c.rapportStatut === "not_generated").length;
    const scoreMoyens = allCabinets.reduce((sum: number, c: any) => sum + (c.score || 0), 0) / (allCabinets.length || 1);

    const globalStats = {
      totalCabinets: allCabinets.length,
      emailsEnvoyes,
      rapportsNonGeneres,
      performanceMoyenne: Math.round(scoreMoyens),
    };

    const now = new Date();
    const dateGeneration = now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const success = await sendCabinetReportEmail({
      cabinetNom: cabinetData.nom || "Cabinet sans nom",
      cabinetEmail: cabinetData.email || "contact@cabinet.fr",
      periode: cabinetData.periode || now.toLocaleString("fr-FR", { month: "long", year: "numeric" }),
      statistiques: {
        caActuel: cabinetData.caActuel || 45000,
        caObjectif: cabinetData.caObjectif || 50000,
        score: cabinetData.score || 85,
        nouveauxPatients: cabinetData.nouveauxPatients || 12,
        nombreRdv: cabinetData.nombreRdv || 180,
        tauxAbsence: cabinetData.tauxAbsence || 5,
      },
      dateGeneration,
      globalStats,
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Rapport envoyé pour ${cabinetData.nom}`,
        cabinet: cabinetData.nom,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Échec de l'envoi pour ${cabinetData.nom}`,
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Erreur API send rapport:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
