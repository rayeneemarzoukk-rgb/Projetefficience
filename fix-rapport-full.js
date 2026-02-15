const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://rayan_dev2:weshwesh123AA--@efficienceprojet.s1rcmkw.mongodb.net/rayan_dev2?retryWrites=true&w=majority';

async function fixRapport() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('rayan_dev2');
    const result = await db.collection('cabinets').updateMany({}, { $set: { rapport: 'Envoyé', rapportStatut: 'sent' } });
    console.log('✅ Statut rapport et texte mis à jour pour tous:', result.modifiedCount);
  } finally {
    await client.close();
  }
}
fixRapport().catch(console.error);
