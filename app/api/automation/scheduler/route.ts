import { type NextRequest, NextResponse } from "next/server"

// Version simplifiée pour Vercel (sans node-cron qui cause des erreurs de build)
// Les tâches automatisées seront déclenchées via Vercel Cron Jobs ou des webhooks externes

export const dynamic = 'force-dynamic'

// Simuler les tâches sans node-cron
const taskStatus = {
  "monthly-reports": { running: false, lastRun: null as string | null },
  "monthly-emails": { running: false, lastRun: null as string | null },
  "daily-import": { running: false, lastRun: null as string | null },
  "alerts-check": { running: false, lastRun: null as string | null },
  "cleanup": { running: false, lastRun: null as string | null },
}

async function executeTask(taskName: string): Promise<{ success: boolean; message: string }> {
  const task = taskStatus[taskName as keyof typeof taskStatus]
  if (!task) {
    return { success: false, message: `Tâche ${taskName} introuvable` }
  }

  task.running = true
  task.lastRun = new Date().toISOString()

  // Simuler l'exécution
  console.log(`🔄 Exécution de la tâche: ${taskName}`)
  
  // Ici vous pouvez ajouter la logique réelle de chaque tâche
  switch (taskName) {
    case "monthly-reports":
      console.log("📊 Génération des rapports mensuels...")
      break
    case "monthly-emails":
      console.log("📧 Envoi des emails mensuels...")
      break
    case "daily-import":
      console.log("📥 Import quotidien des données...")
      break
    case "alerts-check":
      console.log("🚨 Vérification des alertes...")
      break
    case "cleanup":
      console.log("🧹 Nettoyage des fichiers temporaires...")
      break
  }

  task.running = false
  return { success: true, message: `Tâche ${taskName} exécutée avec succès` }
}

export async function POST(request: NextRequest) {
  try {
    const { action, jobName } = await request.json()

    switch (action) {
      case "start-job":
      case "execute-job":
        if (!jobName) {
          return NextResponse.json({ success: false, error: "jobName requis" }, { status: 400 })
        }
        const result = await executeTask(jobName)
        return NextResponse.json(result)

      case "stop-job":
        return NextResponse.json({
          success: true,
          message: `Tâche ${jobName} arrêtée (mode Vercel - pas de cron persistant)`,
        })

      case "start-all":
        return NextResponse.json({
          success: true,
          message: "Sur Vercel, utilisez Vercel Cron Jobs pour l'automatisation",
        })

      case "stop-all":
        return NextResponse.json({
          success: true,
          message: "Toutes les tâches sont en mode manuel sur Vercel",
        })

      default:
        return NextResponse.json(
          { success: false, error: "Action non reconnue" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Erreur API scheduler:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'exécution" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      scheduler: "vercel-mode",
      message: "Sur Vercel, les tâches sont déclenchées via Vercel Cron Jobs ou webhooks",
      jobs: Object.entries(taskStatus).map(([name, status]) => ({
        name,
        running: status.running,
        lastRun: status.lastRun,
      })),
      lastUpdate: new Date().toISOString(),
    },
  })
}
