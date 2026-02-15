const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb+srv://rayan_dev2:weshwesh123AA@efficienceprojet.s1rcmkw.mongodb.net/rayan_dev2');
  const col = mongoose.connection.db.collection('cabinets');
  const setOp = "$set";
  const now = new Date().toLocaleDateString('fr-FR');

  // Dr. Dubois - score 94, top performer
  await col.updateOne({ nom: 'Dr. Dubois' }, { [setOp]: {
    id: 'cab-001',
    nouveauxPatients: 18,
    tauxAbsence: 3,
    nombreRdv: 195,
    progression: 8,
    periode: 'février 2026',
    patientsTraites: 165,
    rdvHonores: 189,
    tauxConversion: 92,
    dateGenerationRapport: now,
    dateEnvoiRapport: now,
  }});

  // Dr. Burnier - score 92
  await col.updateOne({ nom: 'Dr. Burnier' }, { [setOp]: {
    nouveauxPatients: 15,
    tauxAbsence: 4,
    nombreRdv: 180,
    progression: 6,
    periode: 'février 2026',
    patientsTraites: 148,
    rdvHonores: 173,
    tauxConversion: 88,
    dateGenerationRapport: now,
    dateEnvoiRapport: now,
  }});

  // Dr. Laroche - score 88, slightly under objective
  await col.updateOne({ nom: 'Dr. Laroche' }, { [setOp]: {
    nouveauxPatients: 12,
    tauxAbsence: 6,
    nombreRdv: 160,
    progression: 3,
    periode: 'février 2026',
    patientsTraites: 130,
    rdvHonores: 150,
    tauxConversion: 82,
    dateGenerationRapport: now,
    dateEnvoiRapport: now,
  }});

  // Dr. Mocanu - score 87, exactly at objective
  await col.updateOne({ nom: 'Dr. Mocanu' }, { [setOp]: {
    nouveauxPatients: 14,
    tauxAbsence: 5,
    nombreRdv: 170,
    progression: 4,
    periode: 'février 2026',
    patientsTraites: 140,
    rdvHonores: 162,
    tauxConversion: 85,
    dateGenerationRapport: now,
    dateEnvoiRapport: now,
  }});

  // Dr. Pinard - score 76, below objective  
  await col.updateOne({ nom: 'Dr. Pinard' }, { [setOp]: {
    nouveauxPatients: 8,
    tauxAbsence: 9,
    nombreRdv: 130,
    progression: -2,
    periode: 'février 2026',
    patientsTraites: 105,
    rdvHonores: 118,
    tauxConversion: 75,
    dateGenerationRapport: now,
    dateEnvoiRapport: now,
  }});

  console.log('All 5 cabinets updated with complete unique data');
  
  // Verify
  const cabs = await col.find({}).toArray();
  cabs.forEach(c => console.log(c.nom, '- score:', c.score, '- patients:', c.nouveauxPatients, '- rdv:', c.nombreRdv, '- absence:', c.tauxAbsence + '%'));
  await mongoose.disconnect();
}

main().catch(console.error);
