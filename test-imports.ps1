# TEST IMPORTS EFFICIENCE
Write-Host "=== TEST DES IMPORTS ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"
$token = "MonSuperTokenSecret2026!"

# Test 1: Patients
Write-Host "`nTest 1: Import Patients" -ForegroundColor Yellow

$testData = @{
    type = "patients"
    cabinetId = "1"
    data = @(
        @{
            nom = "Dupont"
            prenom = "Jean"
            email = "jean.dupont@test.fr"
            telephone = "0601020304"
            dateNaissance = "1980-05-15"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/import" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        } `
        -Body $testData
    
    Write-Host "[OK] Succes!" -ForegroundColor Green
    Write-Host "Importe: $($response.imported) patients" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Finances
Write-Host "`nTest 2: Import Finances" -ForegroundColor Yellow

$testData = @{
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
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/import" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        } `
        -Body $testData
    
    Write-Host "[OK] Succes!" -ForegroundColor Green
    Write-Host "Importe: $($response.imported) finance records" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Stats
Write-Host "`nTest 3: Verifier MongoDB" -ForegroundColor Yellow

try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/stats" -Method GET
    Write-Host "[OK] MongoDB connecte!" -ForegroundColor Green
    Write-Host "Patients: $($stats.totalPatients)" -ForegroundColor Green
    Write-Host "Cabinets: $($stats.totalCabinets)" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] MongoDB non accessible" -ForegroundColor Red
}

Write-Host "`n=== Tests termines ===" -ForegroundColor Cyan
