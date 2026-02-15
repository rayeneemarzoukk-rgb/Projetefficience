import mongoose from 'mongoose';

// Modèle pour stocker les statistiques globales
const StatistiquesSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['global'],
    default: 'global',
    unique: true 
  },
  
  // Compteurs synchronisés
  cabinetsSuivis: { type: Number, default: 0 },
  rapportsGeneres: { type: Number, default: 0 },
  emailsEnvoyes: { type: Number, default: 0 },
  
  // Statistiques additionnelles
  rapportsEchec: { type: Number, default: 0 },
  dernierRapportDate: { type: Date },
  dernierEmailDate: { type: Date },
  
  // Mois en cours
  moisActuel: { type: String },
  cabinetsMoisActuel: { type: Number, default: 0 },
  rapportsMoisActuel: { type: Number, default: 0 },
  emailsMoisActuel: { type: Number, default: 0 },
  
  updatedAt: { type: Date, default: Date.now }
});

const Statistiques = mongoose.models.Statistiques || mongoose.model('Statistiques', StatistiquesSchema, 'statistiques');

export default Statistiques;
