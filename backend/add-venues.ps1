# add-venues.ps1 - Run this to add 20+ venues
Write-Host "Adding venues to database..." -ForegroundColor Cyan

# Login as vendor first (use your vendor credentials)
$vendorLogin = @{
    email = "grand@venues.com"
    password = "Vendor@2025!"
} | ConvertTo-Json

try {
    $vendor = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $vendorLogin
    
    $token = $vendor.data.token
    Write-Host "✅ Vendor logged in" -ForegroundColor Green

    # Get categories first
    $categories = Invoke-RestMethod -Uri "http://localhost:5000/api/vendor/categories" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    $categoryMap = @{}
    foreach ($cat in $categories.data) {
        $categoryMap[$cat.name] = $cat._id
    }

    # Venues data
    $venues = @(
        @{
            name = "Grand Pearl Wedding Hall"
            description = "Luxurious wedding hall with crystal chandeliers, marble flooring, and grand staircase. Perfect for fairy-tale weddings."
            price = 350000
            capacity = 800
            city = "Islamabad"
            address = "Blue Area, Main Boulevard, Islamabad"
            contactPhone = "0300-1112223"
            amenities = @("Parking", "AC", "Bridal Room", "Sound System", "Catering", "Decoration", "Valet Service")
            category = $categoryMap["Wedding Hall"]
        },
        @{
            name = "Emerald Garden Resort"
            description = "Beautiful garden venue with lush greenery, water features, and outdoor seating. Ideal for daytime weddings."
            price = 180000
            capacity = 500
            city = "Rawalpindi"
            address = "Golf City, Rawalpindi"
            contactPhone = "0300-2223334"
            amenities = @("Parking", "Outdoor Setup", "Gazebo", "Lighting", "Generator", "Catering")
            category = $categoryMap["Lawn / Garden"]
        },
        @{
            name = "Royal Banquet Hall"
            description = "Elegant banquet hall with traditional Pakistani architecture and modern amenities."
            price = 150000
            capacity = 400
            city = "Islamabad"
            address = "F-7 Markaz, Islamabad"
            contactPhone = "0300-3334445"
            amenities = @("Parking", "AC", "Separate Entrances", "Sound System", "Waiting Area", "Catering")
            category = $categoryMap["Banquet Hall"]
        },
        @{
            name = "Crystal Palace"
            description = "Premium venue with European architecture, crystal chandeliers, and luxury finishes."
            price = 450000
            capacity = 1000
            city = "Islamabad"
            address = "Sector E-7, Islamabad"
            contactPhone = "0300-4445556"
            amenities = @("Valet Parking", "AC", "Bridal Suite", "Groom's Room", "CCTV", "Sound System", "VIP Lounge")
            category = $categoryMap["Banquet Hall"]
        },
        @{
            name = "Sunset Marquee"
            description = "Spacious marquee with sunset views, perfect for evening weddings and receptions."
            price = 120000
            capacity = 600
            city = "Wah Cantt"
            address = "Taxila Road, Wah Cantt"
            contactPhone = "0300-5556667"
            amenities = @("Parking", "Generator", "Stage", "Catering Area", "Washrooms", "Lighting")
            category = $categoryMap["Wedding Hall"]
        },
        @{
            name = "Pearl Continental Hotel"
            description = "5-star hotel ballroom with world-class service and amenities."
            price = 500000
            capacity = 800
            city = "Islamabad"
            address = "Club Road, Islamabad"
            contactPhone = "0300-6667778"
            amenities = @("Valet Parking", "AC", "Bridal Suite", "5-star Catering", "Sound System", "Hotel Rooms")
            category = $categoryMap["Hotel Ballroom"]
        },
        @{
            name = "Serena Hotel"
            description = "Luxury hotel venue with stunning views and premium services."
            price = 550000
            capacity = 700
            city = "Islamabad"
            address = "Khayaban-e-Suhrwardy, Islamabad"
            contactPhone = "0300-7778889"
            amenities = @("Valet Parking", "AC", "Luxury Catering", "Bridal Suite", "Spa Services", "Hotel Rooms")
            category = $categoryMap["Hotel Ballroom"]
        },
        @{
            name = "Farmhouse Retreat"
            description = "Spacious farmhouse with pool area and large lawn. Perfect for intimate weddings."
            price = 200000
            capacity = 300
            city = "Rawalpindi"
            address = "Adyala Road, Rawalpindi"
            contactPhone = "0300-8889990"
            amenities = @("Parking", "Swimming Pool", "BBQ Area", "Generator", "Catering", "Event Space")
            category = $categoryMap["Farmhouse"]
        },
        @{
            name = "Hill View Resort"
            description = "Mountain view resort with beautiful scenery and fresh air."
            price = 220000
            capacity = 400
            city = "Murree"
            address = "Mall Road, Murree"
            contactPhone = "0300-9990001"
            amenities = @("Parking", "Mountain View", "Heating", "Catering", "Generator", "Outdoor Space")
            category = $categoryMap["Lawn / Garden"]
        },
        @{
            name = "Seaside Paradise"
            description = "Beachfront venue with ocean views and sunset ceremonies."
            price = 300000
            capacity = 500
            city = "Karachi"
            address = "Sea View, Clifton, Karachi"
            contactPhone = "0300-1112223"
            amenities = @("Parking", "Beach Access", "AC", "Catering", "Sound System", "Outdoor Space")
            category = $categoryMap["Beach Wedding"]
        },
        @{
            name = "Rooftop Heights"
            description = "Modern rooftop venue with panoramic city views."
            price = 180000
            capacity = 250
            city = "Lahore"
            address = "Gulberg, Lahore"
            contactPhone = "0300-2223334"
            amenities = @("Parking", "Rooftop View", "AC", "Catering", "Sound System", "Lighting")
            category = $categoryMap["Rooftop"]
        },
        @{
            name = "Historical Palace"
            description = "Heritage venue with rich history and architectural beauty."
            price = 280000
            capacity = 600
            city = "Lahore"
            address = "Mall Road, Lahore"
            contactPhone = "0300-3334445"
            amenities = @("Parking", "Historical Architecture", "AC", "Catering", "Sound System", "Heritage Walk")
            category = $categoryMap["Historical"]
        }
    )

    $count = 0
    foreach ($venue in $venues) {
        if ($venue.category) {
            $venueBody = $venue | ConvertTo-Json -Depth 3
            try {
                $result = Invoke-RestMethod -Uri "http://localhost:5000/api/vendor/venues" `
                    -Method POST `
                    -Headers @{ 
                        "Authorization" = "Bearer $token"
                        "Content-Type" = "application/json" 
                    } `
                    -Body $venueBody
                $count++
                Write-Host "✅ Added: $($venue.name)" -ForegroundColor Green
            } catch {
                Write-Host "❌ Failed: $($venue.name) - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    Write-Host "`n✅ Successfully added $count venues!" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}