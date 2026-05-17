import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const scaleOnHover = {
    scale: 1.05,
    transition: { duration: 0.3 }
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
    { number: "500+", label: "Venues", icon: BuildingOfficeIcon, delay: 0.1 },
    { number: "200+", label: "Vendors", icon: UserGroupIcon, delay: 0.2 },
    { number: "1000+", label: "Happy Couples", icon: HeartIcon, delay: 0.3 },
    { number: "50+", label: "Cities", icon: MapPinIcon, delay: 0.4 }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gold-500/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{
              y: [null, -100, 100, -50],
              scale: [0, 1, 0],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 10
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <motion.section 
        style={{ opacity, scale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background with zoom animation */}
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Wedding background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 to-primary-800/90" />
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 container-custom text-center text-white"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <HeartIcon className="w-20 h-20 text-gold-500 mx-auto" />
            </motion.div>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-heading font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Your Perfect Wedding
            <motion.span 
              className="block text-gold-500"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Begins Here
            </motion.span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl mb-12 text-cream max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Discover and book the most beautiful wedding venues across Pakistan
          </motion.p>

          {/* Animated Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-gold-500/30">
              <div className="flex flex-col md:flex-row gap-2">
                <motion.div 
                  className="flex-1 relative"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                  <input
                    type="text"
                    placeholder="City or location"
                    value={searchParams.city}
                    onChange={(e) => setSearchParams({...searchParams, city: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-white/20 text-white placeholder-white/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all"
                  />
                </motion.div>
                <motion.div 
                  className="flex-1 relative"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <UserGroupIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                  <input
                    type="number"
                    placeholder="Number of guests"
                    value={searchParams.guests}
                    onChange={(e) => setSearchParams({...searchParams, guests: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-white/20 text-white placeholder-white/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all"
                  />
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-gold-500 text-primary-900 px-8 py-4 rounded-xl font-semibold hover:bg-gold-600 transition-colors flex items-center justify-center gap-2"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Search
                </motion.button>
              </div>
            </div>
          </motion.form>

          {/* Animated Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1, type: "spring" }}
                  className="text-3xl md:text-4xl font-bold text-gold-500"
                >
                  {stat.number}
                </motion.div>
                <div className="text-sm text-cream">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Animated Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <div className="w-6 h-10 border-2 border-gold-500 rounded-full flex justify-center">
            <motion.div 
              className="w-1 h-3 bg-gold-500 rounded-full mt-2"
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section with Scroll Animation */}
      <motion.section 
        className="py-20 bg-cream"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary-900 mb-4">
              Why Choose SmartWed 360
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We make wedding planning simple, stress-free, and magical
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl shadow-lg p-8 text-center group cursor-pointer"
                onClick={() => navigate('/venues')}
              >
                <motion.div 
                  className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-8 h-8 text-primary-900" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Venues with Animation */}
      <motion.section 
        className="py-20 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary-900 mb-4">
              Featured Venues
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore some of our most popular wedding venues
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {featuredVenues.map((venue, index) => (
              <motion.div
                key={venue._id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/venues/${venue._id}`)}
              >
                <div className="relative h-64 overflow-hidden">
                  <motion.img
                    src={venue.images?.[0]?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                  <motion.div 
                    className="absolute top-4 right-4 bg-gold-500 text-primary-900 px-3 py-1 rounded-full text-sm font-semibold"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Featured
                  </motion.div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-2">{venue.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPinIcon className="w-4 h-4 text-gold-500" />
                    <span className="text-sm">{venue.city}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gold-500 font-bold">Rs. {venue.basePrice?.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">Up to {venue.capacity} guests</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/venues')}
              className="bg-gold-500 text-primary-900 px-8 py-4 rounded-xl font-semibold hover:bg-gold-600 transition-colors inline-flex items-center gap-2"
            >
              View All Venues
              <ArrowRightIcon className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section with Animation */}
      <motion.section 
        className="py-20 bg-primary-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container-custom text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <HeartIcon className="w-16 h-16 text-gold-500 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-cream mb-10">
              Join thousands of happy couples who found their dream venues through SmartWed 360
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="bg-gold-500 text-primary-900 px-10 py-4 rounded-xl font-semibold hover:bg-gold-600 transition-colors"
              >
                Create Free Account
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/venues')}
                className="bg-white/20 text-white px-10 py-4 rounded-xl font-semibold hover:bg-white/30 transition-colors border border-gold-500/50"
              >
                Browse Venues
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;