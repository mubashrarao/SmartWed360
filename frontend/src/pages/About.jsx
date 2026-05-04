import { HeartIcon, BuildingOfficeIcon, UserGroupIcon, CalendarIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const About = () => {
  const values = [
    { title: "Trust & Transparency", description: "We believe in honest communication and transparent pricing." },
    { title: "Customer First", description: "Your wedding dreams are our top priority." },
    { title: "Quality Assurance", description: "All vendors are verified for quality service." },
    { title: "Innovation", description: "Constantly improving to serve you better." }
  ];

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container-custom">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <HeartIcon className="w-16 h-16 text-gold-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-900 mb-4">About SmartWed 360</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Making dream weddings a reality since 2025</p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-heading font-bold text-primary-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            At SmartWed 360, we believe that every couple deserves a perfect wedding day without stress. 
            Our platform connects couples with the best wedding venues across Pakistan, making planning simple, 
            transparent, and enjoyable. We're committed to helping you create memories that last a lifetime.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <BuildingOfficeIcon className="w-10 h-10 text-gold-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-primary-900">500+</div>
            <p className="text-gray-600">Venues</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <UserGroupIcon className="w-10 h-10 text-gold-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-primary-900">200+</div>
            <p className="text-gray-600">Vendors</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <CalendarIcon className="w-10 h-10 text-gold-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-primary-900">1000+</div>
            <p className="text-gray-600">Events Planned</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <StarIcon className="w-10 h-10 text-gold-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-primary-900">4.9</div>
            <p className="text-gray-600">Rating</p>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-primary-900 text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
                <CheckCircleIcon className="w-10 h-10 text-gold-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-primary-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-heading font-bold mb-4">Our Story</h2>
          <p className="text-cream max-w-3xl mx-auto">
            Founded in 2025, SmartWed 360 was born from a simple idea: wedding planning should be joyful, not stressful. 
            What started as a small platform has grown into Pakistan's most trusted wedding venue marketplace, 
            helping thousands of couples find their perfect venue and creating unforgettable memories.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;