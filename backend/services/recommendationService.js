const Venue = require('../models/Venue');
const Booking = require('../models/Booking');

class RecommendationService {
  
  // Get personalized recommendations based on user preferences
  async getRecommendations(customerId, preferences = {}) {
    try {
      const {
        eventType,
        timeSlot,
        budget,
        city,
        guestCount,
        requiredFacilities,
        limit = 6
      } = preferences;

      console.log('Getting recommendations for:', { customerId, preferences });

      // Build base query for active venues
      const query = { status: 'active' };
      if (city) query.city = { $regex: city, $options: 'i' };

      // Get all matching venues
      let venues = await Venue.find(query)
        .populate('category', 'name')
        .lean();

      if (venues.length === 0) {
        console.log('No venues found matching basic criteria');
        return { recommendations: [], totalCount: 0, basedOn: preferences };
      }

      // Get customer's booking history for personalization
      const customerBookings = await Booking.find({ 
        customer: customerId,
        status: { $in: ['approved', 'completed'] }
      }).populate('venue');

      // Score each venue
      const scoredVenues = venues.map(venue => {
        let score = 0;
        const reasons = [];
        let venuePrice = null;

        // 1. EVENT TYPE & TIME SLOT MATCH (40% weight)
        if (eventType && venue.eventTypes) {
          const eventTypeData = venue.eventTypes.find(et => et.type === eventType);
          if (eventTypeData && timeSlot) {
            const timeSlotData = eventTypeData.timeSlots?.find(ts => ts.timeType === timeSlot);
            if (timeSlotData) {
              venuePrice = timeSlotData.price;
              score += 40;
              reasons.push(`Supports ${eventTypeData.name} at ${timeSlot === 'day' ? 'Day' : 'Night'} time`);
            } else {
              score -= 10;
            }
          } else if (eventTypeData) {
            // Has event type but time slot not specified
            venuePrice = eventTypeData.timeSlots?.[0]?.price || venue.basePrice;
            score += 20;
            reasons.push(`Available for ${eventTypeData.name}`);
          }
        }

        // 2. BUDGET MATCH (25% weight)
        if (budget && venuePrice) {
          if (venuePrice <= budget) {
            const percentUnder = ((budget - venuePrice) / budget) * 100;
            score += 25;
            if (percentUnder > 20) {
              reasons.push('Well under your budget');
            } else {
              reasons.push('Within your budget');
            }
          } else if (venuePrice <= budget * 1.2) {
            score += 15;
            reasons.push('Slightly above budget');
          } else {
            score -= 10;
          }
        } else if (budget && venue.basePrice) {
          if (venue.basePrice <= budget) {
            score += 20;
            reasons.push('Base price within budget');
          }
        }

        // 3. CAPACITY MATCH (15% weight)
        if (guestCount) {
          if (venue.capacity >= guestCount) {
            const ratio = guestCount / venue.capacity;
            if (ratio > 0.8) {
              score += 15;
              reasons.push('Perfect size for your guest list');
            } else if (ratio > 0.5) {
              score += 12;
              reasons.push('Spacious venue for your guests');
            } else {
              score += 8;
              reasons.push('Very spacious venue');
            }
          } else {
            score -= 20;
          }
        }

        // 4. FACILITIES MATCH (10% weight)
        if (requiredFacilities && requiredFacilities.length > 0 && venue.facilities) {
          const availableFacilities = venue.facilities.filter(f => 
            requiredFacilities.some(req => req.toLowerCase() === f.name.toLowerCase()) && f.isAvailable
          );
          const matchRate = (availableFacilities.length / requiredFacilities.length) * 10;
          score += Math.min(10, matchRate);
          if (matchRate > 7) {
            reasons.push('Has most of your required facilities');
          } else if (matchRate > 4) {
            reasons.push('Has some of your required facilities');
          }
        }

        // 5. LOCATION PREFERENCE (5% weight)
        if (city && venue.city.toLowerCase() === city.toLowerCase()) {
          score += 5;
          reasons.push('Exactly in your preferred city');
        }

        // 6. HISTORY-BASED PERSONALIZATION (5% weight)
        if (customerBookings.length > 0) {
          const preferredCities = [...new Set(customerBookings.map(b => b.venue?.city))];
          const preferredEventTypes = [...new Set(customerBookings.map(b => b.eventType))];
          
          if (preferredCities.includes(venue.city)) {
            score += 3;
            reasons.push('You have booked in this city before');
          }
          if (preferredEventTypes.includes(eventType)) {
            score += 2;
            reasons.push('You have booked similar events before');
          }
        }

        // 7. FEATURED BOOST (additional)
        if (venue.featured) {
          score += 5;
          reasons.push('Featured venue');
        }

        return {
          ...venue,
          calculatedPrice: venuePrice,
          recommendationScore: Math.min(100, Math.round(score)),
          recommendationReasons: reasons.slice(0, 4)
        };
      });

      // Filter out venues with negative scores (can't accommodate guests)
      const validVenues = scoredVenues.filter(v => v.recommendationScore > 0);
      
      // Sort by score (highest first)
      const sortedVenues = validVenues.sort((a, b) => b.recommendationScore - a.recommendationScore);

      console.log(`Found ${sortedVenues.length} recommendations out of ${venues.length} venues`);

      // Return top recommendations
      return {
        recommendations: sortedVenues.slice(0, limit),
        totalCount: sortedVenues.length,
        basedOn: {
          eventType: eventType || 'Not specified',
          timeSlot: timeSlot === 'day' ? 'Day Time' : timeSlot === 'night' ? 'Night Time' : 'Not specified',
          budget: budget ? `Rs. ${parseInt(budget).toLocaleString()}` : 'Not specified',
          city: city || 'Any city',
          guestCount: guestCount || 'Not specified'
        }
      };
    } catch (error) {
      console.error('Recommendation service error:', error);
      throw error;
    }
  }

  // Get top picks for customer (without explicit preferences)
  async getTopPicks(customerId, limit = 4) {
    try {
      // Get customer's booking history
      const customerBookings = await Booking.find({ 
        customer: customerId,
        status: { $in: ['approved', 'completed'] }
      }).populate('venue');

      // If customer has history, use preferences from their last booking
      if (customerBookings.length > 0) {
        const lastBooking = customerBookings[customerBookings.length - 1];
        return this.getRecommendations(customerId, {
          city: lastBooking.venue?.city,
          budget: lastBooking.totalPrice,
          eventType: lastBooking.eventType,
          guestCount: lastBooking.guestCount,
          limit
        });
      }

      // For new customers, show featured and popular venues
      const topPicks = await Venue.find({ status: 'active', featured: true })
        .populate('category', 'name')
        .limit(limit)
        .lean();

      // If no featured venues, show recent venues
      let picks = topPicks;
      if (picks.length === 0) {
        picks = await Venue.find({ status: 'active' })
          .populate('category', 'name')
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean();
      }

      // Add default reasons
      const picksWithReasons = picks.map(venue => ({
        ...venue,
        recommendationScore: 85,
        recommendationReasons: ['Popular choice', 'Highly rated venue', 'Featured']
      }));

      return {
        recommendations: picksWithReasons,
        totalCount: picksWithReasons.length,
        basedOn: {
          type: 'Popular & Featured Venues'
        }
      };
    } catch (error) {
      console.error('Get top picks error:', error);
      throw error;
    }
  }
}

module.exports = new RecommendationService();