import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartIcon, 
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserGroupIcon,
  MapPinIcon,
  SparklesIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [searchParams, setSearchParams] = useState({
    city: '',
    guests: ''
  });

  useEffect(() => {
    fetchFeaturedVenues();
  }, []);

  const fetchFeaturedVenues = async () => {
    try {
      const response = await api.get('/venues?limit=6');
      setFeaturedVenues(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch venues:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchParams.city) params.append('city', searchParams.city);
    if (searchParams.guests) params.append('minCapacity', searchParams.guests);
    navigate(`/venues?${params.toString()}`);
  };

  const features = [
    {
      icon: BuildingOfficeIcon,
      title: "Curated Venues",
      description: "Hand-picked wedding venues with authentic details and verified photos"
    },
    {
      icon: CalendarIcon,
      title: "Easy Booking",
      description: "Simple and transparent booking process with instant confirmation"
    },
    {
      icon: HeartIcon,
      title: "Perfect Match",
      description: "Smart recommendations based on your style, budget, and guest count"
    },
    {
      icon: ShieldCheckIcon,
      title: "Verified Vendors",
      description: "All vendors are verified by our team to ensure quality service"
    }
  ];

  const stats = [
    { number: "500+", label: "Venues", icon: BuildingOfficeIcon },
    { number: "200+", label: "Vendors", icon: UserGroupIcon },
    { number: "1000+", label: "Happy Couples", icon: HeartIcon },
    { number: "50+", label: "Cities", icon: MapPinIcon }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Wedding background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 to-primary-800/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container-custom text-center text-white">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <HeartIcon className="w-20 h-20 text-gold-500 mx-auto" />
            </div>

            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">
              Your Perfect Wedding
              <span className="block text-gold-500">Begins Here</span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 text-cream max-w-3xl mx-auto">
              Discover and book the most beautiful wedding venues across Pakistan
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-gold-500/30">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                    <input
                      type="text"
                      placeholder="City or location"
                      value={searchParams.city}
                      onChange={(e) => setSearchParams({...searchParams, city: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-white/20 text-white placeholder-white/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <UserGroupIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                    <input
                      type="number"
                      placeholder="Number of guests"
                      value={searchParams.guests}
                      onChange={(e) => setSearchParams({...searchParams, guests: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-white/20 text-white placeholder-white/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gold-500 text-primary-900 px-8 py-4 rounded-xl font-semibold hover:bg-gold-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gold-500">{stat.number}</div>
                  <div className="text-sm text-cream">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gold-500 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gold-500 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-cream">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary-900 mb-4">
              Why Choose SmartWed 360
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We make wedding planning simple, stress-free, and magical
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-primary-900" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary-900 mb-4">
              Featured Venues
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore some of our most popular wedding venues
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVenues.map((venue, index) => (
              <div key={venue._id} className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-all"
                   onClick={() => navigate(`/venues/${venue._id}`)}>
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={venue.images?.[0]?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4 bg-gold-500 text-primary-900 px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-2">{venue.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPinIcon className="w-4 h-4 text-gold-500" />
                    <span className="text-sm">{venue.city}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gold-500 font-bold">Rs. {venue.price?.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">Up to {venue.capacity} guests</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/venues')}
              className="bg-gold-500 text-primary-900 px-8 py-4 rounded-xl font-semibold hover:bg-gold-600 transition-colors inline-flex items-center gap-2"
            >
              View All Venues
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary-900">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto">
            <HeartIcon className="w-16 h-16 text-gold-500 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-cream mb-10">
              Join thousands of happy couples who found their dream venues through SmartWed 360
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="bg-gold-500 text-primary-900 px-10 py-4 rounded-xl font-semibold hover:bg-gold-600 transition-colors"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate('/venues')}
                className="bg-white/20 text-white px-10 py-4 rounded-xl font-semibold hover:bg-white/30 transition-colors border border-gold-500/50"
              >
                Browse Venues
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;