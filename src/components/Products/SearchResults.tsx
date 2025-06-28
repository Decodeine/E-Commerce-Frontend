import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../store/actions/storeActions";
import ProductCard from "./ProductCard";
import "./css/SearchResults.css";
import { useParams } from "react-router-dom";
import type { AppDispatch } from "../../store/store";

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

const SearchResults: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { query } = useParams<{ query: string }>();
  const products = useSelector((state: any) => state.store.products);
  const loading = useSelector((state: any) => state.store.loading);

  useEffect(() => {
    if (query) {
      const searchFilters = { search: query };
      dispatch(fetchProducts(searchFilters));
    }
  }, [query, dispatch]);

  const handleAddToCart = (productId: number) => {
    console.log('Add to cart:', productId);
    // TODO: Implement add to cart logic
  };

  const handleToggleWishlist = (productId: number) => {
    console.log('Toggle wishlist:', productId);
    // TODO: Implement wishlist toggle logic
  };

  const renderSearchResults = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading search results...</span>
        </div>
      );
    }
    
    if (!products || products.length === 0) {
      return (
        <div className="empty-state">
          <h4>No products found</h4>
          <p>We couldn't find any products matching "{query}". Try searching with different keywords.</p>
        </div>
      );
    }
    
    return (
      <div className="search-results-grid">
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
    );
  };

  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <h2 className="search-results-title">
          Search Results
          {query && <span className="search-query"> for "{query}"</span>}
        </h2>
        {!loading && products && products.length > 0 && (
          <p className="search-results-count">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>
      
      {renderSearchResults()}
    </div>
  );
};

export default SearchResults;