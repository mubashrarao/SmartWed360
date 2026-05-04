import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  SunIcon,
  MoonIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const CustomerRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: '',
    timeSlot: '',
    budget: '',
    city: '',
    guests: ''
  });
  const [basedOn, setBasedOn] = useState({});
  const [topPicks, setTopPicks] = useState([]);

  useEffect(() => {
    fetchTopPicks();
    fetchRecommendations();
  }, []);

  const fetchTopPicks = async () => {
    try {
      const response = await api.get('/recommendations/top-picks?limit=3');
      setTopPicks(response.data.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch top picks:', error);
    }
  };

  const fetchRecommendations = async (appliedFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (appliedFilters.budget) params.append('budget', appliedFilters.budget);
      if (appliedFilters.city) params.append('city', appliedFilters.city);
      if (appliedFilters.guests) params.append('guestCount', appliedFilters.guests);
      if (appliedFilters.eventType) params.append('eventType', appliedFilters.eventType);
      if (appliedFilters.timeSlot) params.append('timeSlot', appliedFilters.timeSlot);

      const response = await api.get(`/recommendations?${params}`);
      setRecommendations(response.data.recommendations || []);
      setBasedOn(response.data.basedOn || {});
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRecommendations(filters);
  };

  const clearFilters = () => {
    setFilters({
      eventType: '',
      timeSlot: '',
      budget: '',
      city: '',
      guests: ''
    });
    fetchRecommendations({
      eventType: '',
      timeSlot: '',
      budget: '',
      city: '',
      guests: ''
    });
  };

  const eventTypes = [
    { value: '', label: 'Any Event' },
    { value: 'mehendi', label: 'Mehendi Ceremony' },
    { value: 'barat', label: 'Barat (Wedding)' },
    { value: 'walima', label: 'Walima (Reception)' },
    { value: 'bridal_shower', label: 'Bridal Shower' },
    { value: 'birthday', label: 'Birthday Party' },
    { value: 'get_together', label: 'Get Together' }
  ];

  const timeSlots = [
    { value: '', label: 'Any Time' },
    { value: 'day', label: 'Day Time', icon: SunIcon },
    { value: 'night', label: 'Night Time', icon: MoonIcon }
  ];

  const cities = ['', 'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Wah Cantt'];

  if (loading && recommendations.length === 0 && topPicks.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <SparklesIcon className="w-16 h-16 text-gold-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-900 mb-4">
            Personalized <span className="text-gold-500">Recommendations</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {user?.name}, find venues perfectly matched to your preferences
          </p>
        </motion.div>

        {/* Top Picks Section */}
        {topPicks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-heading font-bold text-primary-900 mb-6 flex items-center gap-2">
              <StarIcon className="w-6 h-6 text-gold-500" />
              Top Picks for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topPicks.map((venue) => (
                <Link
                  key={venue._id}
                  to={`/venues/${venue._id}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={venue.images?.[0]?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-gold-500 text-primary-900 px-3 py-1 rounded-full text-xs font-bold">
                      Top Pick
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-primary-900 mb-2">{venue.name}</h3>
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                      <MapPinIcon className="w-4 h-4 text-gold-500" />
                      <span>{venue.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gold-500 font-semibold">Rs.</span>
                      <span className="font-bold text-primary-900">{venue.basePrice?.toLocaleString()}</span>
                      <span className="text-sm text-gray-400">starting price</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filter Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  name="eventType"
                  value={filters.eventType}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  {eventTypes.map(et => (
                    <option key={et.value} value={et.value}>{et.label}</option>
                  ))}
                </select>
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot
                </label>
                <select
                  name="timeSlot"
                  value={filters.timeSlot}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  {timeSlots.map(ts => (
                    <option key={ts.value} value={ts.value}>{ts.label}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    className="input-field pl-10"
                  >
                    {cities.map(city => (
                      <option key={city || 'any'} value={city}>{city || 'Any City'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Budget (PKR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500 font-semibold text-sm">Rs.</span>
                  <input
                    type="number"
                    name="budget"
                    value={filters.budget}
                    onChange={handleFilterChange}
                    placeholder="Any budget"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Guests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests
                </label>
                <div className="relative">
                  <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="guests"
                    value={filters.guests}
                    onChange={handleFilterChange}
                    placeholder="Any size"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
              <button
                type="submit"
                className="btn-gold flex items-center gap-2"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                Get Recommendations
              </button>
            </div>
          </form>
        </motion.div>

        {/* Based On Info */}
        {basedOn && Object.keys(basedOn).length > 0 && basedOn.eventType !== 'Not specified' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-gold-50 border border-gold-500 rounded-lg"
          >
            <p className="text-primary-900">
              <span className="font-semibold">Recommendations based on:</span>{' '}
              {basedOn.eventType && basedOn.eventType !== 'Not specified' && `Event: ${basedOn.eventType}, `}
              {basedOn.timeSlot && `Time: ${basedOn.timeSlot}, `}
              {basedOn.budget && `Budget: ${basedOn.budget}, `}
              {basedOn.city && basedOn.city !== 'Any city' && `City: ${basedOn.city}, `}
              {basedOn.guestCount && `Guests: ${basedOn.guestCount}`}
            </p>
          </motion.div>
        )}

        {/* Results */}
        {recommendations.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <SparklesIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No recommendations found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or browse all venues</p>
            <Link to="/venues" className="btn-gold inline-block">
              Browse All Venues
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {recommendations.length > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Found <span className="font-bold text-primary-900">{recommendations.length}</span> venues matching your preferences
                </p>
                <p className="text-sm text-gray-500">Sorted by match score</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((venue, index) => (
                <motion.div
                  key={venue._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-all"
                  onClick={() => window.location.href = `/venues/${venue._id}`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={venue.images?.[0]?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {venue.recommendationScore && (
                      <div className="absolute top-3 left-3 bg-gold-500 text-primary-900 px-3 py-1 rounded-full text-sm font-bold">
                        {venue.recommendationScore}% Match
                      </div>
                    )}
                    {venue.featured && (
                      <div className="absolute top-3 right-3 bg-primary-900 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-primary-900 mb-2 group-hover:text-gold-500">
                      {venue.name}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                      <MapPinIcon className="w-4 h-4 text-gold-500" />
                      <span>{venue.city}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                      <UserGroupIcon className="w-4 h-4 text-gold-500" />
                      <span>Up to {venue.capacity} guests</span>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-gold-500 font-semibold">Rs.</span>
                      <span className="font-bold text-primary-900">{venue.basePrice?.toLocaleString()}</span>
                      <span className="text-sm text-gray-400">starting price</span>
                    </div>

                    {/* Recommendation Reasons */}
                    {venue.recommendationReasons && venue.recommendationReasons.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-primary-900 mb-2">Why we recommend:</p>
                        <ul className="space-y-1">
                          {venue.recommendationReasons.slice(0, 2).map((reason, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-gold-500">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerRecommendations;