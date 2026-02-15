import * as XLSX from 'xlsx';

export interface CabinetImportData {
  cabinetId: string;
  cabinetName: string;
  periode: string;
  chiffreAffaires: number;
  objectifCA: number;
  nombreRDV: number;
  nombreAbsences: number;
  nouveauxPatients: number;
  patientsTraites: number;
  devisEnvoyes?: number;
  devisAcceptes?: number;
  heuresTravaillees?: number;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  data: CabinetImportData[];
}

/**
 * Service d'import de données depuis fichiers Excel/CSV
 */
class DataImportService {
  /**
   * Parse un fichier Excel (.xlsx, .xls)
   */
  parseExcel(buffer: Buffer): ImportResult {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (jsonData.length < 2) {
        return { success: false, imported: 0, errors: ['Fichier vide ou sans données'], data: [] };
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1);

      return this.processRows(headers, rows);
    } catch (error: any) {
      return { success: false, imported: 0, errors: [`Erreur parsing Excel: ${error.message}`], data: [] };
    }
  }

  /**
   * Parse un fichier CSV
   */
  parseCSV(content: string, delimiter: string = ';'): ImportResult {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        return { success: false, imported: 0, errors: ['Fichier CSV vide'], data: [] };
      }

      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => 
        line.split(delimiter).map(cell => cell.trim().replace(/"/g, ''))
      );

      return this.processRows(headers, rows);
    } catch (error: any) {
      return { success: false, imported: 0, errors: [`Erreur parsing CSV: ${error.message}`], data: [] };
    }
  }

  /**
   * Traite les lignes et mappe vers le format attendu
   */
  private processRows(headers: string[], rows: any[][]): ImportResult {
    const errors: string[] = [];
    const data: CabinetImportData[] = [];

    // Mapping des noms de colonnes possibles
    const columnMappings: Record<string, string[]> = {
      cabinetId: ['cabinet_id', 'cabinetid', 'id', 'id_cabinet'],
      cabinetName: ['cabinet_name', 'cabinetname', 'nom', 'nom_cabinet', 'cabinet'],
      periode: ['periode', 'period', 'mois', 'date'],
      chiffreAffaires: ['chiffre_affaires', 'ca', 'chiffreaffaires', 'revenue', 'montant'],
      objectifCA: ['objectif_ca', 'objectifca', 'objectif', 'target', 'goal'],
      nombreRDV: ['nombre_rdv', 'rdv', 'rendez_vous', 'appointments', 'nb_rdv'],
      nombreAbsences: ['nombre_absences', 'absences', 'absent', 'nb_absences'],
      nouveauxPatients: ['nouveaux_patients', 'nouveaux', 'new_patients', 'nb_nouveaux'],
      patientsTraites: ['patients_traites', 'traites', 'treated', 'nb_traites'],
      devisEnvoyes: ['devis_envoyes', 'devis', 'quotes', 'nb_devis'],
      devisAcceptes: ['devis_acceptes', 'acceptes', 'accepted', 'nb_acceptes'],
      heuresTravaillees: ['heures_travaillees', 'heures', 'hours', 'nb_heures'],
    };

    // Trouve l'index de chaque colonne
    const columnIndexes: Record<string, number> = {};
    const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/\s+/g, '_'));

    for (const [field, aliases] of Object.entries(columnMappings)) {
      const index = normalizedHeaders.findIndex(h => aliases.includes(h));
      if (index !== -1) {
        columnIndexes[field] = index;
      }
    }

    // Vérifie les colonnes obligatoires
    const requiredFields = ['cabinetName', 'periode', 'chiffreAffaires'];
    const missingFields = requiredFields.filter(f => columnIndexes[f] === undefined);
    
    if (missingFields.length > 0) {
      return {
        success: false,
        imported: 0,
        errors: [`Colonnes manquantes: ${missingFields.join(', ')}`],
        data: [],
      };
    }

    // Traite chaque ligne
    rows.forEach((row, index) => {
      try {
        if (!row || row.every(cell => !cell)) return; // Ligne vide

        const record: CabinetImportData = {
          cabinetId: this.getValue(row, columnIndexes.cabinetId) || `cab-${index + 1}`,
          cabinetName: this.getValue(row, columnIndexes.cabinetName) || '',
          periode: this.getValue(row, columnIndexes.periode) || '',
          chiffreAffaires: this.parseNumber(row, columnIndexes.chiffreAffaires),
          objectifCA: this.parseNumber(row, columnIndexes.objectifCA) || 50000,
          nombreRDV: this.parseNumber(row, columnIndexes.nombreRDV) || 0,
          nombreAbsences: this.parseNumber(row, columnIndexes.nombreAbsences) || 0,
          nouveauxPatients: this.parseNumber(row, columnIndexes.nouveauxPatients) || 0,
          patientsTraites: this.parseNumber(row, columnIndexes.patientsTraites) || 0,
          devisEnvoyes: this.parseNumber(row, columnIndexes.devisEnvoyes),
          devisAcceptes: this.parseNumber(row, columnIndexes.devisAcceptes),
          heuresTravaillees: this.parseNumber(row, columnIndexes.heuresTravaillees),
        };

        // Validation
        if (!record.cabinetName) {
          errors.push(`Ligne ${index + 2}: Nom de cabinet manquant`);
          return;
        }

        if (!record.periode) {
          errors.push(`Ligne ${index + 2}: Période manquante`);
          return;
        }

        data.push(record);
      } catch (error: any) {
        errors.push(`Ligne ${index + 2}: ${error.message}`);
      }
    });

    return {
      success: data.length > 0,
      imported: data.length,
      errors,
      data,
    };
  }

  private getValue(row: any[], index: number | undefined): string {
    if (index === undefined || index < 0) return '';
    return String(row[index] || '').trim();
  }

  private parseNumber(row: any[], index: number | undefined): number {
    if (index === undefined || index < 0) return 0;
    const value = row[index];
    if (!value) return 0;
    
    // Nettoie le format (virgule décimale, espaces, symboles €)
    const cleaned = String(value)
      .replace(/\s/g, '')
      .replace(/€/g, '')
      .replace(/,/g, '.');
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Calcule le score automatique basé sur les objectifs
   */
  calculateScore(data: CabinetImportData): { score: number; details: Record<string, number> } {
    const details: Record<string, number> = {};

    // Score CA (40% du total)
    const caRatio = data.objectifCA > 0 ? (data.chiffreAffaires / data.objectifCA) * 100 : 0;
    details.performanceCA = Math.min(caRatio, 120); // Plafond à 120%

    // Score Absences (20% du total) - inversé (moins c'est mieux)
    const tauxAbsence = data.nombreRDV > 0 ? (data.nombreAbsences / data.nombreRDV) * 100 : 0;
    details.tauxAbsence = Math.max(0, 100 - tauxAbsence * 5); // 5% absences = -25 points

    // Score Nouveaux Patients (20% du total)
    details.nouveauxPatients = Math.min(data.nouveauxPatients * 5, 100); // 20 nouveaux = 100%

    // Score Conversion Devis (20% du total)
    if (data.devisEnvoyes && data.devisEnvoyes > 0) {
      const tauxConversion = (data.devisAcceptes || 0) / data.devisEnvoyes * 100;
      details.conversionDevis = tauxConversion;
    } else {
      details.conversionDevis = 70; // Par défaut
    }

    // Score global pondéré
    const score = Math.round(
      details.performanceCA * 0.4 +
      details.tauxAbsence * 0.2 +
      details.nouveauxPatients * 0.2 +
      details.conversionDevis * 0.2
    );

    return { score: Math.min(Math.max(score, 0), 100), details };
  }

  /**
   * Génère des recommandations basées sur le score
   */
  generateRecommendations(data: CabinetImportData, scoreDetails: Record<string, number>): string[] {
    const recommendations: string[] = [];

    if (scoreDetails.performanceCA < 80) {
      recommendations.push('Optimiser le chiffre d\'affaires en proposant des traitements complémentaires');
    }

    if (scoreDetails.tauxAbsence < 80) {
      recommendations.push('Réduire le taux d\'absence via des rappels SMS 24h avant le RDV');
    }

    if (scoreDetails.nouveauxPatients < 60) {
      recommendations.push('Renforcer l\'acquisition de nouveaux patients (marketing, parrainage)');
    }

    if (scoreDetails.conversionDevis < 70) {
      recommendations.push('Améliorer le suivi des devis avec relances personnalisées');
    }

    if (data.heuresTravaillees && data.chiffreAffaires) {
      const caHoraire = data.chiffreAffaires / data.heuresTravaillees;
      if (caHoraire < 200) {
        recommendations.push('Optimiser le CA horaire en réduisant les temps morts');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellente performance ! Maintenir les bonnes pratiques actuelles');
    }

    return recommendations;
  }
}

export const dataImportService = new DataImportService();
export default dataImportService;
