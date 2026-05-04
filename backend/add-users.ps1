# add-users.ps1 - Create multiple test users
Write-Host "Creating test users..." -ForegroundColor Cyan

$users = @(
    @{name="Ayesha Khan"; email="ayesha@test.com"; password="Test@123"; role="customer"; phone="0300-1112223"},
    @{name="Omar Ali"; email="omar@test.com"; password="Test@123"; role="customer"; phone="0300-2223334"},
    @{name="Fatima Ahmed"; email="fatima@test.com"; password="Test@123"; role="customer"; phone="0300-3334445"},
    @{name="Hassan Raza"; email="hassan@test.com"; password="Test@123"; role="customer"; phone="0300-4445556"},
    @{name="Zara Tariq"; email="zara@test.com"; password="Test@123"; role="customer"; phone="0300-5556667"},
    @{name="Premium Venues"; email="premium@venues.com"; password="Vendor@2025"; role="vendor"; phone="0300-6667778"},
    @{name="Elite Events"; email="elite@events.com"; password="Vendor@2025"; role="vendor"; phone="0300-7778889"},
    @{name="Royal Weddings"; email="royal@weddings.com"; password="Vendor@2025"; role="vendor"; phone="0300-8889990"}
)

foreach ($user in $users) {
    $userBody = $user | ConvertTo-Json
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
            -Method POST `
            -Headers @{ "Content-Type" = "application/json" } `
            -Body $userBody
        Write-Host "✅ Created: $($user.name) ($($user.role))" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Already exists or error: $($user.email)" -ForegroundColor Yellow
    }
}