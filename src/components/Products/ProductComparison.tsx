import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBalanceScale, 
  faPlus, 
  faTimes,
  faShoppingCart,
  faHeart,
  faCheck,
  faTrash,
  faSearch,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import Modal from '../UI/Modal/Modal';
import Loading from '../UI/Loading/Loading';
import { useToast } from '../UI/Toast/ToastProvider';
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

interface ComparisonFeature {
  label: string;
  key: string;
  type: 'text' | 'boolean' | 'number' | 'list';
}

const ProductComparison: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { comparison, loading } = useSelector((state: any) => state.store);
  const { token } = useSelector((state: any) => state.auth);
  const { showToast } = useToast();
  
  const isAuthenticated = !!(token && token.trim() !== '');
  const [currentComparisonId, setCurrentComparisonId] = useState<number | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  const comparisonProducts = React.useMemo(() => {
    if (!comparison) return [];
    if (Array.isArray(comparison)) {
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
        dispatch(fetchComparison());
        return;
      }
      try {
        dispatch(fetchComparison());
        const existingComparisons = await productsApi.getProductComparisons(token);
        if (existingComparisons && existingComparisons.length > 0 && existingComparisons[0].id) {
          setCurrentComparisonId(existingComparisons[0].id);
        }
      } catch (error) {
        console.error('Failed to initialize comparison:', error);
        dispatch(fetchComparison());
      }
    };
    initializeComparison();
  }, [dispatch, isAuthenticated, token]);

  const handleAddToCart = (product: Product) => {
    dispatch(addProductToCart(product, 1));
    showToast({
      type: 'success',
      title: 'Added to Cart',
      message: `${product.name} has been added to your cart.`
    });
  };

  const handleAddToWishlist = (productId: number) => {
    if (isAuthenticated) {
      dispatch(addToWishlist(productId) as any);
      showToast({
        type: 'success',
        title: 'Added to Wishlist',
        message: 'Product has been added to your wishlist.'
      });
    } else {
      showToast({
        type: 'warning',
        title: 'Login Required',
        message: 'Please log in to add products to your wishlist.'
      });
      navigate('/login');
    }
  };

  const handleRemoveFromComparison = async (productId: number) => {
    if (!isAuthenticated || !token || !currentComparisonId) return;
    try {
      await productsApi.removeProductFromComparison(currentComparisonId, productId, token);
      dispatch(fetchComparison());
      showToast({
        type: 'success',
        title: 'Removed',
        message: 'Product has been removed from comparison.'
      });
    } catch (error) {
      console.error('Failed to remove from comparison:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove product. Please try again.'
      });
    }
  };

  const handleClearComparison = async () => {
    if (!isAuthenticated || !token || !currentComparisonId) return;
    try {
      for (const product of comparisonProducts) {
        await productsApi.removeProductFromComparison(currentComparisonId, product.id, token);
      }
      dispatch(fetchComparison());
      showToast({
        type: 'success',
        title: 'Cleared',
        message: 'All products have been removed from comparison.'
      });
    } catch (error) {
      console.error('Failed to clear comparison:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to clear comparison. Please try again.'
      });
    }
  };

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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearchProducts(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAddToComparison = async (productId: number) => {
    if (!isAuthenticated || !token) {
      showToast({
        type: 'warning',
        title: 'Login Required',
        message: 'Please log in to add products to comparison.'
      });
      navigate('/login');
      return;
    }

    if (!currentComparisonId) {
      try {
        const newComparison = await productsApi.createProductComparison(token);
        setCurrentComparisonId(newComparison.id);
        await productsApi.addProductToComparison(newComparison.id, productId, token);
        dispatch(fetchComparison());
        setShowAddProduct(false);
        showToast({
          type: 'success',
          title: 'Added',
          message: 'Product has been added to comparison.'
        });
      } catch (error) {
        console.error('Failed to create comparison and add product:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to add product. Please try again.'
        });
      }
      return;
    }
    
    try {
      await productsApi.addProductToComparison(currentComparisonId, productId, token);
      dispatch(fetchComparison());
      setShowAddProduct(false);
      showToast({
        type: 'success',
        title: 'Added',
        message: 'Product has been added to comparison.'
      });
    } catch (error) {
      console.error('Failed to add to comparison:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add product. Please try again.'
      });
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
          <span className={`flex items-center gap-1 ${value ? 'text-green-600' : 'text-red-600'}`}>
            <FontAwesomeIcon icon={value ? faCheck : faTimes} />
            {value ? 'Yes' : 'No'}
          </span>
        );
      case 'number':
        if (feature.key === 'price') {
          return <span className="font-bold text-slate-900">${parseFloat(value || '0').toFixed(2)}</span>;
        }
        if (feature.key === 'average_rating') {
          return <span className="text-slate-700">{value ? `${value}/5` : 'No rating'}</span>;
        }
        return <span className="text-slate-700">{value || 'N/A'}</span>;
      case 'list':
        if (Array.isArray(value)) {
          return (
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
              {value.slice(0, 3).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
              {value.length > 3 && <li className="text-slate-400">+{value.length - 3} more</li>}
            </ul>
          );
        }
        return <span className="text-slate-700">{value || 'N/A'}</span>;
      default:
        return <span className="text-slate-700">{value || 'N/A'}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <Loading variant="spinner" size="lg" text="Loading comparison..." />
          </div>
        </div>
      </div>
    );
  }

  if (comparisonProducts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <Card className="p-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
              <FontAwesomeIcon icon={faBalanceScale} className="text-5xl text-blue-600" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">No Products to Compare</h2>
            <p className="mb-8 text-slate-600">
              Add products to your comparison list to see how they stack up against each other.
              You can compare up to 4 products at once.
            </p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => setShowAddProduct(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Products to Compare
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-slate-900">
                <FontAwesomeIcon icon={faBalanceScale} className="text-blue-600" />
                Product Comparison
              </h1>
              <p className="text-slate-600">
                Comparing {comparisonProducts.length} product{comparisonProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
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
                className="text-red-600 hover:text-red-700"
              >
                <FontAwesomeIcon icon={faTrash} />
                Clear All
              </Button>
            </div>
          </div>
        </Card>

        {/* Comparison Table */}
        <Card className="overflow-x-auto p-6">
          <div className="min-w-[800px]">
            {/* Product Headers */}
            <div className="grid gap-4 border-b border-slate-200 pb-4" style={{ gridTemplateColumns: `200px repeat(${comparisonProducts.length}, 1fr)` }}>
              <div className="font-semibold text-slate-700">Features</div>
              {comparisonProducts.map((product: Product) => (
                <div key={product.id} className="space-y-3">
                  <div className="relative">
                    <button 
                      className="absolute right-0 top-0 rounded-full bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200"
                      onClick={() => handleRemoveFromComparison(product.id)}
                      title="Remove from comparison"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xs" />
                    </button>
                    <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-slate-100">
                      <img src={product.picture} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <h3 className="mb-1 text-base font-semibold text-slate-900 line-clamp-2">{product.name}</h3>
                    <p className="mb-2 text-sm text-slate-600">{product.brand?.name}</p>
                    <div className="mb-3 flex items-baseline gap-2">
                      <span className="text-xl font-bold text-slate-900">
                        ${parseFloat(product.price || '0').toFixed(2)}
                      </span>
                      {product.original_price && (
                        <span className="text-sm text-slate-500 line-through">
                          ${parseFloat(product.original_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.in_stock}
                        fullWidth
                      >
                        <FontAwesomeIcon icon={faShoppingCart} />
                        {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddToWishlist(product.id)}
                        fullWidth
                      >
                        <FontAwesomeIcon icon={faHeart} />
                        Wishlist
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Rows */}
            <div className="mt-4 space-y-4">
              {comparisonFeatures.map((feature) => (
                <div key={feature.key} className="grid gap-4 border-b border-slate-100 pb-4 last:border-0" style={{ gridTemplateColumns: `200px repeat(${comparisonProducts.length}, 1fr)` }}>
                  <div className="font-medium text-slate-700">{feature.label}</div>
                  {comparisonProducts.map((product: Product) => (
                    <div key={product.id} className="text-sm">
                      {renderFeatureValue(product, feature)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Add Product Modal */}
        <Modal 
          isOpen={showAddProduct} 
          onClose={() => setShowAddProduct(false)}
          title="Add Products to Compare"
          size="lg"
        >
          <div className="space-y-4">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search for products to add to comparison..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                autoFocus
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-slate-600">
                {searchResults.length > 0 
                  ? `Found ${searchResults.length} products`
                  : 'No products found'
                }
              </p>
            )}
            
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {!searchQuery && (
                <div className="py-12 text-center">
                  <FontAwesomeIcon icon={faSearch} className="mb-4 text-4xl text-slate-300" />
                  <h3 className="mb-2 font-semibold text-slate-900">Search for Products</h3>
                  <p className="text-sm text-slate-600">Type in the search box above to find products to add to your comparison.</p>
                  <p className="text-sm text-slate-600">You can compare up to 4 products at once.</p>
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <div className="py-12 text-center">
                  <FontAwesomeIcon icon={faTimes} className="mb-4 text-4xl text-slate-300" />
                  <p className="text-slate-600">No products found for "{searchQuery}"</p>
                  <p className="text-sm text-slate-500">Try searching with different keywords.</p>
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((product) => {
                    const isAlreadyInComparison = comparisonProducts.some(
                      (p: Product) => p.id === product.id
                    );
                    
                    return (
                      <div key={product.id} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
                        <img 
                          src={product.picture} 
                          alt={product.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{product.name}</h4>
                          <p className="text-sm text-slate-600">{product.brand?.name}</p>
                          <div className="text-sm font-bold text-slate-900">
                            ${parseFloat(product.price || '0').toFixed(2)}
                          </div>
                        </div>
                        <div>
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
    </div>
  );
};

export default ProductComparison;
