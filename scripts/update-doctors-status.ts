// Script pour mettre à jour Dr. Laroche et Dr. Pinard dans MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function updateDoctorsStatus() {
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

    // Mettre à jour Dr. Laroche - Status OK, rapport en attente
    const larocheResult = await db.collection('cabinets').updateOne(
      { nom: { $regex: /Laroche/i } },
      { 
        $set: { 
          score: 91,
          statut: 'performant',
          caActuel: 42000,
          caObjectif: 40000,
          trend: '+5%',
          rapport: 'En attente',
          rapportStatut: 'pending'
        } 
      }
    );
    console.log(`📋 Dr. Laroche mis à jour: ${larocheResult.modifiedCount}`);

    // Mettre à jour Dr. Pinard - Status OK, rapport en attente
    const pinardResult = await db.collection('cabinets').updateOne(
      { nom: { $regex: /Pinard/i } },
      { 
        $set: { 
          score: 90,
          statut: 'performant',
          caActuel: 41000,
          caObjectif: 40000,
          trend: '+3%',
          rapport: 'En attente',
          rapportStatut: 'pending'
        } 
      }
    );
    console.log(`📋 Dr. Pinard mis à jour: ${pinardResult.modifiedCount}`);

    // Mettre à jour les rapports aussi
    await db.collection('rapports').updateOne(
      { 'cabinet.nom': { $regex: /Laroche/i } },
      { 
        $set: { 
          score: 91,
          cabinetStatut: 'OK',
          caActuel: 42000,
          statut: 'En attente'
        } 
      }
    );

    await db.collection('rapports').updateOne(
      { 'cabinet.nom': { $regex: /Pinard/i } },
      { 
        $set: { 
          score: 90,
          cabinetStatut: 'OK',
          caActuel: 41000,
          statut: 'En attente'
        } 
      }
    );

    console.log('\n✅ Mise à jour terminée avec succès!');
    console.log('Dr. Laroche et Dr. Pinard ont maintenant:');
    console.log('  - Statut cabinet: OK (performant)');
    console.log('  - Statut rapport: En attente (pending)');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

updateDoctorsStatus();
