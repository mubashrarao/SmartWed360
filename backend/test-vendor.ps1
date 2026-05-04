# test-vendor.ps1 - Vendor Module (UC07, UC08, UC09, UC10)
. .\test-helper.ps1

Write-TestHeader "UC07/08/09/10 - Vendor Module"

# First, we need a vendor token - create one if not exists
Write-Info "Creating a test vendor first..."

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$vendorEmail = "vendor$timestamp@test.com"

$vendorBody = @{
    name = "Test Vendor"
    email = $vendorEmail
    password = "Vendor@2025!"
    role = "vendor"
    phone = "03007654321"
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $vendorBody
    
    Write-Success "Test vendor created"
} catch {
    Write-Error "Failed to create test vendor"
}

# Login as admin to approve the vendor
$adminLogin = @{
    email = "admin@smartwed.com"
    password = "Admin@2025!"
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $adminLogin
    
    $adminToken = $adminResponse.data.token
    
    # Get pending vendors
    $pending = Invoke-RestMethod -Uri "$BASE_URL/admin/vendors/pending" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $adminToken" }
    
    if ($pending.count -gt 0) {
        $vendorId = $pending.data[0]._id
        $approveBody = @{ status = "active" } | ConvertTo-Json
        
        $approve = Invoke-RestMethod -Uri "$BASE_URL/admin/vendors/$vendorId" `
            -Method PUT `
            -Headers @{ 
                "Authorization" = "Bearer $adminToken"
                "Content-Type" = "application/json" 
            } `
            -Body $approveBody
        
        Write-Success "Vendor approved"
    }
} catch {
    Write-Error "Failed to approve vendor"
}

# Now login as the approved vendor
$vendorLogin = @{
    email = $vendorEmail
    password = "Vendor@2025!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $vendorLogin
    
    $global:vendorToken = $response.data.token
    Write-Success "Vendor logged in"
} catch {
    Write-Error "Vendor login failed"
    exit
}

# UC08 - Manage Venue Listing
Write-TestHeader "UC08 - Manage Venue Listing"

# Get categories first
try {
    $categories = Invoke-RestMethod -Uri "$BASE_URL/vendor/categories" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $vendorToken" }
    
    $categoryId = $categories.data[0]._id
    Write-Success "Got categories"
} catch {
    Write-Error "Failed to get categories"
}

# Create venue
$venueBody = @{
    name = "Test Wedding Venue"
    description = "A beautiful venue for testing"
    category = $categoryId
    price = 250000
    capacity = 500
    city = "Islamabad"
    address = "Test Address, Main Boulevard"
    contactPhone = "03001234567"
    contactEmail = "test@venue.com"
    amenities = @("Parking", "AC", "WiFi")
} | ConvertTo-Json -Depth 3

try {
    $venue = Invoke-RestMethod -Uri "$BASE_URL/vendor/venues" `
        -Method POST `
        -Headers @{ 
            "Authorization" = "Bearer $vendorToken"
            "Content-Type" = "application/json" 
        } `
        -Body $venueBody
    
    Test-ApiResponse $venue "Create Venue"
    $global:venueId = $venue.data._id
} catch {
    Write-Error "Failed to create venue: $($_.Exception.Message)"
}

# Get all venues
try {
    $venues = Invoke-RestMethod -Uri "$BASE_URL/vendor/venues" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $vendorToken" }
    
    Write-Success "Retrieved $($venues.count) venues"
} catch {
    Write-Error "Failed to get venues"
}

# Get single venue
try {
    $singleVenue = Invoke-RestMethod -Uri "$BASE_URL/vendor/venues/$venueId" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $vendorToken" }
    
    Test-ApiResponse $singleVenue "Get Single Venue"
} catch {
    Write-Error "Failed to get single venue"
}

# Update venue
$updateBody = @{
    price = 275000
    description = "Updated test venue"
} | ConvertTo-Json

try {
    $updated = Invoke-RestMethod -Uri "$BASE_URL/vendor/venues/$venueId" `
        -Method PUT `
        -Headers @{ 
            "Authorization" = "Bearer $vendorToken"
            "Content-Type" = "application/json" 
        } `
        -Body $updateBody
    
    Test-ApiResponse $updated "Update Venue"
} catch {
    Write-Error "Failed to update venue"
}

# UC09 - Respond to Booking Requests
Write-TestHeader "UC09 - Respond to Booking Requests"

# Get vendor bookings
try {
    $bookings = Invoke-RestMethod -Uri "$BASE_URL/vendor/bookings" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $vendorToken" }
    
    Write-Success "Retrieved vendor bookings"
    Write-Info "Pending: $($bookings.stats.pending)"
    Write-Info "Approved: $($bookings.stats.approved)"
} catch {
    Write-Error "Failed to get vendor bookings"
}

# UC10 - Manage Profile
Write-TestHeader "UC10 - Manage Profile"

# Update profile
$profileBody = @{
    name = "Updated Vendor Name"
    phone = "03009999999"
} | ConvertTo-Json

try {
    $profile = Invoke-RestMethod -Uri "$BASE_URL/auth/profile" `
        -Method PUT `
        -Headers @{ 
            "Authorization" = "Bearer $vendorToken"
            "Content-Type" = "application/json" 
        } `
        -Body $profileBody
    
    Test-ApiResponse $profile "Update Profile"
} catch {
    Write-Error "Failed to update profile: $($_.Exception.Message)"
}

# Get profile
try {
    $profile = Invoke-RestMethod -Uri "$BASE_URL/auth/profile" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $vendorToken" }
    
    Write-Success "Retrieved profile"
} catch {
    Write-Error "Failed to get profile"
}

Write-TestHeader "Vendor Module Complete"