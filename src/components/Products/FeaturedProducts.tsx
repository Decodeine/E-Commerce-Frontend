import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar,
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faFire,
  faTags,
  faClock,
  faAward
} from '@fortawesome/free-solid-svg-icons';
import ProductCard from './ProductCard';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import { 
  fetchFeaturedProducts,
  fetchDeals,
  fetchNewArrivals,
  fetchTopRated 
} from '../../store/actions/storeActions';
import type { AppDispatch } from '../../store/store';
import { Product } from '../../services/productsApi';
import './css/FeaturedProducts.css';

interface FeaturedSection {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  products: Product[];
  loading: boolean;
  viewAllLink?: string;
  color: string;
}

const FeaturedProducts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    featuredProducts, 
    dealsProducts, 
    newArrivals, 
    topRated, 
    loading 
  } = useSelector((state: any) => state.store);

  const [activeSection, setActiveSection] = useState('featured');
  const [carouselPositions, setCarouselPositions] = useState<{[key: string]: number}>({});

  useEffect(() => {
    // Fetch all featured product sections
    dispatch(fetchFeaturedProducts());
    dispatch(fetchDeals());
    dispatch(fetchNewArrivals());
    dispatch(fetchTopRated());
  }, [dispatch]);

  const featuredSections: FeaturedSection[] = [
    {
      id: 'featured',
      title: 'Featured Products',
      subtitle: 'Hand-picked products just for you',
      icon: faStar,
      products: featuredProducts || [],
      loading: loading,
      viewAllLink: '/products?featured=true',
      color: 'var(--primary-color)'
    },
    {
      id: 'deals',
      title: 'Hot Deals',
      subtitle: 'Limited time offers and discounts',
      icon: faFire,
      products: dealsProducts || [],
      loading: loading,
      viewAllLink: '/products?deals=true',
      color: 'var(--error-color)'
    },
    {
      id: 'new',
      title: 'New Arrivals',
      subtitle: 'Latest products in our collection',
      icon: faClock,
      products: newArrivals || [],
      loading: loading,
      viewAllLink: '/products?new=true',
      color: 'var(--success-color)'
    },
    {
      id: 'rated',
      title: 'Top Rated',
      subtitle: 'Customer favorites and best sellers',
      icon: faAward,
      products: topRated || [],
      loading: loading,
      viewAllLink: '/products?top_rated=true',
      color: 'var(--warning-color)'
    }
  ];

  const scrollCarousel = (sectionId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(`carousel-${sectionId}`);
    if (!container) return;

    const scrollAmount = 320; // Width of one product card + gap
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

  const ProductCarousel: React.FC<{ section: FeaturedSection }> = ({ section }) => {
    const canScrollLeft = (carouselPositions[section.id] || 0) > 0;
    const canScrollRight = () => {
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
          <FontAwesomeIcon icon={section.icon} className="empty-icon" />
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
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              className={`carousel-btn carousel-btn-right ${!canScrollRight() ? 'disabled' : ''}`}
              onClick={() => scrollCarousel(section.id, 'right')}
              disabled={!canScrollRight()}
              aria-label="Scroll right"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </>
        )}
        
        <div
          id={`carousel-${section.id}`}
          className="product-carousel"
          onScroll={(e) => {
            const target = e.target as HTMLElement;
            setCarouselPositions(prev => ({ 
              ...prev, 
              [section.id]: target.scrollLeft 
            }));
          }}
        >
          {section.products.map((product) => (
            <div key={product.id} className="carousel-item">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SectionTabs = () => (
    <div className="section-tabs">
      {featuredSections.map((section) => (
        <button
          key={section.id}
          className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
          onClick={() => setActiveSection(section.id)}
          style={{ '--tab-color': section.color } as React.CSSProperties}
        >
          <FontAwesomeIcon icon={section.icon} />
          <span className="tab-title">{section.title}</span>
          <span className="tab-count">
            {section.products?.length || 0}
          </span>
        </button>
      ))}
    </div>
  );

  const activeFeatureSection = featuredSections.find(s => s.id === activeSection);

  return (
    <div className="featured-products-container">
      <Card className="featured-products-card">
        {/* Section Header */}
        <div className="featured-header">
          <div className="header-content">
            <FontAwesomeIcon 
              icon={activeFeatureSection?.icon} 
              className="header-icon"
              style={{ color: activeFeatureSection?.color }}
            />
            <div className="header-text">
              <h2 className="section-title">{activeFeatureSection?.title}</h2>
              <p className="section-subtitle">{activeFeatureSection?.subtitle}</p>
            </div>
          </div>
          {activeFeatureSection?.viewAllLink && (
            <Button 
              variant="outline" 
              className="view-all-btn"
              onClick={() => window.location.href = activeFeatureSection.viewAllLink!}
            >
              View All
              <FontAwesomeIcon icon={faArrowRight} />
            </Button>
          )}
        </div>

        {/* Section Navigation Tabs */}
        <SectionTabs />

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
            />
          ))}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="quick-stats">
        {featuredSections.map((section) => (
          <div key={section.id} className="stat-item">
            <FontAwesomeIcon icon={section.icon} style={{ color: section.color }} />
            <div className="stat-content">
              <span className="stat-number">{section.products?.length || 0}</span>
              <span className="stat-label">{section.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
