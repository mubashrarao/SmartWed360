import { MagnifyingGlassIcon, CalendarIcon, CheckCircleIcon, HeartIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const steps = [
    {
      step: 1,
      title: "Browse Venues",
      description: "Explore hundreds of wedding venues with detailed information, photos, and pricing.",
      icon: MagnifyingGlassIcon,
      color: "bg-blue-500"
    },
    {
      step: 2,
      title: "Send Request",
      description: "Select your preferred date, number of guests, and send a booking request to the vendor.",
      icon: CalendarIcon,
      color: "bg-green-500"
    },
    {
      step: 3,
      title: "Get Confirmed",
      description: "Vendor reviews your request and confirms your booking with a response.",
      icon: CheckCircleIcon,
      color: "bg-gold-500"
    }
  ];

  const benefits = [
    "No hidden fees",
    "Verified vendors only",
    "24/7 customer support",
    "Easy cancellation policy",
    "Secure payments",
    "Real customer reviews"
  ];

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <HeartIcon className="w-16 h-16 text-gold-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-900 mb-4">
            How SmartWed 360 Works
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to plan your perfect wedding
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step) => (
            <div key={step.step} className="text-center">
              <div className="relative mb-6">
                <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-900 rounded-full flex items-center justify-center text-white font-bold">
                  {step.step}
                </div>
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        {/* For Vendors Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-heading font-bold text-primary-900 mb-6 text-center">
            For Wedding Vendors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-primary-900 mb-3">How to list your venue:</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center text-primary-900 font-bold text-sm">1</span>
                  <span className="text-gray-600">Register as a vendor on SmartWed 360</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center text-primary-900 font-bold text-sm">2</span>
                  <span className="text-gray-600">Wait for admin approval (24-48 hours)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center text-primary-900 font-bold text-sm">3</span>
                  <span className="text-gray-600">Create your venue listings with photos and details</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center text-primary-900 font-bold text-sm">4</span>
                  <span className="text-gray-600">Start receiving booking requests from customers</span>
                </li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-900 mb-3">Benefits for vendors:</h3>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <CheckCircleIcon className="w-5 h-5 text-gold-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link to="/register?role=vendor" className="btn-primary inline-block">
              Become a Vendor
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary-900 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-heading font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-cream mb-6">
            Join thousands of happy couples who found their dream venues
          </p>
          <Link to="/register" className="btn-gold inline-block">
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;