const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://rayan_dev2:weshwesh123AA--@efficienceprojet.s1rcmkw.mongodb.net/rayan_dev2?retryWrites=true&w=majority';

async function fixStatut() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('rayan_dev2');
    const result = await db.collection('cabinets').updateMany({}, { $set: { rapportStatut: 'sent' } });
    console.log('✅ Statut rapport mis à jour pour tous les cabinets:', result.modifiedCount);
  } finally {
    await client.close();
  }
}
fixStatut().catch(console.error);
