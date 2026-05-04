import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-6"
        >
          <HeartIcon className="w-16 h-16 text-gold-500" />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-primary-900 font-semibold text-lg"
        >
          Loading your wedding magic...
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingSpinner;