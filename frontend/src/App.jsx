import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Venues from './pages/Venues';
import VenueDetail from './pages/VenueDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminVendors from './pages/admin/Vendors';
import AdminCategories from './pages/admin/Categories';
import AdminBookings from './pages/admin/Bookings';

// Vendor Pages
import VendorDashboard from './pages/vendor/Dashboard';
import VendorVenues from './pages/vendor/Venues';
import VendorCreateVenue from './pages/vendor/CreateVenue';
import VendorEditVenue from './pages/vendor/EditVenue';
import VendorBookings from './pages/vendor/Bookings';
import VendorProfile from './pages/vendor/Profile';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerBookings from './pages/customer/Bookings';
import CustomerProfile from './pages/customer/Profile';
import CustomerRecommendations from './pages/customer/Recommendations';

// Import new pages
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import FAQ from './pages/FAQ';
import HowItWorks from './pages/HowItWorks';
import Blog from './pages/Blog';

function App() {
  return (
    <Router>
    <ScrollToTop />
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />
            <main className="flex-grow pt-20">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/venues" element={<Venues />} />
                <Route path="/venues/:id" element={<VenueDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/vendors" element={
                  <ProtectedRoute role="admin">
                    <AdminVendors />
                  </ProtectedRoute>
                } />
                <Route path="/admin/categories" element={
                  <ProtectedRoute role="admin">
                    <AdminCategories />
                  </ProtectedRoute>
                } />
                <Route path="/admin/bookings" element={
                  <ProtectedRoute role="admin">
                    <AdminBookings />
                  </ProtectedRoute>
                } />

                {/* Vendor Routes */}
                <Route path="/vendor/dashboard" element={
                  <ProtectedRoute role="vendor">
                    <VendorDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/vendor/venues" element={
                  <ProtectedRoute role="vendor">
                    <VendorVenues />
                  </ProtectedRoute>
                } />
                <Route path="/vendor/venues/new" element={
                  <ProtectedRoute role="vendor">
                    <VendorCreateVenue />
                  </ProtectedRoute>
                } />
                <Route path="/vendor/venues/edit/:id" element={
                  <ProtectedRoute role="vendor">
                    <VendorEditVenue />
                  </ProtectedRoute>
                } />
                <Route path="/vendor/bookings" element={
                  <ProtectedRoute role="vendor">
                    <VendorBookings />
                  </ProtectedRoute>
                } />
                <Route path="/vendor/profile" element={
                  <ProtectedRoute role="vendor">
                    <VendorProfile />
                  </ProtectedRoute>
                } />

                {/* Customer Routes */}
                <Route path="/customer/dashboard" element={
                  <ProtectedRoute role="customer">
                    <CustomerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/customer/bookings" element={
                  <ProtectedRoute role="customer">
                    <CustomerBookings />
                  </ProtectedRoute>
                } />
                <Route path="/customer/profile" element={
                  <ProtectedRoute role="customer">
                    <CustomerProfile />
                  </ProtectedRoute>
                } />
                <Route path="/customer/recommendations" element={
                  <ProtectedRoute role="customer">
                    <CustomerRecommendations />
                  </ProtectedRoute>
                } />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/blog" element={<Blog />} />

                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: '#800020',
                  color: '#fff',
                  border: '2px solid #D4AF37',
                },
              }}
            />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;