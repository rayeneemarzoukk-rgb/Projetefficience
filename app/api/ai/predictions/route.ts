import { NextRequest, NextResponse } from 'next/server';
import { generatePredictions } from '@/lib/openai-service';

export async function POST(request: NextRequest) {
  try {
    const cabinetData = await request.json();

    if (!cabinetData || !cabinetData.id) {
      return NextResponse.json(
        { success: false, error: 'Données cabinet manquantes' },
        { status: 400 }
      );
    }

    const predictions = await generatePredictions(cabinetData);

    return NextResponse.json({
      success: true,
      data: predictions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur prédictions IA:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la génération des prédictions',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
