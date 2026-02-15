import mongoose from 'mongoose';

const RapportSchema = new mongoose.Schema({
  cabinetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cabinet' },
  cabinetNom: { type: String, required: true },
  cabinetEmail: { type: String, required: true },
  periode: { type: String, required: true },
  statut: {
    type: String,
    enum: ['genere', 'envoye', 'echec'],
    default: 'genere'
  },
  
  // Statistiques du cabinet au moment du rapport
  statistiques: {
    caActuel: { type: Number, default: 0 },
    caObjectif: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    nouveauxPatients: { type: Number, default: 0 },
    nombreRdv: { type: Number, default: 0 },
    tauxAbsence: { type: Number, default: 0 },
  },
  
  // Contenu du rapport
  contenu: { type: String },
  
  // Dates
  dateGeneration: { type: Date, default: Date.now },
  dateEnvoi: { type: Date },
  
  // Email de destination
  emailDestinataire: { type: String, default: 'maarzoukrayan3@gmail.com' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Rapport = mongoose.models.Rapport || mongoose.model('Rapport', RapportSchema, 'rapports');

export default Rapport;
