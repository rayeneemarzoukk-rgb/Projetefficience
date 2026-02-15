$API_URL = "http://localhost:3000"
$WEBHOOK_TOKEN = "MonSuperTokenSecret2026!"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TEST IMPORT - WEBHOOK API" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# TEST 1: Envoyer un import de patients
Write-Host "`nTEST 1: Importer 2 patients via webhook" -ForegroundColor Yellow
try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $WEBHOOK_TOKEN"
    }

    $body = @{
        "type" = "patients"
        "cabinetId" = "cab_test_$timestamp"
        "data" = @(
            @{
                "nom" = "Dupont"
                "prenom" = "Jean"
                "email" = "jean.dupont@test.com"
                "telephone" = "0612345678"
                "dateNaissance" = "1980-05-15"
            },
            @{
                "nom" = "Martin"
                "prenom" = "Marie"
                "email" = "marie.martin@test.com"
                "telephone" = "0687654321"
                "dateNaissance" = "1985-10-20"
            }
        )
    } | ConvertTo-Json -Depth 10

    $response = Invoke-RestMethod -Uri "$API_URL/api/admin/webhook-n8n" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -ContentType "application/json"

    Write-Host "Status: $($response.status)" -ForegroundColor Green
    Write-Host "Type: $($response.type)" -ForegroundColor Green
    Write-Host "Inseres: $($response.inserted) patients" -ForegroundColor Green
    Write-Host "Message: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
}

# Attendre 1 seconde
Start-Sleep -Seconds 1

# TEST 2: Verifier les logs crees
Write-Host "`nTEST 2: Verifier les imports dans les logs" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/admin/recent-imports?minutes=5&limit=20" -Method Get
    
    if ($response.stats.totalImports -gt 0) {
        Write-Host "Total imports: $($response.stats.totalImports)" -ForegroundColor Green
        Write-Host "Reussis: $($response.stats.successCount)" -ForegroundColor Green
        Write-Host "Erreurs: $($response.stats.errorCount)" -ForegroundColor Green
        Write-Host "Enregistrements inseres: $($response.stats.totalInserted)" -ForegroundColor Green
        Write-Host "Taux reussite: $($response.stats.successRate)%" -ForegroundColor Green
        
        Write-Host "`nDerniers imports:" -ForegroundColor Cyan
        $response.imports | Select-Object -First 5 | ForEach-Object {
            Write-Host "  [$($_.status)] $($_.type) - $($_.details.inserted) records - $($_.timestampLocal)" -ForegroundColor Blue
        }
    } else {
        Write-Host "Aucun import trouve" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
}

# TEST 3: Importer des rendez-vous
Write-Host "`nTEST 3: Importer 3 rendez-vous" -ForegroundColor Yellow
try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $WEBHOOK_TOKEN"
    }

    $body = @{
        "type" = "appointments"
        "cabinetId" = "cab_test_$timestamp"
        "data" = @(
            @{
                "patient_id" = "pat_001"
                "date" = "2026-02-01"
                "heure" = "09:00"
                "type" = "CONTROLE"
            },
            @{
                "patient_id" = "pat_002"
                "date" = "2026-02-02"
                "heure" = "10:30"
                "type" = "DETARTRAGE"
            },
            @{
                "patient_id" = "pat_001"
                "date" = "2026-02-03"
                "heure" = "14:00"
                "type" = "SOIN"
            }
        )
    } | ConvertTo-Json -Depth 10

    $response = Invoke-RestMethod -Uri "$API_URL/api/admin/webhook-n8n" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -ContentType "application/json"

    Write-Host "Status: $($response.status)" -ForegroundColor Green
    Write-Host "Inseres: $($response.inserted) rendez-vous" -ForegroundColor Green
} catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
}

# Attendre 1 seconde
Start-Sleep -Seconds 1

# TEST 4: Afficher le resume final
Write-Host "`nTEST 4: Resume des stats finales" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/admin/recent-imports?minutes=10&limit=50" -Method Get
    
    Write-Host "Total imports: $($response.stats.totalImports)" -ForegroundColor Cyan
    Write-Host "Reussis: $($response.stats.successCount)" -ForegroundColor Green
    Write-Host "Erreurs: $($response.stats.errorCount)" -ForegroundColor Red
    Write-Host "Total enregistrements: $($response.stats.totalInserted)" -ForegroundColor Cyan
    Write-Host "Taux reussite: $($response.stats.successRate)%" -ForegroundColor Cyan
    
    Write-Host "`nRepartition par type:" -ForegroundColor Cyan
    Write-Host "  Patients: $($response.stats.byType.patients)" -ForegroundColor Blue
    Write-Host "  Finances: $($response.stats.byType.finances)" -ForegroundColor Blue
    Write-Host "  Production: $($response.stats.byType.production)" -ForegroundColor Blue
    Write-Host "  Rendez-vous: $($response.stats.byType.appointments)" -ForegroundColor Blue
} catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "TEST TERMINE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "URL Admin: http://localhost:3000/admin" -ForegroundColor Blue
Write-Host "Onglet: Imports en Temps Reel" -ForegroundColor Blue
