# test-customer.ps1 - Customer Module (UC02, UC03, UC04, UC05, UC06, UC10)
. .\test-helper.ps1

Write-TestHeader "UC02/03/04/05/06/10 - Customer Module"

# Login as customer
$customerLogin = @{
    email = "customer@test.com"
    password = "Customer@2025!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $customerLogin
    
    $global:customerToken = $response.data.token
    Write-Success "Customer logged in"
} catch {
    Write-Error "Customer login failed"
    exit
}

# UC02 - Search Venues
Write-TestHeader "UC02 - Search Venues"

# Get all venues
try {
    $venues = Invoke-RestMethod -Uri "$BASE_URL/customer/venues" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $customerToken" }
    
    Write-Success "Retrieved $($venues.count) venues"
    $global:venueId = $venues.data[0]._id
} catch {
    Write-Error "Failed to get venues"
}

# Search with filters
try {
    $filtered = Invoke-RestMethod -Uri "$BASE_URL/customer/venues?city=Islamabad&minPrice=100000&maxPrice=300000" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $customerToken" }
    
    Write-Success "Search with filters returned $($filtered.count) venues"
} catch {
    Write-Error "Failed to search with filters"
}

# UC03 - View Venue Details
Write-TestHeader "UC03 - View Venue Details"

try {
    $venue = Invoke-RestMethod -Uri "$BASE_URL/customer/venues/$venueId" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $customerToken" }
    
    Test-ApiResponse $venue "View Venue Details"
    Write-Info "Venue: $($venue.data.name)"
    Write-Info "Price: Rs. $($venue.data.price)"
    Write-Info "Capacity: $($venue.data.capacity)"
} catch {
    Write-Error "Failed to get venue details"
}

# UC04 - Send Booking Request
Write-TestHeader "UC04 - Send Booking Request"

$bookingBody = @{
    venueId = $venueId
    eventDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
    guestCount = 200
    specialRequests = "Need vegetarian options"
} | ConvertTo-Json

try {
    $booking = Invoke-RestMethod -Uri "$BASE_URL/bookings" `
        -Method POST `
        -Headers @{ 
            "Authorization" = "Bearer $customerToken"
            "Content-Type" = "application/json" 
        } `
        -Body $bookingBody
    
    Test-ApiResponse $booking "Send Booking Request"
    $global:bookingId = $booking.data._id
} catch {
    Write-Error "Failed to create booking: $($_.Exception.Message)"
}

# UC05 - View Booking Status
Write-TestHeader "UC05 - View Booking Status"

# Get customer bookings
try {
    $bookings = Invoke-RestMethod -Uri "$BASE_URL/bookings/customer" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $customerToken" }
    
    Write-Success "Retrieved $($bookings.count) bookings"
    foreach ($b in $bookings.data) {
        Write-Info "Booking: $($b.venue.name) - Status: $($b.status)"
    }
} catch {
    Write-Error "Failed to get customer bookings"
}

# Get single booking
try {
    $singleBooking = Invoke-RestMethod -Uri "$BASE_URL/bookings/$bookingId" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $customerToken" }
    
    Test-ApiResponse $singleBooking "Get Single Booking"
} catch {
    Write-Error "Failed to get single booking"
}

# UC06 - View Recommendations
Write-TestHeader "UC06 - View Recommendations"

try {
    $recs = Invoke-RestMethod -Uri "$BASE_URL/recommendations/top-picks" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $customerToken" }
    
    Write-Success "Retrieved $($recs.recommendations.Count) recommendations"
} catch {
    Write-Error "Failed to get recommendations: $($_.Exception.Message)"
}

# Get personalized recommendations with filters
try {
    $filteredRecs = Invoke-RestMethod -Uri "$BASE_URL/recommendations?city=Islamabad&budget=300000&guestCount=400" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $customerToken" }
    
    Write-Success "Retrieved $($filteredRecs.recommendations.Count) filtered recommendations"
} catch {
    Write-Error "Failed to get filtered recommendations"
}

# UC10 - Manage Profile
Write-TestHeader "UC10 - Manage Profile"

# Update profile
$profileBody = @{
    name = "Updated Customer Name"
    phone = "03001112233"
} | ConvertTo-Json

try {
    $profile = Invoke-RestMethod -Uri "$BASE_URL/auth/profile" `
        -Method PUT `
        -Headers @{ 
            "Authorization" = "Bearer $customerToken"
            "Content-Type" = "application/json" 
        } `
        -Body $profileBody
    
    Test-ApiResponse $profile "Update Profile"
} catch {
    Write-Error "Failed to update profile: $($_.Exception.Message)"
}

Write-TestHeader "Customer Module Complete"