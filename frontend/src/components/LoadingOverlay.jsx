import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';

const LoadingOverlay = ({ message = "Processing..." }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <HeartIcon className="w-8 h-8 text-primary-900" />
        </motion.div>
        <p className="text-primary-900 font-semibold">{message}</p>
      </motion.div>
    </div>
  );
};

export default LoadingOverlay;