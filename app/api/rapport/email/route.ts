import { NextResponse } from 'next/server';
import { initializeApp } from '@/lib/db';
import Cabinet from '@/models/Cabinet';
import nodemailer from 'nodemailer';

export async function POST() {
  await initializeApp();

  // Récupérer tous les cabinets
  const cabinets = await Cabinet.find().lean();

  // MODIFIÉ: Envoyer à TOUS les cabinets (plus de filtre par statut)
  // Tous les cabinets recevront leur rapport, quel que soit leur statut
  const cabinetsAEnvoyer = cabinets; // Tous les cabinets

  // Configuration nodemailer avec les bonnes variables d'environnement
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || process.env.SMTP_HOST,
    port: Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587),
    secure: process.env.EMAIL_PORT === '465', // true pour 465, false pour autres ports
    auth: {
      user: process.env.EMAIL_USER || process.env.SMTP_USER,
      pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASS,
    },
  });

  const resultats = [];
  let emailsEnvoyesCount = 0;
  
  // Envoyer à TOUS les cabinets sans exception
  for (const cab of cabinetsAEnvoyer) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_NOTIFICATION_EMAIL || 'maarzoukrayan3@gmail.com',
        subject: `Rapport cabinet: ${cab.nom}`,
        html: `
          <h2>Rapport mensuel - ${cab.nom}</h2>
          <p><strong>Statut:</strong> ${cab.statut}</p>
          <p><strong>Score:</strong> ${cab.score || 'N/A'}</p>
          <p>Ce rapport est envoyé automatiquement à tous les cabinets.</p>
        `,
      });
      
      // Mettre à jour le champ rapportStatut à "sent" après l'envoi réussi
      await Cabinet.findByIdAndUpdate(cab._id, { 
        rapportStatut: 'sent',
        dernierEnvoiRapport: new Date()
      });
      
      emailsEnvoyesCount++;
      resultats.push({ cabinet: cab.nom, sent: true });
    } catch (error) {
      console.error(`Erreur envoi pour ${cab.nom}:`, error);
      resultats.push({ cabinet: cab.nom, sent: false, error: String(error) });
    }
  }

  return NextResponse.json({
    success: true,
    emailsEnvoyes: emailsEnvoyesCount,
    rapportsNonEnvoyes: cabinetsAEnvoyer.length - emailsEnvoyesCount,
    totalCabinets: cabinetsAEnvoyer.length,
    details: resultats,
  });
}