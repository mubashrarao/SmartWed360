import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  HeartIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with:', email);
      
      const response = await api.post('/auth/login', { email, password });
      
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set default header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // FIX: Add delay to ensure toast shows before redirect
        toast.success(`Welcome back, ${userData.name}!`, {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#800020',
            color: '#D4AF37',
            fontSize: '16px',
            fontWeight: 'bold',
          }
        });
        
        // IMPORTANT: Redirect based on role with slight delay
        const role = userData.role;
        console.log('Redirecting based on role:', role);
        
        // Add delay to let toast show before redirect
        setTimeout(() => {
          if (role === 'admin') {
            window.location.href = '/admin/dashboard';
          } else if (role === 'vendor') {
            window.location.href = '/vendor/dashboard';
          } else if (role === 'customer') {
            window.location.href = '/customer/dashboard';
          } else {
            window.location.href = '/';
          }
        }, 500);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-800 pt-24 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <HeartIcon className="w-12 h-12 text-gold-500 mx-auto" />
          </Link>
          <h1 className="text-3xl font-heading font-bold text-primary-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password Field with Show/Hide Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gold-500 transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            New to SmartWed 360?{' '}
            <Link to="/register" className="text-gold-500 hover:text-gold-600 font-semibold">
              Create an account
            </Link>
          </p>
        </div>

        {/* Test credentials hint */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-semibold mb-2">Test Accounts:</p>
          <p>Admin: admin@smartwed.com / Admin@2025!</p>
          <p>Vendor: vendor@test.com / Vendor@2025!</p>
          <p>Customer: customer@test.com / Customer@2025!</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;