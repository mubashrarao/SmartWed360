import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.data?.bookingId) {
      return user?.role === 'vendor' ? '/vendor/bookings' : '/customer/bookings';
    }
    return '#';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container-custom max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary-900">Notifications</h1>
          {notifications.filter(n => !n.isRead).length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-gold-500 hover:text-gold-600 text-sm"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-white rounded-xl shadow-lg p-6 ${
                  !notification.isRead ? 'border-l-4 border-gold-500' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <Link
                    to={getNotificationLink(notification)}
                    className="flex-1"
                    onClick={() => markAsRead(notification._id)}
                  >
                    <h3 className="font-semibold text-primary-900 mb-1">{notification.title}</h3>
                    <p className="text-gray-600 text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </Link>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-gold-500 hover:text-gold-600"
                      title="Mark as read"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;