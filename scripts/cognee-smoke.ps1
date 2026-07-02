# Smoke test: verify Cognee sidecar is reachable and remember/recall work.
# Usage: .\scripts\cognee-smoke.ps1 [-BaseUrl http://localhost:8000]

param(
    [string]$BaseUrl = "http://localhost:8000",
    [string]$Dataset = "consilium-smoke-test",
    # Cognee requires auth by default (REQUIRE_AUTHENTICATION). Falls back to
    # $env:COGNEE_API_KEY (same var apps/api/.env uses) if not passed explicitly.
    [string]$ApiKey = $env:COGNEE_API_KEY
)

$ErrorActionPreference = "Stop"

if (-not $ApiKey) {
    Write-Host "No API key provided (-ApiKey or `$env:COGNEE_API_KEY). Requests will 401 unless REQUIRE_AUTHENTICATION=false." -ForegroundColor Yellow
}
$authHeaders = @{}
if ($ApiKey) { $authHeaders["X-Api-Key"] = $ApiKey }

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

# Confirmed against the live /openapi.json: /api/v1/remember only accepts
# multipart/form-data (Body_remember_api_v1_remember_post: data[] + datasetName).
Write-Host "Remember..." -ForegroundColor Cyan
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
$rememberResult = Invoke-RestMethod -Uri "$BaseUrl/api/v1/remember" -Method Post `
    -ContentType "multipart/form-data; boundary=$boundary" `
    -Headers $authHeaders `
    -Body $bodyLines `
    -TimeoutSec 120
Write-Host "Remember: OK" -ForegroundColor Green
Write-Host ($rememberResult | ConvertTo-Json -Depth 6)

# Field names are camelCase per the live RecallPayloadDTO schema (searchType/topK, not
# snake_case) — cognee.ts's recallForQuery() was fixed to match; keep this script in sync.
Write-Host "Recall..." -ForegroundColor Cyan
$recallBody = @{
    query      = "Is the Consilium Cognee pipeline working?"
    datasets   = @($Dataset)
    searchType = "CHUNKS"
    topK       = 5
} | ConvertTo-Json

$recall = Invoke-RestMethod -Uri "$BaseUrl/api/v1/recall" -Method Post `
    -ContentType "application/json" `
    -Headers $authHeaders `
    -Body $recallBody `
    -TimeoutSec 60

Write-Host "Recall response:" -ForegroundColor Green
$recall | ConvertTo-Json -Depth 6
Write-Host "`nSmoke test complete." -ForegroundColor Green
