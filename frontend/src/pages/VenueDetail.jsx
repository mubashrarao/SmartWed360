import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPinIcon, 
  UserGroupIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  CheckIcon, 
  XMarkIcon,
  SparklesIcon,
  MusicalNoteIcon,
  CameraIcon,
  FireIcon,
  TruckIcon,
  SunIcon,
  MoonIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Booking state
  const [selectedEventType, setSelectedEventType] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [guestCount, setGuestCount] = useState(100);
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [facilitiesTotal, setFacilitiesTotal] = useState(0);

  useEffect(() => {
    fetchVenueDetails();
  }, [id]);

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedEventType, selectedTimeSlot, selectedFacilities]);

  const fetchVenueDetails = async () => {
    try {
      const response = await api.get(`/customer/venues/${id}`);
      setVenue(response.data.data);
      
      // Set default selections
      if (response.data.data.eventTypes?.length > 0) {
        setSelectedEventType(response.data.data.eventTypes[0].type);
        if (response.data.data.eventTypes[0].timeSlots?.length > 0) {
          setSelectedTimeSlot(response.data.data.eventTypes[0].timeSlots[0].timeType);
        }
      }
    } catch (error) {
      console.error('Failed to fetch venue:', error);
      toast.error('Venue not found');
      navigate('/venues');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!venue || !selectedEventType) return;
    
    const eventType = venue.eventTypes?.find(et => et.type === selectedEventType);
    if (!eventType) return;
    
    const timeSlot = eventType.timeSlots?.find(ts => ts.timeType === selectedTimeSlot);
    const venuePrice = timeSlot?.price || venue.basePrice || 0;
    
    const facilitiesPrice = selectedFacilities.reduce((total, facId) => {
      const facility = venue.facilities?.find(f => f._id === facId);
      return total + (facility?.price || 0);
    }, 0);
    
    setFacilitiesTotal(facilitiesPrice);
    setCalculatedPrice(venuePrice + facilitiesPrice);
  };

  const toggleFacility = (facilityId) => {
    setSelectedFacilities(prev => 
      prev.includes(facilityId) 
        ? prev.filter(id => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to book this venue');
      navigate('/login');
      return;
    }

    if (user.role !== 'customer') {
      toast.error('Only customers can book venues');
      return;
    }

    if (!selectedEventType || !selectedTimeSlot) {
      toast.error('Please select event type and time slot');
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await api.post('/bookings', {
        venueId: venue._id,
        eventType: selectedEventType,
        timeSlot: selectedTimeSlot,
        eventDate: selectedDate,
        guestCount,
        specialRequests,
        selectedFacilities: selectedFacilities.map(fid => ({ facilityId: fid, quantity: 1 }))
      });
      
      toast.success('Booking request sent successfully!');
      setShowBookingForm(false);
      navigate('/customer/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getFacilityIcon = (category) => {
    switch(category) {
      case 'decor': return <SparklesIcon className="w-5 h-5" />;
      case 'music': return <MusicalNoteIcon className="w-5 h-5" />;
      case 'photography': return <CameraIcon className="w-5 h-5" />;
      case 'fireworks': return <FireIcon className="w-5 h-5" />;
      case 'transport': return <TruckIcon className="w-5 h-5" />;
      default: return <CheckIcon className="w-5 h-5" />;
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!venue) return null;

  const eventTypeOptions = venue.eventTypes || [];
  const timeSlotOptions = eventTypeOptions.find(et => et.type === selectedEventType)?.timeSlots || [];
  const facilitiesList = venue.facilities || [];

  // Create image array with placeholders if no images
  const images = venue.images?.length > 0 ? venue.images : [
    { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' }
  ];

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-2 h-96 lg:h-[500px] rounded-2xl overflow-hidden">
              <img
                src={images[selectedImage]?.url}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 h-96 lg:h-[500px] overflow-y-auto">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-32 lg:h-24 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-gold-500' : ''
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${venue.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Venue Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-900 mb-4">
                  {venue.name}
                </h1>
                
                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <MapPinIcon className="w-5 h-5 text-gold-500" />
                  <span>{venue.address}, {venue.city}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-4 bg-gold-50 rounded-lg">
                    <UserGroupIcon className="w-6 h-6 text-gold-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="font-bold text-primary-900">{venue.capacity} guests</p>
                  </div>
                  <div className="text-center p-4 bg-gold-50 rounded-lg">
                    <BuildingOfficeIcon className="w-6 h-6 text-gold-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-bold text-primary-900">{venue.category?.name || 'N/A'}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-primary-900 mb-4">Description</h2>
                  <p className="text-gray-600 leading-relaxed">{venue.description}</p>
                </div>

                {/* Amenities */}
                {venue.amenities?.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-primary-900 mb-4">Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {venue.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckIcon className="w-5 h-5 text-gold-500" />
                          <span className="text-gray-600">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facilities */}
                {facilitiesList.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-primary-900 mb-4">Available Facilities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {facilitiesList.map((facility, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {getFacilityIcon(facility.category)}
                            <div>
                              <p className="font-medium text-primary-900">{facility.name}</p>
                              <p className="text-xs text-gray-500">{facility.description}</p>
                            </div>
                          </div>
                          <p className="text-gold-500 font-semibold">Rs. {facility.price.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
                {!showBookingForm ? (
                  <>
                    <div className="text-center mb-6">
                      <p className="text-3xl font-bold text-gold-500 mb-2">
                        Rs. {venue.basePrice?.toLocaleString()}
                      </p>
                      <p className="text-gray-500">starting price per event</p>
                    </div>
                    <button
                      onClick={() => setShowBookingForm(true)}
                      className="w-full btn-primary py-4 text-lg mb-4"
                    >
                      Check Availability & Book
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleBooking} className="space-y-4">
                    <h3 className="text-lg font-bold text-primary-900 mb-4">Book This Venue</h3>
                    
                    {/* Event Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Type *
                      </label>
                      <select
                        value={selectedEventType}
                        onChange={(e) => setSelectedEventType(e.target.value)}
                        className="input-field"
                        required
                      >
                        {eventTypeOptions.map(et => (
                          <option key={et.type} value={et.type}>{et.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Time Slot Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Slot *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlotOptions.map(ts => (
                          <button
                            key={ts.timeType}
                            type="button"
                            onClick={() => setSelectedTimeSlot(ts.timeType)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              selectedTimeSlot === ts.timeType
                                ? 'border-gold-500 bg-gold-50 text-primary-900'
                                : 'border-gray-200 hover:border-gold-300'
                            }`}
                          >
                            <div className="font-semibold flex items-center justify-center gap-1">
                              {ts.timeType === 'day' ? (
                                <SunIcon className="w-4 h-4 text-gold-500" />
                              ) : (
                                <MoonIcon className="w-4 h-4 text-gold-500" />
                              )}
                              {ts.timeType === 'day' ? 'Day Time' : 'Night Time'}
                            </div>
                            <div className="text-sm">Rs. {ts.price.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{ts.startTime} - {ts.endTime}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Date *
                      </label>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        minDate={new Date()}
                        className="input-field"
                        dateFormat="MMMM d, yyyy"
                        required
                      />
                    </div>

                    {/* Guest Count */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Guests *
                      </label>
                      <div className="relative">
                        <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={guestCount}
                          onChange={(e) => setGuestCount(parseInt(e.target.value))}
                          min="1"
                          max={venue.capacity}
                          className="input-field pl-10"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Max capacity: {venue.capacity} guests
                      </p>
                    </div>

                    {/* Facilities Selection */}
                    {facilitiesList.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add-on Facilities
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {facilitiesList.map(facility => (
                            <label key={facility._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gold-50">
                              <div className="flex items-center gap-3">
                                {getFacilityIcon(facility.category)}
                                <div>
                                  <span className="font-medium text-gray-700">{facility.name}</span>
                                  <p className="text-xs text-gray-500">{facility.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-gold-500 font-semibold">Rs. {facility.price.toLocaleString()}</span>
                                <input
                                  type="checkbox"
                                  checked={selectedFacilities.includes(facility._id)}
                                  onChange={() => toggleFacility(facility._id)}
                                  className="w-5 h-5 text-gold-500 rounded"
                                />
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-primary-900 mb-2">Price Breakdown</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Venue Price:</span>
                          <span>Rs. {(calculatedPrice - facilitiesTotal).toLocaleString()}</span>
                        </div>
                        {facilitiesTotal > 0 && (
                          <div className="flex justify-between">
                            <span>Facilities Total:</span>
                            <span>Rs. {facilitiesTotal.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                          <span>Total Price:</span>
                          <span className="text-gold-500">Rs. {calculatedPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        rows="3"
                        className="input-field"
                        placeholder="Any special requirements?"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full btn-primary py-3 disabled:opacity-50"
                    >
                      {submitting ? 'Sending Request...' : 'Send Booking Request'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="w-full btn-gold py-3"
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-primary-900 mb-4">Contact Vendor</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-gold-500" />
                      <span className="text-gray-600">{venue.contactPhone}</span>
                    </div>
                    {venue.contactEmail && (
                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="w-5 h-5 text-gold-500" />
                        <span className="text-gray-600">{venue.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VenueDetail;