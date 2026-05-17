import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  HeartIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Check if 2FA is required
      if (response.data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setTempEmail(email);
        setTempPassword(password);
        toast.info('Please enter your 2FA code');
        setLoading(false);
        return;
      }
      
      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        toast.success(`Welcome back, ${userData.name}!`);
        
        setTimeout(() => {
          if (userData.role === 'admin') {
            window.location.href = '/admin/dashboard';
          } else if (userData.role === 'vendor') {
            window.location.href = '/vendor/dashboard';
          } else {
            window.location.href = '/customer/dashboard';
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

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/auth/2fa/login', {
        email: tempEmail,
        password: tempPassword,
        token: twoFactorCode
      });
      
      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        toast.success(`Welcome back, ${userData.name}!`);
        
        setTimeout(() => {
          if (userData.role === 'admin') {
            window.location.href = '/admin/dashboard';
          } else if (userData.role === 'vendor') {
            window.location.href = '/vendor/dashboard';
          } else {
            window.location.href = '/customer/dashboard';
          }
        }, 500);
      }
    } catch (error) {
      console.error('2FA error:', error);
      toast.error(error.response?.data?.message || 'Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  // 2FA Verification Screen
  if (requiresTwoFactor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-800 pt-24 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        >
          <div className="text-center mb-8">
            <ShieldCheckIcon className="w-16 h-16 text-gold-500 mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold text-primary-900">Two-Factor Authentication</h1>
            <p className="text-gray-600 mt-2">Enter the 6-digit code from your authenticator app</p>
          </div>
          
          <form onSubmit={handleTwoFactorSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full text-center text-2xl tracking-widest px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                required
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setRequiresTwoFactor(false);
                setTwoFactorCode('');
              }}
              className="w-full text-gold-500 hover:text-gold-600 text-sm"
            >
              Back to Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Normal Login Screen
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

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
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gold-500"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors disabled:opacity-50"
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
      </motion.div>
    </div>
  );
};

export default Login;