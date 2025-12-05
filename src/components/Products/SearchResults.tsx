import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, 
  faTimes, 
  faFilter,
  faSort,
  faThLarge,
  faList,
  faChevronDown,
  faArrowLeft,
  faShoppingBag,
  faLightbulb
} from "@fortawesome/free-solid-svg-icons";
import { fetchProducts, setFilters, setPagination, addToWishlist, removeFromWishlist, fetchWishlist } from "../../store/actions/storeActions";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import type { AppDispatch } from "../../store/store";
import { useToast } from "../UI/Toast/ToastProvider";

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'price' | 'rating' | 'newest' | 'popularity';

interface ProductItem {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  picture: string;
  quantity: number;
  sale_price?: number;
  rating?: number;
  reviews_count?: number;
  brand?: any;
  [key: string]: any;
}

const SearchResults: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { query } = useParams<{ query: string }>();
  const { showToast } = useToast();
  
  const decodedQuery = query ? decodeURIComponent(query) : '';
  
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState(decodedQuery);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const products = useSelector((state: any) => state.store.products);
  const loading = useSelector((state: any) => state.store.loading);
  const filters = useSelector((state: any) => state.store.filters);
  const pagination = useSelector((state: any) => state.store.pagination);
  const wishlist = useSelector((state: any) => state.store.wishlist || []);
  const auth = useSelector((state: any) => state.auth);
  const isAuthenticated = !!auth.token;

  // Fetch wishlist when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist() as any);
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (decodedQuery) {
      setSearchQuery(decodedQuery);
      const searchFilters = { search: decodedQuery };
      dispatch(setFilters(searchFilters));
      dispatch(setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, hasNext: false, hasPrevious: false }));
      dispatch(fetchProducts(searchFilters));
    }
  }, [decodedQuery, dispatch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    const updatedFilters = { ...newFilters, search: decodedQuery };
    dispatch(setFilters(updatedFilters));
    setActiveFilters(Object.keys(newFilters).filter(key => newFilters[key]));
    dispatch(fetchProducts(updatedFilters));
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setShowSortDropdown(false);
    const sortedFilters = { ...filters, ordering: newSort, search: decodedQuery };
    handleFilterChange(sortedFilters);
  };

  const clearAllFilters = () => {
    dispatch(setFilters({ search: decodedQuery }));
    setActiveFilters([]);
    dispatch(fetchProducts({ search: decodedQuery }));
  };

  const removeFilter = (filterToRemove: string) => {
    const newFilters = { ...filters };
    if (filterToRemove.startsWith('Category:')) delete newFilters.category;
    if (filterToRemove.startsWith('Brand:')) delete newFilters.brand;
    if (filterToRemove.startsWith('Min:')) delete newFilters.price_min;
    if (filterToRemove.startsWith('Max:')) delete newFilters.price_max;
    newFilters.search = decodedQuery;
    handleFilterChange(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newPagination = { ...pagination, currentPage: page };
    dispatch(setPagination(newPagination));
    dispatch(fetchProducts({ ...filters, search: decodedQuery, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if product is in wishlist
  const isProductInWishlist = (productId: number): boolean => {
    if (!isAuthenticated || !wishlist || wishlist.length === 0) return false;
    return wishlist.some((item: any) => {
      const itemProductId = typeof item.product === 'object' ? item.product.id : item.product;
      return itemProductId === productId;
    });
  };

  // Handle wishlist toggle
  const handleToggleWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      showToast({
        type: 'warning',
        title: 'Login Required',
        message: 'Please log in to add products to your wishlist.',
        duration: 3000
      });
      navigate('/login');
      return;
    }

    try {
      const isInWishlist = isProductInWishlist(productId);
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productId) as any);
        showToast({
          type: 'info',
          title: 'Removed from Wishlist',
          message: 'Product has been removed from your wishlist.',
          duration: 3000
        });
      } else {
        await dispatch(addToWishlist(productId) as any);
        showToast({
          type: 'success',
          title: 'Added to Wishlist',
          message: 'Product has been added to your wishlist.',
          duration: 3000
        });
      }
      dispatch(fetchWishlist() as any);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update wishlist. Please try again.',
        duration: 3000
      });
    }
  };

  const convertProduct = (apiProduct: any) => ({
    ...apiProduct,
    price: parseFloat(apiProduct.price) || 0,
    sale_price: apiProduct.original_price ? parseFloat(apiProduct.original_price) : undefined,
    image: apiProduct.picture,
    reviews_count: apiProduct.review_count,
  });

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
            <Loading variant="spinner" size="lg" text="Searching products..." />
          </div>
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
          <span className="font-medium text-slate-900">Search Results</span>
        </div>

        {/* Search Header */}
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">
              Search Results for "{decodedQuery}"
            </h1>
            {products && products.length > 0 && (
              <p className="mt-2 text-slate-600">
                Found {pagination.totalItems || products.length} product{products.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search products..."
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
          {products && products.length > 0 && (
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
          )}
        </Card>

        {/* Filters Sidebar */}
        {showFilters && products && products.length > 0 && (
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

        {/* Results */}
        {!products || products.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
              <FontAwesomeIcon icon={faSearch} className="text-5xl text-slate-400" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-slate-900">No products found</h2>
            <p className="mb-2 text-lg text-slate-600">
              We couldn't find any products matching <span className="font-semibold text-slate-900">"{decodedQuery}"</span>
            </p>
            <p className="mb-8 text-slate-500">Try searching with different keywords or browse our categories.</p>
            
            <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6 text-left">
              <div className="mb-3 flex items-center gap-2 text-blue-900">
                <FontAwesomeIcon icon={faLightbulb} className="text-xl" />
                <h3 className="font-semibold">Search Tips:</h3>
              </div>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Check your spelling and try again</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Use more general terms (e.g., "phone" instead of "iPhone 13 Pro Max 256GB")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Try searching by brand name or category</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Browse our categories to discover products</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="primary" onClick={() => navigate('/products')}>
                <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
                Browse All Products
              </Button>
              <Button variant="outline" onClick={() => navigate('/category/smartphones')}>
                Smartphones
              </Button>
              <Button variant="outline" onClick={() => navigate('/category/laptops')}>
                Laptops
              </Button>
              <Button variant="outline" onClick={() => navigate('/category/audio')}>
                Audio
              </Button>
              <Button variant="outline" onClick={() => navigate('/category/gaming')}>
                Gaming
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product: ProductItem) => (
                <ProductCard 
                  key={product.id}
                  product={convertProduct(product)}
                />
              ))}
            </div>

            {/* Pagination */}
            {renderAdvancedPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
