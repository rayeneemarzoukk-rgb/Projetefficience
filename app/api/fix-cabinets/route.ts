import { NextResponse } from 'next/server';
import { initializeApp } from '@/lib/db';
import Cabinet from '@/models/Cabinet';

// 🔧 API one-shot pour corriger les cabinets dans MongoDB
export async function GET() {
  try {
    await initializeApp();

    // 1. Récupérer tous les cabinets
    const allCabinets = await Cabinet.find().lean();
    const info = allCabinets.map((c: any) => ({
      _id: String(c._id),
      id: c.id,
      nom: c.nom,
      rapportStatut: c.rapportStatut,
    }));
    console.log(`📊 Cabinets avant correction: ${allCabinets.length}`, JSON.stringify(info));

    // 2. Trouver les doublons par nom
    const seen = new Map<string, any>();
    const toDeleteIds: any[] = [];

    for (const cab of allCabinets) {
      const nom = ((cab as any).nom || '').toLowerCase().trim();
      if (seen.has(nom)) {
        // Doublon - supprimer celui-ci
        toDeleteIds.push((cab as any)._id);
      } else {
        seen.set(nom, cab);
      }
    }

    // 3. Supprimer les doublons
    let deleted = 0;
    for (const id of toDeleteIds) {
      const result = await Cabinet.collection.deleteOne({ _id: id });
      deleted += result.deletedCount;
    }

    // 4. Mettre à jour TOUS les rapportStatut à "sent"
    const updateResult = await Cabinet.collection.updateMany(
      {},
      { $set: { rapportStatut: 'sent', rapport: 'Envoyé' } }
    );

    // 5. Vérification finale
    const finalCabinets = await Cabinet.find().lean();
    
    return NextResponse.json({
      success: true,
      before: allCabinets.length,
      duplicatesRemoved: deleted,
      after: finalCabinets.length,
      updated: updateResult.modifiedCount,
      cabinets: finalCabinets.map((c: any) => ({
        id: c.id,
        nom: c.nom,
        rapportStatut: c.rapportStatut,
      })),
    });
  } catch (error) {
    console.error('❌ Erreur fix-cabinets:', error);
    return NextResponse.json({ error: 'Erreur', details: String(error) }, { status: 500 });
  }
}
