import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPinIcon, UserGroupIcon, CurrencyRupeeIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';

const VenueCard = ({ venue }) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="card group cursor-pointer"
    >
      <Link to={`/venues/${venue._id}`}>
        <div className="relative h-56 overflow-hidden">
          <img
            src={venue.images?.[0]?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3'}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Like Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
          >
            {isLiked ? (
              <HeartIconSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-primary-900" />
            )}
          </button>

          {/* Price Tag */}
          <div className="absolute bottom-4 left-4 bg-gold-500 text-primary-900 px-4 py-2 rounded-full font-bold">
            Rs. {venue.price?.toLocaleString()}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-primary-900 mb-2 group-hover:text-gold-500 transition-colors">
            {venue.name}
          </h3>
          
          <div className="space-y-3 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-gold-500 flex-shrink-0" />
              <span className="text-sm">{venue.city}, {venue.address?.substring(0, 30)}...</span>
            </div>
            
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-4 h-4 text-gold-500 flex-shrink-0" />
              <span className="text-sm">Up to {venue.capacity} guests</span>
            </div>

            <div className="flex items-center gap-2">
              <CurrencyRupeeIcon className="w-4 h-4 text-gold-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-primary-900">
                Starting from Rs. {venue.price?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Amenities Preview */}
          {venue.amenities && venue.amenities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {venue.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-gold-50 text-primary-900 rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {venue.amenities.length > 3 && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  +{venue.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default VenueCard;