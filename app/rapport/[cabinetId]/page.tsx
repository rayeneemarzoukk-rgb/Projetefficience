import { initializeApp } from '@/lib/db';
import Cabinet from '@/models/Cabinet';
import Patient from '@/models/Patient';
import ReportGenerator from '@/components/rapport/report-generator';
import mongoose from 'mongoose';

interface RapportPageProps {
  params: { cabinetId: string }
}

export default async function RapportPage({ params }: RapportPageProps) {
  await initializeApp(); // Connexion MongoDB (obligatoire)

  // Recherche du cabinet par son champ 'id' (String ou numéro)
  let cabinet = await Cabinet.findOne({ id: params.cabinetId }).lean();
  
  // Si non trouvé, essayer en tant que numéro
  if (!cabinet) {
    const numId = parseInt(params.cabinetId);
    if (!isNaN(numId)) {
      cabinet = await Cabinet.findOne({ id: numId.toString() }).lean();
    }
  }
  
  // Si toujours non trouvé, chercher par ObjectId
  if (!cabinet && mongoose.Types.ObjectId.isValid(params.cabinetId)) {
    cabinet = await Cabinet.findById(params.cabinetId).lean();
  }

  if (!cabinet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cabinet introuvable</h1>
          <p className="text-gray-600 mb-6">
            Le cabinet avec l'ID "{params.cabinetId}" n'existe pas dans la base de données.
          </p>
          <a
            href="/rapports"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retour à la liste
          </a>
        </div>
      </div>
    );
  }

  // Recherche des patients liés à ce cabinet (champ cabinetId: string)
  const patientQuery: any = { cabinetId: params.cabinetId };
  const rawPatients = await Patient.find(patientQuery).lean() as any[];
  // Serialize to plain objects (MongoDB ObjectId/Date are not transferable to Client Components)
  const patients = rawPatients.map((p: any) => JSON.parse(JSON.stringify(p)));

  // Calculer les statistiques globales (tous les cabinets)
  const allCabinets = await Cabinet.find({}).lean();
  const emailsEnvoyes = allCabinets.filter((c: any) => c.rapportStatut === "sent").length;
  const rapportsNonGeneres = allCabinets.filter((c: any) => c.rapportStatut === "not_generated").length;
  const scoreMoyens = allCabinets.reduce((sum: number, c: any) => sum + (c.score || 0), 0) / (allCabinets.length || 1);
  
  const globalStats = {
    totalCabinets: allCabinets.length,
    emailsEnvoyes: emailsEnvoyes,
    rapportsNonGeneres: rapportsNonGeneres,
    performanceMoyenne: Math.round(scoreMoyens),
  };

  // Construire les données complètes du rapport avec valeurs par défaut
  const cabinetData = {
    id: (cabinet as any)._id?.toString() || params.cabinetId,
    nom: (cabinet as any).nom || "Cabinet sans nom",
    email: (cabinet as any).email || "email@unknown.fr",
    score: (cabinet as any).score || 85,
    caActuel: (cabinet as any).caActuel || 45000,
    caObjectif: (cabinet as any).caObjectif || 50000,
    progression: (cabinet as any).progression || 5,
    nouveauxPatients: (cabinet as any).nouveauxPatients || 12,
    tauxAbsence: (cabinet as any).tauxAbsence || 5,
    actes: (cabinet as any).actes && (cabinet as any).actes.length > 0 ? (cabinet as any).actes : undefined,
    periode: (cabinet as any).periode || new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" }),
    statut: (cabinet as any).statut || "OK",
  };

  // Affichage du dashboard rapport
  return (
    <ReportGenerator
      cabinet={cabinetData}
      patients={patients}
      globalStats={globalStats}
    />
  );
}   