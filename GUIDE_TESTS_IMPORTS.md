# 🧪 Guide de Test des Imports - Efficience Analytics

## 🎯 Objectif

Vérifier que les imports de données fonctionnent correctement depuis :
1. L'interface web (`/admin/import`)
2. Le webhook N8N (`/api/admin/import`)
3. Le callback N8N (`/api/admin/webhook-n8n`)

---

## ✅ **MÉTHODE 1: Test via Interface Web**

### Étapes:

1. **Démarrer le serveur**
```powershell
npm run dev
```

2. **Se connecter en admin**
```
URL: http://localhost:3000/admin/login
Email: admin@efficience.fr
Password: Admin123!
```

3. **Aller sur la page d'import**
```
URL: http://localhost:3000/admin
Cliquer sur l'onglet "Importation"
```

4. **Tester l'import Drag & Drop**
```
- Créer un fichier CSV de test (voir exemple ci-dessous)
- Glisser-déposer le fichier
- Ou cliquer pour sélectionner
- Choisir le type de ressource (Patients/Finances/Production)
- Cliquer "Importer"
```

### Exemple de fichier CSV (patients.csv):

```csv
nom,prenom,email,telephone,dateNaissance
Dupont,Jean,jean.dupont@test.fr,0601020304,1980-05-15
Martin,Marie,marie.martin@test.fr,0605060708,1990-03-20
Bernard,Pierre,pierre.bernard@test.fr,0609101112,1975-08-30
```

### Exemple de fichier CSV (finances.csv):

```csv
periode,chiffreAffaires,revenus,depenses
2026-01,45000,42000,15000
2026-02,48000,45000,16000
```

### Exemple de fichier CSV (production.csv):

```csv
praticien,periode,heures,actes
Dr. Durand,2026-01,160,125
Dr. Lefevre,2026-01,150,110
```

---

## ✅ **MÉTHODE 2: Test via Webhook (PowerShell)**

### Utiliser le script de test:

```powershell
# Depuis le dossier du projet
.\test-import-webhook.ps1
```

Ce script va :
- ✅ Tester l'import de 2 patients
- ✅ Tester l'import de données financières
- ✅ Vérifier la connexion MongoDB
- ✅ Afficher les résultats en couleur

### Test manuel avec curl (Windows PowerShell):

```powershell
# Test import patients
$body = @{
    type = "patients"
    cabinetId = "1"
    data = @(
        @{
            nom = "Test"
            prenom = "User"
            email = "test@example.fr"
            telephone = "0612345678"
            dateNaissance = "1985-01-01"
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3000/api/admin/import" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer MonSuperTokenSecret2026!"
    } `
    -Body $body
```

---

## ✅ **MÉTHODE 3: Vérifier les Résultats**

### 1. Via le Dashboard

```
URL: http://localhost:3000/admin
Onglet: "Imports en Temps Réel"
```

Vous devriez voir :
- Liste des imports récents
- Statut (success/error)
- Nombre d'enregistrements importés
- Timestamp

### 2. Via MongoDB Compass

```
1. Ouvrir MongoDB Compass
2. Se connecter avec MONGODB_URI
3. Aller dans database: rayan_dev2
4. Vérifier les collections:
   - patients
   - finances
   - production
   - webhook_logs
```

### 3. Via l'API Stats

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/stats" -Method GET
```

Retourne :
```json
{
  "totalPatients": 15,
  "totalCabinets": 3,
  "nouveauxPatients": 12,
  "caActuel": 145000,
  "caObjectif": 200000
}
```

---

## 🔍 **Diagnostics d'Erreurs Communes**

### ❌ Erreur: "Unauthorized" (401)

**Cause:** Token Bearer incorrect

**Solution:**
```powershell
# Vérifier .env.local
N8N_WEBHOOK_TOKEN=MonSuperTokenSecret2026!

# Utiliser le même token dans les headers
Authorization: Bearer MonSuperTokenSecret2026!
```

### ❌ Erreur: "MongoDB connection failed"

**Cause:** MongoDB Atlas non accessible

**Solution:**
```powershell
# Vérifier .env.local
MONGODB_URI=mongodb+srv://...

# Tester la connexion
node check_atlas_connection.py
```

### ❌ Erreur: "Invalid data format"

**Cause:** Colonnes manquantes dans le CSV

**Solution:**
- Patients requiert: nom, prenom, email, telephone, dateNaissance
- Finances requiert: periode, chiffreAffaires, revenus, depenses
- Production requiert: praticien, periode, heures, actes

### ❌ Erreur: "File type not supported"

**Cause:** Format de fichier non CSV

**Solution:**
- Exporter en CSV depuis Excel
- Utiliser délimiteur virgule (,)
- Encodage UTF-8

---

## 🎨 **Interpréter les Résultats**

### ✅ Succès:

```json
{
  "success": true,
  "message": "Données importées avec succès",
  "imported": 3,
  "type": "patients",
  "details": {
    "total": 3,
    "inserted": 3,
    "updated": 0,
    "errors": 0
  }
}
```

### ❌ Échec:

```json
{
  "success": false,
  "error": "Colonnes requises manquantes: email",
  "imported": 0
}
```

### ⚠️ Succès Partiel:

```json
{
  "success": true,
  "message": "Import partiel",
  "imported": 2,
  "errors": [
    "Ligne 3: Email invalide"
  ]
}
```

---

## 📊 **Vérification Post-Import**

### Checklist:

- [ ] Les données apparaissent dans `/admin` (onglet "Imports en Temps Réel")
- [ ] MongoDB contient les nouveaux enregistrements
- [ ] Le journal d'audit a enregistré l'action
- [ ] Pas d'erreur dans la console du navigateur
- [ ] Pas d'erreur dans le terminal Node.js

### Commandes de vérification:

```powershell
# Vérifier les logs du serveur
# (regarder le terminal où npm run dev tourne)

# Tester l'API
Invoke-RestMethod -Uri "http://localhost:3000/api/patients" -Method GET

# Vérifier les cabinets
Invoke-RestMethod -Uri "http://localhost:3000/api/cabinets" -Method GET
```

---

## 🚀 **Prochaines Étapes**

Une fois les tests réussis :

1. **Configurer N8N** (voir section N8N ci-dessous)
2. **Automatiser les imports** via Dropbox/Google Drive
3. **Programmer des imports récurrents**
4. **Configurer les notifications email**

---

## ✅ **Résumé**

Vous avez maintenant 3 façons de tester les imports :

1. **Interface Web** → Manuel, facile pour admins
2. **Webhook PowerShell** → Automatisé, bon pour tests
3. **N8N** → Complètement automatique

Choisissez selon vos besoins ! 🎯
