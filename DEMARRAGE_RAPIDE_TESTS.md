# 🚀 GUIDE DE DEMARRAGE RAPIDE - EFFICIENCE ANALYTICS

## ✅ ETAPES DE VERIFICATION ET TEST

### 📋 ETAPE 1: Verifier que le serveur est lance

```powershell
# Dans un terminal, lancer le serveur Next.js
npm run dev
```

Vous devez voir :
```
▲ Next.js 14.x.x
- Local:   http://localhost:3000
- Ready in Xs
```

---

### 📋 ETAPE 2: Tester la connexion MongoDB

```powershell
# Executer le script de test
.\test-imports.ps1
```

**Resultat attendu:**
- ✅ MongoDB connecte
- Affichage du nombre de patients/cabinets

---

### 📋 ETAPE 3: Tester les imports via l'interface web

#### A. Se connecter en admin

```
1. Ouvrir http://localhost:3000/admin/login
2. Email: admin@efficience.fr
3. Password: Admin123!
4. Cliquer "Se connecter"
```

#### B. Acceder a la page d'import

```
1. Aller sur http://localhost:3000/admin
2. Cliquer sur l'onglet "Importation"
```

#### C. Creer un fichier CSV de test

**Fichier: patients-test.csv**
```csv
nom,prenom,email,telephone,dateNaissance
TestImport,Jean,jean.test@example.fr,0612345678,1985-01-15
TestImport,Marie,marie.test@example.fr,0687654321,1990-06-20
```

#### D. Importer le fichier

```
1. Glisser-deposer le fichier CSV dans la zone
2. OU cliquer "Selectionner un fichier"
3. Choisir le type: "Patients"
4. Cliquer "Importer"
```

**Resultat attendu:**
- ✅ Message de succes
- ✅ "2 patients importes"
- ✅ Affichage dans l'onglet "Imports en Temps Reel"

---

### 📋 ETAPE 4: Voir le workflow N8N

#### Option A: N8N Cloud (Recommande)

```
1. Aller sur https://n8n.io
2. Cliquer "Sign In" ou "Get Started"
3. Creer un compte ou se connecter
4. Acces: https://app.n8n.cloud/
```

#### Option B: N8N Local

```powershell
# Installer N8N globalement
npm install -g n8n

# Demarrer N8N
n8n start
```

Acces: http://localhost:5678

#### Importer le workflow

```
1. Dans N8N, cliquer "New Workflow"
2. Menu (3 points) > "Import from File"
3. Selectionner: n8n-workflow-efficience.json
4. Cliquer "Import"
```

**Vous verrez:**

```
[Webhook Trigger] 
    ↓
[Send to Efficience API]
    ↓
[Set Response]
```

#### Activer le workflow

```
1. Cliquer sur "Active" (bouton en haut a droite)
2. Le bouton devient vert
3. Copier l'URL du webhook
```

---

### 📋 ETAPE 5: Tester N8N avec Efficience

#### A. Obtenir l'URL du webhook N8N

```
1. Cliquer sur le nœud "Webhook - Efficience Sync"
2. Copier "Production Webhook URL"
   Exemple: https://app.n8n.cloud/webhook/abc123...
```

#### B. Tester avec PowerShell

```powershell
# Remplacer <WEBHOOK_URL> par votre URL
$webhookUrl = "<WEBHOOK_URL>"

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
    -Headers @{"Content-Type" = "application/json"} `
    -Body $testData
```

**Resultat attendu:**
```json
{
  "status": "success",
  "message": "Data synchronized to Efficience"
}
```

#### C. Verifier dans Efficience

```
1. Aller sur http://localhost:3000/admin
2. Onglet "Imports en Temps Reel"
3. Voir le nouvel import depuis N8N
```

---

### 📋 ETAPE 6: Verifier les donnees dans MongoDB

#### Via l'interface Efficience

```
1. Dashboard: http://localhost:3000/dashboard
2. Patients: http://localhost:3000/patients
3. Cabinets: http://localhost:3000/cabinets
```

#### Via MongoDB Compass (optionnel)

```
1. Installer MongoDB Compass
2. Connecter avec MONGODB_URI depuis .env.local
3. Database: rayan_dev2
4. Collections: patients, finances, production
```

---

## 🎯 RESUME DES TESTS

| Test | Commande/URL | Resultat Attendu |
|------|--------------|------------------|
| Serveur Next.js | `npm run dev` | ✅ Running on :3000 |
| MongoDB | `.\test-imports.ps1` | ✅ MongoDB connecte |
| Login Admin | http://localhost:3000/admin/login | ✅ Connexion reussie |
| Import CSV | /admin > Importation | ✅ Fichier importe |
| N8N Workflow | https://n8n.io | ✅ Workflow visible |
| Test N8N | Script PowerShell | ✅ Data synced |

---

## 🐛 DEPANNAGE

### ❌ Erreur 500 sur /api/admin/import

**Cause:** Serveur Next.js non demarre

**Solution:**
```powershell
npm run dev
```

### ❌ MongoDB non connecte

**Cause:** Variable MONGODB_URI incorrecte

**Solution:**
```powershell
# Verifier .env.local
MONGODB_URI=mongodb+srv://...
```

### ❌ Login admin echoue

**Cause:** Utilisateur admin non cree

**Solution:**
```powershell
npm run init:admin:powershell
```

### ❌ N8N workflow ne s'execute pas

**Cause:** Workflow non active

**Solution:**
1. Cliquer sur "Active" dans N8N
2. Verifier que le bouton est vert

---

## ✅ VALIDATION FINALE

Avant de considerer le systeme operationnel :

- [ ] Serveur Next.js demarre (npm run dev)
- [ ] MongoDB connecte (test-imports.ps1 OK)
- [ ] Login admin fonctionne
- [ ] Import CSV reussi
- [ ] N8N workflow importe
- [ ] N8N workflow actif
- [ ] Test N8N → Efficience OK
- [ ] Donnees visibles dans /admin

---

## 📞 PROCHAINES ETAPES

Une fois tous les tests valides :

1. **Automatiser les imports**
   - Configurer Dropbox/Google Drive dans N8N
   - Surveiller un dossier specifique
   - Import automatique des nouveaux fichiers

2. **Configurer les notifications**
   - Email apres chaque import
   - Alertes en cas d'erreur

3. **Deployer en production**
   - Vercel pour Next.js
   - N8N Cloud pour les workflows
   - MongoDB Atlas (deja configure)

---

## 🎉 FELICITATIONS !

Si tous les tests passent, votre systeme Efficience Analytics est **100% operationnel** ! 🚀

Pour plus de details, consultez :
- `GUIDE_TESTS_IMPORTS.md` - Tests detailles
- `GUIDE_N8N_WORKFLOW.md` - Configuration N8N complete
- `N8N_INTEGRATION_COMPLETE_GUIDE.md` - Architecture N8N

**Support:** Consultez les fichiers .md pour la documentation complete.
