import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartIcon, 
  UserCircleIcon, 
  BuildingOfficeIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  TagIcon,
  UsersIcon,
  CalendarIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'vendor': return '/vendor/dashboard';
      case 'customer': return '/customer/dashboard';
      default: return '/';
    }
  };

  const getNavLinks = () => {
    if (!user) {
      return [
        { name: 'Home', path: '/', icon: HomeIcon },
        { name: 'Venues', path: '/venues', icon: BuildingOfficeIcon }
      ];
    }

    switch (user.role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
          { name: 'Vendors', path: '/admin/vendors', icon: UsersIcon },
          { name: 'Categories', path: '/admin/categories', icon: TagIcon },
          { name: 'Bookings', path: '/admin/bookings', icon: CalendarIcon }
        ];
      case 'vendor':
        return [
          { name: 'Dashboard', path: '/vendor/dashboard', icon: HomeIcon },
          { name: 'My Venues', path: '/vendor/venues', icon: BuildingOfficeIcon },
          { name: 'Bookings', path: '/vendor/bookings', icon: CalendarIcon },
          { name: 'Profile', path: '/vendor/profile', icon: UserCircleIcon }
        ];
      case 'customer':
        return [
          { name: 'Dashboard', path: '/customer/dashboard', icon: HomeIcon },
          { name: 'Venues', path: '/venues', icon: BuildingOfficeIcon },
          { name: 'My Bookings', path: '/customer/bookings', icon: CalendarIcon },
          { name: 'Recommendations', path: '/customer/recommendations', icon: SparklesIcon },
          { name: 'Profile', path: '/customer/profile', icon: UserCircleIcon }
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-primary-900 shadow-lg py-2' : 'bg-primary-900 py-4'
    }`}>
      <div className="container-custom">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-primary-900" />
            </div>
            <span className="text-2xl font-heading font-bold text-white">
              SmartWed<span className="text-gold-500">360</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-white text-sm font-medium flex items-center gap-2 hover:text-gold-500 transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            ))}

            {user ? (
              <>
                <NotificationBell />
                <button
                  onClick={handleLogout}
                  className="text-white text-sm font-medium flex items-center gap-2 hover:text-gold-500 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Logout
                </button>
                <div className="flex items-center gap-2 ml-4 border-l border-gold-500/30 pl-4">
                  <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center">
                    <span className="text-primary-900 font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white text-sm">{user.name}</span>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-gold-500 text-primary-900 px-6 py-2 rounded-lg font-semibold hover:bg-gold-600 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block text-white py-2 px-4 hover:bg-primary-800 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </div>
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-white py-2 px-4 hover:bg-primary-800 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Logout
                </div>
              </button>
            ) : (
              <Link
                to="/login"
                className="block text-white py-2 px-4 hover:bg-primary-800 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;