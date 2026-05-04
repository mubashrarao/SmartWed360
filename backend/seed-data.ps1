Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   SEEDING SAMPLE VENUE DATA" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Login as vendor (use your approved vendor)
Write-Host "`nLogging in as vendor..." -ForegroundColor Yellow

$vendorLogin = @{
    email = "vendor@test.com"
    password = "123456"
} | ConvertTo-Json

try {
    $vendor = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $vendorLogin

    $vendorToken = $vendor.data.token
    Write-Host "PASSED: Vendor logged in" -ForegroundColor Green

    # Get categories
    Write-Host "`nFetching categories..." -ForegroundColor Yellow
    $categories = Invoke-RestMethod -Uri "http://localhost:5000/api/customer/categories" -Method GET
    
    if ($categories.data.Count -eq 0) {
        Write-Host "ERROR: No categories found. Please create categories first." -ForegroundColor Red
        exit
    }
    
    $categoryId = $categories.data[0]._id
    Write-Host "Using category: $($categories.data[0].name)" -ForegroundColor Gray

    # Sample venues data WITH CONTACT PHONE ADDED
    $venues = @(
        @{
            name = "Grand Pearl Wedding Hall"
            description = "Luxurious wedding hall with modern amenities, perfect for grand celebrations. Features include spacious hall, bridal room, parking, and catering services."
            price = 250000
            capacity = 800
            city = "Islamabad"
            address = "Blue Area, Main Boulevard, Islamabad"
            contactPhone = "+92 300 1112223"
            amenities = @("Parking", "AC", "Bridal Room", "Sound System", "Catering", "Decoration")
            category = $categoryId
            vendor = $vendor.data._id
        },
        @{
            name = "Emerald Garden Resort"
            description = "Beautiful outdoor garden venue with lush greenery and elegant setup. Ideal for outdoor weddings and receptions."
            price = 180000
            capacity = 500
            city = "Rawalpindi"
            address = "Golf City, Rawalpindi"
            contactPhone = "+92 300 2223334"
            amenities = @("Parking", "Outdoor Setup", "Gazebo", "Lighting", "Generator Backup")
            category = $categoryId
            vendor = $vendor.data._id
        },
        @{
            name = "Royal Banquet Hall"
            description = "Elegant banquet hall with traditional and modern fusion design. Separate halls for men and women."
            price = 150000
            capacity = 400
            city = "Islamabad"
            address = "F-7 Markaz, Islamabad"
            contactPhone = "+92 300 3334445"
            amenities = @("Parking", "AC", "Separate Entrances", "Sound System", "Waiting Area")
            category = $categoryId
            vendor = $vendor.data._id
        },
        @{
            name = "Sunset Marquee"
            description = "Spacious marquee venue with beautiful sunset views. Customizable setup according to theme."
            price = 120000
            capacity = 600
            city = "Wah Cantt"
            address = "Taxila Road, Wah Cantt"
            contactPhone = "+92 300 4445556"
            amenities = @("Parking", "Generator", "Stage", "Catering Area", "Washrooms")
            category = $categoryId
            vendor = $vendor.data._id
        },
        @{
            name = "Crystal Palace"
            description = "Premium venue with crystal chandeliers and European architecture. Perfect for high-end weddings."
            price = 350000
            capacity = 1000
            city = "Islamabad"
            address = "Sector E-7, Islamabad"
            contactPhone = "+92 300 5556667"
            amenities = @("Valet Parking", "AC", "Bridal Suite", "Groom's Room", "CCTV", "Sound System")
            category = $categoryId
            vendor = $vendor.data._id
        }
    )

    Write-Host "`nCreating venues..." -ForegroundColor Yellow

    foreach ($venue in $venues) {
        $venueBody = $venue | ConvertTo-Json -Depth 3
        
        try {
            $result = Invoke-RestMethod -Uri "http://localhost:5000/api/vendor/venues" `
                -Method POST `
                -Headers @{ 
                    "Authorization" = "Bearer $vendorToken"
                    "Content-Type" = "application/json" 
                } `
                -Body $venueBody
            
            Write-Host "  PASSED: $($venue.name)" -ForegroundColor Green
        } catch {
            Write-Host "  FAILED: $($venue.name) - $($_.Exception.Message)" -ForegroundColor Red
            
            # Try to get more error details
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $reader.BaseStream.Position = 0
                $reader.DiscardBufferedData()
                $responseBody = $reader.ReadToEnd()
                Write-Host "    Error details: $responseBody" -ForegroundColor Red
            } catch {
                # Ignore
            }
        }
    }

    Write-Host "`n====================================" -ForegroundColor Green
    Write-Host "   SEEDING COMPLETE!" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green

} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}