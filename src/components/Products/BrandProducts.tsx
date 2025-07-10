import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHome, faExternalLinkAlt, faCalendar } from '@fortawesome/free-solid-svg-icons';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import FiltersDemo from './FiltersDemo';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import { AppDispatch, RootState } from '../../store/store';
import { fetchProducts, setFilters, setPagination } from '../../store/actions/storeActions';
import { productsApi, Brand, FilterParams } from '../../services/productsApi';
import './css/ProductList.css';

const BrandProducts: React.FC = () => {
  const { brandSlug, categorySlug } = useParams<{ brandSlug: string; categorySlug?: string }>();
  const [searchParams] = useSearchParams();
  const categoryFilter = categorySlug || searchParams.get('category');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const { products, filters, pagination, loading: productsLoading } = useSelector((state: RootState) => state.store);

  // Convert API product to ProductCard format
  const convertProduct = (apiProduct: any) => ({
    ...apiProduct,
    price: parseFloat(apiProduct.price) || 0,
    sale_price: apiProduct.original_price ? parseFloat(apiProduct.original_price) : undefined,
    image: apiProduct.picture,
    reviews_count: apiProduct.review_count,
  });

  useEffect(() => {
    if (!brandSlug) return;

    const loadBrandAndProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load brand info first
        const brandData = await productsApi.getBrand(brandSlug);
        setBrand(brandData);

        // Reset filters and load brand products
        dispatch(setFilters({}));
        dispatch(setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, hasNext: false, hasPrevious: false }));

        // Load products for this brand with category filter if provided
        const initialFilters = categoryFilter ? { category: categoryFilter } : {};
        await loadBrandProducts(brandSlug, initialFilters);

      } catch (err) {
        console.error('Error loading brand:', err);
        setError('Brand not found');
      } finally {
        setLoading(false);
      }
    };

    loadBrandAndProducts();
  }, [brandSlug, categorySlug, categoryFilter, dispatch]);

  const loadBrandProducts = async (slug: string, filterParams: FilterParams) => {
    try {
      const params = {
        ...filterParams,
        page: pagination.currentPage,
        limit: 12,
      };

      console.log('Loading brand products for:', slug, 'with params:', params);
      
      let response;
      if (categoryFilter) {
        // Use the specific API method for brand products with category filter
        response = await productsApi.getBrandProductsByCategory(slug, categoryFilter, params);
      } else {
        // Use the general brand products method
        response = await productsApi.getBrandProducts(slug, params);
      }
      
      console.log('Brand products response:', response);
      
      dispatch({
        type: 'FETCH_PRODUCTS_SUCCESS',
        payload: {
          results: response.results,
        }
      });

      dispatch({
        type: 'SET_PAGINATION',
        payload: {
          currentPage: 1,
          totalItems: response.count,
          totalPages: Math.ceil(response.count / 12),
          hasNext: response.next !== null,
          hasPrevious: response.previous !== null,
        }
      });
    } catch (err) {
      console.error('Error loading brand products:', err);
      setError('Failed to load products');
    }
  };

  // Debug products state
  useEffect(() => {
    console.log('Products state updated:', products);
    console.log('Products loading state:', productsLoading);
    console.log('Products length:', products.length);
  }, [products, productsLoading]);

  const handleFilterChange = (newFilters: any) => {
    if (!brandSlug) return;
    dispatch(setFilters(newFilters));
    loadBrandProducts(brandSlug, newFilters);
  };

  const handlePageChange = (page: number) => {
    if (!brandSlug) return;
    dispatch(setPagination({ ...pagination, currentPage: page }));
    loadBrandProducts(brandSlug, { ...filters, page });
  };

  if (loading) {
    return (
      <div className="brand-products">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading brand products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-products">
        <Card variant="glass" className="error-container">
          <h2>Brand Not Found</h2>
          <p>{error}</p>
          <Button onClick={() => navigate('/products')} variant="primary">
            <FontAwesomeIcon icon={faHome} />
            View All Products
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="brand-products">
      {/* Breadcrumb */}
      <nav className="breadcrumb-nav">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/products')}
          icon={<FontAwesomeIcon icon={faArrowLeft} />}
        >
          All Products
        </Button>
        <span className="breadcrumb-separator">/</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/brand/${brandSlug}`)}
        >
          {brand?.name}
        </Button>
        {categoryFilter && (
          <>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{categoryFilter}</span>
          </>
        )}
      </nav>

      {/* Brand Header */}
      <div className="brand-header">
        <Card variant="glass" className="brand-info">
          <div className="brand-details">
            <div className="brand-logo-title">
              {brand?.logo && (
                <img src={brand.logo} alt={brand.name} className="brand-logo" />
              )}
              <h1 className="brand-title">
                {brand?.name}
                {categoryFilter && <span className="category-filter-badge"> in {categoryFilter}</span>}
              </h1>
            </div>
            
            {brand?.description && (
              <p className="brand-description">{brand.description}</p>
            )}
            
            <div className="brand-meta">
              <div className="brand-stats">
                <span className="product-count">{brand?.product_count} products</span>
                {brand?.founded_year && (
                  <span className="founded-year">
                    <FontAwesomeIcon icon={faCalendar} />
                    Founded {brand.founded_year}
                  </span>
                )}
              </div>
              
              {brand?.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="products-container">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <ProductFilters 
            onFiltersChange={handleFilterChange}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
          />
          <FiltersDemo />
        </aside>

        {/* Products Grid */}
        <main className="products-main">
          {productsLoading ? (
            <div className="loading-grid">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="product-skeleton" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="products-header">
                <h2>Found {products.length} products</h2>
              </div>
              <div className="products-grid">
                {products.map((product) => {
                  console.log('Rendering product:', product);
                  return (
                    <ProductCard key={product.id} product={convertProduct(product)} />
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination-container">
                  <Card variant="glass" className="pagination-card">
                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <Button
                        key={index + 1}
                        variant={pagination.currentPage === index + 1 ? "primary" : "ghost"}
                        size="sm"
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </Card>
                </div>
              )}
            </>
          ) : (
            <Card variant="glass" className="empty-state">
              <h3>No products found for {brand?.name}</h3>
              <p>Try adjusting your filters or browse other brands.</p>
              <Button onClick={() => navigate('/products')} variant="primary">
                View All Products
              </Button>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrandProducts;
