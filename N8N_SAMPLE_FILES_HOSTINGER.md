# 📁 FICHIERS EXEMPLES À EXTRAIRE - Hostinger FTP

**À déposer dans:** `/public_html/data/`

---

## 1️⃣ patients.csv

```csv
nom,prenom,email,telephone,dateNaissance
Dupont,Jean,jean.dupont@mail.com,+33612345678,1980-01-15
Martin,Marie,marie.martin@mail.com,+33687654321,1985-06-20
Bernard,Pierre,pierre.bernard@mail.com,+33701234567,1975-12-05
Lefevre,Sophie,sophie.lefevre@mail.com,+33745678901,1990-03-10
Durand,Luc,luc.durand@mail.com,+33698765432,1988-07-22
```

**Format:**
- **Encodage:** UTF-8
- **Séparateur:** , (virgule)
- **En-têtes:** nom, prenom, email, telephone, dateNaissance

**À faire:**
1. Créer fichier `patients.csv`
2. Copier contenu ci-dessus
3. Uploader dans `/data/` via FTP

---

## 2️⃣ finances.xlsx

**Créer dans Excel ou Libre Office:**

| cabinetId | periode   | chiffreAffaires | revenus | depenses |
|-----------|-----------|-----------------|---------|----------|
| 1         | 2026-01   | 50000          | 45000   | 20000    |
| 1         | 2025-12   | 48000          | 43000   | 19500    |
| 2         | 2026-01   | 65000          | 60000   | 28000    |
| 2         | 2025-12   | 62000          | 58000   | 27000    |
| 1         | 2025-11   | 47000          | 42000   | 19000    |

**Format:**
- **Type:** XLSX (Excel 2007+)
- **Encodage:** UTF-8
- **Sheet:** "Sheet1" (première feuille)
- **En-têtes:** cabinetId, periode, chiffreAffaires, revenus, depenses

**À faire:**
1. Ouvrir Excel
2. Créer tableau avec données ci-dessus
3. Sauvegarder en `.xlsx`
4. Uploader dans `/data/` via FTP

---

## 3️⃣ production.xlsx

**Créer dans Excel ou Libre Office:**

| cabinetId | praticien | periode | heures | actes | revenus |
|-----------|-----------|---------|--------|-------|---------|
| 1         | Dr Paul   | 2026-01 | 160    | 250   | 40000   |
| 1         | Dr Marie  | 2026-01 | 140    | 220   | 35000   |
| 2         | Dr Jean   | 2026-01 | 168    | 300   | 55000   |
| 1         | Dr Paul   | 2025-12 | 158    | 245   | 39000   |
| 1         | Dr Marie  | 2025-12 | 138    | 215   | 34000   |

**Format:**
- **Type:** XLSX (Excel 2007+)
- **Encodage:** UTF-8
- **Sheet:** "Sheet1"
- **En-têtes:** cabinetId, praticien, periode, heures, actes, revenus

**À faire:**
1. Ouvrir Excel
2. Créer tableau
3. Sauvegarder en `.xlsx`
4. Uploader dans `/data/`

---

## 4️⃣ rendezvous.csv

```csv
cabinetId,patientNom,date,heure,type,status
1,Dupont,2026-01-31,09:00,CONTRÔLE,PLANIFIE
1,Martin,2026-01-31,09:30,DÉTARTRAGE,PLANIFIE
1,Bernard,2026-02-01,10:00,DÉVITALISATION,PLANIFIE
2,Lefevre,2026-01-31,14:00,IMPLANT,PLANIFIE
2,Durand,2026-02-01,15:00,DÉTARTRAGE,PLANIFIE
1,Dupont,2026-02-02,16:00,CONTRÔLE,PLANIFIE
```

**Format:**
- **Encodage:** UTF-8
- **Séparateur:** , (virgule)
- **En-têtes:** cabinetId, patientNom, date, heure, type, status

**À faire:**
1. Créer fichier `rendezvous.csv`
2. Copier contenu
3. Uploader dans `/data/`

---

## 🔧 Comment créer et uploader les fichiers

### Méthode 1: Via Hostinger File Manager

1. Connectez-vous à hPanel
2. Allez à **Files**
3. Naviguez à `/public_html/data/`
4. Cliquez **Upload**
5. Sélectionnez les fichiers
6. Attendez l'upload

### Méthode 2: Via FTP (FileZilla)

1. Téléchargez **FileZilla Client**
2. Connectez-vous avec credentials:
   ```
   Host: ftp.votresite.com
   User: efficience_sync
   Password: VotreMotdePasse2026!
   Port: 21
   ```
3. Naviguez à `/data/`
4. Drag & drop les fichiers

### Méthode 3: Via Ligne de Commande (PowerShell)

