# test-uc01.ps1 - Register/Login
. .\test-helper.ps1

Write-TestHeader "UC01 - Register/Login"

# Clean emails for testing
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$customerEmail = "customer$timestamp@test.com"
$vendorEmail = "vendor$timestamp@test.com"
$adminEmail = "admin$timestamp@test.com"

Write-Info "Testing Customer Registration"
$customerBody = @{
    name = "Test Customer"
    email = $customerEmail
    password = "Test@123456"
    role = "customer"
    phone = "03001234567"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $customerBody
    Test-ApiResponse $response "Customer Registration"
    Write-Info "Customer created: $($response.data.email)"
} catch {
    Write-ErrorMsg "Customer Registration failed: $($_.Exception.Message)"
}

Write-Info "Testing Vendor Registration"
$vendorBody = @{
    name = "Test Vendor"
    email = $vendorEmail
    password = "Test@123456"
    role = "vendor"
    phone = "03007654321"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $vendorBody
    Write-Success "Vendor Registration successful (pending approval)"
    Write-Info "Vendor created: $($response.data.email)"
} catch {
    Write-ErrorMsg "Vendor Registration failed: $($_.Exception.Message)"
}

Write-Info "Testing Admin Registration"
$adminBody = @{
    name = "Test Admin"
    email = $adminEmail
    password = "Test@123456"
    role = "admin"
    phone = "03009999999"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $adminBody
    Test-ApiResponse $response "Admin Registration"
    Write-Info "Admin created: $($response.data.email)"
} catch {
    Write-ErrorMsg "Admin Registration failed: $($_.Exception.Message)"
}

Write-Info "Testing Login with valid credentials"
$loginBody = @{
    email = $customerEmail
    password = "Test@123456"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $loginBody
    Test-ApiResponse $response "Valid Login"
    Write-Info "Login successful for: $($response.data.name)"
} catch {
    Write-ErrorMsg "Valid Login failed: $($_.Exception.Message)"
}

Write-Info "Testing Login with invalid credentials"
$invalidBody = @{
    email = $customerEmail
    password = "WrongPassword"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $invalidBody
    Write-ErrorMsg "Invalid Login should have failed"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Success "Invalid Login correctly rejected (401)"
    } else {
        Write-ErrorMsg "Unexpected error: $($_.Exception.Message)"
    }
}

Write-TestHeader "UC01 Complete"