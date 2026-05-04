import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/admin/bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      completed: 'bg-gold-100 text-gold-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container-custom">
        <h1 className="text-3xl font-heading font-bold text-primary-900 mb-8">
          All Bookings
        </h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Venue</th>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-left">Vendor</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Guests</th>
                  <th className="px-6 py-4 text-left">Price</th>
                  <th className="px-6 py-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gold-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <BuildingOfficeIcon className="w-5 h-5 text-gold-500" />
                        <span className="font-medium">{booking.venue?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserIcon className="w-5 h-5 text-gold-500" />
                        <span>{booking.customer?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{booking.vendor?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {new Date(booking.eventDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{booking.guestCount}</td>
                    <td className="px-6 py-4">Rs. {booking.totalPrice?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;