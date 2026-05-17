import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

const stripePromise = loadStripe('pk_test_51TWDewFxsgeF8m4dVWkw8ZO0KixZjbi0gXJ21dnw5jimDtsNBTNU540a6yhbJduA38xEry6bpJ37818IKm1dtkwi00F9ASUFA7'); // Replace with your publishable key

const PaymentForm = ({ bookingId, totalAmount, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState(0);

  useEffect(() => {
    // Create payment intent
    const createIntent = async () => {
      try {
        const response = await api.post('/payments/create-intent', {
          bookingId,
          advancePercentage: 20
        });
        setClientSecret(response.data.clientSecret);
        setAdvanceAmount(response.data.advanceAmount);
      } catch (error) {
        toast.error('Failed to initialize payment');
      }
    };
    createIntent();
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    
    setLoading(true);
    
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      });
      
      if (error) {
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment in backend
        await api.post('/payments/confirm', {
          paymentIntentId: paymentIntent.id,
          bookingId
        });
        
        toast.success('Payment successful! Your booking is confirmed.');
        onSuccess();
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': { color: '#aab7c4' }
      },
      invalid: { color: '#9e2146' }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-900">Advance Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6 p-4 bg-gold-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Amount: <span className="font-bold">Rs. {totalAmount.toLocaleString()}</span></p>
          <p className="text-sm text-gray-600">Advance (20%): <span className="font-bold text-gold-600">Rs. {advanceAmount.toLocaleString()}</span></p>
          <p className="text-xs text-gray-500 mt-2">Pay advance to confirm your booking. Remaining amount to be paid at venue.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <CardElement options={cardElementOptions} />
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!stripe || loading}
              className="flex-1 btn-primary py-3 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay Rs. ${advanceAmount.toLocaleString()}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-gold py-3"
            >
              Pay Later
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentModal = ({ bookingId, totalAmount, onSuccess, onClose }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        bookingId={bookingId}
        totalAmount={totalAmount}
        onSuccess={onSuccess}
        onClose={onClose}
      />
    </Elements>
  );
};

export default PaymentModal;