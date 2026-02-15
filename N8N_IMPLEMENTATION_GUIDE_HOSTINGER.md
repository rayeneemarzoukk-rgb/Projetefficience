# 🚀 GUIDE IMPLÉMENTATION - N8N + Hostinger FTP

**Date:** 30 Janvier 2026  
**Objectif:** Implémenter et tester le workflow N8N complet

---

## 📋 ÉTAPES D'IMPLÉMENTATION (12 ÉTAPES)

### ✅ ÉTAPE 1: Préparer Hostinger

**Durée:** 5 minutes

1. Connectez-vous à **hPanel** (https://hpanel.hostinger.com)
2. Allez à **Files → FTP Accounts**
3. Créez un nouveau compte FTP `efficience_sync` OU utilisez le compte par défaut
4. Notez les identifiants:
   ```
   Host: ftp.votresite.com
   User: efficience_sync
   Password: VotreMotdePasse2026!
   Port: 21
   ```
5. Via File Manager, créez la structure:
   ```
   /public_html/
     └── data/
         ├── archive/
         ├── patients/
         ├── finances/
         ├── production/
         └── rendezvous/
   ```

**✅ Prêt:** Hostinger configuré avec dossier FTP

---

### ✅ ÉTAPE 2: Vérifier Connexion FTP

**Durée:** 3 minutes

Testez la connexion FTP avec cette commande PowerShell:

```powershell
$ftpServer = "ftp.votresite.com"
$ftpUser = "efficience_sync"
$ftpPass = "VotreMotdePasse2026!"

$uri = "ftp://$ftpServer/data/"
$ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
$ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
$ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory

try {
    $response = $ftpRequest.GetResponse()
    Write-Host "✅ Connexion FTP OK"
    $response.Close()
} catch {
    Write-Host "❌ Erreur FTP: $_"
}
```

**Résultat attendu:** `✅ Connexion FTP OK`

**✅ Prêt:** Connexion FTP validée

---

### ✅ ÉTAPE 3: Démarrer N8N

**Durée:** 2 minutes

**Option A: Avec Docker (Recommandé)**

```powershell
docker run -it --rm `
  -p 5678:5678 `
  -v $env:USERPROFILE\.n8n:/home/node/.n8n `
  n8nio/n8n
```

**Option B: Installation Locale**

```powershell
npm install -g n8n
n8n start
```

Accédez à N8N: **http://localhost:5678**

**✅ Prêt:** N8N démarré et accessible

---

### ✅ ÉTAPE 4: Configurer Credentials FTP dans N8N

**Durée:** 5 minutes

1. Dans N8N, allez à **Settings** (⚙️ en haut à droite)
2. Cliquez **Credentials**
3. Cliquez **Add New** (ou **+**)
4. Recherchez **FTP** et sélectionnez
5. Remplissez:

```
┌────────────────────────────────────┐
│     N8N FTP CREDENTIALS            │
├────────────────────────────────────┤
│ Credential Name: Hostinger FTP     │
│ Host: ftp.votresite.com            │
│ Port: 21                           │
│ User: efficience_sync              │
│ Password: VotreMotdePasse2026!     │
│ Protocol: FTP                      │
│ TLS: Disabled                      │
└────────────────────────────────────┘
```

6. Cliquez **Test Connection**
7. Confirmation: ✅ "Connection successful"
8. Sauvegardez

**✅ Prêt:** FTP Credentials ajoutés

---

### ✅ ÉTAPE 5: Importer le Workflow JSON

**Durée:** 3 minutes

1. Dans N8N, cliquez le menu (☰ en haut à gauche)
2. Cliquez **Import from file**
3. Sélectionnez le fichier: `n8n-workflow-efficience-hostinger-ftp.json`
4. Cliquez **Import**
5. Confirmez l'import

Le workflow devrait s'ouvrir avec tous les nodes

**✅ Prêt:** Workflow importé

---

### ✅ ÉTAPE 6: Configurer les Variables du Workflow

**Durée:** 5 minutes

Ouvrez le workflow et configurez chaque node:

#### Node: "FTP - List Files"
- Vérifiez que **Credential** = "Hostinger FTP"
- Path = `/data`

#### Node: "Parse CSV Files"
- Vérifiez fileFormat = `csv`
- Options: delimiter = `,`

#### Node: "Parse Excel Files"
- Vérifiez fileFormat = `excel`

#### Node: "Send to Efficience"
- URL = `http://localhost:3000/api/admin/webhook-n8n`
- Authorization Header = `Bearer MonSuperTokenSecret2026!`

**✅ Prêt:** Nodes configurés

---

### ✅ ÉTAPE 7: Tester Chaque Node

**Durée:** 10 minutes

Pour chaque node, testez individuellement:

1. **Schedule Trigger**: Cliquez **Execute Workflow**
2. **FTP - List Files**: Doit lister les fichiers de `/data/`
3. **Filter CSV/Excel Files**: Doit filtrer seulement `.csv` et `.xlsx`
4. **Parse CSV Files**: Testez avec un fichier CSV
5. **Validate Data**: Doit valider les données
6. **Transform Data**: Doit transformer au format Efficience
7. **Send to Efficience**: Doit envoyer à http://localhost:3000

**✅ Prêt:** Tous les nodes testés individuellement

---

### ✅ ÉTAPE 8: Tester avec Fichier Exemple

**Durée:** 5 minutes

1. Créez un fichier `patients.csv`:

```csv
nom,prenom,email,telephone,dateNaissance
Dupont,Jean,jean@mail.com,0123456789,1980-01-15
Martin,Marie,marie@mail.com,0987654321,1985-06-20
```

2. Uplo­adez via FTP dans `/data/`
3. Dans N8N, cliquez **Execute Workflow**
4. Observez les exécutions:
   - ✅ FTP détecte le fichier
   - ✅ CSV parsé correctement
   - ✅ Données validées
   - ✅ Envoyé à Efficience

**✅ Prêt:** Workflow fonctionne avec fichier test

---

### ✅ ÉTAPE 9: Vérifier les Données dans MongoDB

**Durée:** 3 minutes

Vérifiez que les données sont importées dans MongoDB:

**Via MongoDB Compass:**
1. Connectez-vous à votre MongoDB Atlas
2. Database: `rayan_dev2`
3. Collection: `patients`
4. Recherchez les enregistrements avec `source: "hostinger-ftp"`

**Via Terminal (mongosh):**
```bash
mongosh "mongodb+srv://..."
use rayan_dev2
db.patients.find({source: "hostinger-ftp"}).pretty()
```

**✅ Prêt:** Données visibles dans MongoDB

---

### ✅ ÉTAPE 10: Vérifier le Dashboard Efficience

**Durée:** 2 minutes

1. Accédez à **http://localhost:3000**
2. Connectez-vous
3. Allez à `/admin`
4. Cherchez la section **"Synchronisation N8N"**
5. Observez:
   - ✅ Bouton "Synchroniser"
   - ✅ Section "Imports Récents"
   - ✅ Affichage des derniers imports

**✅ Prêt:** Dashboard affiche les imports

---

### ✅ ÉTAPE 11: Activer le Workflow N8N

**Durée:** 1 minute

1. En haut du workflow, cliquez le bouton **"Activate"**
2. Confirmez l'activation
3. Le bouton devrait devenir **VERT**
4. Le workflow s'exécutera automatiquement toutes les 5 minutes

**✅ Prêt:** Workflow actif en production

---

### ✅ ÉTAPE 12: Tester en Production

**Durée:** 15 minutes

Testez le workflow complet:

1. **Uploader fichiers de test** dans `/data/`:
   - `patients.csv`
   - `finances.xlsx`
   - `production.xlsx`
   - `rendezvous.csv`

2. **Attendez le prochain cycle** (max 5 minutes)

3. **Vérifiez les imports**:
   - Dashboard Efficience affiche les nouveaux imports
   - MongoDB contient les données
   - Fichiers archivés dans `/data/archive/`

4. **Vérifiez les erreurs** (s'il y en a):
   - N8N: Onglet "Executions"
   - Logs pour debug

**✅ Prêt:** Production fonctionnelle

---

## 📋 CHECKLIST COMPLÈTE

- [ ] **Étape 1:** Hostinger FTP configuré
- [ ] **Étape 2:** Connexion FTP validée
- [ ] **Étape 3:** N8N démarré
- [ ] **Étape 4:** Credentials FTP ajoutés
- [ ] **Étape 5:** Workflow importé
- [ ] **Étape 6:** Nodes configurés
- [ ] **Étape 7:** Chaque node testé
- [ ] **Étape 8:** Fichier test fonctionne
- [ ] **Étape 9:** MongoDB contient les données
- [ ] **Étape 10:** Dashboard affiche les imports
- [ ] **Étape 11:** Workflow activé
- [ ] **Étape 12:** Production validée ✅

---

## 🆘 TROUBLESHOOTING RAPIDE

### N8N ne démarre pas

```powershell
# Vérifier port 5678
netstat -ano | findstr :5678

# Tuer le processus
taskkill /PID [PID] /F

# Redémarrer
n8n start
```

### Erreur: "FTP Connection Failed"

```
1. Vérifier Host correct: ftp.votresite.com
2. Vérifier Port: 21
3. Vérifier User/Pass corrects
4. Via FileZilla: tester FTP manuellement
```

### Erreur: "File not found"

```
1. Vérifier chemin: /data/ existe
2. Vérifier permissions: 755
3. Uploader fichier de test manuellement
```

### Erreur: "Webhook 401"

```
1. Vérifier token: MonSuperTokenSecret2026!
2. Vérifier .env.local contient N8N_WEBHOOK_TOKEN
3. Tester: curl http://localhost:3000/api/admin/webhook-n8n
```

### Erreur: "CSV Parse Failed"

```
1. Vérifier encodage: UTF-8
2. Vérifier séparateur: , (virgule)
3. Vérifier no de rows: <10000
```

---

## 📊 LOGS ET MONITORING

### Voir les Exécutions N8N

1. Dans N8N, onglet **Executions**
2. Cliquez sur une exécution
3. Observez:
   - ✅ Statut: Success/Failed
   - 🔍 Inputs/Outputs de chaque node
   - ⏱️ Temps d'exécution
   - 📝 Messages d'erreur

### Vérifier les Imports Efficience

1. **Dashboard:** `/admin` → "Imports Récents"
2. **MongoDB:** `db.webhook_logs.find().sort({timestamp: -1}).limit(10)`
3. **API:** `GET http://localhost:3000/api/admin/recent-imports`

---

## 📈 PROCHAINES ÉTAPES

Une fois en production:

1. **Automatiser les uploads** depuis votre cabinet dentaire
2. **Configurer Slack/Email** notifications
3. **Monitorer** les imports quotidiens
4. **Archiver** les fichiers après 30 jours
5. **Planifier** des syncs à des heures spécifiques

---

## 🎯 RÉSUMÉ

| Étape | Status | Temps |
|-------|--------|-------|
| 1. Hostinger | ✅ | 5 min |
| 2. FTP Test | ✅ | 3 min |
| 3. N8N Start | ✅ | 2 min |
| 4. FTP Creds | ✅ | 5 min |
| 5. Import Workflow | ✅ | 3 min |
| 6. Config Nodes | ✅ | 5 min |
| 7. Test Nodes | ✅ | 10 min |
| 8. Test Fichier | ✅ | 5 min |
| 9. MongoDB Check | ✅ | 3 min |
| 10. Dashboard Check | ✅ | 2 min |
| 11. Activer Workflow | ✅ | 1 min |
| 12. Production Test | ✅ | 15 min |
| **TOTAL** | | **59 min** |

---

**Vous êtes prêt à lancer ! 🚀**

