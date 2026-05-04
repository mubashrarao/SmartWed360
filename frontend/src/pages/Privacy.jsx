const Privacy = () => {
  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-heading font-bold text-primary-900 mb-6">Privacy Policy</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-primary-900 mb-3">1. Information We Collect</h2>
              <p className="text-gray-600">We collect information you provide directly to us, such as when you create an account, make a booking, or contact us. This may include your name, email address, phone number, and payment information.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-primary-900 mb-3">2. How We Use Your Information</h2>
              <p className="text-gray-600">We use your information to provide and improve our services, process bookings, communicate with you, and personalize your experience.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-primary-900 mb-3">3. Information Sharing</h2>
              <p className="text-gray-600">We share your information with vendors when you make a booking request. We do not sell your personal information to third parties.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-primary-900 mb-3">4. Data Security</h2>
              <p className="text-gray-600">We implement security measures to protect your personal information from unauthorized access.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-primary-900 mb-3">5. Cookies</h2>
              <p className="text-gray-600">We use cookies to enhance your browsing experience and analyze site traffic.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-primary-900 mb-3">6. Your Rights</h2>
              <p className="text-gray-600">You have the right to access, correct, or delete your personal information.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-primary-900 mb-3">7. Contact Us</h2>
              <p className="text-gray-600">If you have questions about this privacy policy, contact us at privacy@smartwed360.com</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">Last updated: January 1, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;