Write-Host "Testing Vendor Token..." -ForegroundColor Cyan

# Login as vendor
$vendorLogin = @{
    email = "vendor@test.com"
    password = "123456"
} | ConvertTo-Json

$vendor = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Headers @{ "Content-Type" = "application/json" } `
    -Body $vendorLogin

$token = $vendor.data.token
Write-Host "✅ Got vendor token" -ForegroundColor Green
Write-Host "Token: $token" -ForegroundColor Gray

# Test the stats endpoint directly
Write-Host "`nTesting /api/vendor/stats..." -ForegroundColor Yellow

try {
    $stats = Invoke-RestMethod -Uri "http://localhost:5000/api/vendor/stats" `
        -Method GET `
        -Headers @{ 
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json" 
        }
    
    Write-Host "✅ Stats endpoint working!" -ForegroundColor Green
    $stats
} catch {
    Write-Host "❌ Stats endpoint failed:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    # Read the response body
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response: $responseBody" -ForegroundColor Red
}