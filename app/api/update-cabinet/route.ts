import { NextRequest, NextResponse } from "next/server"
import { initializeApp } from "@/lib/db"
import Cabinet from "@/models/Cabinet"

/**
 * POST /api/update-cabinet
 * Met à jour les informations du cabinet depuis la page Settings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nom, telephone, adresse, email } = body

    await initializeApp()

    // Mettre à jour le premier cabinet (ou créer si n'existe pas)
    const result = await Cabinet.findOneAndUpdate(
      {}, // Premier cabinet trouvé
      {
        $set: {
          nom: nom || "Cabinet Dentaire",
          phone: telephone,
          email: email || "contact@cabinet-dentaire.fr",
          updatedAt: new Date()
        }
      },
      {
        new: true,
        upsert: true // Créer si n'existe pas
      }
    )

    console.log("✅ Cabinet mis à jour:", result?.nom)

    return NextResponse.json({
      success: true,
      message: "Cabinet mis à jour avec succès",
      cabinet: {
        nom: result?.nom,
        telephone: result?.phone,
        email: result?.email
      }
    })

  } catch (error) {
    console.error("❌ Erreur mise à jour cabinet:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise à jour du cabinet"
      },
      { status: 500 }
    )
  }
}
