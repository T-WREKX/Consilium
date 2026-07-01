# Smoke test: verify Cognee sidecar is reachable and remember/recall work.
# Usage: .\scripts\cognee-smoke.ps1 [-BaseUrl http://localhost:8000]

param(
    [string]$BaseUrl = "http://localhost:8000",
    [string]$Dataset = "consilium-smoke-test"
)

$ErrorActionPreference = "Stop"

Write-Host "Cognee smoke test -> $BaseUrl" -ForegroundColor Cyan

# Health
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get -TimeoutSec 10
    Write-Host "Health: OK" -ForegroundColor Green
} catch {
    Write-Host "Health check failed. Is cognee running? (docker compose up -d cognee)" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

$rememberBody = @{
    datasetName = $Dataset
    data        = "CONSILIUM_SMOKE: Cognee remember/recall pipeline is working for Consilium."
} | ConvertTo-Json

Write-Host "Remember..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/v1/remember" -Method Post `
        -ContentType "application/json" `
        -Body $rememberBody `
        -TimeoutSec 120 | Out-Null
    Write-Host "Remember: OK" -ForegroundColor Green
} catch {
    # Some Cognee versions expect multipart; try form upload
    Write-Host "JSON remember failed, trying multipart..." -ForegroundColor Yellow
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"datasetName`"$LF",
        $Dataset,
        "--$boundary",
        "Content-Disposition: form-data; name=`"data`"; filename=`"smoke.txt`"",
        "Content-Type: text/plain$LF",
        "CONSILIUM_SMOKE: Cognee remember/recall pipeline is working for Consilium.",
        "--$boundary--"
    ) -join $LF
    Invoke-RestMethod -Uri "$BaseUrl/api/v1/remember" -Method Post `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $bodyLines `
        -TimeoutSec 120 | Out-Null
    Write-Host "Remember (multipart): OK" -ForegroundColor Green
}

Write-Host "Recall..." -ForegroundColor Cyan
$recallBody = @{
    query       = "Is the Consilium Cognee pipeline working?"
    datasets    = @($Dataset)
    search_type = "CHUNKS"
    top_k       = 5
} | ConvertTo-Json

$recall = Invoke-RestMethod -Uri "$BaseUrl/api/v1/recall" -Method Post `
    -ContentType "application/json" `
    -Body $recallBody `
    -TimeoutSec 60

Write-Host "Recall response:" -ForegroundColor Green
$recall | ConvertTo-Json -Depth 6
Write-Host "`nSmoke test complete." -ForegroundColor Green
