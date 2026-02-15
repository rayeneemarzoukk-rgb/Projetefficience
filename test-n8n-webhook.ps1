# TEST WEBHOOK N8N
Write-Host "=== TEST WEBHOOK N8N ===" -ForegroundColor Cyan

$webhookUrl = "https://efficienceprojetrayene.app.n8n.cloud/webhook-test/efficience-sync"
# NOTE: Ce webhook envoie les donnees a https://unprocreant-prowed-bruno.ngrok-free.dev/api/admin/webhook-n8n

Write-Host "`nEnvoi de donnees vers N8N..." -ForegroundColor Yellow

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

try {
    $response = Invoke-RestMethod -Uri $webhookUrl `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $testData
    
    Write-Host "[OK] Succes!" -ForegroundColor Green
    Write-Host "Reponse N8N:" -ForegroundColor Cyan
    $response | ConvertTo-Json
    
} catch {
    Write-Host "[ERREUR] $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test termine ===" -ForegroundColor Cyan
