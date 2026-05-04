# run-all-tests.ps1
. .\test-helper.ps1

Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host " SMARTWED 360 - COMPLETE TEST SUITE" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

# Check if server is running
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -TimeoutSec 2
    Write-Success "Server is running"
} catch {
    Write-ErrorMsg "Server is not running! Please start backend server first."
    exit
}

# Menu
Write-Host "`nSelect test to run:" -ForegroundColor Yellow
Write-Host "1. UC01 - Register/Login"
Write-Host "2. UC12/13/14 - Admin Module"
Write-Host "3. UC07/08/09/10 - Vendor Module"  
Write-Host "4. UC02/03/04/05/06/10 - Customer Module"
Write-Host "5. UC11 - Guest User"
Write-Host "6. Run ALL Tests"
Write-Host "0. Exit"

$choice = Read-Host "`nEnter choice (0-6)"

switch ($choice) {
    "1" { & ".\test-uc01.ps1" }
    "2" { & ".\test-admin.ps1" }
    "3" { & ".\test-vendor.ps1" }
    "4" { & ".\test-customer.ps1" }
    "5" { & ".\test-guest.ps1" }
    "6" {
        & ".\test-uc01.ps1"
        & ".\test-admin.ps1"
        & ".\test-vendor.ps1"
        & ".\test-customer.ps1"
        & ".\test-guest.ps1"
    }
    "0" { exit }
    default { Write-Host "Invalid choice" }
}