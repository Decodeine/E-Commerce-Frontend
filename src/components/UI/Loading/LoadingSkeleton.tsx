import React from 'react';
import './Loading.css';

export type SkeletonType = 'text' | 'title' | 'avatar' | 'image' | 'card' | 'product' | 'list';

interface LoadingSkeletonProps {
  type?: SkeletonType;
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
  animated?: boolean;
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'text',
  width,
  height,
  lines = 1,
  className = '',
  animated = true,
  count = 1
}) => {
  const baseClass = `loading-skeleton ${animated ? 'loading-skeleton--animated' : ''} ${className}`;

  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div className={`${baseClass} loading-skeleton--text`}>
            {Array.from({ length: lines }, (_, index) => (
              <div
                key={index}
                className="skeleton-line"
                style={{
                  width: index === lines - 1 && lines > 1 ? '75%' : width,
                  height: height || '1rem'
                }}
              />
            ))}
          </div>
        );

      case 'title':
        return (
          <div 
            className={`${baseClass} loading-skeleton--title`}
            style={{ width: width || '60%', height: height || '1.5rem' }}
          />
        );

      case 'avatar':
        return (
          <div 
            className={`${baseClass} loading-skeleton--avatar`}
            style={{ 
              width: width || '40px', 
              height: height || '40px',
              borderRadius: '50%'
            }}
          />
        );

      case 'image':
        return (
          <div 
            className={`${baseClass} loading-skeleton--image`}
            style={{ 
              width: width || '100%', 
              height: height || '200px'
            }}
          />
        );

      case 'card':
        return (
          <div className={`${baseClass} loading-skeleton--card`}>
            <div className="skeleton-card-image" />
            <div className="skeleton-card-content">
              <div className="skeleton-card-title" />
              <div className="skeleton-card-text" />
              <div className="skeleton-card-text skeleton-card-text--short" />
            </div>
          </div>
        );

      case 'product':
        return (
          <div className={`${baseClass} loading-skeleton--product`}>
            <div className="skeleton-product-image" />
            <div className="skeleton-product-content">
              <div className="skeleton-product-title" />
              <div className="skeleton-product-price" />
              <div className="skeleton-product-rating" />
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`${baseClass} loading-skeleton--list`}>
            {Array.from({ length: lines }, (_, index) => (
              <div key={index} className="skeleton-list-item">
                <div className="skeleton-list-avatar" />
                <div className="skeleton-list-content">
                  <div className="skeleton-list-title" />
                  <div className="skeleton-list-subtitle" />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div 
            className={`${baseClass} loading-skeleton--text`}
            style={{ width, height: height || '1rem' }}
          />
        );
    }
  };

  if (count > 1) {
    return (
      <div className="loading-skeleton-group">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="skeleton-group-item">
            {renderSkeleton()}
          </div>
        ))}
      </div>
    );
  }

  return renderSkeleton();
};

// Specific skeleton components for common use cases
export const TextSkeleton: React.FC<{ lines?: number; width?: string }> = ({ 
  lines = 1, 
  width 
}) => (
  <LoadingSkeleton type="text" lines={lines} width={width} />
);

export const TitleSkeleton: React.FC<{ width?: string }> = ({ width }) => (
  <LoadingSkeleton type="title" width={width} />
);

export const AvatarSkeleton: React.FC<{ size?: string | number }> = ({ size = '40px' }) => (
  <LoadingSkeleton type="avatar" width={size} height={size} />
);

export const ImageSkeleton: React.FC<{ width?: string; height?: string }> = ({ 
  width = '100%', 
  height = '200px' 
}) => (
  <LoadingSkeleton type="image" width={width} height={height} />
);

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton type="card" className={className} />
);

export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton type="product" className={className} />
);

export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({ 
  items = 3, 
  className 
}) => (
  <LoadingSkeleton type="list" lines={items} className={className} />
);

// Composite skeleton components for specific page sections
export const ProductListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="product-list-skeleton">
    {Array.from({ length: count }, (_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

export const ProductDetailSkeleton: React.FC = () => (
  <div className="product-detail-skeleton">
    <div className="skeleton-detail-images">
      <ImageSkeleton height="400px" />
      <div className="skeleton-thumbnails">
        {Array.from({ length: 4 }, (_, index) => (
          <ImageSkeleton key={index} width="80px" height="80px" />
        ))}
      </div>
    </div>
    <div className="skeleton-detail-info">
      <TitleSkeleton width="80%" />
      <TextSkeleton lines={2} />
      <div className="skeleton-price">
        <LoadingSkeleton type="text" width="120px" height="2rem" />
      </div>
      <TextSkeleton lines={4} />
    </div>
  </div>
);

export const CheckoutSkeleton: React.FC = () => (
  <div className="checkout-skeleton">
    <div className="skeleton-checkout-form">
      <TitleSkeleton width="60%" />
      <TextSkeleton lines={6} />
    </div>
    <div className="skeleton-order-summary">
      <TitleSkeleton width="40%" />
      <ListSkeleton items={3} />
    </div>
  </div>
);

export default LoadingSkeleton;
