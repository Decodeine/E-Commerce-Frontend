import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
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
import { fetchProducts, setFilters, setPagination } from "../../store/actions/storeActions";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import CategoryNavigation from "./CategoryNavigation";
import FeaturedProducts from "./FeaturedProducts";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import "./css/ProductList.css";
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
  const [searchParams, setSearchParams] = useSearchParams();
  
  const products = useSelector((state: any) => state.store.products);
  const loading = useSelector((state: any) => state.store.loading);
  const filters = useSelector((state: any) => state.store.filters);
  const pagination = useSelector((state: any) => state.store.pagination);
  
  const [showFilters, setShowFilters] = useState(false);
  const [showFeaturedProducts, setShowFeaturedProducts] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const renderAdvancedPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, pagination.currentPage - 2);
    const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);

    return (
      <Card variant="glass" className="pagination-wrapper">
        <div className="pagination-container">
          <div className="pagination-info">
            <span className="showing-text">
              Showing {((pagination.currentPage - 1) * 12) + 1}-{Math.min(pagination.currentPage * 12, pagination.totalItems)} of {pagination.totalItems} products
            </span>
          </div>
          
          <div className="pagination-controls">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevious}
              className="pagination-nav"
            >
              ← Previous
            </Button>

            <div className="pagination-numbers">
              {startPage > 1 && (
                <>
                  <Button
                    variant={pagination.currentPage === 1 ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    className="pagination-btn"
                  >
                    1
                  </Button>
                  {startPage > 2 && <span className="pagination-dots">...</span>}
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
                    className="pagination-btn"
                  >
                    {page}
                  </Button>
                );
              })}

              {endPage < pagination.totalPages && (
                <>
                  {endPage < pagination.totalPages - 1 && <span className="pagination-dots">...</span>}
                  <Button
                    variant={pagination.currentPage === pagination.totalPages ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(pagination.totalPages)}
                    className="pagination-btn"
                  >
                    {pagination.totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="pagination-nav"
            >
              Next →
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const renderProductStats = () => (
    <Card variant="glass" className="product-stats">
      <div className="stats-grid">
        <div className="stat-item">
          <FontAwesomeIcon icon={faShoppingCart} className="stat-icon" />
          <div className="stat-content">
            <span className="stat-number">{pagination.totalItems || 0}</span>
            <span className="stat-label">Products</span>
          </div>
        </div>
        <div className="stat-item">
          <FontAwesomeIcon icon={faStar} className="stat-icon" />
          <div className="stat-content">
            <span className="stat-number">4.8</span>
            <span className="stat-label">Avg Rating</span>
          </div>
        </div>
        <div className="stat-item">
          <FontAwesomeIcon icon={faEye} className="stat-icon" />
          <div className="stat-content">
            <span className="stat-number">{products?.length || 0}</span>
            <span className="stat-label">Showing</span>
          </div>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="product-list-modern">
        <div className="page-header">
          <Card variant="glass" className="header-card">
            <div className="header-content">
              <h1 className="page-title">Discovering Amazing Products</h1>
              <p className="page-subtitle">Please wait while we load the latest products for you</p>
            </div>
          </Card>
        </div>
        <div className="loading-section">
          <Loading variant="spinner" size="lg" text="Loading products..." />
          <div className="loading-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-list-modern">
        <div className="page-header">
          <Card variant="glass" className="header-card">
            <div className="header-content">
              <h1 className="page-title">No Products Found</h1>
              <p className="page-subtitle">We couldn't find any products matching your criteria</p>
            </div>
          </Card>
        </div>
        <Card variant="glass" className="empty-state-card">
          <div className="empty-state">
            <FontAwesomeIcon icon={faSearch} className="empty-icon" />
            <h3>No products available</h3>
            <p>Try adjusting your filters or search terms, or check back soon for new products!</p>
            <div className="empty-actions">
              <Button variant="primary" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
              <Button variant="ghost" onClick={() => setShowFilters(!showFilters)}>
                Adjust Filters
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="product-list-modern">
      {/* Featured Products Section */}
      {shouldShowFeatured && showFeaturedProducts && (
        <div className="featured-section">
          <FeaturedProducts />
          <Card variant="glass" className="section-divider">
            <div className="divider-content">
              <h2>Explore Our Full Collection</h2>
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

      {/* Modern Page Header */}
      <div className="page-header">
        <Card variant="glass" className="header-card">
          <div className="header-content">
            <div className="header-main">
              <h1 className="page-title">
                {filters?.category ? `${filters.category} Products` : 'All Products'}
              </h1>
              <p className="page-subtitle">
                Discover amazing products with unbeatable prices and fast shipping
              </p>
            </div>
            
            {/* Advanced Search Bar */}
            <form onSubmit={handleSearchSubmit} className="search-section">
              <div className="search-wrapper">
                <input
                  type="text"
                  placeholder="Search for products, brands, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <Button type="submit" variant="primary" className="search-btn">
                  <FontAwesomeIcon icon={faSearch} />
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>

      {/* Product Stats */}
      {renderProductStats()}

      {/* Category Navigation - Horizontal */}
      <div className="category-navigation-section">
        <Card variant="glass" className="category-nav-card">
          <div className="category-nav-content">
            <h3>Browse by Category</h3>
            <div className="category-buttons">
              {[
                { id: 'all', name: 'All Products', icon: '🛍️' },
                { id: 'smartphones', name: 'Smartphones', icon: '📱' },
                { id: 'laptops', name: 'Laptops', icon: '💻' },
                { id: 'audio', name: 'Audio & Headphones', icon: '🎧' },
                { id: 'gaming', name: 'Gaming', icon: '🎮' },
                { id: 'tablets', name: 'Tablets', icon: '📺' },
                { id: 'accessories', name: 'Accessories', icon: '⌨️' }
              ].map(category => (
                <Button
                  key={category.id}
                  variant={filters?.category === category.id || (!filters?.category && category.id === 'all') ? 'primary' : 'ghost'}
                  onClick={() => {
                    if (category.id === 'all') {
                      handleFiltersChange({});
                    } else {
                      handleFiltersChange({ ...filters, category: category.id });
                    }
                  }}
                  className="category-btn"
                >
                  <span className="category-icon">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Active Filters & Controls */}
      <div className="controls-section">
        <Card variant="glass" className="controls-card">
          <div className="controls-header">
            <div className="filter-controls">
              <Button
                variant={showFilters ? "primary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                icon={<FontAwesomeIcon icon={faFilter} />}
                className="filter-toggle"
              >
                Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
              </Button>

              {/* Active Filters Display */}
              {activeFilters.length > 0 && (
                <div className="active-filters">
                  {activeFilters.map((filter, index) => (
                    <span key={index} className="filter-tag">
                      {filter}
                      <button 
                        onClick={() => removeFilter(filter)}
                        className="filter-remove"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </span>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="clear-all"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            <div className="view-controls">
              {/* Sort Dropdown */}
              <div className="sort-dropdown">
                <Button
                  variant="outline"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="sort-toggle"
                >
                  <FontAwesomeIcon icon={faSort} />
                  Sort by {sortBy}
                  <FontAwesomeIcon icon={faChevronDown} />
                </Button>
                {showSortDropdown && (
                  <div className="sort-menu">
                    {(['popularity', 'newest', 'price', 'rating', 'name'] as SortOption[]).map(option => (
                      <button
                        key={option}
                        onClick={() => handleSortChange(option)}
                        className={`sort-option ${sortBy === option ? 'active' : ''}`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="view-toggle">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  icon={<FontAwesomeIcon icon={faThLarge} />}
                  className="view-btn"
                />
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  icon={<FontAwesomeIcon icon={faList} />}
                  className="view-btn"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Layout - No Sidebar, Full Width */}
      <div className="main-content">
        {/* Filters Section - Horizontal Layout */}
        <div className={`filters-section ${showFilters ? 'show' : ''}`}>
          <ProductFilters
            onFiltersChange={handleFiltersChange}
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
        </div>

        {/* Products Grid - 3-4 per row */}
        <div className="products-content">
          <div className={`products-${viewMode}`}>
            {(Array.isArray(products) ? products : []).map((item: ProductItem) => (
              <ProductCard 
                key={item.id}
                product={{
                  id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
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
              />
            ))}
          </div>

          {/* Advanced Pagination */}
          {renderAdvancedPagination()}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          variant="primary"
          className="scroll-top-btn"
          onClick={scrollToTop}
          icon={<FontAwesomeIcon icon={faArrowUp} />}
        />
      )}
    </div>
  );
};

export default ProductList;