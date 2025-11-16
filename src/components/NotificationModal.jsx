import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function NotificationModal({ 
  isOpen, 
  onClose, 
  title = "Notification",
  message,
  type = "info" // 'info', 'success', 'warning', 'error'
}) {
  if (!isOpen) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'error':
        return 'bg-red-600';
      case 'info':
      default:
        return 'bg-[#0C8CE9]';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠︎';
      case 'error':
        return '⛌';
      case 'info':
      default:
        return 'ⓘ';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 right-4 z-70"
        >
          <div className={`${getBackgroundColor()} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm`}>
            <span>{getIcon()}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-sm">{message}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-amber-200 ml-2 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}