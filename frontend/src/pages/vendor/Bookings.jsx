import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const VendorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [responseNotes, setResponseNotes] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/vendor/bookings');
      setBookings(response.data.data);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await api.put(`/vendor/bookings/${bookingId}`, {
        status,
        vendorNotes: responseNotes
      });
      toast.success(`Booking ${status} successfully`);
      setSelectedBooking(null);
      setResponseNotes('');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      waiting_payment: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      completed: 'bg-gold-100 text-gold-800'
    };
    return styles[status] || styles.pending;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary-900">
            Booking Requests
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and respond to customer booking requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-primary-900">{stats.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gold-600">{stats.completed || 0}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'pending', 'approved', 'rejected', 'cancelled', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full font-medium capitalize ${
                filter === status
                  ? 'bg-primary-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gold-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings found</h3>
            <p className="text-gray-500">No bookings match your filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={booking.venue?.images?.[0]?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'}
                      alt={booking.venue?.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-primary-900">{booking.venue?.name}</h3>
                      <p className="text-gray-600 flex items-center gap-2 mt-1">
                        <UserIcon className="w-4 h-4 text-gold-500" />
                        {booking.customer?.name} • {booking.customer?.email}
                      </p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Event Date</p>
                    <p className="font-semibold">{new Date(booking.eventDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Guests</p>
                    <p className="font-semibold">{booking.guestCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Price</p>
                    <p className="font-semibold">Rs. {booking.totalPrice?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Booked on</p>
                    <p className="font-semibold">{new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="bg-gold-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Special Requests:</span> {booking.specialRequests}
                    </p>
                  </div>
                )}

                {selectedBooking === booking._id ? (
                  <div className="space-y-4">
                    <textarea
                      value={responseNotes}
                      onChange={(e) => setResponseNotes(e.target.value)}
                      placeholder="Add notes for the customer (optional)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                      rows="2"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'approved')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => setSelectedBooking(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  booking.status === 'pending' && (
                    <button
                      onClick={() => setSelectedBooking(booking._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-primary-900 rounded-lg hover:bg-gold-600"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      Respond to Request
                    </button>
                  )
                )}

                {booking.vendorNotes && (
                  <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Your Response:</span> {booking.vendorNotes}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorBookings;