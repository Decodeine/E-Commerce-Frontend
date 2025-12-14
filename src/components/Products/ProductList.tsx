import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter, 
  faSearch, 
  faSort, 
  faThLarge, 
  faList, 
  faArrowUp,
  faShoppingCart,
  faStar,
  faEye,
  faHeart,
  faChevronDown,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { fetchProducts, setFilters, setPagination, addToWishlist, removeFromWishlist, fetchWishlist } from "../../store/actions/storeActions";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import CategoryNavigation from "./CategoryNavigation";
import FeaturedProducts from "./FeaturedProducts";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import { useToast } from "../UI/Toast/ToastProvider";
import type { AppDispatch } from "../../store/store";
import type { FilterParams } from "../../services/productsApi";

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

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'price' | 'rating' | 'newest' | 'popularity';

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  
  const products = useSelector((state: any) => state.store.products);
  const loading = useSelector((state: any) => state.store.loading);
  const filters = useSelector((state: any) => state.store.filters);
  const pagination = useSelector((state: any) => state.store.pagination);
  const wishlist = useSelector((state: any) => state.store.wishlist || []);
  const auth = useSelector((state: any) => state.auth);
  const isAuthenticated = !!auth.token;
  
  const [showFilters, setShowFilters] = useState(false);
  const [showFeaturedProducts, setShowFeaturedProducts] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch wishlist when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist() as any);
    }
  }, [dispatch, isAuthenticated]);

  // Check if we should show featured products
  const shouldShowFeatured = !filters?.category && 
                             !filters?.search && 
                             !filters?.brand && 
                             !filters?.price_min && 
                             !filters?.price_max &&
                             pagination?.currentPage === 1;

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  // Handle scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFiltersChange = (newFilters: FilterParams) => {
    dispatch(setFilters(newFilters));
    dispatch(setPagination({ ...pagination, currentPage: 1 }));
    dispatch(fetchProducts({ ...newFilters, page: 1 }));
    
    // Update active filters for display
    const filterTags = [];
    if (newFilters.category) filterTags.push(`Category: ${newFilters.category}`);
    if (newFilters.brand) filterTags.push(`Brand: ${newFilters.brand}`);
    if (newFilters.price_min) filterTags.push(`Min: $${newFilters.price_min}`);
    if (newFilters.price_max) filterTags.push(`Max: $${newFilters.price_max}`);
    setActiveFilters(filterTags);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleFiltersChange({ ...filters, search: searchQuery.trim() });
    }
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setShowSortDropdown(false);
    // Apply sorting logic here
    const sortedFilters = { ...filters, ordering: newSort };
    handleFiltersChange(sortedFilters);
  };

  const clearAllFilters = () => {
    dispatch(setFilters({}));
    setActiveFilters([]);
    setSearchQuery('');
  };

  const removeFilter = (filterToRemove: string) => {
    const newFilters = { ...filters };
    if (filterToRemove.startsWith('Category:')) delete newFilters.category;
    if (filterToRemove.startsWith('Brand:')) delete newFilters.brand;
    if (filterToRemove.startsWith('Min:')) delete newFilters.price_min;
    if (filterToRemove.startsWith('Max:')) delete newFilters.price_max;
    handleFiltersChange(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newPagination = { ...pagination, currentPage: page };
    dispatch(setPagination(newPagination));
    dispatch(fetchProducts({ ...filters, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
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
      // Refresh wishlist
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
          {/* Header Skeleton */}
          <Card className="mb-6 p-6">
            <div className="mb-4 h-8 w-64 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-96 animate-pulse rounded bg-slate-200" />
          </Card>
          
          {/* Loading Spinner */}
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Loading variant="spinner" size="lg" text="Loading products..." />
            </div>
          </div>
          
          {/* Product Grid Skeleton */}
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
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Card className="mb-6 p-6">
            <h1 className="text-2xl font-bold text-slate-900">No Products Found</h1>
            <p className="mt-2 text-slate-600">We couldn't find any products matching your criteria</p>
          </Card>
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <FontAwesomeIcon icon={faSearch} className="text-4xl text-slate-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">No products available</h3>
            <p className="mb-6 text-slate-600">Try adjusting your filters or search terms, or check back soon for new products!</p>
            <div className="flex justify-center gap-3">
              <Button variant="primary" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                Adjust Filters
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
        {/* Featured Products Section */}
        {shouldShowFeatured && showFeaturedProducts && (
          <div className="mb-8">
            <FeaturedProducts />
            <Card className="mt-6 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Explore Our Full Collection</h2>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFeaturedProducts(false)}
                  icon={<FontAwesomeIcon icon={faTimes} />}
                >
                  Hide Featured
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Page Header */}
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">
              {filters?.category ? `${filters.category} Products` : 'All Products'}
            </h1>
            <p className="mt-2 text-slate-600">
              Discover amazing products with unbeatable prices and fast shipping
            </p>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search for products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
              <Button type="submit" variant="primary">
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </div>
          </form>

          {/* Product Stats */}
          <div className="grid grid-cols-3 gap-4 rounded-lg bg-slate-50 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{pagination.totalItems || 0}</div>
              <div className="text-sm text-slate-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">4.8</div>
              <div className="text-sm text-slate-600">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{products?.length || 0}</div>
              <div className="text-sm text-slate-600">Showing</div>
            </div>
          </div>
        </Card>

        {/* Controls */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={showFilters ? "primary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                icon={<FontAwesomeIcon icon={faFilter} />}
              >
                Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
              </Button>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {activeFilters.map((filter, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                    >
                      {filter}
                      <button 
                        onClick={() => removeFilter(filter)}
                        className="hover:text-blue-900"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </span>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <FontAwesomeIcon icon={faSort} />
                  Sort by {sortBy}
                  <FontAwesomeIcon icon={faChevronDown} />
                </Button>
                {showSortDropdown && (
                  <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                    {(['popularity', 'newest', 'price', 'rating', 'name'] as SortOption[]).map(option => (
                      <button
                        key={option}
                        onClick={() => handleSortChange(option)}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          sortBy === option 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-slate-200">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  icon={<FontAwesomeIcon icon={faThLarge} />}
                  className="rounded-r-none"
                />
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  icon={<FontAwesomeIcon icon={faList} />}
                  className="rounded-l-none"
                />
              </div>
            </div>
          </div>
        </Card>
        {/* Filters Section */}
        {showFilters && (
          <div className="mb-6">
            <ProductFilters
              onFiltersChange={handleFiltersChange}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="w-full">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(Array.isArray(products) ? products : []).map((item: ProductItem) => {
                const productId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
                return (
                  <ProductCard 
                    key={item.id}
                    product={{
                      id: productId,
                      name: item.name,
                      slug: item.slug,
                      price: item.price,
                      sale_price: item.sale_price,
                      image: item.picture,
                      rating: item.rating,
                      reviews_count: item.reviews_count,
                      in_stock: item.quantity > 0,
                      brand: item.brand
                    }}
                    viewMode={viewMode}
                    onToggleWishlist={handleToggleWishlist}
                    isInWishlist={isProductInWishlist(productId)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(products) ? products : []).map((item: ProductItem) => {
                const productId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
                return (
                  <ProductCard 
                    key={item.id}
                    product={{
                      id: productId,
                      name: item.name,
                      slug: item.slug,
                      price: item.price,
                      sale_price: item.sale_price,
                      image: item.picture,
                      rating: item.rating,
                      reviews_count: item.reviews_count,
                      in_stock: item.quantity > 0,
                      brand: item.brand
                    }}
                    viewMode={viewMode}
                    onToggleWishlist={handleToggleWishlist}
                    isInWishlist={isProductInWishlist(productId)}
                  />
                );
              })}
            </div>
          )}

          {/* Advanced Pagination */}
          <div className="mt-8">
            {renderAdvancedPagination()}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:scale-110"
          aria-label="Scroll to top"
        >
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      )}
    </div>
  );
};

export default ProductList;