import React, { useState, useEffect } from 'react';
import { Star, ArrowRight, ChevronLeft, ChevronRight, Flame, Tag, Clock, Award, TrendingUp, Sparkles, LucideIcon } from 'lucide-react';
import './css/FeaturedProducts.css';

// TypeScript interfaces
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number | null;
  picture: string;
  rating: number;
  review_count: number;
  in_stock: boolean;
}

interface FeaturedSection {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  products: Product[];
  color: string;
  loading: boolean;
  viewAllLink?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  isInWishlist: boolean;
}

interface ProductCarouselProps {
  section: FeaturedSection;
}

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    price: 199.99,
    original_price: 249.99,
    picture: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    rating: 4.8,
    review_count: 124,
    in_stock: true
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    slug: 'smart-fitness-watch',
    price: 299.99,
    original_price: 399.99,
    picture: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    rating: 4.6,
    review_count: 89,
    in_stock: true
  },
  {
    id: '3',
    name: 'Minimalist Desk Lamp',
    slug: 'minimalist-desk-lamp',
    price: 89.99,
    original_price: null,
    picture: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop',
    rating: 4.9,
    review_count: 67,
    in_stock: true
  },
  {
    id: '4',
    name: 'Eco-Friendly Water Bottle',
    slug: 'eco-friendly-water-bottle',
    price: 34.99,
    original_price: 44.99,
    picture: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop',
    rating: 4.7,
    review_count: 203,
    in_stock: false
  },
  {
    id: '5',
    name: 'Wireless Charging Pad',
    slug: 'wireless-charging-pad',
    price: 49.99,
    original_price: null,
    picture: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=300&fit=crop',
    rating: 4.5,
    review_count: 156,
    in_stock: true
  }
];

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onToggleWishlist, isInWishlist }) => {
  const discountPercentage = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="product-card">
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="discount-badge">
          -{discountPercentage}%
        </div>
      )}

      {/* Stock Badge */}
      {!product.in_stock && (
        <div className="stock-badge">
          Out of Stock
        </div>
      )}

      {/* Product Image */}
      <div className="product-image-container">
        <img
          src={product.picture}
          alt={product.name}
          className="product-image"
        />
        <div className="image-overlay"></div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        {/* Rating */}
        <div className="product-rating">
          <div className="rating-stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={`star ${i < Math.floor(product.rating) ? 'filled' : ''}`}
              />
            ))}
          </div>
          <span className="rating-text">
            {product.rating} ({product.review_count})
          </span>
        </div>

        {/* Price */}
        <div className="product-pricing">
          <span className="current-price">${product.price}</span>
          {product.original_price && (
            <span className="original-price">${product.original_price}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="product-actions">
          <button
            onClick={() => onAddToCart(product.id)}
            disabled={!product.in_stock}
            className={`add-to-cart-btn ${!product.in_stock ? 'disabled' : ''}`}
          >
            {product.in_stock ? 'Add to Cart' : 'Sold Out'}
          </button>
          <button
            onClick={() => onToggleWishlist(product.id)}
            className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
          >
            <Star size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const FeaturedProducts: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('featured');
  const [carouselPositions, setCarouselPositions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const featuredSections: FeaturedSection[] = [
    {
      id: 'featured',
      title: 'Featured Products',
      subtitle: 'Hand-picked premium selections',
      icon: Sparkles,
      products: mockProducts,
      color: 'var(--primary-color)',
      loading: loading,
      viewAllLink: '/products?featured=true'
    },
    {
      id: 'deals',
      title: 'Hot Deals',
      subtitle: 'Limited time flash sales',
      icon: Flame,
      products: mockProducts.slice(0, 3),
      color: 'var(--error-color)',
      loading: loading,
      viewAllLink: '/products?deals=true'
    },
    {
      id: 'new',
      title: 'New Arrivals',
      subtitle: 'Fresh additions to our catalog',
      icon: TrendingUp,
      products: mockProducts.slice(1, 4),
      color: 'var(--success-color)',
      loading: loading,
      viewAllLink: '/products?new=true'
    },
    {
      id: 'rated',
      title: 'Top Rated',
      subtitle: 'Customer favorites & bestsellers',
      icon: Award,
      products: mockProducts.slice(2, 5),
      color: 'var(--warning-color)',
      loading: loading,
      viewAllLink: '/products?top_rated=true'
    }
  ];

  const scrollCarousel = (sectionId: string, direction: 'left' | 'right'): void => {
    const container = document.getElementById(`carousel-${sectionId}`);
    if (!container) return;

    const scrollAmount = 320;
    const currentPosition = carouselPositions[sectionId] || 0;
    const maxScroll = container.scrollWidth - container.clientWidth;

    let newPosition;
    if (direction === 'left') {
      newPosition = Math.max(0, currentPosition - scrollAmount);
    } else {
      newPosition = Math.min(maxScroll, currentPosition + scrollAmount);
    }

    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setCarouselPositions(prev => ({ ...prev, [sectionId]: newPosition }));
  };

  const ProductCarousel: React.FC<ProductCarouselProps> = ({ section }) => {
    const canScrollLeft = (carouselPositions[section.id] || 0) > 0;
    const canScrollRight = (): boolean => {
      const container = document.getElementById(`carousel-${section.id}`);
      if (!container) return true;
      const maxScroll = container.scrollWidth - container.clientWidth;
      return (carouselPositions[section.id] || 0) < maxScroll;
    };

    if (section.loading) {
      return (
        <div className="carousel-container">
          <div className="loading-carousel">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="loading-card">
                <div className="loading-image"></div>
                <div className="loading-content">
                  <div className="loading-line"></div>
                  <div className="loading-line short"></div>
                  <div className="loading-line"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!section.products || section.products.length === 0) {
      return (
        <div className="empty-section">
          <section.icon className="empty-icon" size={48} />
          <p>No products available in this section yet.</p>
        </div>
      );
    }

    return (
      <div className="carousel-container">
        {section.products.length > 4 && (
          <>
            <button
              className={`carousel-btn carousel-btn-left ${!canScrollLeft ? 'disabled' : ''}`}
              onClick={() => scrollCarousel(section.id, 'left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className={`carousel-btn carousel-btn-right ${!canScrollRight() ? 'disabled' : ''}`}
              onClick={() => scrollCarousel(section.id, 'right')}
              disabled={!canScrollRight()}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div
          id={`carousel-${section.id}`}
          className="product-carousel"
          onScroll={(e: React.UIEvent<HTMLDivElement>) => {
            const target = e.target as HTMLDivElement;
            setCarouselPositions(prev => ({
              ...prev,
              [section.id]: target.scrollLeft
            }));
          }}
        >
          {section.products.map((product) => (
            <div key={product.id} className="carousel-item">
              <ProductCard
                product={product}
                onAddToCart={(id) => console.log('Add to cart:', id)}
                onToggleWishlist={(id) => console.log('Toggle wishlist:', id)}
                isInWishlist={false}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SectionTabs = () => (
    <div className="section-tabs">
      {featuredSections.map((section) => {
        const IconComponent = section.icon;
        return (
          <button
            key={section.id}
            className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
            style={{ '--tab-color': section.color } as React.CSSProperties}
          >
            <IconComponent size={20} />
            <span className="tab-title">{section.title}</span>
            <span className="tab-count">
              {section.products?.length || 0}
            </span>
          </button>
        );
      })}
    </div>
  );

  const activeFeatureSection: FeaturedSection | undefined = featuredSections.find(s => s.id === activeSection);

  return (
    <div className="featured-products-container">
      <div className="featured-products-card">
        {/* Main Header */}
        <div className="main-header-feature">
          <h1 className="main-title">
            Discover Amazing
            <span className="gradient-text"> Products</span>
          </h1>
          <p className="main-subtitle">
            Curated collections of premium products, exclusive deals, and trending items just for you
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <SectionTabs />

        {/* Section Header */}
        {activeFeatureSection && (
          <div className="featured-header">
            <div className="header-content">
              <div className="header-icon-wrapper" style={{ '--section-color': activeFeatureSection.color } as React.CSSProperties}>
                <activeFeatureSection.icon className="header-icon" size={32} />
              </div>
              <div className="header-text">
                <h2 className="section-title">{activeFeatureSection.title}</h2>
                <p className="section-subtitle">{activeFeatureSection.subtitle}</p>
              </div>
            </div>
            {activeFeatureSection.viewAllLink && (
              <button className="view-all-btn" style={{ '--btn-color': activeFeatureSection.color } as React.CSSProperties}>
                View All
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}

        {/* Active Section Content */}
        {activeFeatureSection && (
          <div className="section-content">
            <ProductCarousel section={activeFeatureSection} />
          </div>
        )}

        {/* Section Indicators */}
        <div className="section-indicators">
          {featuredSections.map((section) => (
            <div
              key={section.id}
              className={`indicator ${activeSection === section.id ? 'active' : ''}`}
              style={{ backgroundColor: section.color }}
              onClick={() => setActiveSection(section.id)}
            />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        {featuredSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <div key={section.id} className="stat-item" style={{ '--stat-color': section.color } as React.CSSProperties}>
              <IconComponent className="stat-icon" size={24} />
              <div className="stat-content">
                <span className="stat-number">{section.products?.length || 0}</span>
                <span className="stat-label">{section.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedProducts;