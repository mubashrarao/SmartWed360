import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline';

const TwoFactorSetup = () => {
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

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
      await api.post('/auth/2fa/verify', { token: verificationCode });
      toast.success('2FA enabled successfully!');
      setStep(3);
    } catch (error) {
      toast.error('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    try {
      await api.post('/auth/2fa/disable');
      toast.success('2FA disabled successfully');
      setStep(1);
      setSecret('');
      setQrCode('');
      setVerificationCode('');
    } catch (error) {
      toast.error('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <ShieldCheckIcon className="w-6 h-6 text-gold-500" />
        <h3 className="text-lg font-semibold text-primary-900">Two-Factor Authentication</h3>
      </div>

      {step === 1 && (
        <div>
          <p className="text-gray-600 mb-4">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>
          <button
            onClick={enable2FA}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Enabling...' : 'Enable 2FA'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-gray-600 mb-4">
            1. Install Google Authenticator app on your phone
          </p>
          <p className="text-gray-600 mb-4">
            2. Scan this QR code:
          </p>
          {qrCode && (
            <img src={qrCode} alt="QR Code" className="mx-auto mb-4 w-48 h-48" />
          )}
          <p className="text-gray-600 mb-4">
            Or enter this code manually: <strong className="text-primary-900">{secret}</strong>
          </p>
          <p className="text-gray-600 mb-4">
            3. Enter the 6-digit code from the app:
          </p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
            className="input-field text-center text-2xl letter-spacing-2 mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={verify2FA}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </button>
            <button
              onClick={() => setStep(1)}
              className="flex-1 btn-gold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
            ✅ Two-factor authentication is ENABLED
          </div>
          <button
            onClick={disable2FA}
            disabled={loading}
            className="btn-gold w-full"
          >
            Disable 2FA
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;