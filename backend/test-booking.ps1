Write-Host "====================================" -ForegroundColor Cyan
Write-Host "     TESTING BOOKING MODULE" -ForegroundColor Cyan
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

    # Step 2: Get venues to book
    Write-Host "`nSTEP 2: Fetching available venues..." -ForegroundColor Yellow
    $venues = Invoke-RestMethod -Uri "http://localhost:5000/api/customer/venues" -Method GET
    $venueToBook = $venues.data[0]  # Book the first venue
    Write-Host "✅ Found venue: $($venueToBook.name)" -ForegroundColor Green

    # Step 3: Create a booking
    Write-Host "`nSTEP 3: Creating booking request..." -ForegroundColor Yellow
    $tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    
    $bookingBody = @{
        venueId = $venueToBook._id
        eventDate = $tomorrow
        guestCount = 100
        specialRequests = "Need vegetarian food options and separate seating area"
    } | ConvertTo-Json

    $booking = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" `
        -Method POST `
        -Headers @{ 
            "Authorization" = "Bearer $customerToken"
            "Content-Type" = "application/json" 
        } `
        -Body $bookingBody

    Write-Host "✅ Booking created!" -ForegroundColor Green
    Write-Host "  Booking ID: $($booking.data._id)"
    Write-Host "  Status: $($booking.data.status)"
    Write-Host "  Event Date: $($booking.data.eventDate)"
    $bookingId = $booking.data._id

    # Step 4: Get customer's bookings
    Write-Host "`nSTEP 4: Getting customer's bookings..." -ForegroundColor Yellow
    $customerBookings = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/customer" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $customerToken" }

    Write-Host "✅ Found $($customerBookings.count) bookings" -ForegroundColor Green

    # Step 5: Login as vendor to respond to booking
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

    # Step 6: Get vendor's bookings
    Write-Host "`nSTEP 6: Getting vendor's bookings..." -ForegroundColor Yellow
    $vendorBookings = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/vendor" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $vendorToken" }

    Write-Host "✅ Found $($vendorBookings.count) bookings" -ForegroundColor Green
    Write-Host "Stats: Pending=$($vendorBookings.stats.pending), Approved=$($vendorBookings.stats.approved)"

    # Step 7: Approve the booking
    Write-Host "`nSTEP 7: Approving the booking..." -ForegroundColor Yellow
    $approveBody = @{
        status = "approved"
        vendorNotes = "Looking forward to hosting your event!"
    } | ConvertTo-Json

    $approvedBooking = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/$bookingId/status" `
        -Method PUT `
        -Headers @{ 
            "Authorization" = "Bearer $vendorToken"
            "Content-Type" = "application/json" 
        } `
        -Body $approveBody

    Write-Host "✅ Booking approved!" -ForegroundColor Green
    Write-Host "  New Status: $($approvedBooking.data.status)"
    Write-Host "  Vendor Notes: $($approvedBooking.data.vendorNotes)"

    # Step 8: Check booking details as customer
    Write-Host "`nSTEP 8: Getting booking details as customer..." -ForegroundColor Yellow
    $bookingDetails = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/$bookingId" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $customerToken" }

    Write-Host "✅ Booking details retrieved" -ForegroundColor Green
    Write-Host "  Venue: $($bookingDetails.data.venue.name)"
    Write-Host "  Status: $($bookingDetails.data.status)"
    Write-Host "  Total Price: Rs. $($bookingDetails.data.totalPrice)"

    # Step 9: Test booking stats (admin)
    Write-Host "`nSTEP 9: Getting booking stats as admin..." -ForegroundColor Yellow
    $adminLogin = @{
        email = "admin@smartwed.com"
        password = "admin123"
    } | ConvertTo-Json

    $admin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $adminLogin

    $adminToken = $admin.data.token

    $stats = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/stats" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $adminToken" }

    Write-Host "✅ Stats retrieved!" -ForegroundColor Green
    Write-Host "  Total Bookings: $($stats.data.total)"
    Write-Host "  Pending: $($stats.data.pending)"
    Write-Host "  Approved: $($stats.data.approved)"
    Write-Host "  Completed: $($stats.data.completed)"

    Write-Host "`n====================================" -ForegroundColor Green
    Write-Host "   ALL BOOKING TESTS PASSED!" -ForegroundColor Green
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