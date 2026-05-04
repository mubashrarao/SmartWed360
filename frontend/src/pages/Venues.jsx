import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  FunnelIcon, 
  MapPinIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Venues = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filtersData, setFiltersData] = useState({
    cities: [],
    minPriceRange: 0,
    maxPriceRange: 1000000
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    capacity: searchParams.get('minCapacity') || '',
    category: searchParams.get('category') || ''
  });

  useEffect(() => {
    fetchCategories();
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchVenues();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/customer/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchFiltersData = async () => {
    try {
      const response = await api.get('/customer/venues?limit=1');
      if (response.data.filters) {
        setFiltersData({
          cities: response.data.filters.cities || [],
          minPriceRange: response.data.filters.minPrice || 0,
          maxPriceRange: response.data.filters.maxPrice || 1000000
        });
      }
    } catch (error) {
      console.error('Failed to fetch filters data:', error);
    }
  };

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      const response = await api.get(`/customer/venues?${params}`);
      setVenues(response.data.data || []);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Failed to fetch venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        // Convert filter names to match API expectations
        if (key === 'capacity') {
          params.append('minCapacity', value);
        } else {
          params.append(key, value);
        }
      }
    });
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      minPrice: '',
      maxPrice: '',
      capacity: '',
      category: ''
    });
    setSearchParams({});
    setShowFilters(false);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(v => v && v !== '');

  if (loading && venues.length === 0) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-900 mb-4">
            Wedding Venues
          </h1>
          <p className="text-xl text-gray-600">
            Discover {pagination.total} beautiful venues for your special day
          </p>
        </motion.div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filters.city && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-100 text-primary-900 rounded-full text-sm">
                City: {filters.city}
                <button onClick={() => setFilters({...filters, city: ''})} className="hover:text-red-500">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-100 text-primary-900 rounded-full text-sm">
                Price: Rs. {filters.minPrice || 0} - {filters.maxPrice || 'Any'}
                <button onClick={() => setFilters({...filters, minPrice: '', maxPrice: ''})} className="hover:text-red-500">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
            {filters.capacity && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-100 text-primary-900 rounded-full text-sm">
                Guests: {filters.capacity}+
                <button onClick={() => setFilters({...filters, capacity: ''})} className="hover:text-red-500">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-100 text-primary-900 rounded-full text-sm">
                Category: {categories.find(c => c._id === filters.category)?.name}
                <button onClick={() => setFilters({...filters, category: ''})} className="hover:text-red-500">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
            <button onClick={clearFilters} className="text-sm text-gold-500 hover:text-gold-600 ml-2">
              Clear all
            </button>
          </div>
        )}

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <FunnelIcon className="w-5 h-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`md:w-1/4 ${showFilters ? 'block' : 'hidden md:block'}`}
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-5 h-5 text-gold-500" />
                  Filters
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gold-500 hover:text-gold-600"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* City Filter */}
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
                      <option value="">All Cities</option>
                      {filtersData.cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="input-field"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name} ({cat.venueCount})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (PKR)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500 font-semibold text-sm">Rs.</span>
                      <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        placeholder={`Min ${filtersData.minPriceRange.toLocaleString()}`}
                        className="input-field pl-10"
                      />
                    </div>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500 font-semibold text-sm">Rs.</span>
                      <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        placeholder={`Max ${filtersData.maxPriceRange.toLocaleString()}`}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Guests
                  </label>
                  <div className="relative">
                    <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="capacity"
                      value={filters.capacity}
                      onChange={handleFilterChange}
                      placeholder="Number of guests"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <button
                  onClick={applyFilters}
                  className="w-full btn-gold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>

          {/* Venues Grid */}
          <div className="md:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : venues.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <FunnelIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No venues found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or clear them to see all venues</p>
                <button onClick={clearFilters} className="btn-gold inline-block">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {venues.map((venue, index) => (
                    <motion.div
                      key={venue._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-all"
                      onClick={() => window.location.href = `/venues/${venue._id}`}
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={venue.images?.[0]?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                          alt={venue.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {venue.featured && (
                          <div className="absolute top-4 right-4 bg-gold-500 text-primary-900 px-3 py-1 rounded-full text-sm font-semibold">
                            Featured
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-primary-900 mb-2 group-hover:text-gold-500 transition-colors line-clamp-1">
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
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            <span className="text-gold-500 font-semibold">Rs.</span>
                            <span className="font-bold text-primary-900">{venue.basePrice?.toLocaleString()}</span>
                          </div>
                          <span className="text-sm text-gray-400">starting price</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gold-50 flex items-center gap-1"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                      Previous
                    </button>
                    {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg ${
                            pagination.page === pageNum
                              ? 'bg-gold-500 text-primary-900'
                              : 'bg-white border border-gray-300 hover:bg-gold-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gold-50 flex items-center gap-1"
                    >
                      Next
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Venues;