import mongoose from 'mongoose';

const CabinetSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Identifiant cabinet (ex: "cab-001")
  nom: { type: String, required: true },              // Nom du cabinet
  adresse: { type: String },                          // Adresse (optionnel)
  telephone: { type: String },                        // Téléphone (optionnel)
  email: { type: String },                            // Email (optionnel)
  
  // Champs de rapport
  rapport: { type: String, default: "Non envoyé" },  // Texte du rapport
  rapportStatut: { type: String, default: "not_generated", enum: ["not_generated", "generated", "sent"] }, // Statut du rapport
  dateGenerationRapport: { type: String },           // Date de génération du rapport
  dateEnvoiRapport: { type: String },                // Date d'envoi du rapport
  
  // Champs de performance
  score: { type: Number, default: 0 },               // Score de performance
  caActuel: { type: Number, default: 0 },            // CA réalisé
  caObjectif: { type: Number, default: 0 },          // CA objectif
  progression: { type: Number, default: 0 },         // Progression en %
  nouveauxPatients: { type: Number, default: 0 },    // Nombre de nouveaux patients
  tauxAbsence: { type: Number, default: 0 },         // Taux d'absence
  
  // Actes dentaires
  actes: [{
    type: { type: String },
    nombre: { type: Number },
    ca: { type: Number },
    couleur: { type: String },
    pourcentage: { type: Number }
  }],
  
  // Période
  periode: { type: String },                          // Période du rapport (ex: "Décembre 2025")
  
  // Statut général
  statut: { type: String, enum: ["OK", "À surveiller", "Performant"] },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Évite la double déclaration du modèle en dev
const Cabinet = mongoose.models.Cabinet || mongoose.model('Cabinet', CabinetSchema, 'cabinets');
export default Cabinet;