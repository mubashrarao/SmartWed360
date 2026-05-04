Write-Host "Testing Venue Creation API" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Login as vendor
$vendorLogin = @{
    email = "vendor@test.com"
    password = "123456"
} | ConvertTo-Json

try {
    $vendor = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $vendorLogin

    $vendorToken = $vendor.data.token
    Write-Host "✅ Vendor logged in" -ForegroundColor Green

    # Get categories
    $categories = Invoke-RestMethod -Uri "http://localhost:5000/api/customer/categories" -Method GET
    $categoryId = $categories.data[0]._id
    Write-Host "✅ Got category: $($categories.data[0].name)" -ForegroundColor Green

    # Test venue creation with minimal data
    $testVenue = @{
        name = "Test Venue"
        description = "This is a test venue"
        category = $categoryId
        price = 100000
        capacity = 200
        city = "Islamabad"
        address = "Test Address"
        contactPhone = "1234567890"
        amenities = @("Parking", "AC")
    } | ConvertTo-Json -Depth 3

    Write-Host "`nSending venue creation request..." -ForegroundColor Yellow
    Write-Host "Request body: $testVenue" -ForegroundColor Gray

    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/vendor/venues" `
        -Method POST `
        -Headers @{ 
            "Authorization" = "Bearer $vendorToken"
            "Content-Type" = "application/json" 
        } `
        -Body $testVenue

    Write-Host "✅ Venue created successfully!" -ForegroundColor Green
    $result

} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    # Read the response body
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    } catch {
        Write-Host "Could not read response body" -ForegroundColor Red
    }
}