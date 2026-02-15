import { NextRequest, NextResponse } from 'next/server';
import { analyzeCabinet } from '@/lib/openai-service';

export async function POST(request: NextRequest) {
  try {
    const cabinetData = await request.json();

    if (!cabinetData || !cabinetData.id) {
      return NextResponse.json(
        { success: false, error: 'Données cabinet manquantes' },
        { status: 400 }
      );
    }

    const analysis = await analyzeCabinet(cabinetData);

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        cabinetId: cabinetData.id,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Erreur analyse IA:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de l\'analyse du cabinet',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
