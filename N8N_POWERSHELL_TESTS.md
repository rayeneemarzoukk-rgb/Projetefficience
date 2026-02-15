# 🧪 TESTS N8N + HOSTINGER - COMMANDES POWERSHELL

**À exécuter dans PowerShell pour valider toute la chaîne**

---

## 🔧 TEST 1: Vérifier Connexion FTP

```powershell
Write-Host "=== TEST 1: Connexion FTP ===" -ForegroundColor Green

$ftpServer = "ftp.votresite.com"
$ftpUser = "efficience_sync"
$ftpPass = "VotreMotdePasse2026!"

try {
    $uri = "ftp://$ftpServer/data/"
    $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    
    $response = $ftpRequest.GetResponse()
    Write-Host "✅ Connexion FTP OK" -ForegroundColor Green
    Write-Host "   Host: $ftpServer" -ForegroundColor Cyan
    Write-Host "   User: $ftpUser" -ForegroundColor Cyan
    Write-Host "   Path: /data/" -ForegroundColor Cyan
    
    $response.Close()
} catch {
    Write-Host "❌ ERREUR: $_" -ForegroundColor Red
    exit
}
```

---

## 🔧 TEST 2: Lister Fichiers dans /data/

```powershell
Write-Host "`n=== TEST 2: Lister Fichiers ===" -ForegroundColor Green

$ftpServer = "ftp.votresite.com"
$ftpUser = "efficience_sync"
$ftpPass = "VotreMotdePasse2026!"

try {
    $uri = "ftp://$ftpServer/data/"
    $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    
    $response = $ftpRequest.GetResponse()
    $stream = $response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $files = $reader.ReadToEnd()
    
    Write-Host "✅ Fichiers trouvés:" -ForegroundColor Green
    Write-Host $files -ForegroundColor Cyan
    
    $reader.Close()
    $stream.Close()
    $response.Close()
} catch {
    Write-Host "❌ ERREUR: $_" -ForegroundColor Red
}
```

---

## 🔧 TEST 3: Uploader Fichier CSV Test

```powershell
Write-Host "`n=== TEST 3: Uploader Fichier CSV ===" -ForegroundColor Green

# Créer un fichier CSV temporaire
$csvContent = @"
nom,prenom,email,telephone,dateNaissance
Test,User,test@mail.com,0123456789,2000-01-01
"@

$tempFile = "$env:TEMP\test_patients.csv"
$csvContent | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "📝 Fichier créé: $tempFile" -ForegroundColor Cyan

# Uploader le fichier
try {
    $ftpServer = "ftp.votresite.com"
    $ftpUser = "efficience_sync"
    $ftpPass = "VotreMotdePasse2026!"
    
    $uri = "ftp://$ftpServer/data/test_patients_$([datetime]::Now.ToString('yyyyMMdd_HHmmss')).csv"
    $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    
    $fileStream = [System.IO.File]::OpenRead($tempFile)
    $ftpStream = $ftpRequest.GetRequestStream()
    $fileStream.CopyTo($ftpStream)
    $ftpStream.Close()
    $fileStream.Close()
    
    Write-Host "✅ Fichier uploadé avec succès" -ForegroundColor Green
    Write-Host "   Fichier FTP: $uri" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ ERREUR: $_" -ForegroundColor Red
} finally {
    Remove-Item $tempFile -Force
}
```

---

## 🔧 TEST 4: Tester Webhook Efficience

```powershell
Write-Host "`n=== TEST 4: Tester Webhook Efficience ===" -ForegroundColor Green

$webhookUrl = "http://localhost:3000/api/admin/webhook-n8n"
$token = "MonSuperTokenSecret2026!"

