Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   TESTING RECOMMENDATION MODULE" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Step 1: Login as customer
Write-Host "`nSTEP 1: Logging in as Customer..." -ForegroundColor Yellow

$customerLogin = @{
    email = "test@example.com"
    password = "123456"
} | ConvertTo-Json

try {
    $customer = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $customerLogin

    $customerToken = $customer.data.token
    Write-Host "✅ Customer logged in: $($customer.data.name)" -ForegroundColor Green

    # Step 2: Get top picks (for customers with history)
    Write-Host "`nSTEP 2: Getting top picks..." -ForegroundColor Yellow
    $topPicks = Invoke-RestMethod -Uri "http://localhost:5000/api/recommendations/top-picks" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $customerToken" }

    Write-Host "✅ Found $($topPicks.recommendations.Count) top picks" -ForegroundColor Green
    foreach ($venue in $topPicks.recommendations) {
        Write-Host "  - $($venue.name) (Score: $($venue.recommendationScore))" -ForegroundColor Gray
        foreach ($reason in $venue.recommendationReasons) {
            Write-Host "      • $reason" -ForegroundColor DarkGray
        }
    }

    # Step 3: Get personalized recommendations with filters
    Write-Host "`nSTEP 3: Getting personalized recommendations..." -ForegroundColor Yellow
    $recommendations = Invoke-RestMethod -Uri "http://localhost:5000/api/recommendations?city=Islamabad&budget=300000&guestCount=400" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $customerToken" }

    Write-Host "✅ Found $($recommendations.recommendations.Count) recommendations" -ForegroundColor Green
    Write-Host "Based on: Budget Rs.$($recommendations.basedOn.budget), City $($recommendations.basedOn.city), Guests $($recommendations.basedOn.guestCount)" -ForegroundColor Cyan
    
    foreach ($venue in $recommendations.recommendations) {
        Write-Host "  - $($venue.name) (Rs.$($venue.price), Score: $($venue.recommendationScore))" -ForegroundColor Gray
    }

    # Step 4: Get similar venues (public)
    Write-Host "`nSTEP 4: Getting similar venues..." -ForegroundColor Yellow
    
    # First get a venue ID
    $venues = Invoke-RestMethod -Uri "http://localhost:5000/api/customer/venues?limit=1" -Method GET
    if ($venues.data.Count -gt 0) {
        $venueId = $venues.data[0]._id
        $similar = Invoke-RestMethod -Uri "http://localhost:5000/api/recommendations/similar/$venueId" -Method GET
        
        Write-Host "✅ Found $($similar.count) similar venues to: $($venues.data[0].name)" -ForegroundColor Green
        foreach ($venue in $similar.data) {
            Write-Host "  - $($venue.name)" -ForegroundColor Gray
        }
    }

    # Step 5: Get trending venues (public)
    Write-Host "`nSTEP 5: Getting trending venues..." -ForegroundColor Yellow
    $trending = Invoke-RestMethod -Uri "http://localhost:5000/api/recommendations/trending" -Method GET
    
    Write-Host "✅ Found $($trending.count) trending venues" -ForegroundColor Green
    foreach ($venue in $trending.data) {
        Write-Host "  - $($venue.name)" -ForegroundColor Gray
    }

    # Step 6: Quick recommendations (public)
    Write-Host "`nSTEP 6: Getting quick recommendations..." -ForegroundColor Yellow
    $quickBody = @{
        budget = 250000
        city = "Islamabad"
        guestCount = 500
    } | ConvertTo-Json

    $quick = Invoke-RestMethod -Uri "http://localhost:5000/api/recommendations/quick" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $quickBody

    Write-Host "✅ Found $($quick.count) quick recommendations" -ForegroundColor Green
    foreach ($venue in $quick.data) {
        Write-Host "  - $($venue.name) (Match: $($venue.matchScore)%, $($venue.matchReason))" -ForegroundColor Gray
    }

    Write-Host "`n====================================" -ForegroundColor Green
    Write-Host "   ALL RECOMMENDATION TESTS PASSED!" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green

} catch {
    Write-Host "❌ ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}