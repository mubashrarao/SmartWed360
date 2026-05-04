import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalVenues: 0,
    activeVenues: 0,
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/vendor/stats'),
        api.get('/vendor/bookings')
      ]);
      
      setStats(statsRes.data.data);
      setRecentBookings(bookingsRes.data.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const StatCard = ({ title, value, icon: Icon, bgColor, subtext }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-3xl font-bold text-primary-900">{value}</span>
      </div>
      <h3 className="text-gray-600 font-medium">{title}</h3>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container-custom">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Venues"
            value={stats.totalVenues}
            icon={BuildingOfficeIcon}
            bgColor="bg-blue-500"
            subtext={`${stats.activeVenues} active`}
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={CalendarIcon}
            bgColor="bg-green-500"
          />
          <StatCard
            title="Pending Bookings"
            value={stats.pendingBookings}
            icon={ClockIcon}
            bgColor="bg-yellow-500"
          />
          <StatCard
            title="Approved Bookings"
            value={stats.approvedBookings}
            icon={CheckCircleIcon}
            bgColor="bg-gold-500"
          />
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-heading font-bold text-primary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/vendor/venues/new"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center">
                <PlusIcon className="w-6 h-6 text-primary-900" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900">Add New Venue</h3>
                <p className="text-sm text-gray-500">List a new venue and get bookings</p>
              </div>
            </div>
          </Link>

          <Link
            to="/vendor/bookings"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-6 h-6 text-primary-900" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900">View Bookings</h3>
                <p className="text-sm text-gray-500">{stats.pendingBookings} pending requests</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-heading font-bold text-primary-900">
              Recent Booking Requests
            </h3>
            <Link to="/vendor/bookings" className="text-gold-500 hover:text-gold-600 text-sm">
              View All →
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No booking requests yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold text-primary-900">{booking.venue?.name}</p>
                    <p className="text-sm text-gray-500">
                      Customer: {booking.customer?.name} • {booking.guestCount} guests
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(booking.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;