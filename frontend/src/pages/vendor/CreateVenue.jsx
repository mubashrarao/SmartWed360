import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  SparklesIcon,
  MusicalNoteIcon,
  CameraIcon,
  FireIcon,
  TruckIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateVenue = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const fileInputRef = useRef(null);
  
  // Basic Info
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    basePrice: '',
    capacity: '',
    city: '',
    address: '',
    contactPhone: '',
    contactEmail: ''
  });
  
  // Amenities
  const [amenities, setAmenities] = useState([]);
  const [newAmenity, setNewAmenity] = useState('');
  
  // Event Types
  const [eventTypes, setEventTypes] = useState([
    {
      type: 'mehendi',
      name: 'Mehendi Ceremony',
      isActive: true,
      timeSlots: [
        { timeType: 'day', price: '', startTime: '10:00', endTime: '17:00' },
        { timeType: 'night', price: '', startTime: '17:00', endTime: '22:00' }
      ]
    },
    {
      type: 'barat',
      name: 'Barat (Wedding)',
      isActive: true,
      timeSlots: [
        { timeType: 'day', price: '', startTime: '11:00', endTime: '16:00' },
        { timeType: 'night', price: '', startTime: '19:00', endTime: '00:00' }
      ]
    },
    {
      type: 'walima',
      name: 'Walima (Reception)',
      isActive: true,
      timeSlots: [
        { timeType: 'day', price: '', startTime: '12:00', endTime: '17:00' },
        { timeType: 'night', price: '', startTime: '18:00', endTime: '23:00' }
      ]
    },
    {
      type: 'bridal_shower',
      name: 'Bridal Shower',
      isActive: true,
      timeSlots: [
        { timeType: 'day', price: '', startTime: '12:00', endTime: '17:00' },
        { timeType: 'night', price: '', startTime: '17:00', endTime: '22:00' }
      ]
    },
    {
      type: 'birthday',
      name: 'Birthday Party',
      isActive: true,
      timeSlots: [
        { timeType: 'day', price: '', startTime: '12:00', endTime: '17:00' },
        { timeType: 'night', price: '', startTime: '18:00', endTime: '23:00' }
      ]
    },
    {
      type: 'get_together',
      name: 'Get Together',
      isActive: true,
      timeSlots: [
        { timeType: 'day', price: '', startTime: '10:00', endTime: '16:00' },
        { timeType: 'night', price: '', startTime: '17:00', endTime: '22:00' }
      ]
    }
  ]);
  
  // Facilities
  const [facilities, setFacilities] = useState([
    { name: 'Professional Decor', description: 'Full event decoration with floral arrangements', price: '', category: 'decor', isAvailable: true },
    { name: 'DJ & Sound System', description: 'Professional DJ with high-quality sound system', price: '', category: 'music', isAvailable: true },
    { name: 'Photography Package', description: 'Professional photography (4 hours)', price: '', category: 'photography', isAvailable: true },
    { name: 'Drone Coverage', description: 'Aerial drone videography', price: '', category: 'photography', isAvailable: true },
    { name: 'Fireworks Display', description: '10-minute fireworks show', price: '', category: 'fireworks', isAvailable: true },
    { name: 'Valet Parking', description: 'Valet parking service', price: '', category: 'transport', isAvailable: true },
    { name: 'Catering Service', description: 'Premium catering service', price: '', category: 'catering', isAvailable: true },
    { name: 'Lighting Setup', description: 'Professional lighting with effects', price: '', category: 'lighting', isAvailable: true }
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/vendor/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEventTypePriceChange = (eventIndex, slotIndex, value) => {
    const updatedEventTypes = [...eventTypes];
    updatedEventTypes[eventIndex].timeSlots[slotIndex].price = value;
    setEventTypes(updatedEventTypes);
  };

  const handleFacilityPriceChange = (index, value) => {
    const updatedFacilities = [...facilities];
    updatedFacilities[index].price = value;
    setFacilities(updatedFacilities);
  };

  const toggleEventType = (index) => {
    const updated = [...eventTypes];
    updated[index].isActive = !updated[index].isActive;
    setEventTypes(updated);
  };

  const toggleFacility = (index) => {
    const updated = [...facilities];
    updated[index].isAvailable = !updated[index].isAvailable;
    setFacilities(updated);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('You can only upload up to 5 images');
      return;
    }
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const activeEventTypes = eventTypes
        .filter(et => et.isActive)
        .map(et => ({
          type: et.type,
          name: et.name,
          timeSlots: et.timeSlots.filter(ts => ts.price && ts.price > 0).map(ts => ({
            timeType: ts.timeType,
            price: parseInt(ts.price),
            startTime: ts.startTime,
            endTime: ts.endTime
          }))
        }))
        .filter(et => et.timeSlots.length > 0);

      const activeFacilities = facilities
        .filter(f => f.isAvailable && f.price && f.price > 0)
        .map(f => ({
          name: f.name,
          description: f.description,
          price: parseInt(f.price),
          category: f.category,
          isAvailable: true
        }));

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('basePrice', formData.basePrice);
      submitData.append('capacity', formData.capacity);
      submitData.append('city', formData.city);
      submitData.append('address', formData.address);
      submitData.append('contactPhone', formData.contactPhone);
      submitData.append('contactEmail', formData.contactEmail || '');
      submitData.append('amenities', JSON.stringify(amenities));
      submitData.append('eventTypes', JSON.stringify(activeEventTypes));
      submitData.append('facilities', JSON.stringify(activeFacilities));
      
      imageFiles.forEach(file => {
        submitData.append('images', file);
      });

      const response = await api.post('/vendor/venues', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Venue created successfully!');
      navigate('/vendor/venues');
    } catch (error) {
      console.error('Create venue error:', error);
      toast.error(error.response?.data?.message || 'Failed to create venue');
    } finally {
      setLoading(false);
    }
  };

  const getFacilityIcon = (category) => {
    switch(category) {
      case 'decor': return <SparklesIcon className="w-4 h-4" />;
      case 'music': return <MusicalNoteIcon className="w-4 h-4" />;
      case 'photography': return <CameraIcon className="w-4 h-4" />;
      case 'fireworks': return <FireIcon className="w-4 h-4" />;
      case 'transport': return <TruckIcon className="w-4 h-4" />;
      default: return <CheckIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container-custom max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-primary-900" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-primary-900">
                Add New Venue
              </h1>
              <p className="text-gray-500">List your venue with event types and facilities</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ===== BASIC INFORMATION ===== */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-primary-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    className="input-field" placeholder="e.g., Grand Pearl Wedding Hall" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange}
                    className="input-field" required>
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (PKR) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500 font-semibold">Rs.</span>
                    <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange}
                      className="input-field pl-12" placeholder="250000" required />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Base price for reference. Set event-specific prices below.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Capacity *</label>
                  <div className="relative">
                    <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="number" name="capacity" value={formData.capacity} onChange={handleChange}
                      className="input-field pl-10" placeholder="500" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" name="city" value={formData.city} onChange={handleChange}
                      className="input-field pl-10" placeholder="Islamabad" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange}
                    className="input-field" placeholder="Street, Sector, etc." required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange}
                      className="input-field pl-10" placeholder="+92 300 1234567" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange}
                      className="input-field pl-10" placeholder="info@venue.com" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  rows="4" className="input-field" placeholder="Describe your venue, its unique features, amenities, etc." required />
              </div>
            </div>

            {/* ===== EVENT TYPES WITH TIME-BASED PRICING - NO EMOJIS ===== */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-gold-500" />
                Event Types & Time-Based Pricing
              </h2>
              <p className="text-sm text-gray-500 mb-4">Set different prices for Day and Night events. Day time events are typically less expensive.</p>
              
              <div className="space-y-6">
                {eventTypes.map((event, idx) => (
                  <div key={event.type} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={event.isActive}
                          onChange={() => toggleEventType(idx)}
                          className="w-4 h-4 text-gold-500 rounded"
                        />
                        <label className="font-semibold text-primary-900">{event.name}</label>
                      </div>
                      <span className="text-xs text-gray-400">
                        {event.timeSlots[0].startTime}-{event.timeSlots[0].endTime} | {event.timeSlots[1].startTime}-{event.timeSlots[1].endTime}
                      </span>
                    </div>
                    
                    {event.isActive && (
                      <div className="grid grid-cols-2 gap-4 ml-6">
                        <div className="bg-gold-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <SunIcon className="w-4 h-4 text-gold-500" />
                            <p className="text-sm font-medium">Day Time</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gold-500 font-semibold">Rs.</span>
                            <input
                              type="number"
                              placeholder="Price"
                              value={event.timeSlots[0].price}
                              onChange={(e) => handleEventTypePriceChange(idx, 0, e.target.value)}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{event.timeSlots[0].startTime} - {event.timeSlots[0].endTime}</p>
                        </div>
                        <div className="bg-gold-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <MoonIcon className="w-4 h-4 text-gold-500" />
                            <p className="text-sm font-medium">Night Time</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gold-500 font-semibold">Rs.</span>
                            <input
                              type="number"
                              placeholder="Price"
                              value={event.timeSlots[1].price}
                              onChange={(e) => handleEventTypePriceChange(idx, 1, e.target.value)}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{event.timeSlots[1].startTime} - {event.timeSlots[1].endTime}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Note: Day events are typically less expensive. For example: Day: 200,000 PKR, Night: 300,000 PKR</p>
            </div>

            {/* ===== FACILITIES WITH PRICING ===== */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-gold-500" />
                Facilities & Add-ons
              </h2>
              <p className="text-sm text-gray-500 mb-4">Add extra services that customers can book with your venue.</p>
              
              <div className="space-y-3">
                {facilities.map((facility, idx) => (
                  <div key={facility.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={facility.isAvailable}
                        onChange={() => toggleFacility(idx)}
                        className="w-4 h-4 text-gold-500 rounded"
                      />
                      <div className="flex items-center gap-2">
                        {getFacilityIcon(facility.category)}
                        <span className="font-medium text-gray-700">{facility.name}</span>
                      </div>
                      <p className="text-xs text-gray-400">{facility.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gold-500 font-semibold text-sm">Rs.</span>
                      <input
                        type="number"
                        placeholder="Price"
                        value={facility.price}
                        onChange={(e) => handleFacilityPriceChange(idx, e.target.value)}
                        disabled={!facility.isAvailable}
                        className="w-28 p-2 border rounded disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== IMAGE UPLOAD ===== */}
            <div className="border-b pb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue Images (Max 5)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gold-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}>
                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP formats accepted. Maximum 5MB per image.</p>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===== AMENITIES ===== */}
            <div className="border-b pb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)}
                  className="flex-1 input-field" placeholder="e.g., Parking, Air Conditioning, WiFi"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()} />
                <button type="button" onClick={handleAddAmenity}
                  className="px-6 py-3 bg-gold-500 text-primary-900 rounded-lg hover:bg-gold-600">
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity) => (
                  <span key={amenity} className="inline-flex items-center gap-1 px-3 py-1 bg-gold-50 text-primary-900 rounded-full border border-gold-500">
                    {amenity}
                    <button type="button" onClick={() => handleRemoveAmenity(amenity)} className="text-primary-900 hover:text-red-500">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* ===== SUBMIT BUTTONS ===== */}
            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={loading}
                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                <CheckIcon className="w-5 h-5" />
                {loading ? 'Creating...' : 'Create Venue'}
              </button>
              <button type="button" onClick={() => navigate('/vendor/venues')}
                className="flex-1 btn-gold py-3">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateVenue;