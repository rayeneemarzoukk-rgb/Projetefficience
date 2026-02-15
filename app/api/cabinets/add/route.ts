import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { sendCabinetReportEmail } from "@/lib/email-service"

const MONGODB_URI = process.env.MONGODB_URI || ''
const DB_NAME = process.env.MONGODB_DB || 'rayan_dev2'

/**
 * 🏥 API pour ajouter un cabinet avec génération automatique de rapport
 * 
 * Flux:
 * 1. Créer le cabinet en base
 * 2. Générer un rapport de statistiques
 * 3. Envoyer le rapport par email à Rayene
 * 4. Mettre à jour les compteurs globaux
 */
export async function POST(request: NextRequest) {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    const body = await request.json()
    const { nom, email, adresse, telephone, caActuel, caObjectif } = body

    // Validation
    if (!nom) {
      return NextResponse.json({ 
        success: false, 
        error: "Nom du cabinet requis" 
      }, { status: 400 })
    }

    await client.connect()
    const db = client.db(DB_NAME)

    // Générer un ID unique
    const cabinetId = new ObjectId()
    const now = new Date()
    const periode = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

    // 📊 Statistiques initiales du cabinet
    const statistiques = {
      caActuel: caActuel || Math.floor(Math.random() * 30000) + 30000,
      caObjectif: caObjectif || 50000,
      score: Math.floor(Math.random() * 20) + 75, // Score entre 75-95
      nouveauxPatients: Math.floor(Math.random() * 10) + 5,
      nombreRdv: Math.floor(Math.random() * 50) + 100,
      tauxAbsence: Math.round((Math.random() * 10 + 2) * 10) / 10,
    }

    // 1️⃣ Créer le cabinet
    const newCabinet = {
      _id: cabinetId,
      nom,
      email: email || `contact@${nom.toLowerCase().replace(/\s+/g, '-')}.fr`,
      adresse: adresse || '',
      phone: telephone || '',
      ...statistiques,
      statut: statistiques.score >= 80 ? 'performant' : statistiques.score >= 60 ? 'surveiller' : 'alerte',
      rapportStatut: 'pending',
      createdAt: now,
      updatedAt: now,
    }

    await db.collection('cabinets').insertOne(newCabinet)
    console.log(`✅ Cabinet créé: ${nom}`)

    // 2️⃣ Créer le rapport
    const rapport = {
      cabinetId: cabinetId,
      cabinetNom: nom,
      cabinetEmail: newCabinet.email,
      periode,
      statut: 'genere',
      statistiques,
      dateGeneration: now,
      emailDestinataire: process.env.ADMIN_NOTIFICATION_EMAIL || 'maarzoukrayan3@gmail.com',
      createdAt: now,
    }

    const rapportResult = await db.collection('rapports').insertOne(rapport)
    console.log(`📊 Rapport généré pour: ${nom}`)

    // 3️⃣ Envoyer l'email du rapport
    let emailEnvoye = false
    try {
      emailEnvoye = await sendCabinetReportEmail({
        cabinetNom: nom,
        cabinetEmail: newCabinet.email,
        periode,
        statistiques,
        dateGeneration: now.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      })

      if (emailEnvoye) {
        // Mettre à jour le statut du rapport
        await db.collection('rapports').updateOne(
          { _id: rapportResult.insertedId },
          { 
            $set: { 
              statut: 'envoye',
              dateEnvoi: new Date()
            }
          }
        )
        
        // Mettre à jour le cabinet
        await db.collection('cabinets').updateOne(
          { _id: cabinetId },
          { $set: { rapportStatut: 'sent' } }
        )
        
        console.log(`📧 Email rapport envoyé pour: ${nom}`)
      }
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError)
    }

    // 4️⃣ Mettre à jour les statistiques globales
    const moisActuel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    
    await db.collection('statistiques').updateOne(
      { type: 'global' },
      {
        $inc: {
          cabinetsSuivis: 1,
          rapportsGeneres: 1,
          emailsEnvoyes: emailEnvoye ? 1 : 0,
          cabinetsMoisActuel: 1,
          rapportsMoisActuel: 1,
          emailsMoisActuel: emailEnvoye ? 1 : 0,
        },
        $set: {
          moisActuel,
          dernierRapportDate: now,
          ...(emailEnvoye && { dernierEmailDate: now }),
          updatedAt: now,
        }
      },
      { upsert: true }
    )

    await client.close()

    return NextResponse.json({
      success: true,
      message: emailEnvoye 
        ? `Cabinet "${nom}" créé avec succès ! Rapport généré et envoyé par email.`
        : `Cabinet "${nom}" créé avec succès ! Rapport généré (email en attente).`,
      data: {
        cabinet: {
          id: cabinetId.toString(),
          nom,
          email: newCabinet.email,
          score: statistiques.score,
        },
        rapport: {
          id: rapportResult.insertedId.toString(),
          periode,
          statut: emailEnvoye ? 'envoye' : 'genere',
        },
        emailEnvoye,
      }
    })

  } catch (error) {
    console.error('❌ Erreur création cabinet:', error)
    await client.close()
    return NextResponse.json({ 
      success: false, 
      error: "Erreur lors de la création du cabinet" 
    }, { status: 500 })
  }
}

/**
 * GET - Récupérer les statistiques globales
 */
export async function GET() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db(DB_NAME)

    // Récupérer ou initialiser les stats
    const statsDoc = await db.collection('statistiques').findOne({ type: 'global' })
    
    // Définir les valeurs par défaut
    let cabinetsSuivis = 0
    let rapportsGeneres = 0
    let emailsEnvoyes = 0
    let moisActuel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    let cabinetsMoisActuel = 0
    
    if (!statsDoc) {
      // Compter les données existantes
      cabinetsSuivis = await db.collection('cabinets').countDocuments()
      rapportsGeneres = await db.collection('rapports').countDocuments()
      emailsEnvoyes = await db.collection('rapports').countDocuments({ statut: 'envoye' })

      await db.collection('statistiques').insertOne({ 
        type: 'global',
        cabinetsSuivis,
        rapportsGeneres,
        emailsEnvoyes,
        moisActuel,
        cabinetsMoisActuel: 0,
        rapportsMoisActuel: 0,
        emailsMoisActuel: 0,
      })
    } else {
      cabinetsSuivis = statsDoc.cabinetsSuivis || 0
      rapportsGeneres = statsDoc.rapportsGeneres || 0
      emailsEnvoyes = statsDoc.emailsEnvoyes || 0
      moisActuel = statsDoc.moisActuel || moisActuel
      cabinetsMoisActuel = statsDoc.cabinetsMoisActuel || 0
    }

    await client.close()

    return NextResponse.json({
      success: true,
      statistiques: {
        cabinetsSuivis,
        rapportsGeneres,
        emailsEnvoyes,
        tauxReussite: rapportsGeneres > 0 
          ? Math.round((emailsEnvoyes / rapportsGeneres) * 100) 
          : 0,
        moisActuel,
        nouveauxCeMois: cabinetsMoisActuel,
      }
    })

  } catch (error) {
    console.error('❌ Erreur récupération stats:', error)
    await client.close()
    return NextResponse.json({ 
      success: false, 
      error: "Erreur serveur" 
    }, { status: 500 })
  }
}
