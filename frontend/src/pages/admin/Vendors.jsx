import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminVendors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const statusFilter = searchParams.get('status') || 'all';

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await api.get('/admin/vendors');
      setVendors(response.data.data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId) => {
    try {
      const response = await api.put(`/admin/vendors/${vendorId}`, { status: 'active' });
      toast.success('Vendor approved successfully');
      fetchVendors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (vendorId) => {
    try {
      const response = await api.put(`/admin/vendors/${vendorId}`, { status: 'rejected' });
      toast.success('Vendor rejected');
      fetchVendors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed');
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    const matchesSearch = vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800'
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
            Vendor Management
          </h1>
          <p className="text-gray-600 mt-2">
            Approve, reject, and manage vendor accounts
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Vendors</p>
            <p className="text-2xl font-bold text-primary-900">{vendors.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {vendors.filter(v => v.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {vendors.filter(v => v.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {vendors.filter(v => v.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'active', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSearchParams({ status })}
                  className={`px-4 py-2 rounded-lg font-medium capitalize ${
                    statusFilter === status
                      ? 'bg-primary-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gold-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vendors List */}
        {filteredVendors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No vendors found</h3>
            <p className="text-gray-500">No vendors match your search criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVendors.map((vendor) => (
              <motion.div
                key={vendor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gold-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-primary-900">
                            {vendor.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(vendor.status)}`}>
                            {vendor.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <EnvelopeIcon className="w-4 h-4 text-gold-500" />
                            <span className="text-gray-600">{vendor.email}</span>
                          </div>
                          {vendor.phone && (
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="w-4 h-4 text-gold-500" />
                              <span className="text-gray-600">{vendor.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gold-500" />
                            <span className="text-gray-600">
                              Joined {new Date(vendor.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {vendor.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(vendor._id)}
                          className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(vendor._id)}
                          className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {vendor.status === 'active' && (
                      <span className="text-sm text-green-600 font-medium">✓ Approved</span>
                    )}
                    {vendor.status === 'rejected' && (
                      <span className="text-sm text-red-600 font-medium">✗ Rejected</span>
                    )}
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

export default AdminVendors;