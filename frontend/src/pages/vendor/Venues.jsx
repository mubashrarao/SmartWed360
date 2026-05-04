import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const VendorVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await api.get('/vendor/venues');
      setVenues(response.data.data);
    } catch (error) {
      console.error('Failed to fetch venues:', error);
      toast.error('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (venueId) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;

    try {
      await api.delete(`/vendor/venues/${venueId}`);
      toast.success('Venue deleted successfully');
      fetchVenues();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container-custom">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary-900">
              My Venues
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your venue listings ({venues.length} total)
            </p>
          </div>
          <Link
            to="/vendor/venues/new"
            className="bg-primary-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Venue
          </Link>
        </div>

        {/* Venues Grid */}
        {venues.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No venues yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first venue</p>
            <Link
              to="/vendor/venues/new"
              className="bg-gold-500 text-primary-900 px-6 py-3 rounded-lg font-semibold hover:bg-gold-600 transition-colors inline-flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Your First Venue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <motion.div
                key={venue._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="relative h-48">
                  <img
                    src={venue.images?.[0]?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      venue.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {venue.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-primary-900 mb-2">{venue.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPinIcon className="w-4 h-4 text-gold-500" />
                      <span className="text-sm">{venue.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <UserGroupIcon className="w-4 h-4 text-gold-500" />
                      <span className="text-sm">Up to {venue.capacity} guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gold-500 font-semibold">Rs.</span>
                      <span className="text-sm font-semibold">{venue.basePrice?.toLocaleString() || venue.price?.toLocaleString()}</span>
                      <span className="text-xs text-gray-400">starting price</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/vendor/venues/edit/${venue._id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gold-500 text-primary-900 rounded-lg hover:bg-gold-600 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(venue._id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                    <Link
                      to={`/venues/${venue._id}`}
                      target="_blank"
                      className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorVenues;