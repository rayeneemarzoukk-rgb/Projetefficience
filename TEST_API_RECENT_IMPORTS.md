# 🧪 TEST COMPLET: API /api/admin/recent-imports

## 📋 Checklist - Qu'est-ce qui manquait et ce qui a été fait

### ✅ CRÉÉ (3 choses)

| Composant | Fichier | Statut | Détails |
|-----------|---------|--------|---------|
| **API Améliorée** | `/api/admin/recent-imports/route.ts` | ✅ Modernisée | Filtres, stats, agrégation |
| **Composant Display** | `/components/admin/recent-imports-display.tsx` | ✅ Créé | Real-time UI avec polling 10s |
| **Intégration Admin Panel** | `/app/admin/page.tsx` | ✅ Modifiée | Onglet 5 + import composant |

### 📊 CE QUE RETOURNE L'API

```json
{
  "success": true,
  "imports": [
    {
      "id": "ObjectId",
      "type": "patients",
      "status": "success",
      "recordsProcessed": 15,
      "message": "Import processed",
      "timestamp": "2026-01-27T10:30:00Z",
      "timestampLocal": "27/01/2026 10:30:00",
      "cabinetId": "all",
      "details": {
        "inserted": 15,
        "errors": [],
        "errorMessage": null
      }
    }
  ],
  "stats": {
    "totalImports": 5,
    "successCount": 5,
    "errorCount": 0,
    "totalRecords": 42,
    "totalInserted": 42,
    "byType": {
      "patients": 2,
      "finances": 1,
      "production": 1,
      "appointments": 1
    },
    "successRate": 100
  },
  "query": {
    "minutes": 5,
    "limit": 20,
    "type": "all",
    "successOnly": true
  }
}
```

---

## 🧪 TEST 1: Appel API Simple

### PowerShell
```powershell
# Test GET simple
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/recent-imports" -Method Get | ConvertTo-Json | Write-Host

# Avec filtres
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/recent-imports?minutes=10&limit=10&type=patients" -Method Get | ConvertTo-Json | Write-Host
```

### cURL
```bash
# Test GET simple
curl -X GET "http://localhost:3000/api/admin/recent-imports"

# Avec filtres
curl -X GET "http://localhost:3000/api/admin/recent-imports?minutes=10&limit=10&type=patients"

# Avec tout
curl -X GET "http://localhost:3000/api/admin/recent-imports?minutes=30&limit=50&type=finances&successOnly=true"
```

---

## 🧪 TEST 2: Déclencher un Import (via N8N ou webhook)

Pour que l'API retourne des résultats, il faut d'abord importer des données via le webhook N8N :

### PowerShell
```powershell
$url = "http://localhost:3000/api/admin/webhook-n8n"
$token = "MonSuperTokenSecret2026!"  # De .env.local

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

$body = @{
    "type" = "patients"
    "cabinetId" = "cab_test"
    "data" = @(
        @{
            "nom" = "Dupont"
            "prenom" = "Jean"
            "email" = "jean@test.com"
            "telephone" = "0123456789"
            "dateNaissance" = "1980-01-15"
        },
        @{
            "nom" = "Martin"
            "prenom" = "Marie"
            "email" = "marie@test.com"
            "telephone" = "0987654321"
            "dateNaissance" = "1985-06-20"
        }
    )
} | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -Uri $url -Method Post -Headers $headers -Body $body -ContentType "application/json"
Write-Host "Status: $($response.StatusCode)"
Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json
```

---

## 🧪 TEST 3: Vérifier les Logs dans MongoDB

```javascript
// Dans MongoDB Compass ou mongosh
db.webhook_logs.find({}).sort({ timestamp: -1 }).limit(10).pretty()

// Ou filtrer par type
db.webhook_logs.find({ type: "patients" }).sort({ timestamp: -1 }).limit(5).pretty()

// Ou filtrer par statut
db.webhook_logs.find({ success: true }).sort({ timestamp: -1 }).pretty()

// Compter par type
db.webhook_logs.aggregate([
  { $group: { _id: "$type", count: { $sum: 1 } } }
])
```

---

## 🎯 INTÉGRATION VISUELLE: Admin Panel Étapes

### 1️⃣ Ouvrir Admin Panel
- URL: `http://localhost:3000/admin`
- Voir 5 onglets en haut

