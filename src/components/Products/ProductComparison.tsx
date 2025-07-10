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
  faTrash,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import Modal from '../UI/Modal/Modal';
import ProductCard from '../Products/ProductCard';
import { 
  fetchComparison, 
  addToComparison, 
  removeFromComparison, 
  clearComparisonList,
  addProductToCart,
  addToWishlist 
} from '../../store/actions/storeActions';
import { productsApi } from '../../services/productsApi';
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
  const { token } = useSelector((state: any) => state.auth);
  
  // Derive isAuthenticated from token
  const isAuthenticated = !!(token && token.trim() !== '');
  
  const [currentComparisonId, setCurrentComparisonId] = useState<number | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Extract products array from comparison data structure
  const comparisonProducts = React.useMemo(() => {
    if (!comparison) return [];
    
    // Handle different possible data structures
    if (Array.isArray(comparison)) {
      // If comparison is an array of comparisons, take the first one
      if (comparison.length > 0 && comparison[0].products) {
        if (comparison[0].id && currentComparisonId !== comparison[0].id) {
          setCurrentComparisonId(comparison[0].id);
        }
        return comparison[0].products;
      }
      return [];
    }
    
    if (comparison.products && Array.isArray(comparison.products)) {
      if (comparison.id && currentComparisonId !== comparison.id) {
        setCurrentComparisonId(comparison.id);
      }
      return comparison.products;
    }
    
    return [];
  }, [comparison, currentComparisonId]);

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
    const initializeComparison = async () => {
      if (!isAuthenticated || !token) {
        // If not authenticated, just fetch comparison data without creating new ones
        dispatch(fetchComparison());
        return;
      }

      try {
        // First, try to fetch existing comparisons
        dispatch(fetchComparison());
        
        // If user is authenticated, check if they have existing comparisons
        const existingComparisons = await productsApi.getProductComparisons(token);
        
        if (!existingComparisons || existingComparisons.length === 0) {
          // Create a new comparison only when user tries to add a product
          console.log('No existing comparisons found - will create when adding first product');
        } else if (existingComparisons[0] && existingComparisons[0].id) {
          // Use the first existing comparison
          setCurrentComparisonId(existingComparisons[0].id);
          console.log('Using existing comparison:', existingComparisons[0].id);
        }
      } catch (error) {
        console.error('Failed to initialize comparison:', error);
        // Fallback to just fetching comparison data
        dispatch(fetchComparison());
      }
    };

    initializeComparison();
  }, [dispatch, isAuthenticated, token]);

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

  const handleRemoveFromComparison = async (productId: number) => {
    if (!isAuthenticated || !token || !currentComparisonId) {
      console.warn('Cannot remove from comparison: missing auth or comparison ID');
      return;
    }

    try {
      await productsApi.removeProductFromComparison(currentComparisonId, productId, token);
      dispatch(fetchComparison()); // Refresh the comparison data
    } catch (error) {
      console.error('Failed to remove from comparison:', error);
      alert('Failed to remove product from comparison. Please try again.');
    }
  };

  const handleClearComparison = async () => {
    if (!isAuthenticated || !token || !currentComparisonId) {
      console.warn('Cannot clear comparison: missing auth or comparison ID');
      return;
    }

    try {
      // Remove all products from comparison
      for (const product of comparisonProducts) {
        await productsApi.removeProductFromComparison(currentComparisonId, product.id, token);
      }
      dispatch(fetchComparison()); // Refresh the comparison data
    } catch (error) {
      console.error('Failed to clear comparison:', error);
      alert('Failed to clear comparison. Please try again.');
    }
  };

  // Search products for adding to comparison
  const handleSearchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await productsApi.getProducts({ search: query, page: 1, page_size: 10 });
      setSearchResults(response.results || []);
    } catch (error) {
      console.error('Failed to search products:', error);
      setSearchResults([]);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // TODO: In a production app, you should:
  // 1. Create a comparison on component mount or when first product is added
  // 2. Store the comparison ID in component state or Redux
  // 3. Use that ID for all add/remove operations
  // 4. Handle the case where user is not authenticated

  const handleAddToComparison = async (productId: number) => {
    if (!isAuthenticated || !token) {
      alert('Please log in to add products to comparison');
      return;
    }

    if (!currentComparisonId) {
      try {
        // Create a new comparison if none exists
        console.log('Creating new comparison for user');
        const newComparison = await productsApi.createProductComparison(token);
        setCurrentComparisonId(newComparison.id);
        
        // Now add the product to the new comparison
        await productsApi.addProductToComparison(newComparison.id, productId, token);
        dispatch(fetchComparison()); // Refresh the comparison data
        setShowAddProduct(false);
      } catch (error) {
        console.error('Failed to create comparison and add product:', error);
        alert('Failed to add product to comparison. Please try again.');
      }
      return;
    }
    
    try {
      await productsApi.addProductToComparison(currentComparisonId, productId, token);
      dispatch(fetchComparison()); // Refresh the comparison data
      setShowAddProduct(false);
    } catch (error) {
      console.error('Failed to add to comparison:', error);
      alert('Failed to add product to comparison. Please try again.');
    }
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

  if (comparisonProducts.length === 0) {
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
              Comparing {comparisonProducts.length} product{comparisonProducts.length !== 1 ? 's' : ''}
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
              disabled={comparisonProducts.length >= 4}
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
        {comparisonProducts.length === 0 ? (
          <div className="empty-comparison">
            <div className="empty-content">
              <FontAwesomeIcon icon={faBalanceScale} size="3x" />
              <h3>No Products to Compare</h3>
              <p>Add products to your comparison list to see detailed comparisons.</p>
              <Button 
                variant="primary" 
                onClick={() => setShowAddProduct(true)}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Products
              </Button>
            </div>
          </div>
        ) : (
          <div className="comparison-table">
            {/* Product Headers */}
            <div className="table-header">
              <div className="feature-column header-label">
                Features
              </div>
              {comparisonProducts.map((product: Product) => (
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
                {comparisonProducts.map((product: Product) => (
                  <div key={product.id} className="product-column feature-value">
                    {renderFeatureValue(product, feature)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Recommendations */}
      {comparisonProducts.length > 0 && (
        <div className="comparison-recommendations">
          <Card>
            <h3>Our Recommendation</h3>
            <div className="recommendation-content">
              {(() => {
                // Simple recommendation logic - highest rated product
                if (comparisonProducts.length === 0) return null;
                
                const bestProduct = comparisonProducts.reduce((best: Product, current: Product) => {
                  const bestRating = best.reviews_summary?.average_rating || 0;
                  const currentRating = current.reviews_summary?.average_rating || 0;
                  return currentRating > bestRating ? current : best;
                }, comparisonProducts[0]);

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

      {/* Add Product Modal */}
      <Modal 
        isOpen={showAddProduct} 
        onClose={() => setShowAddProduct(false)}
        title="Add Products to Compare"
        size="lg"
      >
        <div className="add-product-modal-content">
          <div className="search-container">
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search for products to add to comparison..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
            </div>
            {searchQuery && (
              <p className="search-info">
                {searchResults.length > 0 
                  ? `Found ${searchResults.length} products`
                  : 'No products found'
                }
              </p>
            )}
          </div>
          
          <div className="search-results">
            {!searchQuery && (
              <div className="search-placeholder">
                <FontAwesomeIcon icon={faSearch} size="2x" />
                <h3>Search for Products</h3>
                <p>Type in the search box above to find products to add to your comparison.</p>
                <p>You can compare up to 4 products at once.</p>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="no-results">
                <FontAwesomeIcon icon={faTimes} />
                <p>No products found for "{searchQuery}"</p>
                <p>Try searching with different keywords.</p>
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="product-results">
                {searchResults.map((product) => {
                  const isAlreadyInComparison = comparisonProducts.some(
                    (p: Product) => p.id === product.id
                  );
                  
                  return (
                    <div key={product.id} className="search-result-item">
                      <div className="product-info">
                        <img 
                          src={product.picture} 
                          alt={product.name}
                          className="product-thumbnail"
                        />
                        <div className="product-details">
                          <h4 className="product-name">{product.name}</h4>
                          <p className="product-brand">{product.brand?.name}</p>
                          <div className="product-price">
                            ${parseFloat(product.price || '0').toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="product-actions">
                        {isAlreadyInComparison ? (
                          <Button variant="outline" disabled>
                            <FontAwesomeIcon icon={faCheck} />
                            Already Added
                          </Button>
                        ) : comparisonProducts.length >= 4 ? (
                          <Button variant="outline" disabled>
                            Comparison Full
                          </Button>
                        ) : (
                          <Button 
                            variant="primary"
                            onClick={() => handleAddToComparison(product.id)}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                            Add to Compare
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductComparison;