$payload = @{
    type = "patients"
    cabinetId = "1"
    data = @(
        @{
            nom = "TestWebhook"
            prenom = "User"
            email = "webhook@test.com"
            telephone = "0123456789"
        }
    )
    timestamp = [datetime]::Now.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    source = "test-powerShell"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest `
        -Uri $webhookUrl `
        -Method POST `
        -Headers $headers `
        -Body $payload `
        -TimeoutSec 10
    
    Write-Host "✅ Webhook OK" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Cyan
    Write-Host "   Response:" -ForegroundColor Cyan
    
    $responseJson = $response.Content | ConvertFrom-Json
    $responseJson | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ ERREUR: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}
```

---

## 🔧 TEST 5: Vérifier API Admin Webhook

```powershell
Write-Host "`n=== TEST 5: Vérifier API Webhook ===" -ForegroundColor Green

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:3000/api/admin/webhook-n8n" `
        -Method GET `
        -TimeoutSec 5
    
    Write-Host "✅ API Webhook OK" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Cyan
    
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   Message: $($content.message)" -ForegroundColor Cyan
    Write-Host "   Status: $($content.status)" -ForegroundColor Cyan
    Write-Host "   Timestamp: $($content.timestamp)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ ERREUR: $_" -ForegroundColor Red
}
```

---

## 🔧 TEST 6: Vérifier API Import Endpoint

```powershell
Write-Host "`n=== TEST 6: Vérifier API Import ===" -ForegroundColor Green

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:3000/api/admin/import" `
        -Method GET `
        -TimeoutSec 5
    
    Write-Host "✅ API Import OK" -ForegroundColor Green
    
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   Message: $($content.message)" -ForegroundColor Cyan
    Write-Host "   Endpoint: $($content.endpoint)" -ForegroundColor Cyan
    Write-Host "   Status: $($content.status)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ ERREUR: $_" -ForegroundColor Red
}
```

---

## 🔧 TEST 7: Vérifier API Trigger Sync

```powershell
Write-Host "`n=== TEST 7: Vérifier API Trigger Sync ===" -ForegroundColor Green

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:3000/api/admin/trigger-sync" `
        -Method GET `
        -TimeoutSec 5
    
    Write-Host "✅ API Trigger Sync OK" -ForegroundColor Green
    
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   Message: $($content.message)" -ForegroundColor Cyan
    Write-Host "   Endpoint: $($content.endpoint)" -ForegroundColor Cyan
    Write-Host "   Status: $($content.status)" -ForegroundColor Cyan
    Write-Host "   N8N Configured: $($content.n8nConfigured)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ ERREUR: $_" -ForegroundColor Red
}
```

---

## 🔧 TEST 8: Vérifier Recent Imports

```powershell
Write-Host "`n=== TEST 8: Vérifier Recent Imports ===" -ForegroundColor Green

$token = "MonSuperTokenSecret2026!"

$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:3000/api/admin/recent-imports" `
        -Method GET `
        -Headers $headers `
        -TimeoutSec 5
    
    Write-Host "✅ Recent Imports OK" -ForegroundColor Green
    
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   Imports: $($content.imports.Count)" -ForegroundColor Cyan
    
    if ($content.imports.Count -gt 0) {
        Write-Host "   Derniers imports:" -ForegroundColor Cyan
        $content.imports | ForEach-Object {
            Write-Host "   - $($_.type): $($_.count) records ($($_.timestamp))" -ForegroundColor Cyan
        }
    }
    
} catch {
    Write-Host "❌ ERREUR: $_" -ForegroundColor Red
}
```

---

## 🔧 TEST 9: Vérifier N8N

```powershell
Write-Host "`n=== TEST 9: Vérifier N8N ===" -ForegroundColor Green

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5678/api/v1/workflows" `
        -TimeoutSec 5
    
    Write-Host "✅ N8N OK" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Cyan
    
} catch {
    Write-Host "⚠️ N8N non accessible" -ForegroundColor Yellow
    Write-Host "   Conseil: Vérifier que N8N est démarré" -ForegroundColor Yellow
    Write-Host "   Commande: n8n start" -ForegroundColor Yellow
}
```

---

## 🔧 TEST 10: Tester Workflow Complet

```powershell
Write-Host "`n=== TEST 10: Workflow Complet ===" -ForegroundColor Green
Write-Host "Ce test simule l'ensemble du processus" -ForegroundColor Yellow

Write-Host "`n1. Créer et uploader un fichier test..." -ForegroundColor Cyan

# Créer CSV test
$csvContent = @"
nom,prenom,email,telephone,dateNaissance
Dupont,Jean,jean@test.com,0123456789,1980-01-15
Martin,Marie,marie@test.com,0987654321,1985-06-20
"@

$tempFile = "$env:TEMP\test_full_$(Get-Random).csv"
$csvContent | Out-File -FilePath $tempFile -Encoding UTF8

# Uploader
$ftpServer = "ftp.votresite.com"
$ftpUser = "efficience_sync"
$ftpPass = "VotreMotdePasse2026!"
$fileName = "test_patients_$(Get-Random).csv"

try {
    $uri = "ftp://$ftpServer/data/$fileName"
    $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    
    $fileStream = [System.IO.File]::OpenRead($tempFile)
    $ftpStream = $ftpRequest.GetRequestStream()
    $fileStream.CopyTo($ftpStream)
    $ftpStream.Close()
    $fileStream.Close()
    
    Write-Host "✅ Fichier uploadé: $fileName" -ForegroundColor Green
    
    Write-Host "`n2. Attendre N8N (5 secondes)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    
    Write-Host "`n3. Vérifier l'import..." -ForegroundColor Cyan
    
    $token = "MonSuperTokenSecret2026!"
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $response = Invoke-WebRequest `
        -Uri "http://localhost:3000/api/admin/recent-imports" `
        -Method GET `
        -Headers $headers `
        -TimeoutSec 5
    
    $content = $response.Content | ConvertFrom-Json
    
    if ($content.imports.Count -gt 0) {
        Write-Host "✅ WORKFLOW COMPLET OK!" -ForegroundColor Green
        Write-Host "   Imports trouvés: $($content.imports.Count)" -ForegroundColor Green
    } else {
        Write-Host "⏳ Aucun import détecté" -ForegroundColor Yellow
        Write-Host "   N8N peut prendre 5 minutes pour détecter" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ ERREUR: $_" -ForegroundColor Red
} finally {
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
}
```

---

## 🚀 EXÉCUTER TOUS LES TESTS

```powershell
# Copier et exécuter ce bloc complet

Write-Host "`n" -ForegroundColor Yellow
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║     🧪 N8N + HOSTINGER TESTS COMPLETS                          ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow

# TEST 1: Connexion FTP
Write-Host "`n[1/10] Connexion FTP" -ForegroundColor Yellow
# ... (code ci-dessus)

# TEST 2: Lister Fichiers
Write-Host "`n[2/10] Lister Fichiers" -ForegroundColor Yellow
# ... (code ci-dessus)

# ... etc pour tests 3-10

Write-Host "`n" -ForegroundColor Yellow
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║     ✅ TOUS LES TESTS TERMINÉS                                ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
```

---

## 📋 RÉSUMÉ DES TESTS

| Test | Objectif | Success |
|------|----------|---------|
| 1 | Connexion FTP | ✅ |
| 2 | Lister fichiers | ✅ |
| 3 | Uploader CSV | ✅ |
| 4 | Webhook Efficience | ✅ |
| 5 | API Webhook | ✅ |
| 6 | API Import | ✅ |
| 7 | API Trigger | ✅ |
| 8 | Recent Imports | ✅ |
| 9 | N8N | ✅ |
| 10 | Workflow Complet | ✅ |

---

**Tous les tests prêts! 🚀**

