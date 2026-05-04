import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, UserGroupIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const SearchBar = ({ compact = false }) => {
  const [searchParams, setSearchParams] = useState({
    city: '',
    budget: '',
    guests: ''
  });
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchParams.city) params.append('city', searchParams.city);
    if (searchParams.budget) params.append('maxPrice', searchParams.budget);
    if (searchParams.guests) params.append('minCapacity', searchParams.guests);
    
    navigate(`/venues?${params.toString()}`);
  };

  if (compact) {
    return (
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="City"
            value={searchParams.city}
            onChange={(e) => setSearchParams({...searchParams, city: e.target.value})}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="bg-gold-500 text-primary-900 px-6 py-3 rounded-lg font-semibold hover:bg-gold-600 transition-colors"
        >
          Search
        </motion.button>
      </form>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSearch}
      className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-gold-500/30"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
          <input
            type="text"
            placeholder="City"
            value={searchParams.city}
            onChange={(e) => setSearchParams({...searchParams, city: e.target.value})}
            className="w-full pl-10 pr-4 py-3 bg-white/20 text-white placeholder-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>

        <div className="relative">
          <CurrencyRupeeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
          <input
            type="number"
            placeholder="Max Budget"
            value={searchParams.budget}
            onChange={(e) => setSearchParams({...searchParams, budget: e.target.value})}
            className="w-full pl-10 pr-4 py-3 bg-white/20 text-white placeholder-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>

        <div className="relative">
          <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
          <input
            type="number"
            placeholder="Guests"
            value={searchParams.guests}
            onChange={(e) => setSearchParams({...searchParams, guests: e.target.value})}
            className="w-full pl-10 pr-4 py-3 bg-white/20 text-white placeholder-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="bg-gold-500 text-primary-900 px-6 py-3 rounded-lg font-semibold hover:bg-gold-600 transition-colors flex items-center justify-center gap-2"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
          Search Venues
        </motion.button>
      </div>
    </motion.form>
  );
};

export default SearchBar;