# 🔗 Guide N8N - Voir et Utiliser le Workflow

## 🎯 Objectif

Visualiser et activer le workflow N8N pour l'automatisation des imports Efficience Analytics.

---

## 📥 **ÉTAPE 1: Accéder à N8N**

### Option A: N8N Cloud (Recommandé)

1. **Aller sur le site officiel**
```
URL: https://n8n.io
```

2. **Se connecter ou créer un compte**
```
- Cliquer "Sign Up" ou "Sign In"
- Utiliser votre email professionnel
- Confirmer l'email
```

3. **Accéder à votre workspace**
```
URL: https://app.n8n.cloud/
```

### Option B: N8N Local (Auto-hébergé)

1. **Installer N8N via npm**
```powershell
npm install -g n8n
```

2. **Démarrer N8N**
```powershell
n8n start
```

3. **Accéder à l'interface**
```
URL: http://localhost:5678
```

---

## 📊 **ÉTAPE 2: Importer le Workflow Efficience**

### Méthode 1: Import via Fichier JSON

1. **Ouvrir N8N**
```
Cloud: https://app.n8n.cloud/
Local: http://localhost:5678
```

2. **Créer un nouveau workflow**
```
- Cliquer sur "New Workflow" (en haut à droite)
- Ou cliquer sur le bouton "+" dans la liste des workflows
```

3. **Importer le fichier JSON**
```
- Cliquer sur "..." (menu 3 points) en haut à droite
- Sélectionner "Import from File"
- Choisir: n8n-workflow-efficience.json
- Cliquer "Import"
```

### Méthode 2: Import via URL

1. **Copier le contenu du fichier**
```powershell
# Afficher le contenu
Get-Content "n8n-workflow-efficience.json" | clip
```

2. **Dans N8N, cliquer sur "Import from URL"**
```
- Coller le JSON
- Cliquer "Import"
```

---

## 🔍 **ÉTAPE 3: Visualiser le Workflow**

Une fois importé, vous verrez :

### 🎨 **Vue Graphique du Workflow**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [1] Webhook - Efficience Sync                         │
│      (Point d'entrée - Trigger)                        │
│      ↓                                                  │
│  [2] Send to Efficience                                │
│      (HTTP Request vers API)                           │
│      ↓                                                  │
│  [3] Response to N8N                                   │
│      (Retourner résultat)                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 📝 **Détails de Chaque Nœud**

#### Nœud 1: Webhook Trigger
```
Type: Webhook
Path: /webhook-test/efficience-sync
Method: POST
Authentication: Header Auth (x-n8n-token)
```

**Ce nœud:**
- Attend les données entrantes
- Valide le token de sécurité
- Transmet les données au nœud suivant

#### Nœud 2: HTTP Request to Efficience
```
Type: HTTP Request
URL: http://localhost:3000/api/admin/webhook-n8n
Method: POST
Headers:
  - Content-Type: application/json
  - Authorization: Bearer efficience-n8n-token-2026-secure-xyz789
Body: JSON avec type, cabinetId, data
```

**Ce nœud:**
- Envoie les données à votre API Efficience
- Attend la réponse
- Gère les erreurs

#### Nœud 3: Set Response
```
Type: Set
Assignments:
  - status: "success"
  - message: "Data synchronized to Efficience"
  - timestamp: {{$now}}
```

**Ce nœud:**
- Formate la réponse finale
- Retourne le statut à l'appelant

---

## ⚙️ **ÉTAPE 4: Configurer le Workflow**

### 1. **Mettre à jour les URLs**

**Dans le nœud "Send to Efficience":**

```javascript
// URL locale (développement)
http://localhost:3000/api/admin/webhook-n8n

// URL production (à remplacer)
https://votre-domaine.com/api/admin/webhook-n8n
```

### 2. **Vérifier le Token d'Authentification**

**Dans le nœud "Send to Efficience", Headers:**

```
Authorization: Bearer MonSuperTokenSecret2026!
```

⚠️ **IMPORTANT:** Ce token doit correspondre à `N8N_WEBHOOK_TOKEN` dans `.env.local`

### 3. **Personnaliser les Données**

**Dans le nœud "Send to Efficience", Body:**

```json
{
  "type": "patients",
  "cabinetId": "1",
  "data": {{$json.body}}
}
```

Modifier selon vos besoins :
- `type`: "patients", "finances", "production"
- `cabinetId`: ID du cabinet destinataire
- `data`: Structure des données

---

## 🚀 **ÉTAPE 5: Activer et Tester**

### 1. **Activer le Workflow**

```
- Cliquer sur le bouton "Active" (en haut à droite)
- Le statut passe de "Inactive" à "Active"
- Le bouton devient vert
```

### 2. **Obtenir l'URL du Webhook**

```
- Cliquer sur le nœud "Webhook - Efficience Sync"
- Cliquer sur "Copy Test URL" ou "Copy Production URL"
- L'URL ressemble à :
  https://n8n.cloud/webhook-test/efficience-sync
  ou
  http://localhost:5678/webhook-test/efficience-sync
```

### 3. **Tester le Webhook**

**Méthode A: Via PowerShell**

```powershell
# Créer fichier test-n8n-webhook.ps1
$webhookUrl = "http://localhost:5678/webhook-test/efficience-sync"
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

$testData = @{
    type = "patients"
    cabinetId = "1"
    data = @(
        @{
            nom = "TestN8N"
            prenom = "User"
            email = "test.n8n@example.fr"
            telephone = "0612345678"
            dateNaissance = "1990-01-01"
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $webhookUrl `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "x-n8n-token" = $token
    } `
    -Body $testData
```

