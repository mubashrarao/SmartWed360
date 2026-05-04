const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Venue = require('./models/Venue');
const Category = require('./models/Category');

dotenv.config();

async function createNewVenues() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get a vendor user (use your existing vendor)
    const vendor = await User.findOne({ role: 'vendor', status: 'active' });
    
    if (!vendor) {
      console.log('❌ No active vendor found. Please create a vendor first.');
      console.log('   Register as vendor and get approved by admin.');
      await mongoose.disconnect();
      return;
    }

    // Get categories
    const categories = await Category.find();
    const weddingHallCategory = categories.find(c => c.name === 'Wedding Hall') || categories[0];
    
    if (!weddingHallCategory) {
      console.log('❌ No categories found. Please create categories first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`👤 Using vendor: ${vendor.name}`);
    console.log(`📁 Using category: ${weddingHallCategory.name}`);

    // New venues with enhanced features
    const venues = [
      {
        name: "Grand Pearl Wedding Hall",
        description: "A luxurious wedding hall with crystal chandeliers, marble flooring, and a grand staircase. Perfect for fairy-tale weddings with capacity for 800 guests. Features include separate bridal suite, valet parking, and premium catering services.",
        basePrice: 350000,
        capacity: 800,
        city: "Islamabad",
        address: "Blue Area, Main Boulevard, Islamabad",
        contactPhone: "0300-1112223",
        contactEmail: "info@grandpearl.com",
        amenities: ["Parking", "AC", "Bridal Room", "Sound System", "Catering", "Valet Service", "WiFi", "Security"],
        images: [],
        status: "active",
        featured: true,
        eventTypes: [
          {
            type: "mehendi",
            name: "Mehendi Ceremony",
            timeSlots: [
              { timeType: "day", price: 180000, startTime: "10:00", endTime: "17:00" },
              { timeType: "night", price: 250000, startTime: "18:00", endTime: "23:00" }
            ]
          },
          {
            type: "barat",
            name: "Barat (Wedding)",
            timeSlots: [
              { timeType: "day", price: 250000, startTime: "11:00", endTime: "16:00" },
              { timeType: "night", price: 350000, startTime: "19:00", endTime: "00:00" }
            ]
          },
          {
            type: "walima",
            name: "Walima (Reception)",
            timeSlots: [
              { timeType: "day", price: 220000, startTime: "12:00", endTime: "17:00" },
              { timeType: "night", price: 300000, startTime: "18:00", endTime: "23:00" }
            ]
          },
          {
            type: "birthday",
            name: "Birthday Party",
            timeSlots: [
              { timeType: "day", price: 120000, startTime: "12:00", endTime: "17:00" },
              { timeType: "night", price: 180000, startTime: "18:00", endTime: "23:00" }
            ]
          }
        ],
        facilities: [
          { name: "Professional Decor", description: "Full event decoration with floral arrangements", price: 50000, category: "decor", isAvailable: true },
          { name: "DJ & Sound System", description: "Professional DJ with high-quality sound system", price: 30000, category: "music", isAvailable: true },
          { name: "Photography Package", description: "Professional photography (4 hours)", price: 40000, category: "photography", isAvailable: true },
          { name: "Drone Coverage", description: "Aerial drone videography", price: 20000, category: "photography", isAvailable: true },
          { name: "Fireworks Display", description: "10-minute fireworks show", price: 25000, category: "fireworks", isAvailable: true },
          { name: "Valet Parking", description: "Valet parking service", price: 15000, category: "transport", isAvailable: true },
          { name: "Catering Service", description: "Premium catering service for 500 guests", price: 200000, category: "catering", isAvailable: true }
        ]
      },
      {
        name: "Emerald Garden Resort",
        description: "Beautiful outdoor garden venue with lush greenery, water features, and outdoor seating. Ideal for daytime weddings and evening receptions. Perfect for nature-loving couples.",
        basePrice: 250000,
        capacity: 500,
        city: "Rawalpindi",
        address: "Golf City, Rawalpindi",
        contactPhone: "0300-2223334",
        contactEmail: "info@emeraldgarden.com",
        amenities: ["Parking", "Outdoor Setup", "Gazebo", "Lighting", "Generator", "Catering", "Backup Power"],
        images: [],
        status: "active",
        featured: true,
        eventTypes: [
          {
            type: "mehendi",
            name: "Mehendi Ceremony",
            timeSlots: [
              { timeType: "day", price: 120000, startTime: "10:00", endTime: "17:00" },
              { timeType: "night", price: 180000, startTime: "18:00", endTime: "23:00" }
            ]
          },
          {
            type: "barat",
            name: "Barat (Wedding)",
            timeSlots: [
              { timeType: "day", price: 180000, startTime: "11:00", endTime: "16:00" },
              { timeType: "night", price: 250000, startTime: "19:00", endTime: "00:00" }
            ]
          },
          {
            type: "walima",
            name: "Walima (Reception)",
            timeSlots: [
              { timeType: "day", price: 150000, startTime: "12:00", endTime: "17:00" },
              { timeType: "night", price: 220000, startTime: "18:00", endTime: "23:00" }
            ]
          }
        ],
        facilities: [
          { name: "Outdoor Decor", description: "Garden-themed decoration", price: 40000, category: "decor", isAvailable: true },
          { name: "Live Music", description: "Live band performance", price: 35000, category: "music", isAvailable: true },
          { name: "Photography Package", description: "Professional photography", price: 35000, category: "photography", isAvailable: true },
          { name: "BBQ Setup", description: "Live BBQ station", price: 45000, category: "catering", isAvailable: true }
        ]
      },
      {
        name: "Crystal Palace Banquet",
        description: "Premium venue with crystal chandeliers, European architecture, and luxury finishes. Perfect for high-end weddings and corporate events.",
        basePrice: 450000,
        capacity: 1000,
        city: "Islamabad",
        address: "Sector E-7, Islamabad",
        contactPhone: "0300-3334445",
        contactEmail: "info@crystalpalace.com",
        amenities: ["Valet Parking", "AC", "Bridal Suite", "Groom's Room", "CCTV", "Sound System", "VIP Lounge", "Elevator"],
        images: [],
        status: "active",
        featured: true,
        eventTypes: [
          {
            type: "barat",
            name: "Barat (Wedding)",
            timeSlots: [
              { timeType: "day", price: 300000, startTime: "11:00", endTime: "16:00" },
              { timeType: "night", price: 450000, startTime: "19:00", endTime: "00:00" }
            ]
          },
          {
            type: "walima",
            name: "Walima (Reception)",
            timeSlots: [
              { timeType: "day", price: 280000, startTime: "12:00", endTime: "17:00" },
              { timeType: "night", price: 400000, startTime: "18:00", endTime: "23:00" }
            ]
          },
          {
            type: "corporate",
            name: "Corporate Event",
            timeSlots: [
              { timeType: "day", price: 200000, startTime: "09:00", endTime: "17:00" },
              { timeType: "night", price: 300000, startTime: "18:00", endTime: "23:00" }
            ]
          }
        ],
        facilities: [
          { name: "Luxury Decor", description: "Premium decoration with fresh flowers", price: 80000, category: "decor", isAvailable: true },
          { name: "Premium Sound System", description: "High-end sound system", price: 50000, category: "music", isAvailable: true },
          { name: "Professional Photography", description: "Full-day photography", price: 70000, category: "photography", isAvailable: true },
          { name: "Fireworks Display", description: "Grand fireworks show", price: 50000, category: "fireworks", isAvailable: true },
          { name: "Drone Coverage", description: "Complete aerial coverage", price: 30000, category: "photography", isAvailable: true }
        ]
      }
    ];

    let createdCount = 0;

    for (const venueData of venues) {
      // Check if venue already exists
      const existing = await Venue.findOne({ name: venueData.name });
      if (existing) {
        console.log(`⚠️ Venue "${venueData.name}" already exists. Skipping.`);
        continue;
      }

      const venue = new Venue({
        ...venueData,
        vendor: vendor._id,
        category: weddingHallCategory._id,
        price: venueData.basePrice // For backward compatibility
      });

      await venue.save();
      createdCount++;
      console.log(`✅ Created: ${venueData.name}`);
    }

    console.log(`\n🎉 Successfully created ${createdCount} new venues!`);
    console.log(`\n📋 Summary:`);
    console.log(`   - Total venues now: ${await Venue.countDocuments()}`);
    console.log(`   - Each venue has event types and facilities`);

    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

createNewVenues();