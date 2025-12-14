import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationTriangle, 
  faInfoCircle, 
  faTimes,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
  defaultDuration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
  defaultDuration = 5000
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  const showToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = {
      ...toastData,
      id,
      duration: toastData.duration ?? defaultDuration
    };

    setToasts(currentToasts => {
      const updatedToasts = [...currentToasts, newToast];
      // Keep only the latest maxToasts
      return updatedToasts.slice(-maxToasts);
    });

    // Auto-remove toast after duration (if duration > 0)
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }

    return id;
  }, [generateId, defaultDuration, maxToasts]);

  const hideToast = useCallback((id: string) => {
    setToasts(currentToasts => {
      const toast = currentToasts.find(t => t.id === id);
      if (toast?.onClose) {
        toast.onClose();
      }
      return currentToasts.filter(t => t.id !== id);
    });
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faExclamationCircle;
      case 'warning':
        return faExclamationTriangle;
      case 'info':
        return faInfoCircle;
      default:
        return faInfoCircle;
    }
  };

  const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    React.useEffect(() => {
      // Trigger animation on mount
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
      setIsExiting(true);
      setTimeout(() => {
        hideToast(toast.id);
      }, 300); // Match CSS animation duration
    };

    const handleAction = () => {
      if (toast.action) {
        toast.action.onClick();
        handleClose();
      }
    };

    return (
      <div 
        className={`toast toast--${toast.type} ${isVisible ? 'toast--visible' : ''} ${isExiting ? 'toast--exiting' : ''}`}
        role="alert"
        aria-live="polite"
      >
        <div className="toast__icon">
          <FontAwesomeIcon icon={getToastIcon(toast.type)} />
        </div>
        
        <div className="toast__content">
          <div className="toast__title">{toast.title}</div>
          {toast.message && (
            <div className="toast__message">{toast.message}</div>
          )}
          
          {toast.action && (
            <button 
              className="toast__action"
              onClick={handleAction}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button 
          className="toast__close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    );
  };

  const contextValue: ToastContextType = {
    toasts,
    showToast,
    hideToast,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className={`toast-container toast-container--${position}`}>
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

// Helper hook for common toast actions
export const useToastActions = () => {
  const { showToast } = useToast();

  const showSuccess = useCallback((title: string, message?: string) => {
    return showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    return showToast({ type: 'error', title, message });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    return showToast({ type: 'warning', title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    return showToast({ type: 'info', title, message });
  }, [showToast]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default ToastProvider;
