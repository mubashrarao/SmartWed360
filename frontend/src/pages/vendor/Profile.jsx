import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  BuildingOfficeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VendorProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    businessName: user?.businessName || '',
    businessAddress: user?.businessAddress || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.put('/auth/profile', { 
        name: formData.name, 
        phone: formData.phone,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress
      });
      
      if (response.data.success) {
        // Update local state and storage via context
        const updatedUser = { 
          ...user, 
          name: formData.name, 
          phone: formData.phone,
          businessName: formData.businessName,
          businessAddress: formData.businessAddress
        };
        updateUser(updatedUser);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container-custom max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header with Status */}
          <div className="h-32 bg-gradient-to-r from-primary-900 to-gold-500 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gold-500 flex items-center justify-center">
                <BuildingOfficeIcon className="w-16 h-16 text-primary-900" />
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                user?.status === 'active' ? 'bg-green-500 text-white' :
                user?.status === 'pending' ? 'bg-yellow-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {user?.status?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-primary-900">
                  {user?.name}
                </h1>
                <p className="text-gray-500">
                  Vendor • Member since {new Date(user?.createdAt).toLocaleDateString()}
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-primary-900 rounded-lg hover:bg-gold-600 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (cannot be changed)
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="input-field pl-10 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="03XX-XXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <div className="relative">
                    <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Your Business Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  <textarea
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    rows="3"
                    className="input-field"
                    placeholder="Your Business Address"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <CheckIcon className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-gold-500" />
                  <span className="text-gray-600">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 text-gold-500" />
                    <span className="text-gray-600">{user.phone}</span>
                  </div>
                )}
                {user.businessName && (
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="w-5 h-5 text-gold-500" />
                    <span className="text-gray-600">{user.businessName}</span>
                  </div>
                )}
                {user.businessAddress && (
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="w-5 h-5 text-gold-500" />
                    <span className="text-gray-600">{user.businessAddress}</span>
                  </div>
                )}

                {/* Pending Approval Message */}
                {user?.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <ClockIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">Account Pending Approval</h4>
                        <p className="text-sm text-yellow-700">
                          Your vendor account is awaiting admin approval. You will be able to list venues once approved.
                          You will receive an email notification when your account is approved.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Account Message */}
                {user?.status === 'active' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">Account Active</h4>
                        <p className="text-sm text-green-700">
                          Your vendor account is active. You can now add venues and manage bookings.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VendorProfile;