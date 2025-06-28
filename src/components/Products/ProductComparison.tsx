import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBalanceScale, 
  faPlus, 
  faTimes,
  faShoppingCart,
  faHeart,
  faCheck,
  faMinus,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import ProductCard from '../Products/ProductCard';
import { 
  fetchComparison, 
  addToComparison, 
  removeFromComparison, 
  clearComparisonList,
  addProductToCart,
  addToWishlist 
} from '../../store/actions/storeActions';
import type { AppDispatch } from '../../store/store';
import { Product } from '../../services/productsApi';
import './css/ProductComparison.css';

interface ComparisonFeature {
  label: string;
  key: string;
  type: 'text' | 'boolean' | 'number' | 'list';
}

const ProductComparison: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { comparison, loading } = useSelector((state: any) => state.store);
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Sample comparison features - can be customized per category
  const comparisonFeatures: ComparisonFeature[] = [
    { label: 'Price', key: 'price', type: 'number' },
    { label: 'Brand', key: 'brand.name', type: 'text' },
    { label: 'Model', key: 'model_number', type: 'text' },
    { label: 'Rating', key: 'average_rating', type: 'number' },
    { label: 'Reviews', key: 'reviews_count', type: 'number' },
    { label: 'In Stock', key: 'in_stock', type: 'boolean' },
    { label: 'Warranty', key: 'warranty_period', type: 'text' },
    { label: 'Features', key: 'key_features', type: 'list' },
  ];

  useEffect(() => {
    if (comparison.length > 0) {
      const productIds = comparison.map((product: Product) => product.id);
      dispatch(fetchComparison(productIds));
    }
  }, [dispatch]);

  const handleAddToCart = (product: Product) => {
    dispatch(addProductToCart(product, 1));
    // Show toast notification
  };

  const handleAddToWishlist = (productId: number) => {
    if (isAuthenticated) {
      dispatch(addToWishlist(productId));
      // Show toast notification
    } else {
      // Show login required toast
    }
  };

  const handleRemoveFromComparison = (productId: number) => {
    dispatch(removeFromComparison(productId));
  };

  const handleClearComparison = () => {
    dispatch(clearComparisonList());
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const renderFeatureValue = (product: Product, feature: ComparisonFeature) => {
    const value = getNestedValue(product, feature.key);
    
    switch (feature.type) {
      case 'boolean':
        return (
          <span className={`boolean-value ${value ? 'true' : 'false'}`}>
            <FontAwesomeIcon icon={value ? faCheck : faTimes} />
            {value ? 'Yes' : 'No'}
          </span>
        );
      case 'number':
        if (feature.key === 'price') {
          return <span className="price-value">${parseFloat(value || '0').toFixed(2)}</span>;
        }
        if (feature.key === 'average_rating') {
          return <span className="rating-value">{value ? `${value}/5` : 'No rating'}</span>;
        }
        return <span className="number-value">{value || 'N/A'}</span>;
      case 'list':
        if (Array.isArray(value)) {
          return (
            <ul className="feature-list">
              {value.slice(0, 3).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
              {value.length > 3 && <li>+{value.length - 3} more</li>}
            </ul>
          );
        }
        return <span>{value || 'N/A'}</span>;
      default:
        return <span>{value || 'N/A'}</span>;
    }
  };

  if (loading) {
    return (
      <div className="comparison-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (comparison.length === 0) {
    return (
      <div className="comparison-container">
        <Card className="empty-comparison-card">
          <div className="empty-comparison-content">
            <FontAwesomeIcon icon={faBalanceScale} className="empty-icon" />
            <h2>No Products to Compare</h2>
            <p>
              Add products to your comparison list to see how they stack up against each other.
              You can compare up to 4 products at once.
            </p>
            <Button 
              variant="primary" 
              onClick={() => setShowAddProduct(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Products to Compare
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="comparison-container">
      {/* Header */}
      <div className="comparison-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="comparison-title">
              <FontAwesomeIcon icon={faBalanceScale} />
              Product Comparison
            </h1>
            <p className="comparison-count">
              Comparing {comparison.length} product{comparison.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="header-actions">
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'overview' ? 'active' : ''}`}
                onClick={() => setViewMode('overview')}
              >
                Overview
              </button>
              <button 
                className={`view-btn ${viewMode === 'detailed' ? 'active' : ''}`}
                onClick={() => setViewMode('detailed')}
              >
                Detailed
              </button>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowAddProduct(true)}
              disabled={comparison.length >= 4}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Product
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClearComparison}
              className="clear-btn"
            >
              <FontAwesomeIcon icon={faTrash} />
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="comparison-content">
        <div className="comparison-table">
          {/* Product Headers */}
          <div className="table-header">
            <div className="feature-column header-label">
              Features
            </div>
            {comparison.map((product: Product) => (
              <div key={product.id} className="product-column">
                <div className="product-header">
                  <button 
                    className="remove-product-btn"
                    onClick={() => handleRemoveFromComparison(product.id)}
                    title="Remove from comparison"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  <div className="product-image">
                    <img src={product.picture} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-brand">{product.brand?.name}</p>
                    <div className="product-price">
                      <span className="current-price">
                        ${parseFloat(product.price || '0').toFixed(2)}
                      </span>
                      {product.original_price && (
                        <span className="original-price">
                          ${parseFloat(product.original_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="product-actions">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.in_stock}
                      >
                        <FontAwesomeIcon icon={faShoppingCart} />
                        {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddToWishlist(product.id)}
                      >
                        <FontAwesomeIcon icon={faHeart} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Rows */}
          <div className="table-body">
            {comparisonFeatures.map((feature) => (
              <div key={feature.key} className="feature-row">
                <div className="feature-column feature-label">
                  {feature.label}
                </div>
                {comparison.map((product: Product) => (
                  <div key={product.id} className="product-column feature-value">
                    {renderFeatureValue(product, feature)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {comparison.length > 0 && (
        <div className="comparison-recommendations">
          <Card>
            <h3>Our Recommendation</h3>
            <div className="recommendation-content">
              {(() => {
                // Simple recommendation logic - highest rated product
                const bestProduct = comparison.reduce((best: Product, current: Product) => {
                  const bestRating = best.reviews_summary?.average_rating || 0;
                  const currentRating = current.reviews_summary?.average_rating || 0;
                  return currentRating > bestRating ? current : best;
                }, comparison[0]);

                return (
                  <div className="recommended-product">
                    <div className="recommendation-badge">
                      <FontAwesomeIcon icon={faCheck} />
                      Best Choice
                    </div>
                    <ProductCard product={bestProduct} />
                    <p className="recommendation-reason">
                      Based on rating, features, and value for money.
                    </p>
                  </div>
                );
              })()}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductComparison;
