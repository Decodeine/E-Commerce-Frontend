import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setFilters, setPagination } from "../../store/actions/storeActions";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import FiltersDemo from "./FiltersDemo";
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
  [key: string]: any;
}

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector((state: any) => state.store.products);
  const loading = useSelector((state: any) => state.store.loading);
  const filters = useSelector((state: any) => state.store.filters);
  const pagination = useSelector((state: any) => state.store.pagination);
  const brands = useSelector((state: any) => state.store.brands);
  const categories = useSelector((state: any) => state.store.categories);
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleFiltersChange = (newFilters: FilterParams) => {
    dispatch(setFilters(newFilters));
    // Reset to page 1 when filters change
    dispatch(setPagination({ ...pagination, currentPage: 1 }));
    dispatch(fetchProducts({ ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    const newPagination = { ...pagination, currentPage: page };
    dispatch(setPagination(newPagination));
    dispatch(fetchProducts({ ...filters, page }));
  };

  const handleAddToCart = (productId: number) => {
    console.log('Add to cart:', productId);
    // TODO: Implement add to cart logic
  };

  const handleToggleWishlist = (productId: number) => {
    console.log('Toggle wishlist:', productId);
    // TODO: Implement wishlist toggle logic
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, pagination.currentPage - 2);
    const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);

    // Previous button
    pages.push(
      <button
        key="prev"
        className={`pagination-btn ${!pagination.hasPrevious ? 'disabled' : ''}`}
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={!pagination.hasPrevious}
      >
        ←
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={`pagination-btn ${pagination.currentPage === 1 ? 'active' : ''}`}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }

    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${pagination.currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        pages.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      pages.push(
        <button
          key={pagination.totalPages}
          className={`pagination-btn ${pagination.currentPage === pagination.totalPages ? 'active' : ''}`}
          onClick={() => handlePageChange(pagination.totalPages)}
        >
          {pagination.totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        className={`pagination-btn ${!pagination.hasNext ? 'disabled' : ''}`}
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={!pagination.hasNext}
      >
        →
      </button>
    );

    return (
      <div className="pagination-container">
        <div className="pagination">
          {pages}
        </div>
        <div className="pagination-info">
          Showing {((pagination.currentPage - 1) * 12) + 1}-{Math.min(pagination.currentPage * 12, pagination.totalItems)} of {pagination.totalItems} products
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="product-list-container">
        <div className="product-list-header">
          <h1 className="product-list-title">All Products</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading products...</span>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-list-container">
        <div className="product-list-header">
          <h1 className="product-list-title">All Products</h1>
        </div>
        <div className="empty-state">
          <h3>No products available</h3>
          <p>Check back soon for new products!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <div className="header-content">
          <h1 className="product-list-title">All Products</h1>
          <div className="header-actions">
            <button 
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <span>Filters</span>
              <span className="filter-icon">⚙</span>
            </button>
          </div>
        </div>
        <p className="product-list-count">
          {pagination.totalItems} product{pagination.totalItems !== 1 ? 's' : ''} available
        </p>
      </div>
      
      <div className="product-list-content">
        {/* Filters Demo - Shows active filters and stats */}
        <FiltersDemo />
        
        {/* Filters Sidebar */}
        <div className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
          <ProductFilters
            onFiltersChange={handleFiltersChange}
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
        </div>

        {/* Products Content */}
        <div className="products-content">
          <div className="products-grid">
            {products.map((item: ProductItem) => (
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
                  in_stock: item.quantity > 0
                }}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isInWishlist={false} // TODO: Implement wishlist state
              />
            ))}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default ProductList;