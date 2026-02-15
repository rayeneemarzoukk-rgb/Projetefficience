import { NextRequest, NextResponse } from 'next/server';
import { generatePredictions, generateRecommendations } from '@/lib/openai-service';

export async function POST(request: NextRequest) {
  try {
    const cabinetData = await request.json();

    if (!cabinetData || !cabinetData.id) {
      return NextResponse.json(
        { success: false, error: 'Données cabinet manquantes' },
        { status: 400 }
      );
    }

    // Générer d'abord les prédictions
    const predictions = await generatePredictions(cabinetData);

    // Ensuite générer les recommandations basées sur les prédictions
    const recommendations = await generateRecommendations(cabinetData, predictions);

    return NextResponse.json({
      success: true,
      data: {
        predictions,
        recommendations,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur recommandations IA:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la génération des recommandations',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
