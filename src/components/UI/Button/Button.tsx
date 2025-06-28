import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: IconDefinition | React.ReactElement;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  as?: React.ElementType;
  to?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  as: Component = 'button',
  to,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseClasses = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const fullWidthClass = fullWidth ? 'btn--full-width' : '';
  const loadingClass = loading ? 'btn--loading' : '';
  
  const classes = [
    baseClasses,
    variantClass,
    sizeClass,
    fullWidthClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  const renderIcon = () => {
    if (loading) {
      return <span className="btn__spinner" />;
    }
    
    if (icon) {
      // Check if icon is a FontAwesome IconDefinition
      if (typeof icon === 'object' && icon && 'iconName' in (icon as any)) {
        return <FontAwesomeIcon icon={icon as IconDefinition} className="btn__icon" />;
      } else {
        // It's a React element (like <FontAwesomeIcon />)
        return <span className="btn__icon">{icon as React.ReactElement}</span>;
      }
    }
    
    return null;
  };

  const buttonContent = (
    <>
      {iconPosition === 'left' && renderIcon()}
      <span className="btn__text">{children}</span>
      {iconPosition === 'right' && renderIcon()}
    </>
  );

  if (Component === 'button') {
    return (
      <button
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }

  // For other components like Link
  return (
    <Component
      className={classes}
      to={to}
      {...props}
    >
      {buttonContent}
    </Component>
  );
};

export default Button;
