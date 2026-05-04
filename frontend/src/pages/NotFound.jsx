import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';

const NotFound = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center">
    <div className="text-center">
      <HeartIcon className="w-20 h-20 text-gold-500 mx-auto mb-6" />
      <h1 className="text-6xl font-heading font-bold text-primary-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  </div>
);

export default NotFound;