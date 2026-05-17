import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline';

const TwoFactorSetup = () => {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(user?.isTwoFactorEnabled || false);

  // Check 2FA status when component loads
  useEffect(() => {
    setIsEnabled(user?.isTwoFactorEnabled || false);
  }, [user]);

  const enable2FA = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/2fa/enable');
      setSecret(response.data.secret);
      setQrCode(response.data.qrCode);
      setStep(2);
      toast.success('Scan QR code with Google Authenticator');
    } catch (error) {
      toast.error('Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/2fa/verify', { token: verificationCode });
      if (response.data.success) {
        // Update user context with 2FA enabled
        const updatedUser = { ...user, isTwoFactorEnabled: true };
        updateUser(updatedUser);
        setIsEnabled(true);
        toast.success('2FA enabled successfully!');
        setStep(3);
      }
    } catch (error) {
      toast.error('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/2fa/disable');
      if (response.data.success) {
        // Update user context with 2FA disabled
        const updatedUser = { ...user, isTwoFactorEnabled: false };
        updateUser(updatedUser);
        setIsEnabled(false);
        toast.success('2FA disabled successfully');
        setStep(1);
        setSecret('');
        setQrCode('');
        setVerificationCode('');
      }
    } catch (error) {
      toast.error('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  if (isEnabled) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-primary-900">Two-Factor Authentication</h3>
        </div>
        
        <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-4">
          ✅ Two-factor authentication is <span className="font-bold">ENABLED</span>
        </div>
        
        <button
          onClick={disable2FA}
          disabled={loading}
          className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Disabling...' : 'Disable 2FA'}
        </button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-gold-600" />
          </div>
          <h3 className="text-lg font-semibold text-primary-900">Two-Factor Authentication</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          Add an extra layer of security to your account by enabling two-factor authentication.
        </p>
        
        <button
          onClick={enable2FA}
          disabled={loading}
          className="w-full bg-primary-900 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enabling...' : 'Enable 2FA'}
        </button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
            <KeyIcon className="w-5 h-5 text-gold-600" />
          </div>
          <h3 className="text-lg font-semibold text-primary-900">Setup 2FA</h3>
        </div>
        
        <p className="text-gray-600 mb-2">1. Install Google Authenticator app on your phone</p>
        <p className="text-gray-600 mb-2">2. Scan this QR code:</p>
        
        {qrCode && (
          <img src={qrCode} alt="QR Code" className="mx-auto my-4 w-48 h-48" />
        )}
        
        <p className="text-gray-600 mb-2">
          Or enter this code manually: <strong className="text-primary-900">{secret}</strong>
        </p>
        
        <p className="text-gray-600 mb-4">3. Enter the 6-digit code from the app:</p>
        
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="000000"
          maxLength={6}
          className="w-full text-center text-2xl tracking-widest px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 mb-4"
        />
        
        <div className="flex gap-3">
          <button
            onClick={verify2FA}
            disabled={loading || verificationCode.length !== 6}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Enable'}
          </button>
          <button
            onClick={() => setStep(1)}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TwoFactorSetup;