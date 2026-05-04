# test-admin.ps1 - Admin Module (UC12, UC13, UC14)
. .\test-helper.ps1

Write-TestHeader "UC12/13/14 - Admin Module"

# Login as admin first
$adminLogin = @{
    email = "admin@smartwed.com"
    password = "Admin@2025!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $adminLogin
    
    $global:adminToken = $response.data.token
    Write-Success "Admin logged in"
} catch {
    Write-Error "Admin login failed"
    exit
}

# UC13 - Approve Vendors
Write-TestHeader "UC13 - Approve Vendors"

# Get pending vendors
try {
    $pending = Invoke-RestMethod -Uri "$BASE_URL/admin/vendors/pending" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $adminToken" }
    
    Write-Success "Found $($pending.count) pending vendors"
    
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
        
        Test-ApiResponse $approve "Vendor Approval"
    }
} catch {
    Write-Error "Failed to get pending vendors: $($_.Exception.Message)"
}

# UC12 - Manage Categories
Write-TestHeader "UC12 - Manage Categories"

# Create categories
$categories = @("Wedding Hall", "Banquet", "Lawn", "Farmhouse", "Hotel", "Resort")
foreach ($cat in $categories) {
    $catBody = @{
        name = $cat
        description = "$cat category for wedding venues"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/categories" `
            -Method POST `
            -Headers @{ 
                "Authorization" = "Bearer $adminToken"
                "Content-Type" = "application/json" 
            } `
            -Body $catBody
        
        Write-Success "Created category: $cat"
    } catch {
        Write-Error "Failed to create category $cat"
    }
}

# Get all categories
try {
    $categories = Invoke-RestMethod -Uri "$BASE_URL/admin/categories" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $adminToken" }
    
    Write-Success "Retrieved $($categories.count) categories"
    $global:categoryId = $categories.data[0]._id
} catch {
    Write-Error "Failed to get categories"
}

# UC14 - Monitor Bookings and Users
Write-TestHeader "UC14 - Monitor Bookings and Users"

# Get dashboard stats
try {
    $stats = Invoke-RestMethod -Uri "$BASE_URL/admin/dashboard" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $adminToken" }
    
    Write-Success "Dashboard stats retrieved"
    Write-Info "Total Users: $($stats.data.users.total)"
    Write-Info "Total Vendors: $($stats.data.users.vendors.total)"
    Write-Info "Total Bookings: $($stats.data.bookings.total)"
} catch {
    Write-Error "Failed to get dashboard stats"
}

# Get all bookings
try {
    $bookings = Invoke-RestMethod -Uri "$BASE_URL/admin/bookings" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $adminToken" }
    
    Write-Success "Retrieved $($bookings.count) bookings"
} catch {
    Write-Error "Failed to get bookings: $($_.Exception.Message)"
}

# Get all vendors
try {
    $vendors = Invoke-RestMethod -Uri "$BASE_URL/admin/vendors" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $adminToken" }
    
    Write-Success "Retrieved $($vendors.count) vendors"
} catch {
    Write-Error "Failed to get vendors"
}

Write-TestHeader "Admin Module Complete"