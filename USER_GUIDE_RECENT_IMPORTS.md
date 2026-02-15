# 🎯 GUIDE D'UTILISATION: API Recent Imports + UI

## 📱 VUE D'ENSEMBLE VISUELLE

```
┌───────────────────────────────────────────────────────────┐
│  Admin Panel: http://localhost:3000/admin                │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  [Accueil] [Import] [Imports en Temps Réel] [Audit] [...]│
│            ────────                                        │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ IMPORTS EN TEMPS RÉEL                                │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │                                                       │ │
│  │  ┌─────────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌─────┐ │ │
│  │  │ Total   │ │ ✅   │ │ ❌   │ │ 💾    │ │Last │ │ │
│  │  │  5      │ │  5   │ │  0   │ │  42   │ │10:30│ │ │
│  │  │ imports │ │ ok   │ │error │ │record │ │     │ │ │
│  │  └─────────┘ └──────┘ └──────┘ └────────┘ └─────┘ │ │
│  │                                                       │ │
│  │  ┌──────────────────────────────────────────────────┐ │
│  │  │ Répartition par Type                             │ │
│  │  │  👥 Patients: 2  │ 💰 Finances: 1              │ │
│  │  │  ⚙️ Production: 1 │ 📅 RDV: 1                  │ │
│  │  └──────────────────────────────────────────────────┘ │
│  │                                                       │ │
│  │  ┌──────────────────────────────────────────────────┐ │
│  │  │ Historique (5 dernières minutes)                 │ │
│  │  │                                                   │ │
│  │  │  ┌──────────────────────────────────────────┐   │ │
│  │  │  │  ✅ 👥 Patients | Success               │   │ │
│  │  │  │     5 enregistrements | 27/01 10:30:00 │   │ │
│  │  │  │     Cabinet: cab_test                   │   │ │
│  │  │  └──────────────────────────────────────────┘   │ │
│  │  │                                                   │ │
│  │  │  ┌──────────────────────────────────────────┐   │ │
│  │  │  │  ✅ 💰 Finances | Success               │   │ │
│  │  │  │     3 enregistrements | 27/01 10:25:00 │   │ │
│  │  │  │     Cabinet: cab_test                   │   │ │
│  │  │  └──────────────────────────────────────────┘   │ │
│  │  │                                                   │ │
│  │  │  ┌──────────────────────────────────────────┐   │ │
│  │  │  │  ❌ ⚙️ Production | Error               │   │ │
│  │  │  │     0 enregistrements | 27/01 10:20:00 │   │ │
│  │  │  │     Cabinet: cab_test                   │   │ │
│  │  │  │     ⚠️ Erreur: Data validation failed   │   │ │
│  │  │  └──────────────────────────────────────────┘   │ │
│  │  │                                                   │ │
│  │  └──────────────────────────────────────────────────┘ │
│  │                                                       │ │
│  │  🔄 Auto-refresh: toutes les 10 secondes            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

---

## 🚀 DÉMARRAGE RAPIDE (3 ÉTAPES)

### ÉTAPE 1: Démarrer le serveur Next.js
```bash
# Terminal 1
cd "c:\efficience-app-offic - Copie"
npm run dev

# Attendez: "✓ Ready in 2.5s" puis ouvrez http://localhost:3000
```

### ÉTAPE 2: Aller à l'Admin Panel
```
Browser:
  1. Aller à http://localhost:3000/admin
  2. Vous voyez 5 onglets en haut
  3. Cliquer le 3e onglet: "Imports en Temps Réel"
  4. Voir message: "Aucun import détecté dans les 5 dernières minutes"
     (C'est normal, on n'a rien déclenché encore)
```

### ÉTAPE 3: Déclencher un import test
```powershell
# Terminal 2
cd "c:\efficience-app-offic - Copie"
.\test-recent-imports.ps1

# Vous verrez:
# ✅ TEST 1: API simple - OK
# ✅ TEST 2: API avec filtres - OK
# ✅ TEST 3: Déclencher import test - OK
# ✅ TEST 4: Vérifier logs - OK
```

### ÉTAPE 4: Voir en temps réel
```
Browser (Admin Panel):
  Le composant rafraîchit automatiquement
  Vous verrez:
  ✅ Stats cards se mettre à jour
  ✅ Historique affichant le nouvel import
  ✅ Répartition par type mise à jour
```

---

## 📊 COMPRENDRE LES DONNÉES

### Stats Cards (en haut)

```
┌────────────────┬────────────────┬────────────────┐
│ Total Imports  │ ✅ Réussis     │ ❌ Erreurs     │
│      5         │      5 (100%)  │      0         │
└────────────────┴────────────────┴────────────────┘
```

**Explication:**
- **Total Imports**: Nombre total d'imports dans les 5 dernières minutes
- **Réussis**: Combien se sont bien déroulés (vert)
- **Erreurs**: Combien ont échoué (rouge)

### Répartition par Type

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 👥 Patients  │ 💰 Finances  │ ⚙️ Production│ 📅 RDV       │
│     2        │     1        │     1        │     1        │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Signification:**
- Vous pouvez rapidement voir les volumes par type
- Utile pour debug si un type ne reçoit pas de données

### Historique Détaillé

```
┌─────────────────────────────────────────────────────┐
│ ✅ 👥 Patients | Success                           │
│ 5 enregistrements insérés                          │
│ Cabinet: cab_test                                  │
│ 27/01/2026 10:30:45                               │
└─────────────────────────────────────────────────────┘
```

**Lecture:**
- **✅ / ❌**: Status (succès ou erreur)
- **👥 / 💰 / ⚙️ / 📅**: Type d'import
- **Success / Error**: Résultat
- **5 enregistrements**: Combien de records ont été traités
- **Cabinet ID**: Quel cabinet (si N8N gère plusieurs)
- **Timestamp**: Quand c'est arrivé

---

## 🎮 INTERAGIR AVEC LE SYSTÈME

### Via Admin Panel

```
1️⃣ Onglet "Imports en Temps Réel"
   └─ Affichage automatique et mise à jour 10s

