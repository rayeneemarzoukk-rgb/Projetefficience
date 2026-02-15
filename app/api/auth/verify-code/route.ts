import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.MONGODB_DB || 'rayan_dev2';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email et code requis' },
        { status: 400 }
      );
    }

    // Connexion MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client[DB_NAME];

    // Récupérer le code de vérification
    const verification = await db.collection('verification_codes').findOne({
      email: email.toLowerCase(),
      code: code.trim(),
    });

    if (!verification) {
      client.close();
      return NextResponse.json(
        { success: false, error: 'Code invalide' },
        { status: 400 }
      );
    }

    // Vérifier l'expiration
    if (new Date() > new Date(verification.expiresAt)) {
      client.close();
      return NextResponse.json(
        { success: false, error: 'Code expiré. Demandez un nouveau code.' },
        { status: 400 }
      );
    }

    // Marquer comme vérifié
    await db.collection('verification_codes').updateOne(
      { email: email.toLowerCase() },
      { $set: { verified: true, verifiedAt: new Date() } }
    );

    client.close();

    return NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès',
    });
  } catch (error) {
    console.error('Erreur verify-code:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
