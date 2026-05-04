import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Become a Vendor', path: '/register?role=vendor' }
    ],
    support: [
      { name: 'FAQs', path: '/faq' },
      { name: 'Terms of Use', path: '/terms' },
      { name: 'Privacy Policy', path: '/privacy' }
    ],
    resources: [
      { name: 'Browse Venues', path: '/venues' },
      { name: 'How It Works', path: '/how-it-works' },
      { name: 'Blog', path: '/blog' }
    ]
  };

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <HeartIcon className="w-8 h-8 text-gold-500" />
              <span className="text-2xl font-heading font-bold">
                SmartWed<span className="text-gold-500">360</span>
              </span>
            </div>
            <p className="text-cream text-sm leading-relaxed max-w-md">
              Making your dream wedding a reality with the perfect venue and services. 
              We connect couples with the best wedding vendors across Pakistan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gold-500 font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-cream text-sm hover:text-gold-500 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-gold-500 font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-cream text-sm hover:text-gold-500 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-gold-500 font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-cream text-sm hover:text-gold-500 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gold-500/20 mt-8 pt-8 text-center">
          <p className="text-cream text-sm">
            © {currentYear} SmartWed 360. All rights reserved. Made with ❤️ for happy couples
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;