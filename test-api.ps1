$API_URL = "http://localhost:3000"
# Removed unused $TOKEN variable

Write-Host "TEST 1: GET /api/admin/recent-imports" -ForegroundColor Green
Invoke-RestMethod -Uri "$API_URL/api/admin/recent-imports" -Method Get | ConvertTo-Json | Write-Host

Write-Host "`nTEST 2: GET avec filtres" -ForegroundColor Green
Invoke-RestMethod -Uri "$API_URL/api/admin/recent-imports?minutes=10&limit=10" -Method Get | ConvertTo-Json | Write-Host

Write-Host "`nFIN!" -ForegroundColor Yellow
