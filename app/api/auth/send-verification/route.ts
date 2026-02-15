import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email-service';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.MONGODB_DB || 'rayan_dev2';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Email et nom requis' },
        { status: 400 }
      );
    }

    // Générer le code de vérification
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Connexion MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client[DB_NAME];

    // Stocker le code dans une collection temporaire
    await db.collection('verification_codes').updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          email: email.toLowerCase(),
          code,
          name,
          expiresAt,
          verified: false,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Envoyer l'email
    const emailSent = await sendVerificationEmail(email, code, name);

    client.close();

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Code de vérification envoyé par email',
    });
  } catch (error) {
    console.error('Erreur send-verification:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
