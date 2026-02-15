import { NextRequest, NextResponse } from "next/server"
import { initializeApp } from "@/lib/db"
import Cabinet from "@/models/Cabinet"

/**
 * GET /api/cabinet-info
 * Récupère les informations du cabinet pour la page Settings
 */
export async function GET(request: NextRequest) {
  try {
    await initializeApp()

    // Récupérer le premier cabinet (ou le cabinet de l'utilisateur connecté)
    const cabinet = await Cabinet.findOne().lean()

    if (!cabinet) {
      // Retourner des données par défaut si aucun cabinet n'existe
      return NextResponse.json({
        success: true,
        info: {
          nom: "Cabinet Dentaire",
          telephone: "+33 1 23 45 67 89",
          adresse: "123 Rue de la Santé, 75013 Paris",
          email: "contact@cabinet-dentaire.fr"
        }
      })
    }

    return NextResponse.json({
      success: true,
      info: {
        nom: cabinet.nom || "Cabinet Dentaire",
        telephone: cabinet.phone || "+33 1 23 45 67 89",
        adresse: cabinet.adresse || "123 Rue de la Santé, 75013 Paris",
        email: cabinet.email || "contact@cabinet-dentaire.fr"
      }
    })

  } catch (error) {
    console.error("❌ Erreur récupération cabinet-info:", error)
    
    // Retourner des données par défaut en cas d'erreur
    return NextResponse.json({
      success: true,
      info: {
        nom: "Cabinet Dentaire",
        telephone: "+33 1 23 45 67 89",
        adresse: "123 Rue de la Santé, 75013 Paris",
        email: "contact@cabinet-dentaire.fr"
      }
    })
  }
}
