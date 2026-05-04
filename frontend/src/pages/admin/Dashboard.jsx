import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  TagIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.users.total}
            icon={UsersIcon}
            bgColor="bg-blue-500"
            subtext={`${stats.users.customers} customers`}
          />
          <StatCard
            title="Total Vendors"
            value={stats.users.vendors.total}
            icon={BuildingOfficeIcon}
            bgColor="bg-green-500"
            subtext={`${stats.users.vendors.active} active, ${stats.users.vendors.pending} pending`}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.users.vendors.pending}
            icon={ClockIcon}
            bgColor="bg-yellow-500"
            subtext="Vendors waiting for approval"
          />
          <StatCard
            title="Active Vendors"
            value={stats.users.vendors.active}
            icon={CheckCircleIcon}
            bgColor="bg-gold-500"
            subtext="Approved vendors"
          />
        </div>

        {/* Pending Approvals Alert */}
        {stats.users.vendors.pending > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    {stats.users.vendors.pending} Vendor(s) Pending Approval
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Review and approve vendor applications to activate their accounts
                  </p>
                </div>
              </div>
              <Link
                to="/admin/vendors?status=pending"
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Review Now
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <h2 className="text-xl font-heading font-bold text-primary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/admin/vendors"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900">Manage Vendors</h3>
                <p className="text-sm text-gray-500">Approve or reject vendors</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/categories"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <TagIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900">Categories</h3>
                <p className="text-sm text-gray-500">Manage venue categories</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/bookings"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900">Monitor Bookings</h3>
                <p className="text-sm text-gray-500">View all platform bookings</p>
              </div>
            </div>
          </Link>

          <button
            onClick={fetchDashboardData}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center">
                <ArrowPathIcon className="w-6 h-6 text-primary-900" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900">Refresh</h3>
                <p className="text-sm text-gray-500">Update dashboard data</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Vendors */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-heading font-bold text-primary-900 mb-4">
            Recent Vendor Registrations
          </h3>
          {stats.recentActivity.vendors.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent vendor registrations</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {stats.recentActivity.vendors.map((vendor) => (
                <div key={vendor._id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold text-primary-900">{vendor.name}</p>
                    <p className="text-sm text-gray-500">{vendor.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      vendor.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {vendor.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(vendor.createdAt).toLocaleDateString()}
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

export default AdminDashboard;