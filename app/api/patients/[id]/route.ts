import { initializeApp } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth-guard';
import Patient from '@/models/Patient';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if (auth.response) return auth.response;

  try {
    await initializeApp();
    const { id } = params;

    const result = await Patient.findByIdAndDelete(id);
    
    if (!result) {
      return NextResponse.json({ error: "Patient non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Patient supprimé" });
  } catch (error) {
    console.error('Erreur suppression patient:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if (auth.response) return auth.response;

  try {
    await initializeApp();
    const { id } = params;
    const body = await request.json();

    const result = await Patient.findByIdAndUpdate(id, body, { new: true });
    
    if (!result) {
      return NextResponse.json({ error: "Patient non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true, patient: result });
  } catch (error) {
    console.error('Erreur modification patient:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
