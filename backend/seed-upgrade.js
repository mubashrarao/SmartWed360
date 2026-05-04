const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Venue = require('./models/Venue');

dotenv.config();

async function upgradeVenues() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const venues = await Venue.find();
    
    for (const venue of venues) {
      // Add event types if not present
      if (!venue.eventTypes || venue.eventTypes.length === 0) {
        venue.eventTypes = [
          {
            type: 'mehendi',
            name: 'Mehendi Ceremony',
            timeSlots: [
              { timeType: 'day', price: venue.basePrice * 0.7, startTime: '10:00', endTime: '17:00' },
              { timeType: 'night', price: venue.basePrice * 1, startTime: '18:00', endTime: '23:00' }
            ]
          },
          {
            type: 'barat',
            name: 'Barat (Wedding)',
            timeSlots: [
              { timeType: 'day', price: venue.basePrice * 0.8, startTime: '11:00', endTime: '16:00' },
              { timeType: 'night', price: venue.basePrice * 1.2, startTime: '19:00', endTime: '00:00' }
            ]
          },
          {
            type: 'walima',
            name: 'Walima (Reception)',
            timeSlots: [
              { timeType: 'day', price: venue.basePrice * 0.8, startTime: '12:00', endTime: '17:00' },
              { timeType: 'night', price: venue.basePrice * 1.1, startTime: '18:00', endTime: '23:00' }
            ]
          }
        ];
      }
      
      // Add facilities if not present
      if (!venue.facilities || venue.facilities.length === 0) {
        venue.facilities = [
          { name: 'Professional Decor', description: 'Full event decoration setup', price: 50000, category: 'decor' },
          { name: 'DJ & Sound System', description: 'Professional DJ with sound system', price: 30000, category: 'music' },
          { name: 'Photography Package', description: 'Professional photography (4 hours)', price: 40000, category: 'photography' },
          { name: 'Fireworks Display', description: '10-minute fireworks show', price: 25000, category: 'fireworks' },
          { name: 'Drone Coverage', description: 'Aerial drone videography', price: 20000, category: 'photography' },
          { name: 'Valet Parking', description: 'Valet parking service', price: 15000, category: 'transport' }
        ];
      }
      
      await venue.save();
      console.log(`✅ Upgraded venue: ${venue.name}`);
    }const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Venue = require('./models/Venue');

dotenv.config();

async function upgradeVenues() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const venues = await Venue.find();
    console.log(`Found ${venues.length} venues to upgrade`);

    if (venues.length === 0) {
      console.log('No venues found. Please add some venues first.');
      await mongoose.disconnect();
      return;
    }
    
    let upgradedCount = 0;
    
    for (const venue of venues) {
      let updated = false;
      
      // Add basePrice if missing (use existing price)
      if (!venue.basePrice && venue.price) {
        venue.basePrice = venue.price;
        updated = true;
        console.log(`  Added basePrice: ${venue.basePrice} for ${venue.name}`);
      }
      
      // Add event types if not present
      if (!venue.eventTypes || venue.eventTypes.length === 0) {
        const basePrice = venue.basePrice || venue.price || 100000;
        
        venue.eventTypes = [
          {
            type: 'mehendi',
            name: 'Mehendi Ceremony',
            timeSlots: [
              { timeType: 'day', price: Math.round(basePrice * 0.6), startTime: '10:00', endTime: '17:00' },
              { timeType: 'night', price: Math.round(basePrice * 0.8), startTime: '18:00', endTime: '23:00' }
            ]
          },
          {
            type: 'barat',
            name: 'Barat (Wedding)',
            timeSlots: [
              { timeType: 'day', price: Math.round(basePrice * 0.8), startTime: '11:00', endTime: '16:00' },
              { timeType: 'night', price: Math.round(basePrice * 1.0), startTime: '19:00', endTime: '00:00' }
            ]
          },
          {
            type: 'walima',
            name: 'Walima (Reception)',
            timeSlots: [
              { timeType: 'day', price: Math.round(basePrice * 0.7), startTime: '12:00', endTime: '17:00' },
              { timeType: 'night', price: Math.round(basePrice * 0.9), startTime: '18:00', endTime: '23:00' }
            ]
          },
          {
            type: 'bridal_shower',
            name: 'Bridal Shower',
            timeSlots: [
              { timeType: 'day', price: Math.round(basePrice * 0.5), startTime: '11:00', endTime: '16:00' },
              { timeType: 'night', price: Math.round(basePrice * 0.7), startTime: '18:00', endTime: '22:00' }
            ]
          },
          {
            type: 'birthday',
            name: 'Birthday Party',
            timeSlots: [
              { timeType: 'day', price: Math.round(basePrice * 0.4), startTime: '12:00', endTime: '17:00' },
              { timeType: 'night', price: Math.round(basePrice * 0.6), startTime: '18:00', endTime: '23:00' }
            ]
          },
          {
            type: 'get_together',
            name: 'Get Together',
            timeSlots: [
              { timeType: 'day', price: Math.round(basePrice * 0.3), startTime: '10:00', endTime: '16:00' },
              { timeType: 'night', price: Math.round(basePrice * 0.5), startTime: '17:00', endTime: '22:00' }
            ]
          }
        ];
        updated = true;
        console.log(`  Added event types for ${venue.name}`);
      }
      
      // Add facilities if not present
      if (!venue.facilities || venue.facilities.length === 0) {
        venue.facilities = [
          { name: 'Professional Decor', description: 'Full event decoration setup', price: 50000, category: 'decor', isAvailable: true },
          { name: 'DJ & Sound System', description: 'Professional DJ with sound system', price: 30000, category: 'music', isAvailable: true },
          { name: 'Photography Package', description: 'Professional photography (4 hours)', price: 40000, category: 'photography', isAvailable: true },
          { name: 'Fireworks Display', description: '10-minute fireworks show', price: 25000, category: 'fireworks', isAvailable: true },
          { name: 'Drone Coverage', description: 'Aerial drone videography', price: 20000, category: 'photography', isAvailable: true },
          { name: 'Valet Parking', description: 'Valet parking service', price: 15000, category: 'transport', isAvailable: true },
          { name: 'Catering Service', description: 'Premium catering service', price: 80000, category: 'catering', isAvailable: true },
          { name: 'Lighting Setup', description: 'Professional lighting', price: 25000, category: 'lighting', isAvailable: true }
        ];
        updated = true;
        console.log(`  Added facilities for ${venue.name}`);
      }
      
      if (updated) {
        await venue.save();
        upgradedCount++;
        console.log(`✅ Upgraded: ${venue.name}`);
      } else {
        console.log(`⏭️ Already upgraded: ${venue.name}`);
      }
    }
    
    console.log(`\n✅ Upgrade complete! Upgraded ${upgradedCount} venues.`);
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\n💡 Tip: Make sure you have venues in your database first.');
    await mongoose.disconnect();
  }
}

upgradeVenues();
    
    console.log('All venues upgraded successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

upgradeVenues();