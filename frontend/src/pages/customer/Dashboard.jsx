import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CalendarIcon, BuildingOfficeIcon, SparklesIcon } from '@heroicons/react/24/outline';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/customer?limit=3');
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container-custom">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary-900">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Your wedding planning journey continues here
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/venues"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-primary-900" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900">Browse Venues</h3>
                <p className="text-sm text-gray-500">Find your perfect venue</p>
              </div>
            </div>
          </Link>

          <Link
            to="/customer/bookings"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-primary-900" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900">My Bookings</h3>
                <p className="text-sm text-gray-500">View your booking status</p>
              </div>
            </div>
          </Link>

          <Link
            to="/customer/recommendations"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-primary-900" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900">Recommendations</h3>
                <p className="text-sm text-gray-500">Personalized for you</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-heading font-bold text-primary-900 mb-4">
            Recent Bookings
          </h2>
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No bookings yet. Start by browsing venues!
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-primary-900">{booking.venue?.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.eventDate).toLocaleDateString()} • {booking.guestCount} guests
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                      booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;