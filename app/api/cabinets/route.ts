// API pour les cabinets - Récupère les données de MongoDB
import { initializeApp } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth-guard';
import Cabinet from '@/models/Cabinet';

export async function GET(request: Request) {
  // 🔒 Vérification authentification obligatoire
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    // Connexion à MongoDB
    await initializeApp();

    // Récupérer les cabinets depuis la base de données
    const cabinets = await Cabinet.find().lean();

    // Si aucun cabinet dans la BD, retourner données par défaut
    if (cabinets.length === 0) {
      return Response.json({
        cabinets: [
          {
            id: 1,
            nom: "Dental Care Bordeaux",
            email: "contact@cabinetb.fr",
            score: 94,
            statut: "performant",
            ca: "52 000€",
            trend: "+5%",
            rapport: "Envoyé",
            rapportStatut: "sent",
          },
        {
          id: 2,
          nom: "Cabinet Dr. Martin",
          email: "dr.martin@cabinet.fr",
          score: 92,
          statut: "performant",
          ca: "45 000€",
          trend: "+3%",
          rapport: "Envoyé",
          rapportStatut: "sent",
        },
        {
          id: 3,
          nom: "Dr. Emmanuel (ER)",
          email: "emmanuel@cabinet.fr",
          score: 88,
          statut: "surveiller",
          ca: "38 000€",
          trend: "-1%",
          rapport: "À générer",
          rapportStatut: "pending",
        },
        {
          id: 4,
          nom: "Dr. Jean-Claude (JC)",
          email: "jc@cabinet.fr",
          score: 87,
          statut: "surveiller",
          ca: "45 000€",
          trend: "+2%",
          rapport: "Envoyé",
          rapportStatut: "sent",
        },
        {
          id: 5,
          nom: "Cabinet Sourire",
          email: "sourire@cabinet.fr",
          score: 76,
          statut: "attention",
          ca: "32 000€",
          trend: "-8%",
          rapport: "Non envoyé",
          rapportStatut: "failed",
        },
      ],
      }, { status: 200 });
    }

    // Retourner les cabinets depuis MongoDB
    return Response.json({ cabinets }, { status: 200 });
  } catch (error) {
    console.error('Erreur API /cabinets:', error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
