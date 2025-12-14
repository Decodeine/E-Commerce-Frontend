import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationTriangle, 
  faInfoCircle, 
  faTimes,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast.persistent && toast.duration !== 0) {
      const duration = toast.duration || 5000;
      const timer = setTimeout(() => {
        handleRemove();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.persistent]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Match CSS animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faExclamationCircle;
      case 'warning':
        return faExclamationTriangle;
      case 'info':
      default:
        return faInfoCircle;
    }
  };

  return (
    <div 
      className={`toast toast--${toast.type} ${isVisible ? 'toast--visible' : ''} ${isRemoving ? 'toast--removing' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__icon">
        <FontAwesomeIcon icon={getIcon()} />
      </div>
      
      <div className="toast__content">
        <div className="toast__title">{toast.title}</div>
        {toast.message && (
          <div className="toast__message">{toast.message}</div>
        )}
        
        {toast.action && (
          <button 
            className="toast__action"
            onClick={toast.action.onClick}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      <button 
        className="toast__close"
        onClick={handleRemove}
        aria-label="Close notification"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
};

export default Toast;