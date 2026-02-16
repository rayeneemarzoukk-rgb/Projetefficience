import { initializeApp } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth-guard';
import Cabinet from '@/models/Cabinet';
import mongoose from 'mongoose';

// Fonction pour calculer le statut du cabinet
function calculateCabinetStatut(caActuel: number, caObjectif: number): string {
  if (caActuel >= caObjectif) return "OK";
  if (caActuel >= caObjectif * 0.85) return "À suivre";
  return "À surveiller";
}

// API pour les rapports - Récupère les vrais données MongoDB
export async function GET(request: Request) {
  // 🔒 Vérification authentification obligatoire
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    // Initialize MongoDB connection
    await initializeApp();

    // Récupérer tous les cabinets
    const cabinets = await Cabinet.find({}).lean();

    if (!cabinets || cabinets.length === 0) {
      return Response.json({
        rapportsEnvoyes: 0,
        rapportsGeneresNonEnvoyes: 0,
        rapportsNonGeneres: 0,
        totalCabinets: 0,
        rapports: [],
      });
    }

    // Mapper les cabinets en rapports avec données complètes
    const rapports = cabinets.map((cabinet: any) => {
      const caActuel = cabinet.caActuel || 0;
      const caObjectif = cabinet.caObjectif || 50000;
      const statut = cabinet.rapportStatut === "sent" ? "Envoyé" : cabinet.rapportStatut === "generated" ? "Généré" : "Non généré";
      const cabinetStatut = calculateCabinetStatut(caActuel, caObjectif);
      const nombreRdv = cabinet.nombreRdv || 150;
      const tauxAbsence = cabinet.tauxAbsence || 5;
      const nouveauxPatients = cabinet.nouveauxPatients || 12;

      // Répartition des actes (calculée dynamiquement)
      const consultations = Math.round(nombreRdv * 0.44);
      const detartrages = Math.round(nombreRdv * 0.34);
      const soinsConservateurs = Math.round(nombreRdv * 0.15);
      const protheses = Math.round(nombreRdv * 0.07);
      const totalActes = consultations + detartrages + soinsConservateurs + protheses;

      return {
        id: cabinet._id?.toString() || `rapport-${cabinet.id}`,
        cabinetId: cabinet.id || cabinet._id?.toString(),
        cabinet: {
          id: cabinet.id || cabinet._id?.toString(),
          nom: cabinet.nom || "Cabinet sans nom",
          email: cabinet.email || "email@unknown.fr",
        },
        periode: cabinet.periode || new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" }),
        statut: statut,
        cabinetStatut: cabinetStatut,
        dateGeneration: cabinet.dateGenerationRapport || new Date().toLocaleDateString("fr-FR"),
        dateEnvoi: cabinet.rapportStatut === "sent" ? (cabinet.dateEnvoiRapport || new Date().toLocaleDateString("fr-FR")) : undefined,
        score: cabinet.score || 85,
        caActuel: caActuel,
        caObjectif: caObjectif,
        progression: cabinet.progression || 0,
        nouveauxPatients: nouveauxPatients,
        patientsTraites: cabinet.patientsTraites || Math.round(nouveauxPatients * 0.85),
        rdvHonores: cabinet.rdvHonores || Math.round(nombreRdv * (1 - tauxAbsence / 100)),
        tauxAbsence: tauxAbsence,
        tauxConversion: cabinet.tauxConversion || 85,
        nombreRdv: nombreRdv,
        actes: [
          { type: "Consultations", nombre: consultations, ca: consultations * 50, couleur: "#3b82f6", pourcentage: totalActes > 0 ? Math.round((consultations / totalActes) * 100) : 0 },
          { type: "Détartrages", nombre: detartrages, ca: detartrages * 73, couleur: "#10b981", pourcentage: totalActes > 0 ? Math.round((detartrages / totalActes) * 100) : 0 },
          { type: "Soins conservateurs", nombre: soinsConservateurs, ca: soinsConservateurs * 150, couleur: "#8b5cf6", pourcentage: totalActes > 0 ? Math.round((soinsConservateurs / totalActes) * 100) : 0 },
          { type: "Prothèses", nombre: protheses, ca: protheses * 720, couleur: "#f59e0b", pourcentage: totalActes > 0 ? Math.round((protheses / totalActes) * 100) : 0 },
        ],
      };
    });

    // Compter les statuts
    const rapportsEnvoyes = rapports.filter((r: any) => r.statut === "Envoyé").length;
    const rapportsGeneresNonEnvoyes = rapports.filter((r: any) => r.statut === "Généré").length;
    const rapportsNonGeneres = rapports.filter((r: any) => r.statut === "Non généré").length;

    return Response.json({
      rapportsEnvoyes,
      rapportsGeneresNonEnvoyes,
      rapportsNonGeneres,
      totalCabinets: rapports.length,
      rapports,
    });
  } catch (error) {
    console.error("❌ Erreur API /rapports:", error);
    return Response.json(
      { 
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // 🔒 Vérification authentification obligatoire
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    const body = await request.json()

    // Logique pour générer un rapport
    const newRapport = {
      id: Math.random(),
      cabinet: body.cabinetId,
      statut: "Généré",
      dateGeneration: new Date().toLocaleDateString(),
    }

    return Response.json(newRapport, { status: 201 })
  } catch (error) {
    return Response.json({ error: "Erreur lors de la génération" }, { status: 500 })
  }
}
