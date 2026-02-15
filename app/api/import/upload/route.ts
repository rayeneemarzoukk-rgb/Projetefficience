import { NextRequest, NextResponse } from 'next/server';
import { dataImportService } from '@/lib/data-import-service';
import { initializeApp } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await initializeApp();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const format = formData.get('format') as string || 'auto';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();

    let result;

    // Détection automatique du format
    if (format === 'auto') {
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        result = dataImportService.parseExcel(buffer);
      } else if (fileName.endsWith('.csv')) {
        const content = buffer.toString('utf-8');
        result = dataImportService.parseCSV(content);
      } else {
        return NextResponse.json(
          { success: false, error: 'Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv' },
          { status: 400 }
        );
      }
    } else if (format === 'excel') {
      result = dataImportService.parseExcel(buffer);
    } else if (format === 'csv') {
      const content = buffer.toString('utf-8');
      const delimiter = formData.get('delimiter') as string || ';';
      result = dataImportService.parseCSV(content, delimiter);
    } else {
      return NextResponse.json(
        { success: false, error: 'Format non reconnu' },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.errors, imported: 0 },
        { status: 400 }
      );
    }

    // Calcul des scores pour chaque cabinet
    const enrichedData = result.data.map(record => {
      const { score, details } = dataImportService.calculateScore(record);
      const recommendations = dataImportService.generateRecommendations(record, details);
      
      return {
        ...record,
        score,
        scoreDetails: details,
        recommendations,
        tauxAbsence: record.nombreRDV > 0 
          ? Math.round((record.nombreAbsences / record.nombreRDV) * 100 * 10) / 10 
          : 0,
      };
    });

    // TODO: Sauvegarder dans MongoDB
    // await saveToDatabase(enrichedData);

    return NextResponse.json({
      success: true,
      imported: result.imported,
      errors: result.errors,
      data: enrichedData,
      message: `${result.imported} enregistrement(s) importé(s) avec succès`,
    });

  } catch (error: any) {
    console.error('❌ Erreur import:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API Import de données',
    formats: ['xlsx', 'xls', 'csv'],
    requiredColumns: ['cabinet_name', 'periode', 'chiffre_affaires'],
    optionalColumns: [
      'cabinet_id',
      'objectif_ca',
      'nombre_rdv',
      'nombre_absences',
      'nouveaux_patients',
      'patients_traites',
      'devis_envoyes',
      'devis_acceptes',
      'heures_travaillees',
    ],
    example: {
      'cabinet_name': 'Cabinet Dr. Bresden',
      'periode': 'Janvier 2026',
      'chiffre_affaires': 52000,
      'objectif_ca': 50000,
      'nombre_rdv': 180,
      'nombre_absences': 5,
      'nouveaux_patients': 15,
    },
  });
}
