# test-guest.ps1 - Guest User (UC11)
. .\test-helper.ps1

Write-TestHeader "UC11 - Guest User (No Login Required)"

# Browse venues without login
try {
    $venues = Invoke-RestMethod -Uri "$BASE_URL/venues" `
        -Method GET
    
    Write-Success "Guest can browse venues - found $($venues.count)"
} catch {
    Write-Error "Failed to browse venues as guest"
}

# View single venue without login
if ($venues.data.Count -gt 0) {
    $venueId = $venues.data[0]._id
    try {
        $venue = Invoke-RestMethod -Uri "$BASE_URL/venues/$venueId" `
            -Method GET
        
        Write-Success "Guest can view venue details"
    } catch {
        Write-Error "Failed to view venue details as guest"
    }
}

# Try to access protected route (should fail)
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/bookings/customer" `
        -Method GET
    
    Write-Error "Guest should not access protected routes"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Success "Guest correctly blocked from protected routes"
    }
}

Write-TestHeader "Guest Module Complete"