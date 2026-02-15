# 🔌 Configuration N8N Complète - Hostinger FTP

**Date:** 30 Janvier 2026  
**Objectif:** Automatiser l'import de fichiers CSV/Excel depuis Hostinger FTP vers Efficience via N8N

---

## 📋 TABLE DES MATIÈRES

1. [Configuration Hostinger FTP](#configuration-hostinger-ftp)
2. [Installation & Démarrage N8N](#installation--démarrage-n8n)
3. [Workflow N8N Complet](#workflow-n8n-complet)
4. [Configuration FTP dans N8N](#configuration-ftp-dans-n8n)
5. [Nodes N8N Détaillés](#nodes-n8n-détaillés)
6. [Fichiers Exemple à Extraire](#fichiers-exemple-à-extraire)
7. [Tests et Validation](#tests-et-validation)
8. [Troubleshooting](#troubleshooting)

---

## 🔑 Configuration Hostinger FTP

### Étape 1: Accéder à Hostinger

1. Connectez-vous à **hPanel** (https://hpanel.hostinger.com)
2. Allez à **Files → FTP Accounts**
3. Créer un nouveau compte FTP ou utiliser le compte par défaut

### Étape 2: Récupérer les Identifiants

```
┌─────────────────────────────────────────┐
│        HOSTINGER FTP CREDENTIALS        │
├─────────────────────────────────────────┤
│ FTP Host: ftp.votresite.com             │
│ FTP User: efficience_sync               │
│ FTP Password: VotreMotdePasse2026!      │
│ FTP Port: 21                            │
│ Racine: /public_html/                   │
└─────────────────────────────────────────┘
```

### Étape 3: Créer le Dossier de Données

1. Via FTP, créez ces dossiers:
```
/public_html/
  └── data/
      ├── patients/
      ├── finances/
      ├── production/
      └── rendezvous/
```

2. Ou via Hostinger File Manager:
   - Créer dossier `data`
   - Créer sous-dossiers dedans

### Étape 4: Tester la Connexion FTP

```powershell
# Test PowerShell
$ftpServer = "ftp.votresite.com"
$ftpUser = "efficience_sync"
$ftpPass = "VotreMotdePasse2026!"

$ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer/data/")
$ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
$ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory

try {
    $response = $ftpRequest.GetResponse()
    Write-Host "✅ Connexion FTP OK"
    $response.Close()
} catch {
    Write-Host "❌ Erreur: $_"
}
```

---

## 🚀 Installation & Démarrage N8N

### Option 1: Avec Docker (Recommandé)

```powershell
# Démarrer N8N avec Docker
docker run -it --rm `
  -p 5678:5678 `
  -v $env:USERPROFILE\.n8n:/home/node/.n8n `
  n8nio/n8n

# Accéder à N8N
# http://localhost:5678
```

### Option 2: Installation Locale

```powershell
# Installer globalement
npm install -g n8n

# Démarrer N8N
n8n start

# Accéder à N8N
# http://localhost:5678
```

### Étape: Configuration Initiale N8N

1. Ouvrez http://localhost:5678
2. Créez un compte admin
3. Allez à **Settings → Credentials**
4. Ajoutez les credentials FTP

---

## 🔧 Configuration FTP dans N8N

### Ajouter Credential FTP dans N8N

1. **Allez à:** Settings → Credentials → Add New
2. **Type:** FTP / SFTP
3. **Remplissez:**

```
┌─────────────────────────────────────────┐
│         N8N FTP CREDENTIALS             │
├─────────────────────────────────────────┤
│ Credential Name: Hostinger FTP          │
│ Host: ftp.votresite.com                 │
│ Port: 21                                │
│ User: efficience_sync                   │
│ Password: VotreMotdePasse2026!          │
│ Protocol: FTP                           │
│ TLS: Disabled (sauf si besoin)         │
│ Working Directory: /data/               │
└─────────────────────────────────────────┘
```

4. Cliquez **Test Connection**
5. Confirmation: ✅ Connection successful

---

## 🎯 Workflow N8N Complet

### Architecture du Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   N8N WORKFLOW - EFFICIENCE                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [1] FTP List Files                                         │
│      └─ Surveille /data/ à intervalle régulier              │
│         (toutes les 5 minutes)                              │
│         └─ Filtre: *.csv, *.xlsx                            │
│                                                              │
│            ↓                                                 │
│                                                              │
│  [2] FTP Read File                                          │
│      └─ Récupère contenu du fichier                         │
│      └─ Pour chaque fichier trouvé                          │
│                                                              │
│            ↓                                                 │
│                                                              │
│  [3] Parse CSV/Excel                                        │
│      └─ CSV Parser OU Excel Parser                          │
│      └─ Détecte en-têtes (headers)                          │
│      └─ Extrait les données                                 │
│                                                              │
│            ↓                                                 │
│                                                              │
│  [4] Validate Data                                          │
│      └─ Vérifie colonnes requises                           │
│      └─ Vérifie types de données                            │
│      └─ Détecte type (patients/finances/etc)               │
│      └─ Rejette si validation échoue                        │
│                                                              │
│            ↓                                                 │
│                                                              │
│  [5] Transform Data                                         │
│      └─ Mappe colonnes CSV vers format MongoDB             │
│      └─ Ajoute metadata (timestamp, source)                │
│      └─ Formate types (dates, nombres)                      │
│                                                              │
│            ↓                                                 │
│                                                              │
│  [6] Send to Efficience                                     │
│      └─ HTTP POST /api/admin/webhook-n8n                   │
│      └─ Headers: Authorization Bearer token                │
│      └─ Body: {type, cabinetId, data}                      │
│                                                              │
│            ↓                                                 │
│                                                              │
│  [7] Move File & Archive                                    │
│      └─ FTP Move /data/ → /data/archive/                   │
│      └─ Renomme: original_YYYY-MM-DD_HHmmss.csv           │
│      └─ Évite doubles imports                               │
│                                                              │
│            ↓                                                 │
│                                                              │
│  [8] Notify Admin (Optional)                                │
│      └─ Email ou Slack notification                         │
│      └─ "15 patients importés le 30/01/2026"               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔨 Nodes N8N Détaillés

### Node 1: FTP List Files (Trigger)

**Type:** FTP  
**Operation:** List

```json
{
  "name": "FTP List Files",
  "type": "n8n-nodes-base.ftp",
  "typeVersion": 1,
  "position": [100, 300],
  "credentials": {
    "ftpApi": "Hostinger FTP"
  },
  "parameters": {
    "operation": "list",
    "path": "/data/",
    "options": {
      "recurse": true
    }
  }
}
```

**Fréquence:** Ajouter une trigger en haut pour intervalle
```json
{
  "interval": [
    5,
    "minutes"
  ]
}
```

---

### Node 2: FTP Read File

**Type:** FTP  
**Operation:** Download

```json
{
  "name": "FTP Read File",
  "type": "n8n-nodes-base.ftp",
  "typeVersion": 1,
  "position": [300, 300],
  "credentials": {
    "ftpApi": "Hostinger FTP"
  },
  "parameters": {
    "operation": "download",
    "path": "={{ $node['FTP List Files'].json.name }}",
    "binary": true
  }
}
```

---

### Node 3: Parse CSV

**Type:** Spreadsheet  
**Operation:** Read from file

```json
{
  "name": "Parse CSV",
  "type": "n8n-nodes-base.spreadsheet",
  "typeVersion": 1,
  "position": [500, 300],
  "parameters": {
    "operation": "fromFile",
    "fileFormat": "csv",
    "options": {
      "delimiter": ",",
      "encoding": "utf8",
      "headers": true,
      "maxRowCount": 10000
    }
  }
}
```

---

### Node 4: Validate Data

**Type:** Function (Code)

```json
{
  "name": "Validate Data",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [700, 300],
  "parameters": {
    "functionCode": "// Validation des données\nconst requiredFields = {\n  patients: ['nom', 'email', 'telephone'],\n  finances: ['cabinetId', 'chiffreAffaires', 'periode'],\n  production: ['praticien', 'heures', 'periode'],\n  rendezvous: ['patientNom', 'date', 'heure']\n};\n\nconst data = $input.all();\nconst validated = [];\nconst errors = [];\n\nfor (const row of data) {\n  // Déterminer le type de données\n  let dataType = 'patients';\n  \n  if ('chiffreAffaires' in row) dataType = 'finances';\n  if ('praticien' in row && 'heures' in row) dataType = 'production';\n  if ('patientNom' in row) dataType = 'rendezvous';\n  \n  // Vérifier colonnes requises\n  const required = requiredFields[dataType] || [];\n  const missing = required.filter(field => !row[field]);\n  \n  if (missing.length > 0) {\n    errors.push({\n      row: row,\n      missingFields: missing,\n      reason: `Missing fields: ${missing.join(', ')}`\n    });\n  } else {\n    validated.push({\n      ...row,\n      _dataType: dataType,\n      _imported: new Date().toISOString()\n    });\n  }\n}\n\nreturn [\n  {\n    validated: validated,\n    errors: errors,\n    totalRows: data.length,\n    validRows: validated.length,\n    errorCount: errors.length,\n    validationStatus: errors.length === 0 ? 'PASS' : 'FAIL_WITH_SOME_ERRORS'\n  }\n];"
  }
}
```

---

### Node 5: Transform Data

**Type:** Function (Code)

```json
{
  "name": "Transform Data",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [900, 300],
  "parameters": {
    "functionCode": "const validatedData = $input.all()[0];\nconst transformed = {};\n\n// Grouper par type de données\nfor (const row of validatedData.validated) {\n  const type = row._dataType;\n  \n  if (!transformed[type]) {\n    transformed[type] = [];\n  }\n  \n  // Nettoyer les metadata temporaires\n  const cleanRow = { ...row };\n  delete cleanRow._dataType;\n  delete cleanRow._imported;\n  \n  // Transformation spécifique par type\n  if (type === 'patients') {\n    transformed[type].push({\n      nom: cleanRow.nom?.trim(),\n      prenom: cleanRow.prenom?.trim() || '',\n      email: cleanRow.email?.toLowerCase().trim(),\n      telephone: cleanRow.telephone?.replace(/\\s/g, ''),\n      dateNaissance: cleanRow.dateNaissance || null,\n      source: 'hostinger-ftp'\n    });\n  }\n  \n  if (type === 'finances') {\n    transformed[type].push({\n      cabinetId: cleanRow.cabinetId?.toString(),\n      periode: cleanRow.periode?.toString(),\n      chiffreAffaires: parseFloat(cleanRow.chiffreAffaires || 0),\n      revenus: parseFloat(cleanRow.revenus || 0),\n      depenses: parseFloat(cleanRow.depenses || 0),\n      source: 'hostinger-ftp'\n    });\n  }\n  \n  if (type === 'production') {\n    transformed[type].push({\n      cabinetId: cleanRow.cabinetId?.toString() || '1',\n      praticien: cleanRow.praticien?.trim(),\n      periode: cleanRow.periode?.toString(),\n      heures: parseFloat(cleanRow.heures || 0),\n      actes: parseInt(cleanRow.actes || 0),\n      revenus: parseFloat(cleanRow.revenus || 0),\n      source: 'hostinger-ftp'\n    });\n  }\n  \n  if (type === 'rendezvous') {\n    transformed[type].push({\n      cabinetId: cleanRow.cabinetId?.toString() || '1',\n      patientNom: cleanRow.patientNom?.trim(),\n      date: new Date(cleanRow.date).toISOString(),\n      heure: cleanRow.heure?.toString(),\n      type: cleanRow.type?.trim() || 'CONTRÔLE',\n      status: cleanRow.status?.trim() || 'PLANIFIE',\n      source: 'hostinger-ftp'\n    });\n  }\n}\n\nreturn Object.entries(transformed).map(([type, data]) => ({\n  type: type,\n  data: data,\n  count: data.length\n}));"
  }
}
```

---

### Node 6: Send to Efficience

**Type:** HTTP Request

```json
{
  "name": "Send to Efficience",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.1,
  "position": [1100, 300],
  "parameters": {
    "method": "POST",
    "url": "http://localhost:3000/api/admin/webhook-n8n",
    "authentication": "headerAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "Bearer MonSuperTokenSecret2026!"
        },
        {
          "name": "X-N8N-Source",
          "value": "Hostinger FTP"
        }
      ]
    },
    "sendBody": true,
    "bodyParametersUi": "json",
    "jsonBody": "={{ JSON.stringify({ type: $node['Transform Data'].json.type, cabinetId: '1', data: $node['Transform Data'].json.data, timestamp: new Date().toISOString(), source: 'hostinger-ftp' }) }}",
    "options": {
      "redirects": true,
      "ignoreResponseCode": false
    }
  }
}
```

---

### Node 7: Archive File

**Type:** FTP  
**Operation:** Move/Rename

```json
{
  "name": "Archive File",
  "type": "n8n-nodes-base.ftp",
  "typeVersion": 1,
  "position": [1300, 300],
  "credentials": {
    "ftpApi": "Hostinger FTP"
  },
  "parameters": {
    "operation": "rename",
    "path": "/data/={{ $node['FTP List Files'].json.name }}",
    "newPath": "/data/archive/={{ $node['FTP List Files'].json.name }}_{{ $now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14) }}"
  }
}
```

---

### Node 8: Notify Admin (Optionnel)

**Type:** Slack (ou Email)

```json
{
  "name": "Notify Admin",
  "type": "n8n-nodes-base.slack",
  "typeVersion": 1,
  "position": [1500, 300],
  "credentials": {
    "slackApi": "Slack Webhook"
  },
  "parameters": {
    "channel": "#efficience-notifications",
    "text": "✅ **Import N8N Réussi**\n\n📊 *Résumé:*\n- Type: {{ $node['Transform Data'].json.type }}\n- Fichier: {{ $node['FTP List Files'].json.name }}\n- Enregistrements: {{ $node['Transform Data'].json.count }}\n- Timestamp: {{ $now.toLocaleString() }}\n- Source: Hostinger FTP"
  }
}
```

---

## 📁 Fichiers Exemple à Extraire

### patients.csv
```csv
nom,prenom,email,telephone,dateNaissance
Dupont,Jean,jean.dupont@mail.com,+33123456789,1980-01-15
Martin,Marie,marie.martin@mail.com,+33987654321,1985-06-20
Bernard,Pierre,pierre.bernard@mail.com,+33456789012,1975-12-05
Lefevre,Sophie,sophie.lefevre@mail.com,+33789012345,1990-03-10
Durand,Luc,luc.durand@mail.com,+33234567890,1988-07-22
```

### finances.xlsx
| cabinetId | periode   | chiffreAffaires | revenus | depenses |
|-----------|-----------|-----------------|---------|----------|
| 1         | 2026-01   | 50000          | 45000   | 20000    |
| 1         | 2025-12   | 48000          | 43000   | 19500    |
| 2         | 2026-01   | 65000          | 60000   | 28000    |

### production.xlsx
| cabinetId | praticien | periode | heures | actes | revenus |
|-----------|-----------|---------|--------|-------|---------|
| 1         | Dr Paul   | 2026-01 | 160    | 250   | 40000   |
| 1         | Dr Marie  | 2026-01 | 140    | 220   | 35000   |
| 2         | Dr Jean   | 2026-01 | 168    | 300   | 55000   |

### rendezvous.csv
```csv
cabinetId,patientNom,date,heure,type,status
1,Dupont,2026-01-31,09:00,CONTRÔLE,PLANIFIE
1,Martin,2026-01-31,09:30,DÉTARTRAGE,PLANIFIE
1,Bernard,2026-02-01,10:00,DÉVITALISATION,PLANIFIE
2,Lefevre,2026-01-31,14:00,IMPLANT,PLANIFIE
```

---

## ✅ Tests et Validation

### Test 1: Vérifier Connexion FTP

```powershell
# Dans le terminal PowerShell
$ftpServer = "ftp.votresite.com"
$ftpUser = "efficience_sync"
$ftpPass = "VotreMotdePasse2026!"

$uri = "ftp://$ftpServer/data/"
$ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
$ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
$ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory

$response = $ftpRequest.GetResponse()
$stream = $response.GetResponseStream()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()

Write-Host "✅ Files in /data/:"
Write-Host $content
```

### Test 2: Tester N8N Webhook Manuel

```powershell
# Trigger le webhook N8N manuellement
$payload = @{
    type = "patients"
    cabinetId = "1"
    data = @(
        @{
            nom = "Test"
            email = "test@mail.com"
            telephone = "0123456789"
        }
    )
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer MonSuperTokenSecret2026!"
    "Content-Type" = "application/json"
}

$response = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/admin/webhook-n8n" `
    -Method POST `
    -Headers $headers `
    -Body $payload

Write-Host "Response:"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Test 3: Vérifier Import dans MongoDB

```powershell
# Vérifier si les données sont dans MongoDB
# Via MongoDB Compass ou mongosh

# Commande mongosh:
# use rayan_dev2
# db.patients.find({source: "hostinger-ftp"}).pretty()
```

---

## 🐛 Troubleshooting

### Erreur: "FTP Connection Failed"

**Solution:**
```
1. Vérifier Host: ftp.votresite.com (pas http://)
2. Vérifier Port: 21 (standard) ou 990 (SFTP)
3. Vérifier User/Password corrects
4. Vérifier dossier /data/ existe
5. Tester avec logiciel FTP: FileZilla
```

### Erreur: "File not found"

**Solution:**
```
1. Vérifier chemin: /data/ ou /public_html/data/
2. Mettre permissions 755 sur le dossier
3. Vérifier que fichiers sont en .csv ou .xlsx
4. Utiliser chemins absolus: /public_html/data/
```

### Erreur: "Webhook 401 Unauthorized"

**Solution:**
```
1. Vérifier token: Bearer MonSuperTokenSecret2026!
2. Vérifier .env.local a N8N_WEBHOOK_TOKEN correct
3. Vérifier URL: http://localhost:3000 accessible
4. Tester avec curl:
   curl -X GET http://localhost:3000/api/admin/webhook-n8n
```

### Erreur: "CSV Parse Failed"

**Solution:**
```
1. Vérifier encodage: UTF-8
2. Vérifier séparateur: , (virgule)
3. Vérifier pas de caractères spéciaux
4. Vérifier headers (première ligne) correct
5. Utiliser CSV Parser spécifique
```

---

## 📊 Configuration Résumée

| Élément | Valeur |
|---------|--------|
| **FTP Host** | ftp.votresite.com |
| **FTP User** | efficience_sync |
| **FTP Path** | /data/ |
| **N8N Port** | 5678 |
| **Efficience URL** | http://localhost:3000 |
| **Webhook Token** | MonSuperTokenSecret2026! |
| **Intervalle Check** | 5 minutes |
| **Archive Path** | /data/archive/ |
| **Types Supportés** | patients, finances, production, rendezvous |

---

## ✨ Prochaines Étapes

1. ✅ Configurer credentials FTP dans N8N
2. ✅ Importer workflow JSON
3. ✅ Tester chaque node individuellement
4. ✅ Activer workflow en production
5. ✅ Déposer fichiers test dans /data/
6. ✅ Vérifier imports dans MongoDB
7. ✅ Vérifier dashboard mis à jour
8. ✅ Configurer notifications (Slack/Email)

---

**Configuration complète et prête à utiliser! 🚀**

