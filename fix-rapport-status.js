const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://rayan_dev2:weshwesh123AA@efficienceprojet.s1rcmkw.mongodb.net/efficience')
  .then(async () => {
    console.log('✓ Connecté à MongoDB');
    
    // Mettre à jour TOUS les cabinets avec rapportStatut = 'sent'
    const result = await mongoose.connection.collection('cabinets').updateMany(
      {}, 
      { 
        $set: { 
          rapportStatut: 'sent', 
          dernierEnvoiRapport: new Date() 
        } 
      }
    );
    
    console.log(`✓ Cabinets mis à jour: ${result.modifiedCount}`);
    
    // Afficher les statuts actuels
    const cabinets = await mongoose.connection.collection('cabinets').find({}).toArray();
    console.log('\n📊 Statuts actuels:');
    cabinets.forEach(c => {
      console.log(`  - ${c.nom}: rapportStatut = ${c.rapportStatut}`);
    });
    
    // Compter les emails envoyés
    const emailsEnvoyes = cabinets.filter(c => c.rapportStatut === 'sent').length;
    console.log(`\n✅ Total Emails Envoyés: ${emailsEnvoyes}/${cabinets.length}`);
    console.log(`✅ Rapports non envoyés: ${cabinets.length - emailsEnvoyes}`);
    
    await mongoose.disconnect();
    console.log('\n✓ Terminé!');
  })
  .catch(err => {
    console.error('Erreur:', err.message);
    process.exit(1);
  });
