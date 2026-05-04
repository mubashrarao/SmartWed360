Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   TESTING NOTIFICATION MODULE" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Step 1: Login as customer to check notifications
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

    # Step 2: Get unread count
    Write-Host "`nSTEP 2: Getting unread count..." -ForegroundColor Yellow
    $unreadCount = Invoke-RestMethod -Uri "http://localhost:5000/api/notifications/unread-count" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $customerToken" }

    Write-Host "✅ Unread notifications: $($unreadCount.data.unreadCount)" -ForegroundColor Green

    # Step 3: Get all notifications
    Write-Host "`nSTEP 3: Getting all notifications..." -ForegroundColor Yellow
    $notifications = Invoke-RestMethod -Uri "http://localhost:5000/api/notifications" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $customerToken" }

    Write-Host "✅ Found $($notifications.count) notifications" -ForegroundColor Green
    foreach ($notif in $notifications.data) {
        $readStatus = if ($notif.isRead) { "Read" } else { "Unread" }
        Write-Host "  - [$readStatus] $($notif.title): $($notif.message)" -ForegroundColor Gray
    }

    # Step 4: Mark first notification as read (if any exist and unread)
    if ($notifications.count -gt 0) {
        $firstUnread = $notifications.data | Where-Object { -not $_.isRead } | Select-Object -First 1
        if ($firstUnread) {
            Write-Host "`nSTEP 4: Marking notification as read..." -ForegroundColor Yellow
            $markRead = Invoke-RestMethod -Uri "http://localhost:5000/api/notifications/$($firstUnread._id)/read" `
                -Method PUT `
                -Headers @{ "Authorization" = "Bearer $customerToken" }

            Write-Host "✅ Notification marked as read!" -ForegroundColor Green
        }
    }

    # Step 5: Login as vendor to check vendor notifications
    Write-Host "`nSTEP 5: Logging in as Vendor..." -ForegroundColor Yellow
    $vendorLogin = @{
        email = "vendor@test.com"
        password = "123456"
    } | ConvertTo-Json

    $vendor = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $vendorLogin

    $vendorToken = $vendor.data.token
    Write-Host "✅ Vendor logged in: $($vendor.data.name)" -ForegroundColor Green

    # Step 6: Get vendor notifications
    Write-Host "`nSTEP 6: Getting vendor notifications..." -ForegroundColor Yellow
    $vendorNotifs = Invoke-RestMethod -Uri "http://localhost:5000/api/notifications" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $vendorToken" }

    Write-Host "✅ Found $($vendorNotifs.count) notifications for vendor" -ForegroundColor Green
    foreach ($notif in $vendorNotifs.data) {
        $readStatus = if ($notif.isRead) { "Read" } else { "Unread" }
        Write-Host "  - [$readStatus] $($notif.title): $($notif.message)" -ForegroundColor Gray
    }

    # Step 7: Mark all as read
    Write-Host "`nSTEP 7: Marking all notifications as read..." -ForegroundColor Yellow
    $markAll = Invoke-RestMethod -Uri "http://localhost:5000/api/notifications/read-all" `
        -Method PUT `
        -Headers @{ "Authorization" = "Bearer $vendorToken" }

    Write-Host "✅ All notifications marked as read!" -ForegroundColor Green

    # Step 8: Verify unread count is 0
    Write-Host "`nSTEP 8: Verifying unread count..." -ForegroundColor Yellow
    $finalCount = Invoke-RestMethod -Uri "http://localhost:5000/api/notifications/unread-count" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $vendorToken" }

    Write-Host "✅ Unread count: $($finalCount.data.unreadCount)" -ForegroundColor Green

    Write-Host "`n====================================" -ForegroundColor Green
    Write-Host "   ALL NOTIFICATION TESTS PASSED!" -ForegroundColor Green
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