import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserGroupIcon,
  CurrencyRupeeIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  CheckCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaymentModal from '../../components/PaymentModal';
import toast from 'react-hot-toast';

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/customer');
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Cancel booking function - for pending bookings only
  const cancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.');
    if (!confirmCancel) return;
    
    setActionLoading(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/cancel`, {
        reason: 'Cancelled by customer'
      });
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(null);
    }
  };

  // Complete booking function - for approved bookings only
  const completeBooking = async (bookingId) => {
    const confirmComplete = window.confirm('Has this event been completed? Mark it as completed.');
    if (!confirmComplete) return;
    
    setActionLoading(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/complete`);
      toast.success('Booking marked as completed!');
      fetchBookings();
    } catch (error) {
      console.error('Complete error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  // ============ UPDATED STATUS BADGE WITH WAITING_PAYMENT ============
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      waiting_payment: 'bg-orange-100 text-orange-800 border-orange-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      completed: 'bg-gold-100 text-gold-800 border-gold-200'
    };
    return styles[status] || styles.pending;
  };

  // ============ UPDATED STATUS ICON WITH WAITING_PAYMENT ============
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'waiting_payment': return <CreditCardIcon className="w-4 h-4" />;
      case 'approved': return <CheckCircleIcon className="w-4 h-4" />;
      case 'rejected': return <XMarkIcon className="w-4 h-4" />;
      case 'cancelled': return <XMarkIcon className="w-4 h-4" />;
      case 'completed': return <CheckIcon className="w-4 h-4" />;
      default: return null;
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary-900">
            My Bookings
          </h1>
          <p className="text-gray-600 mt-2">
            Track and manage all your wedding venue bookings
          </p>
        </div>

        {/* Filter Tabs - Add waiting_payment to tabs */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'pending', 'waiting_payment', 'approved', 'rejected', 'cancelled', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full font-medium capitalize whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-primary-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gold-100'
              }`}
            >
              {status === 'waiting_payment' ? 'Waiting Payment' : status}
            </button>
          ))}
        </div>

        {/* No Bookings Message */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <CalendarIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">You haven't made any bookings yet</p>
            <Link to="/venues" className="btn-primary inline-block">
              Browse Venues
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Venue Image */}
                    <div className="md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={booking.venue?.images?.[0]?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}
                        alt={booking.venue?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-primary-900 mb-1">
                            {booking.venue?.name}
                          </h3>
                          <p className="text-gray-600 flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4 text-gold-500" />
                            {booking.venue?.city}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status === 'waiting_payment' ? 'WAITING PAYMENT' : booking.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Event Date</p>
                          <p className="font-semibold text-primary-900">
                            {new Date(booking.eventDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Guests</p>
                          <p className="font-semibold text-primary-900 flex items-center gap-1">
                            <UserGroupIcon className="w-4 h-4 text-gold-500" />
                            {booking.guestCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Total Price</p>
                          <p className="font-semibold text-primary-900 flex items-center gap-1">
                            <CurrencyRupeeIcon className="w-4 h-4 text-gold-500" />
                            Rs. {booking.totalPrice?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Advance Paid</p>
                          <p className="font-semibold text-primary-900 flex items-center gap-1">
                            <CurrencyRupeeIcon className="w-4 h-4 text-green-500" />
                            Rs. {booking.advancePayment?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>

                      {/* Payment Status Badge */}
                      {booking.paymentStatus && booking.paymentStatus !== 'pending' && (
                        <div className="mb-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            booking.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            <CreditCardIcon className="w-3 h-3" />
                            Payment: {booking.paymentStatus.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Special Requests */}
                      {booking.specialRequests && (
                        <div className="bg-gold-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Special Requests:</span> {booking.specialRequests}
                          </p>
                        </div>
                      )}

                      {/* Vendor Notes */}
                      {booking.vendorNotes && (
                        <div className="bg-primary-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Vendor Response:</span> {booking.vendorNotes}
                          </p>
                        </div>
                      )}

                      {/* ============ UPDATED PAYMENT BUTTON FOR WAITING_PAYMENT STATUS ============ */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        {/* Pay Advance Button - For waiting_payment bookings */}
                        {booking.status === 'waiting_payment' && booking.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowPayment(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-primary-900 rounded-lg hover:bg-gold-600 transition-colors"
                          >
                            <CreditCardIcon className="w-4 h-4" />
                            Pay Advance (20%) to Confirm
                          </button>
                        )}

                        {/* Cancel Button - Only for pending bookings */}
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => cancelBooking(booking._id)}
                            disabled={actionLoading === booking._id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === booking._id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <XMarkIcon className="w-4 h-4" />
                            )}
                            Cancel Booking
                          </button>
                        )}

                        {/* Complete Button - Only for approved bookings */}
                        {booking.status === 'approved' && (
                          <button
                            onClick={() => completeBooking(booking._id)}
                            disabled={actionLoading === booking._id}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === booking._id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckIcon className="w-4 h-4" />
                            )}
                            Mark as Completed
                          </button>
                        )}

                        {/* View Venue Details Link */}
                        <Link
                          to={`/venues/${booking.venue?._id}`}
                          className="flex items-center gap-2 px-4 py-2 border border-gold-500 text-gold-600 rounded-lg hover:bg-gold-50 transition-colors"
                        >
                          View Venue Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && selectedBooking && (
        <PaymentModal
          bookingId={selectedBooking._id}
          totalAmount={selectedBooking.totalPrice}
          onSuccess={() => {
            setShowPayment(false);
            setSelectedBooking(null);
            fetchBookings();
            toast.success('Payment successful! Booking confirmed.');
          }}
          onClose={() => {
            setShowPayment(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerBookings;