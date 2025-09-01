import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faShippingFast,
  faUndo,
  faShieldAlt,
  faHeadset,
  faStar,
  faHeart,
  faEye,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import ProductCard from '../Products/ProductCard';
import CategoryNavigation from '../Products/CategoryNavigation';
import FeaturedProducts from '../Products/FeaturedProducts';
import Newsletter from '../Misc/Newsletter';
import { fetchCategories } from '../../store/actions/storeActions';
import { AppDispatch } from '../../store/store';
import { productsApi } from '../../services/productsApi';
import './css/HomePage.css';

// Use the Product type from productsApi
import type { Product } from '../../services/productsApi';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load categories into Redux store
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch featured hero products from API
  useEffect(() => {
    setIsLoading(true);
    productsApi.getFeaturedProducts()
      .then((products) => {
        setHeroProducts(products);
      })
      .catch((error) => {
        console.error('Failed to fetch featured products:', error);
        setHeroProducts([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const featuredCategories = [
    {
      id: 1,
      name: "Smartphones",
      slug: "smartphones",
      image: "/images/categories/smartphones.jpg",
      productCount: 156,
      color: "#667eea"
    },
    {
      id: 2,
      name: "Laptops",
      slug: "laptops",
      image: "/images/categories/laptops.jpg",
      productCount: 89,
      color: "#764ba2"
    },
    {
      id: 3,
      name: "Audio & Headphones",
      slug: "audio",
      image: "/images/categories/audio.jpg",
      productCount: 234,
      color: "#f093fb"
    },
    {
      id: 4,
      name: "Gaming",
      slug: "gaming",
      image: "/images/categories/gaming.jpg",
      productCount: 178,
      color: "#4facfe"
    }
  ];

  const keyFeatures = [
    {
      icon: faShippingFast,
      title: "Free Shipping",
      description: "Free delivery on orders over $50",
      color: "#4CAF50"
    },
    {
      icon: faUndo,
      title: "Easy Returns",
      description: "30-day hassle-free returns",
      color: "#2196F3"
    },
    {
      icon: faShieldAlt,
      title: "Secure Payment",
      description: "Your payment info is safe",
      color: "#FF9800"
    },
    {
      icon: faHeadset,
      title: "24/7 Support",
      description: "Round-the-clock customer service",
      color: "#9C27B0"
    }
  ];

  const handleCategoryClick = (slug: string) => {
    // Navigate to hierarchical brand selection instead of direct products
    navigate(`/category/${slug}/brands`);
  };

  const handleSearchProducts = () => {
    navigate('/products');
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Discover Amazing
              <span className="gradient-text"> Tech Products</span>
            </h1>
            <p className="hero-description">
              Shop the latest smartphones, laptops, and gadgets with unbeatable prices
              and fast, free shipping on orders over $50.
            </p>
            <div className="hero-actions">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSearchProducts}
                icon={<FontAwesomeIcon icon={faSearch} />}
                className="hero-cta"
              >
                Shop Now
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleViewAllProducts}
                icon={<FontAwesomeIcon icon={faEye} />}
                className="hero-secondary"
              >
                Browse All
              </Button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.8</span>
                <span className="stat-label">
                  <FontAwesomeIcon icon={faStar} /> Rating
                </span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-products-showcase">
              {isLoading ? (
                <div className="hero-loading">Loading featured products...</div>
              ) : heroProducts.length === 0 ? (
                <div className="hero-no-products">No featured products found. Please add products in the admin panel.</div>
              ) : heroProducts.slice(0, 3).map((product, index) => {
                // Convert price fields to number for ProductCard compatibility
                const fixedProduct = {
                  ...product,
                  price: Number(product.price),
                  original_price: product.original_price ? Number(product.original_price) : undefined,
                  rating: product.rating ? Number(product.rating) : 0,
                };
                return (
                  <div
                    key={product.id}
                    className={`hero-product-card hero-product-${index + 1}`}
                    style={{ '--delay': `${index * 0.2}s` } as React.CSSProperties}
                  >
                    <ProductCard
                      product={fixedProduct}
                      isInWishlist={false}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Navigation */}
      <section className="category-nav-section">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Find exactly what you're looking for</p>
        </div>
        <div className="categories-grid">
          {featuredCategories.map((category) => (
            <Card
              key={category.id}
              variant="glass"
              className="category-card"
              onClick={() => handleCategoryClick(category.slug)}
              style={{ '--category-color': category.color } as React.CSSProperties}
            >
              <div className="category-image">
                <img
                  src={category.image || '/images/placeholder-category.jpg'}
                  alt={category.name}
                  loading="lazy"
                />
                <div className="category-overlay">
                  <FontAwesomeIcon icon={faArrowRight} />
                </div>
              </div>
              <div className="category-info">
                <h3 className="category-name">{category.name}</h3>
                <p className="category-count">{category.productCount} products</p>
                <div className="category-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/category/${category.slug}/brands`);
                    }}
                  >
                    View Brands
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/category/${category.slug}`);
                    }}
                  >
                    All Products
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <FeaturedProducts />
      </section>

      {/* Key Features Grid */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">Experience the difference with our premium service</p>
        </div>
        <div className="features-grid">
          {keyFeatures.map((feature, index) => (
            <Card
              key={index}
              variant="glass"
              className="feature-card"
              style={{ '--feature-color': feature.color } as React.CSSProperties}
            >
              <div className="feature-icon">
                <FontAwesomeIcon icon={feature.icon} />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="trust-section">
        <Card variant="glass" className="trust-card" padding="xl">
          <div className="trust-content">
            <div className="trust-stats">
              <div className="trust-stat">
                <h3>4.8/5</h3>
                <p>Average Rating</p>
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className={i < 5 ? 'star-filled' : 'star-empty'}
                    />
                  ))}
                </div>
              </div>
              <div className="trust-stat">
                <h3>50,000+</h3>
                <p>Happy Customers</p>
              </div>
              <div className="trust-stat">
                <h3>99.9%</h3>
                <p>Uptime</p>
              </div>
            </div>
            <div className="trust-testimonial">
              <blockquote>
                "Amazing product quality and super fast shipping. This is now my go-to store for all tech needs!"
              </blockquote>
              <cite>— Sarah M., Verified Customer</cite>
            </div>
          </div>
        </Card>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <Newsletter />
      </section>
    </div>
  );
};

export default HomePage;
