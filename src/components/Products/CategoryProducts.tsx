import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faHome, 
  faFilter,
  faSearch,
  faSort,
  faThLarge,
  faList,
  faTimes,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import Loading from '../UI/Loading/Loading';
import { AppDispatch, RootState } from '../../store/store';
import { fetchProducts, setFilters, setPagination, addToWishlist, removeFromWishlist, fetchWishlist } from '../../store/actions/storeActions';
import { productsApi, Category, FilterParams } from '../../services/productsApi';
import { useToast } from '../UI/Toast/ToastProvider';

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'price' | 'rating' | 'newest' | 'popularity';

const CategoryProducts: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const { products, filters, pagination, loading: productsLoading } = useSelector((state: RootState) => state.store);
  const wishlist = useSelector((state: any) => state.store.wishlist || []);
  const auth = useSelector((state: any) => state.auth);
  const isAuthenticated = !!auth.token;

  // Fetch wishlist when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist() as any);
    }
  }, [dispatch, isAuthenticated]);

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
        const categories = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse.results || []);
        
        // Try to find category by slug first, then by name (case-insensitive)
        let foundCategory = categories.find((cat: Category) => {
          const catSlug = cat.slug?.toLowerCase() || cat.name.toLowerCase().replace(/\s+/g, '-');
          const catNameLower = cat.name.toLowerCase();
          const slugLower = categorySlug.toLowerCase();
          
          return catSlug === slugLower ||
                 catNameLower === slugLower ||
                 catNameLower.replace(/\s+/g, '-') === slugLower ||
                 catNameLower === slugLower.replace(/-/g, ' ') ||
                 catNameLower.includes(slugLower) ||
                 slugLower.includes(catNameLower);
        });

        // If still not found, try to create a fallback category
        if (!foundCategory) {
          console.warn(`Category "${categorySlug}" not found, using fallback`);
          foundCategory = {
            id: 0,
            name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
            slug: categorySlug,
            description: '',
            product_count: 0,
            icon: ''
          } as Category;
        }

        setCategory(foundCategory);

        // Reset filters and load category products
        const initialFilters = { category: foundCategory.name };
        dispatch(setFilters(initialFilters));
        dispatch(setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, hasNext: false, hasPrevious: false }));

        // Load products for this category
        await loadCategoryProducts(foundCategory.name, initialFilters);

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

      const response = await productsApi.getCategoryProducts(categoryName, params);
      
      dispatch({
        type: 'FETCH_PRODUCTS_SUCCESS',
        payload: {
          results: response.results || [],
        }
      });

      dispatch({
        type: 'SET_PAGINATION',
        payload: {
          currentPage: params.page || 1,
          totalItems: response.count || 0,
          totalPages: Math.ceil((response.count || 0) / 12),
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
    const updatedFilters = { ...newFilters, category: category.name };
    dispatch(setFilters(updatedFilters));
    setActiveFilters(Object.keys(newFilters).filter(key => newFilters[key]));
    loadCategoryProducts(category.name, updatedFilters);
  };

  const handlePageChange = (page: number) => {
    if (!categorySlug || !category) return;
    const newPagination = { ...pagination, currentPage: page };
    dispatch(setPagination(newPagination));
    loadCategoryProducts(category.name, { ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && category) {
      const searchFilters = { ...filters, search: searchQuery.trim(), category: category.name };
      handleFilterChange(searchFilters);
    }
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setShowSortDropdown(false);
    if (category) {
      const sortedFilters = { ...filters, ordering: newSort, category: category.name };
      handleFilterChange(sortedFilters);
    }
  };

  const clearAllFilters = () => {
    if (category) {
      dispatch(setFilters({ category: category.name }));
      setActiveFilters([]);
      setSearchQuery('');
      loadCategoryProducts(category.name, { category: category.name });
    }
  };

  const removeFilter = (filterToRemove: string) => {
    const newFilters = { ...filters };
    if (filterToRemove.startsWith('Brand:')) delete newFilters.brand;
    if (filterToRemove.startsWith('Min:')) delete newFilters.price_min;
    if (filterToRemove.startsWith('Max:')) delete newFilters.price_max;
    if (category) {
      newFilters.category = category.name;
      handleFilterChange(newFilters);
    }
  };

  // Check if product is in wishlist
  const isProductInWishlist = (productId: number): boolean => {
    if (!isAuthenticated || !wishlist || wishlist.length === 0) return false;
    return wishlist.some((item: any) => {
      const itemProductId = typeof item.product === 'object' ? item.product.id : item.product;
      return itemProductId === productId;
    });
  };

  const renderAdvancedPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const startPage = Math.max(1, pagination.currentPage - 2);
    const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);

    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-sm text-slate-600">
            Showing {((pagination.currentPage - 1) * 12) + 1}-{Math.min(pagination.currentPage * 12, pagination.totalItems)} of {pagination.totalItems} products
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevious}
            >
              ← Previous
            </Button>

            <div className="flex items-center gap-1">
              {startPage > 1 && (
                <>
                  <Button
                    variant={pagination.currentPage === 1 ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </Button>
                  {startPage > 2 && <span className="px-2 text-slate-400">...</span>}
                </>
              )}

              {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                const page = startPage + i;
                return (
                  <Button
                    key={page}
                    variant={pagination.currentPage === page ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}

              {endPage < pagination.totalPages && (
                <>
                  {endPage < pagination.totalPages - 1 && <span className="px-2 text-slate-400">...</span>}
                  <Button
                    variant={pagination.currentPage === pagination.totalPages ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(pagination.totalPages)}
                  >
                    {pagination.totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              Next →
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <Loading variant="spinner" size="lg" text="Loading category products..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <FontAwesomeIcon icon={faTimes} className="text-4xl text-red-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Unable to Load Products</h3>
            <p className="mb-6 text-slate-600">{error}</p>
            <div className="flex justify-center gap-3">
              <Button variant="primary" onClick={() => navigate('/products')}>
                <FontAwesomeIcon icon={faHome} className="mr-2" />
                Browse All Products
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/products')}
            icon={<FontAwesomeIcon icon={faArrowLeft} />}
          >
            All Products
          </Button>
          <span>/</span>
          <span className="font-medium text-slate-900">{category?.name || categorySlug}</span>
        </div>

        {/* Category Header */}
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">{category?.name || categorySlug}</h1>
            {category?.description && (
              <p className="mt-2 text-slate-600">{category.description}</p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
              <span className="font-medium">{category?.product_count || products.length} products available</span>
            </div>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search within this category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
              <Button type="submit" variant="primary">
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </div>
          </form>

          {/* Controls Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "primary" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                icon={<FontAwesomeIcon icon={faFilter} />}
              >
                Filters
              </Button>
              
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  icon={<FontAwesomeIcon icon={faSort} />}
                >
                  Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                  <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </Button>
                
                {showSortDropdown && (
                  <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                    {(['popularity', 'name', 'price', 'rating', 'newest'] as SortOption[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSortChange(option)}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          sortBy === option
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded p-2 transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FontAwesomeIcon icon={faThLarge} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded p-2 transition-colors ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-600">Active filters:</span>
                {activeFilters.map((filter, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                  >
                    {filter}
                    <button
                      onClick={() => removeFilter(filter)}
                      className="ml-1 hover:text-blue-600"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </span>
                ))}
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Filters Sidebar */}
        {showFilters && (
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Filter Products</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                icon={<FontAwesomeIcon icon={faTimes} />}
              >
                Close
              </Button>
            </div>
            <ProductFilters 
              onFiltersChange={handleFilterChange}
              isOpen={true}
              onToggle={() => setShowFilters(false)}
            />
          </Card>
        )}

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="mb-4 aspect-square animate-pulse rounded-lg bg-slate-200" />
                <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="mb-2 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200" />
              </Card>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={convertProduct(product)} />
              ))}
            </div>

            {/* Pagination */}
            {renderAdvancedPagination()}
          </>
        ) : (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <FontAwesomeIcon icon={faSearch} className="text-4xl text-slate-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">No products found</h3>
            <p className="mb-6 text-slate-600">Try adjusting your filters or browse other categories.</p>
            <div className="flex justify-center gap-3">
              <Button variant="primary" onClick={clearAllFilters}>
                Clear Filters
              </Button>
              <Button variant="outline" onClick={() => navigate('/products')}>
                Browse All Products
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
