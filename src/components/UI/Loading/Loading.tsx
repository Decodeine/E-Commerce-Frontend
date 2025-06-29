import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import './Loading.css';

// Re-export LoadingSpinner for convenience
export { default as LoadingSpinner } from './LoadingSpinner';

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton';

interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  color?: string;
  text?: string;
  overlay?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  color,
  text,
  overlay = false,
  className = ''
}) => {
  const renderSpinner = () => (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <FontAwesomeIcon 
        icon={faSpinner} 
        spin 
        style={{ color }} 
      />
    </div>
  );

  const renderDots = () => (
    <div className={`loading-dots loading-dots--${size}`}>
      <div className="loading-dot" style={{ backgroundColor: color }}></div>
      <div className="loading-dot" style={{ backgroundColor: color }}></div>
      <div className="loading-dot" style={{ backgroundColor: color }}></div>
    </div>
  );

  const renderPulse = () => (
    <div className={`loading-pulse loading-pulse--${size}`}>
      <div className="loading-pulse-circle" style={{ backgroundColor: color }}></div>
    </div>
  );

  const renderSkeleton = () => (
    <div className={`loading-skeleton loading-skeleton--${size}`}>
      <div className="loading-skeleton-line"></div>
      <div className="loading-skeleton-line loading-skeleton-line--short"></div>
      <div className="loading-skeleton-line"></div>
    </div>
  );

  const renderLoadingAnimation = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className={`loading loading--${variant} ${className}`}>
      {renderLoadingAnimation()}
      {text && (
        <div className={`loading-text loading-text--${size}`}>
          {text}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className="loading-overlay-content">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Skeleton components for specific UI elements
export const ProductCardSkeleton: React.FC = () => (
  <div className="product-card-skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-line skeleton-line--title"></div>
      <div className="skeleton-line skeleton-line--subtitle"></div>
      <div className="skeleton-line skeleton-line--price"></div>
      <div className="skeleton-button"></div>
    </div>
  </div>
);

export const ProductListSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="product-list-skeleton">
    {Array.from({ length: count }, (_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

export const ProductDetailsSkeleton: React.FC = () => (
  <div className="product-details-skeleton">
    <div className="skeleton-gallery">
      <div className="skeleton-main-image"></div>
      <div className="skeleton-thumbnails">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="skeleton-thumbnail"></div>
        ))}
      </div>
    </div>
    <div className="skeleton-info">
      <div className="skeleton-line skeleton-line--title"></div>
      <div className="skeleton-line skeleton-line--subtitle"></div>
      <div className="skeleton-line skeleton-line--rating"></div>
      <div className="skeleton-line skeleton-line--price"></div>
      <div className="skeleton-actions">
        <div className="skeleton-button skeleton-button--primary"></div>
        <div className="skeleton-button skeleton-button--secondary"></div>
      </div>
    </div>
  </div>
);

export const NavbarSkeleton: React.FC = () => (
  <div className="navbar-skeleton">
    <div className="skeleton-logo"></div>
    <div className="skeleton-nav-items">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="skeleton-nav-item"></div>
      ))}
    </div>
    <div className="skeleton-actions">
      <div className="skeleton-icon"></div>
      <div className="skeleton-icon"></div>
    </div>
  </div>
);

export default Loading;