```powershell
# Uploader patients.csv
$filePath = "C:\temp\patients.csv"
$ftpServer = "ftp.votresite.com"
$ftpUser = "efficience_sync"
$ftpPass = "VotreMotdePasse2026!"

$ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer/data/patients.csv")
$ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
$ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile

$fileStream = [System.IO.File]::OpenRead($filePath)
$ftpStream = $ftpRequest.GetRequestStream()
$fileStream.CopyTo($ftpStream)
$ftpStream.Close()
$fileStream.Close()

Write-Host "✅ Fichier uploadé"
```

---

## 📝 Règles Importantes

### Noms de Fichiers
- ✅ `patients.csv` - BON
- ✅ `finance_2026_01.xlsx` - BON
- ❌ `Patients (1).csv` - MAUVAIS (espace, parenthèse)
- ❌ `données.csv` - MAUVAIS (accents)

### Extensions
- ✅ `.csv` - Supporté
- ✅ `.xlsx` - Supporté
- ❌ `.xls` - Vieux format (peut poser problèmes)
- ❌ `.txt` - Non supporté

### Encodage
- ✅ **UTF-8** - OBLIGATOIRE
- ❌ UTF-16 - Problèmes possibles
- ❌ ISO-8859-1 - Accents mal reconnus

### Séparateurs
- ✅ **,** (virgule) - OBLIGATOIRE pour CSV
- ❌ **;** (point-virgule) - Dépend des locales
- ❌ **\t** (tabulation) - Peut fonctionner mais non recommandé

### En-têtes (Headers)
- ✅ **Obligatoires** en première ligne
- ✅ **Exactement** comme dans la doc
- ❌ En-têtes différents → Import échoue

---

## 🧪 Tester Avant d'Uploader

Avant d'uploader, validez les fichiers:

### Excel (.xlsx)

```powershell
# Lire fichier Excel avec PowerShell
$excel = New-Object -ComObject Excel.Application
$workbook = $excel.Workbooks.Open("C:\temp\finances.xlsx")
$worksheet = $workbook.Sheets(1)

# Afficher contenu
for ($row = 1; $row -le 10; $row++) {
    for ($col = 1; $col -le 5; $col++) {
        $cell = $worksheet.Cells.Item($row, $col).Value
        Write-Host $cell -NoNewline "`t"
    }
    Write-Host ""
}

$workbook.Close()
$excel.Quit()
```

### CSV

```powershell
# Lire fichier CSV
$csv = Import-Csv -Path "C:\temp\patients.csv"
$csv | Format-Table

# Vérifier colonnes
$csv[0].PSObject.Properties.Name
```

---

## 📊 Format de Sortie Attendu

Une fois importé, le format dans MongoDB sera:

### Patients
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@mail.com",
  "telephone": "+33612345678",
  "dateNaissance": "1980-01-15",
  "source": "hostinger-ftp",
  "_id": ObjectId(...)
}
```

### Finances
```json
{
  "cabinetId": "1",
  "periode": "2026-01",
  "chiffreAffaires": 50000,
  "revenus": 45000,
  "depenses": 20000,
  "source": "hostinger-ftp",
  "_id": ObjectId(...)
}
```

### Production
```json
{
  "cabinetId": "1",
  "praticien": "Dr Paul",
  "periode": "2026-01",
  "heures": 160,
  "actes": 250,
  "revenus": 40000,
  "source": "hostinger-ftp",
  "_id": ObjectId(...)
}
```

### Rendez-vous
```json
{
  "cabinetId": "1",
  "patientNom": "Dupont",
  "date": "2026-01-31T09:00:00.000Z",
  "heure": "09:00",
  "type": "CONTRÔLE",
  "status": "PLANIFIE",
  "source": "hostinger-ftp",
  "_id": ObjectId(...)
}
```

---

## ✅ CHECKLIST AVANT UPLOAD

- [ ] Fichiers nommés correctement
- [ ] Extensions: .csv ou .xlsx
- [ ] Encodage: UTF-8
- [ ] Première ligne: En-têtes
- [ ] Séparateur CSV: Virgule ,
- [ ] Pas d'espaces/caractères spéciaux dans noms
- [ ] Contenu validé manuellement
- [ ] Dossier `/data/` existe sur Hostinger
- [ ] Permissions FTP OK

---

## 🎯 PROCESSUS COMPLET

```
┌─────────────────────────────────────┐
│ 1. Créer fichier CSV/XLSX           │
├─────────────────────────────────────┤
│ 2. Valider le contenu               │
├─────────────────────────────────────┤
│ 3. Uploader dans /data/             │
├─────────────────────────────────────┤
│ 4. N8N détecte (max 5 min)         │
├─────────────────────────────────────┤
│ 5. Parser et valider                │
├─────────────────────────────────────┤
│ 6. Envoyer à Efficience webhook     │
├─────────────────────────────────────┤
│ 7. Insérer dans MongoDB             │
├─────────────────────────────────────┤
│ 8. Archiver fichier                 │
├─────────────────────────────────────┤
│ 9. Dashboard mis à jour             │
├─────────────────────────────────────┤
│ 10. ✅ TERMINÉ                      │
└─────────────────────────────────────┘
```

---

**Tous les fichiers sont prêts à être uplo­adés! 🚀**