### 2️⃣ Cliquer "Imports en Temps Réel"
- Affiche les 15 derniers imports
- Stats en temps réel
- Répartition par type
- Auto-refresh toutes les 10 secondes

### 3️⃣ Voir en direct
- Card verte = ✅ Succès
- Card rouge = ❌ Erreur
- Nombre d'enregistrements insérés
- Timestamp exact

---

## 📋 CE QUE CHACUN FAIT

### 1. API `/api/admin/recent-imports/route.ts`
**Responsable:** Interroger MongoDB et retourner les logs

**Paramètres GET:**
- `?minutes=5` - Plage de temps (défaut 5)
- `?limit=20` - Nombre de résultats (défaut 20)
- `?type=patients` - Filtre par type (optionnel)
- `?successOnly=true` - Seulement les réussites (défaut true)

**Retourne:** Logs + Stats agrégées

---

### 2. Composant `/components/admin/recent-imports-display.tsx`
**Responsable:** Afficher les données en UI et faire le polling

**Ce qu'il fait:**
- Fetch l'API toutes les 10 secondes
- Affiche 5 stats cards (total, succès, erreurs, enregistrements, last update)
- Affiche répartition par type
- Affiche historique avec couleurs et icônes
- Gère le loading state

---

### 3. Intégration `/app/admin/page.tsx`
**Responsable:** Ajouter le composant à l'admin panel

**Changements:**
- Ajout import: `RecentImportsDisplay`
- Ajout icône: `Activity` de lucide-react
- Ajout onglet 5: "Imports en Temps Réel"
- Ajout condition: `{activeTab === "recent" && <RecentImportsDisplay />}`

---

## 🔗 FLUX COMPLET

```
1. N8N détecte fichier sur Hostinger
   ↓
2. N8N parse et valide
   ↓
3. N8N POST /api/admin/webhook-n8n
   ↓
4. Données insérées dans MongoDB + log dans webhook_logs
   ↓
5. Composant RecentImportsDisplay fetch /api/admin/recent-imports
   ↓
6. Affichage real-time dans Admin Panel (rafraîchissement 10s)
```

---

## 🚀 DÉMARRAGE RAPIDE

### Step 1: Tester l'API
```powershell
# Dans PowerShell
$result = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/recent-imports" -Method Get
$result | ConvertTo-Json -Depth 5
```

### Step 2: Tester le composant
```
1. Aller à http://localhost:3000/admin
2. Cliquer onglet "Imports en Temps Réel"
3. Voir "Aucun import détecté" (normal si pas d'imports)
```

### Step 3: Déclencher un import test
```powershell
# Lancer le webhook N8N depuis PowerShell
# (voir TEST 2 plus haut)
```

### Step 4: Vérifier en temps réel
```
1. Clic sur le bouton "Synchroniser maintenant"
2. Voir les stats se mettre à jour
3. Voir l'historique s'actualiser
```

---

## ✅ FONCTIONNALITÉS FINALES

| Fonctionnalité | Où? | Statut |
|---|---|---|
| Récupérer logs MongoDB | API | ✅ |
| Filtrer par type | API | ✅ |
| Filtrer par plage temps | API | ✅ |
| Agréger stats | API | ✅ |
| Afficher en UI | Composant | ✅ |
| Polling 10s | Composant | ✅ |
| Cards stats | Composant | ✅ |
| Historique détaillé | Composant | ✅ |
| Intégration admin | Page | ✅ |
| Real-time updates | Tout ensemble | ✅ |

---

## 🐛 TROUBLESHOOTING

### "Aucun import détecté"
- C'est normal si vous n'avez pas encore déclenché d'import
- Utilisez TEST 2 pour déclencher un import test

### "API Error 500"
- Vérifier que MongoDB est en ligne
- Vérifier `MONGODB_URI` dans `.env.local`
- Vérifier les logs serveur

### "Pas de refresh auto"
- Vérifier la console (F12) pour erreurs
- Vérifier que l'URL API répond: `curl http://localhost:3000/api/admin/recent-imports`

---

## 📝 RÉSUMÉ

**Avant:** API incomplète, pas d'UI, pas de filtres
**Après:** API complète + UI belle + polling + stats + filtres + intégration admin

**Tout prêt pour N8N + Hostinger!** 🚀
