import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHome } from '@fortawesome/free-solid-svg-icons';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import FiltersDemo from './FiltersDemo';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import { AppDispatch, RootState } from '../../store/store';
import { fetchProducts, setFilters, setPagination } from '../../store/actions/storeActions';
import { productsApi, Category, FilterParams } from '../../services/productsApi';
import './css/ProductList.css';

const CategoryProducts: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [category, setCategory] = useState<Category | null>(null);
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
    if (!categorySlug) return;

    const loadCategoryAndProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all categories to find the real category name
        const categoriesResponse = await productsApi.getCategories();
        const categories = Array.isArray(categoriesResponse) ? categoriesResponse : [];
        
        console.log('All categories:', categories);
        console.log('Looking for category slug:', categorySlug);
        
        // Try to find category by slug first, then by name
        let foundCategory = categories.find(cat => 
          cat.name.toLowerCase().replace(/\s+/g, '-') === categorySlug ||
          cat.name.toLowerCase() === categorySlug.replace(/-/g, ' ')
        );

        // If not found by name, try direct slug match (backend might use slug directly)
        if (!foundCategory) {
          // Try using the slug directly as the category name for API call
          console.log('Category not found by name matching, trying direct slug:', categorySlug);
          try {
            await loadCategoryProducts(categorySlug, {});
            // If successful, create a mock category object
            foundCategory = {
              id: 0,
              name: categorySlug,
              description: '',
              product_count: 0,
              icon: ''
            };
            setCategory(foundCategory);
            setLoading(false);
            return;
          } catch (directSlugError) {
            console.log('Direct slug API call failed:', directSlugError);
          }
        }

        console.log('Found category:', foundCategory);

        if (!foundCategory) {
          setError('Category not found');
          setLoading(false);
          return;
        }

        setCategory(foundCategory);

        // Reset filters and load category products
        dispatch(setFilters({}));
        dispatch(setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, hasNext: false, hasPrevious: false }));

        // Use the real category name for the API call
        await loadCategoryProducts(foundCategory.name, {});

      } catch (err) {
        console.error('Error loading category:', err);
        setError('Failed to load category products');
      } finally {
        setLoading(false);
      }
    };

    loadCategoryAndProducts();
  }, [categorySlug, dispatch]);

  const loadCategoryProducts = async (categoryName: string, filterParams: FilterParams) => {
    try {
      const params = {
        ...filterParams,
        page: pagination.currentPage,
        limit: 12,
      };

      console.log('Loading category products for:', categoryName, 'with params:', params);
      const response = await productsApi.getCategoryProducts(categoryName, params);
      console.log('Category products response:', response);
      
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
      console.error('Error loading category products:', err);
      setError('Failed to load products');
    }
  };

  const handleFilterChange = (newFilters: any) => {
    if (!categorySlug || !category) return;
    dispatch(setFilters(newFilters));
    loadCategoryProducts(category.name, newFilters);
  };

  const handlePageChange = (page: number) => {
    if (!categorySlug || !category) return;
    dispatch(setPagination({ ...pagination, currentPage: page }));
    loadCategoryProducts(category.name, { ...filters, page });
  };

  if (loading) {
    return (
      <div className="category-products">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading category products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-products">
        <Card variant="glass" className="error-container">
          <h2>Unable to Load Products</h2>
          <p>{error}</p>
          <Button onClick={() => navigate('/products')} variant="primary">
            <FontAwesomeIcon icon={faHome} />
            Browse All Products
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="category-products">
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
        <span className="breadcrumb-current">{category?.name || (categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : 'Category')}</span>
      </nav>

      {/* Category Header */}
      <div className="category-header">
        <Card variant="glass" className="category-info">
          <div className="category-details">
            <h1 className="category-title">{category?.name || (categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : 'Category')}</h1>
            {category?.description && (
              <p className="category-description">{category.description}</p>
            )}
            <div className="category-stats">
              <span className="product-count">{category?.product_count || products.length} products</span>
            </div>
          </div>
          {category?.icon && (
            <div className="category-icon">
              <img src={category.icon} alt={category.name} />
            </div>
          )}
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
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={convertProduct(product)} />
                ))}
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
              <h3>No products found in {category?.name || categorySlug}</h3>
              <p>Try adjusting your filters or browse other categories.</p>
              <Button onClick={() => navigate('/products')} variant="primary">
                Browse All Products
              </Button>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoryProducts;
