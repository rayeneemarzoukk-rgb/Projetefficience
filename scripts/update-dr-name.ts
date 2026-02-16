// Script pour mettre à jour "Dr. Dubois" en "Dr. Marzouk" dans MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function updateDrName() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI non défini dans .env.local');
    process.exit(1);
  }

  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database non disponible');
    }

    // Mettre à jour dans la collection cabinets
    const cabinetsResult = await db.collection('cabinets').updateMany(
      { nom: { $regex: /Dr\.?\s*Dubois/i } },
      { $set: { nom: 'Dr. Marzouk' } }
    );
    console.log(`📋 Cabinets mis à jour: ${cabinetsResult.modifiedCount}`);

    // Mettre à jour l'email aussi si présent
    const emailResult = await db.collection('cabinets').updateMany(
      { email: 'dubois@cabinet.fr' },
      { $set: { email: 'marzouk@cabinet.fr' } }
    );
    console.log(`📧 Emails mis à jour: ${emailResult.modifiedCount}`);

    // Vérifier aussi dans les rapports
    const rapportsResult = await db.collection('rapports').updateMany(
      { 'cabinet.nom': { $regex: /Dr\.?\s*Dubois/i } },
      { $set: { 'cabinet.nom': 'Dr. Marzouk', 'cabinet.email': 'marzouk@cabinet.fr' } }
    );
    console.log(`📊 Rapports mis à jour: ${rapportsResult.modifiedCount}`);

    console.log('\n✅ Mise à jour terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

updateDrName();
