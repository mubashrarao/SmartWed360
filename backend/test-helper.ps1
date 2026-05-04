# test-helper.ps1
$global:BASE_URL = "http://localhost:5000/api"

function Write-Success {
    param([string]$message)
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$message)
    Write-Host "❌ $message" -ForegroundColor Red
}

function Write-Info {
    param([string]$message)
    Write-Host "ℹ️ $message" -ForegroundColor Cyan
}

function Write-TestHeader {
    param([string]$testName)
    Write-Host "`n" + ("=" * 60) -ForegroundColor Magenta
    Write-Host " TEST: $testName" -ForegroundColor Magenta
    Write-Host ("=" * 60) -ForegroundColor Magenta
}

function Test-ApiResponse {
    param($response, $testName)
    if ($response.success -eq $true) {
        Write-Success "$testName passed"
        return $true
    } else {
        Write-ErrorMsg "$testName failed"
        return $false
    }
}