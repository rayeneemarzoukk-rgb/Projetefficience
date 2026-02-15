# ========================================
# TEST DES IMPORTS - EFFICIENCE ANALYTICS
# ========================================

Write-Host "=== TEST DES IMPORTS VIA WEBHOOK ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:3000"
$token = "MonSuperTokenSecret2026!"

# Donnees de test pour patients
$testPatients = @{
    type = "patients"
    cabinetId = "1"
    data = @(
        @{
            nom = "Dupont"
            prenom = "Jean"
            email = "jean.dupont@test.fr"
            telephone = "0601020304"
            dateNaissance = "1980-05-15"
        },
        @{
            nom = "Martin"
            prenom = "Marie"
            email = "marie.martin@test.fr"
            telephone = "0605060708"
            dateNaissance = "1990-03-20"
        }
    )
}

Write-Host "Test 1: Import de Patients" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Yellow

try {
    $jsonBody = $testPatients | ConvertTo-Json -Depth 10
    
    $response = Invoke-WebRequest `
        -Uri "$baseUrl/api/admin/import" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        } `
        -Body $jsonBody `
        -UseBasicParsing

    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ SUCCÈS!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Message: $($result.message)" -ForegroundColor Green
    Write-Host "Imported: $($result.imported) patients" -ForegroundColor Green
    
} catch {
    Write-Host "❌ ERREUR!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Détails: $errorBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Test 2: Import de Finances" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Yellow

$testFinances = @{
    type = "finances"
    cabinetId = "1"
    data = @(
        @{
            periode = "2026-01"
            chiffreAffaires = 45000
            revenus = 42000
            depenses = 15000
        }
    )
}

try {
    $jsonBody = $testFinances | ConvertTo-Json -Depth 10
    
    $response = Invoke-WebRequest `
        -Uri "$baseUrl/api/admin/import" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        } `
        -Body $jsonBody `
        -UseBasicParsing

    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ SUCCÈS!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Message: $($result.message)" -ForegroundColor Green
    Write-Host "Imported: $($result.imported) finance records" -ForegroundColor Green
    
} catch {
    Write-Host "❌ ERREUR!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Test 3: Verifier MongoDB" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow

try {
    $statsResponse = Invoke-WebRequest `
        -Uri "$baseUrl/api/stats" `
        -Method GET `
        -UseBasicParsing

    $stats = $statsResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ MongoDB connecté!" -ForegroundColor Green
    Write-Host "Patients en DB: $($stats.totalPatients)" -ForegroundColor Green
    Write-Host "Cabinets en DB: $($stats.totalCabinets)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur connexion MongoDB" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Tests termines!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
