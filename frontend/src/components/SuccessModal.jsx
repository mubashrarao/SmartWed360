import { CheckCircleIcon } from '@heroicons/react/24/solid';

const SuccessModal = ({ show, onClose, message }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center max-w-md">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-primary-900 mb-2">Success!</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <button onClick={onClose} className="btn-primary">Continue</button>
      </div>
    </div>
  );
};

export default SuccessModal;