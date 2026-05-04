import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserIcon, EnvelopeIcon, LockClosedIcon, PhoneIcon,
  HeartIcon, BuildingOfficeIcon, ShieldCheckIcon,
  EyeIcon, EyeSlashIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';

const Register = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: ''
  });
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      
      // Auto-focus next input
      if (value && index < 3) {
        document.getElementById(`code-input-${index + 1}`)?.focus();
      }
    }
  };

  const handleSendVerification = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/send-verification', { ...formData, role });
      toast.success('Verification code sent to your email!');
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const pinCode = verificationCode.join('');
    
    if (pinCode.length !== 4) {
      toast.error('Please enter complete 4-digit code');
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.post('/auth/verify-email', {
        email: formData.email,
        pinCode: pinCode
      });
      
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      toast.success(response.data.message);
      
      // Redirect based on role
      if (role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else if (role === 'vendor') {
        window.location.href = '/login';
      } else {
        window.location.href = '/customer/dashboard';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await api.post('/auth/resend-verification', { email: formData.email });
      toast.success('New verification code sent!');
    } catch (error) {
      toast.error('Failed to resend code');
    }
  };

  const roles = [
    { id: 'customer', name: 'Customer', icon: HeartIcon, color: 'bg-pink-500', description: 'Looking for the perfect wedding venue' },
    { id: 'vendor', name: 'Vendor', icon: BuildingOfficeIcon, color: 'bg-green-500', description: 'List your venue and get bookings' },
    { id: 'admin', name: 'Admin', icon: ShieldCheckIcon, color: 'bg-purple-500', description: 'Manage the platform' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-800 py-16 px-4">
      <div className="container-custom max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-heading font-bold text-white">SmartWed <span className="text-gold-500">360</span></h1>
          </Link>
          <h2 className="text-2xl font-heading text-white mb-2">Create Your Account</h2>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= s ? 'bg-gold-500 text-primary-900' : 'bg-white/20 text-white'
              }`}>{s}</div>
              {s < 3 && <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-gold-500' : 'bg-white/20'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r) => (
              <button key={r.id} onClick={() => handleRoleSelect(r.id)}
                className="bg-white rounded-2xl p-6 text-left hover:shadow-2xl transition-all">
                <div className={`w-12 h-12 ${r.color} rounded-lg flex items-center justify-center mb-4`}>
                  <r.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2">{r.name}</h3>
                <p className="text-gray-600 text-sm">{r.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Registration Form */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8">
            <button onClick={() => setStep(1)} className="text-gold-500 mb-4">← Back</button>
            <div className="mb-6 inline-block px-4 py-2 rounded-full text-sm font-semibold bg-gray-100">
              Registering as: {role.charAt(0).toUpperCase() + role.slice(1)}
            </div>
            <form onSubmit={handleSendVerification} className="space-y-4">
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  className="input-field pl-10" placeholder="Full Name" required />
              </div>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="input-field pl-10" placeholder="Email Address" required />
              </div>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  className="input-field pl-10" placeholder="Phone Number" />
              </div>

              {/* Password Field */}
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-12"
                  placeholder="Password"
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

              {/* Confirm Password Field */}
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10 pr-12"
                  placeholder="Confirm Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gold-500"
                >
                  {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Step 3: Email Verification */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <HeartIcon className="w-16 h-16 text-gold-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-900 mb-2">Verify Your Email</h3>
            <p className="text-gray-600 mb-6">We've sent a 4-digit verification code to<br />{formData.email}</p>
            
            {/* 4-Digit PIN Input */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  id={`code-input-${index}`}
                  type="text"
                  maxLength="1"
                  value={verificationCode[index]}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-gold-500 focus:outline-none"
                />
              ))}
            </div>

            <button onClick={handleVerifyEmail} disabled={loading}
              className="w-full btn-primary py-3 mb-3 disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
            <button onClick={handleResendCode} className="text-gold-500 text-sm">
              Resend Code
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Register;