**Méthode B: Via l'Interface N8N**

```
1. Cliquer sur "Execute Workflow" (bouton play en haut)
2. Saisir des données de test
3. Voir le résultat en temps réel
```

---

## 📊 **ÉTAPE 6: Voir les Résultats**

### Dans N8N:

```
- Aller dans "Executions" (menu gauche)
- Voir la liste des exécutions
- Cliquer sur une exécution pour voir les détails
- Vérifier:
  ✅ Statut: Success
  ✅ Durée: ~500-800ms
  ✅ Données passées entre nœuds
```

### Dans Efficience:

```
1. Aller sur http://localhost:3000/admin
2. Onglet "Imports en Temps Réel"
3. Vérifier les nouveaux imports
4. Onglet "Audit"
5. Voir l'action enregistrée
```

---

## 🎨 **Personnaliser le Workflow**

### Ajouter des Sources de Fichiers

**1. Ajouter Dropbox:**

```
1. Cliquer sur "+" pour ajouter un nœud
2. Chercher "Dropbox Trigger"
3. Configurer:
   - Dossier à surveiller: /Efficience/Imports
   - Événement: File created
4. Connecter à "Send to Efficience"
```

**2. Ajouter Google Drive:**

```
1. Ajouter nœud "Google Drive Trigger"
2. Configurer:
   - Dossier: ID du dossier Google Drive
   - Type: File created
3. Connecter au workflow
```

### Ajouter Validation de Données

**Ajouter un nœud "Function" avant "Send to Efficience":**

```javascript
// Valider les données
const data = $input.all();
const validData = data.filter(item => {
  return item.json.email && 
         item.json.nom && 
         item.json.prenom;
});

if (validData.length === 0) {
  throw new Error('Aucune donnée valide trouvée');
}

return validData;
```

### Ajouter Notifications

**Ajouter un nœud "Send Email" après succès:**

```
Type: Email
To: admin@efficience.fr
Subject: ✅ Import réussi - {{$json.imported}} enregistrements
Body: Les données ont été importées avec succès.
```

---

## 🔒 **Sécurité**

### Bonnes Pratiques:

✅ **Toujours utiliser HTTPS en production**
```
https://votre-domaine.com/api/admin/webhook-n8n
```

✅ **Utiliser des tokens sécurisés**
```
N8N_WEBHOOK_TOKEN=<générer via openssl rand -base64 32>
```

✅ **Valider les données entrantes**
```javascript
// Vérifier que les champs requis existent
if (!data.type || !data.cabinetId) {
  throw new Error('Données invalides');
}
```

✅ **Logger toutes les actions**
```
Activer le logging dans N8N
Vérifier le journal d'audit Efficience
```

---

## 🐛 **Dépannage**

### ❌ Workflow ne s'exécute pas

**Vérifier:**
- [ ] Le workflow est "Active"
- [ ] L'URL du webhook est correcte
- [ ] Le token d'authentification est valide
- [ ] Le serveur Efficience est démarré (`npm run dev`)

### ❌ Erreur "Unauthorized"

**Solution:**
```
1. Vérifier le token dans .env.local
2. Vérifier le header Authorization dans N8N
3. Les deux doivent correspondre exactement
```

### ❌ Erreur "Cannot connect to localhost"

**Solution:**
```
1. Si N8N Cloud, remplacer localhost par URL publique
2. Utiliser ngrok pour exposer localhost :
   ngrok http 3000
3. Mettre à jour l'URL dans N8N avec l'URL ngrok
```

---

## 📚 **Ressources**

### Documentation N8N:
- Site officiel: https://n8n.io
- Documentation: https://docs.n8n.io
- Templates: https://n8n.io/workflows
- Forum: https://community.n8n.io

### Tutoriels vidéo:
- YouTube: "N8N Tutorial for Beginners"
- N8N Academy: https://academy.n8n.io

---

## ✅ **Checklist Finale**

Avant de mettre en production :

- [ ] Workflow importé dans N8N
- [ ] URLs mises à jour (production)
- [ ] Tokens sécurisés configurés
- [ ] Workflow activé
- [ ] Test réussi via webhook
- [ ] Données visibles dans Efficience
- [ ] Journal d'audit actif
- [ ] Notifications configurées
- [ ] Backup du workflow effectué

---

## 🎯 **Résumé**

Pour voir le schéma N8N :

1. **Aller sur https://n8n.io** ou démarrer `n8n start`
2. **Importer** `n8n-workflow-efficience.json`
3. **Visualiser** le schéma graphique
4. **Configurer** les URLs et tokens
5. **Activer** le workflow
6. **Tester** avec des données

Le workflow automatise complètement vos imports ! 🚀
