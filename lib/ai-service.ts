import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialiser Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Vérifier si l'API key est configurée
const isConfigured = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIza');

export interface CabinetData {
  id: string;
  nom: string;
  caActuel: number;
  caObjectif: number;
  nouveauxPatients: number;
  absences: number;
  devisEnvoyes: number;
  devisConvertis: number;
  traitements: {
    nom: string;
    nombre: number;
  }[];
  periodicite: string; 
}

export interface PredictionResult {
  caPredit: number;
  tauxConversion: number;
  patientsPrevus: number;
  riskFactors: string[];
  confidence: number;
}

export interface RecommendationResult {
  recommendations: string[];
  urgency: 'critical' | 'high' | 'medium' | 'low';
  actionPlan: {
    action: string;
    impact: string;
    deadline: string;
  }[];
}

async function callGemini(prompt: string): Promise<string> {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

function parseJSON<T>(content: string): T {
  // Nettoyer le contenu des balises markdown
  const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function generatePredictions(data: CabinetData): Promise<PredictionResult> {
  if (!isConfigured) {
    console.warn('⚠️ Gemini API non configurée - Lancement exception pour fallback');
    throw new Error('Gemini API non configurée');
  }

  const prompt = `Tu es un expert en gestion de cabinets dentaires.
Données du cabinet: ${data.nom}
- CA actuel: ${data.caActuel}€
- CA objectif: ${data.caObjectif}€
- Nouveaux patients: ${data.nouveauxPatients}
- Absences: ${data.absences}
- Devis convertis: ${data.devisConvertis}/${data.devisEnvoyes}

Réponds UNIQUEMENT en JSON valide (sans texte avant ou après):
{
  "caPredit": <nombre estimé du CA prédit>,
  "tauxConversion": <pourcentage 0-100>,
  "patientsPrevus": <nombre de patients prévus>,
  "riskFactors": ["facteur de risque 1", "facteur 2"],
  "confidence": <niveau de confiance 0-100>
}`;

  try {
    const content = await callGemini(prompt);
    return parseJSON<PredictionResult>(content);
  } catch (error) {
    console.error('❌ Erreur Gemini generatePredictions:', error);
    throw error;
  }
}

export async function generateRecommendations(data: CabinetData, prediction: PredictionResult): Promise<RecommendationResult> {
  if (!isConfigured) {
    console.warn('⚠️ Gemini API non configurée - Lancement exception pour fallback');
    throw new Error('Gemini API non configurée');
  }

  const gap = ((data.caObjectif - prediction.caPredit) / data.caObjectif) * 100;
  const prompt = `Tu es un consultant expert en gestion de cabinets dentaires.
Génère des recommandations pour ce cabinet dentaire.
Écart par rapport à l'objectif: ${gap.toFixed(1)}%
CA actuel: ${data.caActuel}€
Objectif: ${data.caObjectif}€

Réponds UNIQUEMENT en JSON valide (sans texte avant ou après):
{
  "recommendations": ["recommandation 1", "recommandation 2", "recommandation 3"],
  "urgency": "critical" ou "high" ou "medium" ou "low",
  "actionPlan": [
    {"action": "action à réaliser", "impact": "impact attendu", "deadline": "délai"},
    {"action": "action 2", "impact": "impact 2", "deadline": "délai 2"}
  ]
}`;

  try {
    const content = await callGemini(prompt);
    return parseJSON<RecommendationResult>(content);
  } catch (error) {
    console.error('❌ Erreur Gemini generateRecommendations:', error);
    throw error;
  }
}

export async function analyzeCabinet(data: CabinetData): Promise<string> {
  if (!isConfigured) {
    console.warn('⚠️ Gemini API non configurée - Utilisation d\'analyse par défaut');
    const tauxConversion = ((data.devisConvertis / data.devisEnvoyes) * 100).toFixed(0);
    return `Analyse du cabinet ${data.nom}:\n\nLe cabinet présente un chiffre d'affaires de ${data.caActuel}€ pour un objectif de ${data.caObjectif}€. Avec ${data.nouveauxPatients} nouveaux patients et un taux de conversion de ${tauxConversion}%, le cabinet montre des performances solides.\n\nRecommandations: Améliorer le suivi des devis, réduire les absences, et optimiser la planification.`;
  }

  const prompt = `Tu es un expert consultant en gestion dentaire avec 20 ans d'expérience.
Analyse ce cabinet: ${data.nom}
- CA: ${data.caActuel}€ (Objectif: ${data.caObjectif}€)
- Nouveaux patients: ${data.nouveauxPatients}
- Absences: ${data.absences}
- Taux de conversion devis: ${((data.devisConvertis / data.devisEnvoyes) * 100).toFixed(0)}%

Fournir une analyse détaillée en français (3-4 paragraphes) avec:
1. Points forts du cabinet
2. Points faibles identifiés
3. 3 actions immédiates à mettre en place`;

  try {
    const content = await callGemini(prompt);
    return content;
  } catch (error) {
    console.error('❌ Erreur Gemini analyzeCabinet:', error);
    return 'Erreur lors de l\'analyse IA';
  }
}

export async function generateReportWithAI(
  cabinetName: string,
  data: CabinetData,
  prediction: PredictionResult,
  recommendations: RecommendationResult,
  period: string
): Promise<string> {
  if (!isConfigured) {
    console.warn('⚠️ Gemini API non configurée - Lancement exception pour fallback');
    throw new Error('Gemini API non configurée');
  }

  const prompt = `Génère un rapport professionnel complet pour le cabinet dentaire "${cabinetName}" (Période: ${period})

Données:
- CA actuel: ${data.caActuel}€
- CA prédit: ${prediction.caPredit}€
- CA objectif: ${data.caObjectif}€
- Taux de conversion: ${prediction.tauxConversion}%
- Nouveaux patients: ${data.nouveauxPatients}
- Niveau de confiance: ${prediction.confidence}%
- Recommandations prioritaires: ${recommendations.recommendations.slice(0, 3).join(', ')}

Formatte le rapport en markdown avec les sections suivantes:
# Résumé Exécutif
# Performance Financière
# Analyse des Indicateurs
# Recommandations Prioritaires
# Plan d'Action`;

  try {
    const content = await callGemini(prompt);
    return content;
  } catch (error) {
    console.error('❌ Erreur Gemini generateReportWithAI:', error);
    throw error;
  }
}
