// API pour les patients
import { initializeApp } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth-guard';
import Patient from '@/models/Patient';

export async function GET(request: Request) {
  // 🔒 Vérification authentification obligatoire
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    await initializeApp();

    // Récupérer les patients depuis MongoDB
    const patients = await Patient.find().lean();

    return Response.json({ patients }, { status: 200 });
  } catch (error) {
    console.error('Erreur API /patients:', error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // 🔒 Vérification authentification obligatoire
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    await initializeApp();

    const body = await request.json();
    const newPatient = new Patient(body);
    const savedPatient = await newPatient.save();

    return Response.json(savedPatient, { status: 201 });
  } catch (error) {
    console.error('Erreur création patient:', error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
