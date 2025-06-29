import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCircleNotch, faCog, faSync } from '@fortawesome/free-solid-svg-icons';
import './Loading.css';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerType = 'default' | 'notch' | 'cog' | 'sync';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  type?: SpinnerType;
  color?: string;
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
  inline?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  type = 'default',
  color,
  speed = 'normal',
  className = '',
  inline = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'notch':
        return faCircleNotch;
      case 'cog':
        return faCog;
      case 'sync':
        return faSync;
      default:
        return faSpinner;
    }
  };

  const getAnimationDuration = () => {
    switch (speed) {
      case 'slow':
        return '2s';
      case 'fast':
        return '0.5s';
      default:
        return '1s';
    }
  };

  const spinnerClasses = [
    'loading-spinner',
    `loading-spinner--${size}`,
    inline ? 'loading-spinner--inline' : '',
    className
  ].filter(Boolean).join(' ');

  const iconStyle = {
    color,
    animationDuration: getAnimationDuration()
  };

  return (
    <div className={spinnerClasses}>
      <FontAwesomeIcon 
        icon={getIcon()} 
        spin 
        style={iconStyle}
        data-testid="loading-spinner"
      />
    </div>
  );
};

export default LoadingSpinner;