2️⃣ Onglet "Importation"
   └─ Upload manuel de fichiers CSV
   └─ Déclenche /api/admin/webhook-n8n

3️⃣ Bouton "Synchroniser maintenant"
   ├─ Déclenche /api/admin/trigger-sync
   ├─ Qui peut appeler N8N si configuré
   └─ Voir résultat dans "Imports en Temps Réel"
```

### Via API Directement

```powershell
# Test simple
$result = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/recent-imports"
$result | ConvertTo-Json -Depth 3

# Avec filtres
$result = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/recent-imports?minutes=10&type=patients"
$result.stats | ConvertTo-Json
```

---

## 🔍 DÉPANNAGE

### Problème: "Aucun import détecté"

**Cause:** Aucun import n'a été déclenché
**Solution:**
```powershell
# Déclencher un import test
$url = "http://localhost:3000/api/admin/webhook-n8n"
$token = "MonSuperTokenSecret2026!"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    "type" = "patients"
    "cabinetId" = "cab_test"
    "data" = @(@{"nom"="Test";"prenom"="User";"email"="test@test.com"})
} | ConvertTo-Json -Depth 10
Invoke-WebRequest -Uri $url -Method Post -Headers $headers -Body $body
```

### Problème: "API Error 500"

**Cause:** Problème MongoDB ou serveur
**Solution:**
```powershell
# Vérifier MongoDB
# 1. Vérifier MONGODB_URI dans .env.local
# 2. Vérifier que MongoDB Atlas est en ligne
# 3. Vérifier les logs du serveur (Terminal 1)
```

### Problème: "Stats ne se mettent pas à jour"

**Cause:** Polling peut être bloqué par le navigateur
**Solution:**
```javascript
// Dans la console (F12)
// Forcer un refresh
location.reload()

// Ou vérifier l'API manuellement
fetch('/api/admin/recent-imports')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## 🔗 INTÉGRATION N8N + HOSTINGER

Une fois le système testé, l'intégration N8N + Hostinger suit ce flux:

```
1. Hostinger: Fichiers CSV dans dossier
   ↓
2. N8N: Webhook surveille le dossier
   ↓
3. N8N: Parse et valide les données
   ↓
4. N8N: POST http://votre-site/api/admin/webhook-n8n
   ├─ Header: Authorization: Bearer MonSuperTokenSecret2026!
   └─ Body: { "type": "patients", "cabinetId": "...", "data": [...] }
   ↓
5. API: Insère dans MongoDB + log
   ↓
6. Composant: Refresh auto (10s)
   ↓
7. Admin Panel: Voir les données en temps réel ✅
```

### Configuration N8N

```json
{
  "nodes": [
    {
      "name": "Watch Folder",
      "type": "dropbox_watch"
    },
    {
      "name": "Parse CSV",
      "type": "spreadsheet"
    },
    {
      "name": "HTTP to Efficience",
      "type": "httpRequest",
      "method": "POST",
      "url": "http://votre-site/api/admin/webhook-n8n",
      "headers": {
        "Authorization": "Bearer MonSuperTokenSecret2026!"
      },
      "body": {
        "type": "patients",
        "cabinetId": "{{ $node.DropboxWatch.data.cabinetId }}",
        "data": "{{ $json.data }}"
      }
    }
  ]
}
```

Voir: `N8N_SETUP_EFFICIENCE_COMPLETE.md`

---

## 🎯 CHECKLIST UTILISATION

```
✅ Serveur lancé (npm run dev)
✅ Admin Panel accessible (/admin)
✅ Onglet "Imports en Temps Réel" visible
✅ Stats cards affichées
✅ Répartition par type visible
✅ Historique visible (vide ou avec données)
✅ Auto-refresh toutes les 10 secondes
✅ Import test déclenché avec succès
✅ Données apparues dans le composant
✅ Timestamp correct affichée
✅ API respond avec parametres (?minutes=10&type=patients)
```

---

## 📞 SUPPORT RAPIDE

| Problème | Solution |
|----------|----------|
| "Aucun import" | Déclencher test (voir section dépannage) |
| "API Error 500" | Vérifier MongoDB + logs serveur |
| "Stats incorrectes" | Vérifier timestamp MongoDB |
| "UI pas à jour" | F5 pour rafraîchir, ou attendre 10s |
| "Composant manquant" | Vérifier import dans /app/admin/page.tsx |
| "N8N ne trouve pas API" | Vérifier URL et Bearer token |

---

## 🚀 PROCHAINES ÉTAPES

```
1. ✅ Tester le système (lire ce guide)
2. ✅ Configurer N8N
3. ✅ Configurer Hostinger
4. ✅ Activer la surveillance des fichiers
5. ✅ Tester un vrai import depuis Hostinger
6. ✅ Déployer en production
```

---

**Date:** 27 janvier 2026  
**Status:** ✅ Prêt à utiliser
