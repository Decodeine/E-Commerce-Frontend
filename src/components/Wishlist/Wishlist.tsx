import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faTrash, 
  faShoppingCart, 
  faShare,
  faEye,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import ProductCard from '../Products/ProductCard';
import { fetchWishlist, removeFromWishlist, addProductToCart } from '../../store/actions/storeActions';
import type { AppDispatch } from '../../store/store';
import './css/Wishlist.css';

interface WishlistItem {
  id: number;
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    sale_price?: number;
    image: string;
    rating?: number;
    reviews_count?: number;
    in_stock: boolean;
    brand?: string;
  };
  added_at: string;
  notes?: string;
}

const Wishlist: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { wishlist, loading } = useSelector((state: any) => state.store);
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'added' | 'price' | 'name'>('added');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemoveFromWishlist = async (itemId: number) => {
    try {
      await dispatch(removeFromWishlist(itemId));
      // Optionally show success toast
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Optionally show error toast
    }
  };

  const handleAddToCart = (product: any) => {
    dispatch(addProductToCart(product, 1));
    // Optionally show success toast
  };

  const handleShareWishlist = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Wishlist',
        text: 'Check out my wishlist!',
        url: window.location.href
      });
    } else {
      // Fallback to copy URL
      navigator.clipboard.writeText(window.location.href);
      // Show copied toast
    }
  };

  const sortedWishlist = React.useMemo(() => {
    if (!wishlist || wishlist.length === 0) return [];
    
    const sorted = [...wishlist].sort((a: WishlistItem, b: WishlistItem) => {
      switch (sortBy) {
        case 'added':
          return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
        case 'price':
          const priceA = a.product.sale_price || a.product.price;
          const priceB = b.product.sale_price || b.product.price;
          return priceA - priceB;
        case 'name':
          return a.product.name.localeCompare(b.product.name);
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [wishlist, sortBy]);

  if (!isAuthenticated) {
    return (
      <div className="wishlist-container">
        <Card className="auth-required-card" padding="xl">
          <div className="auth-required-content">
            <FontAwesomeIcon icon={faHeart} className="auth-icon" />
            <h2>Sign in to view your wishlist</h2>
            <p>Save your favorite products and never lose track of them!</p>
            <Button variant="primary" size="lg">
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading your wishlist...</span>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="wishlist-container">
        <Card className="empty-wishlist-card" padding="xl">
          <div className="empty-wishlist-content">
            <FontAwesomeIcon icon={faHeart} className="empty-icon" />
            <h2>Your wishlist is empty</h2>
            <p>Start adding products you love to keep track of them!</p>
            <Button variant="primary" size="lg">
              Browse Products
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      {/* Wishlist Header */}
      <div className="wishlist-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="wishlist-title">
              <FontAwesomeIcon icon={faHeart} />
              My Wishlist
            </h1>
            <p className="wishlist-count">
              {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="header-actions">
            <Button
              variant="ghost"
              size="sm"
              icon={faShare}
              onClick={handleShareWishlist}
            >
              Share
            </Button>
            
            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="added">Recently Added</option>
              <option value="price">Price: Low to High</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Wishlist Content */}
      <div className={`wishlist-content ${viewMode}`}>
        {viewMode === 'grid' ? (
          <div className="wishlist-grid">
            {sortedWishlist.map((item: WishlistItem) => (
              <div key={item.id} className="wishlist-item-wrapper">
                <ProductCard
                  product={item.product}
                  onAddToCart={() => handleAddToCart(item.product)}
                  onToggleWishlist={() => handleRemoveFromWishlist(item.id)}
                  isInWishlist={true}
                />
                <div className="wishlist-item-meta">
                  <span className="added-date">
                    Added {new Date(item.added_at).toLocaleDateString()}
                  </span>
                  {item.notes && (
                    <p className="item-notes">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="wishlist-list">
            {sortedWishlist.map((item: WishlistItem) => (
              <Card key={item.id} className="wishlist-list-item" padding="md">
                <div className="list-item-content">
                  <div className="item-image">
                    <img src={item.product.image} alt={item.product.name} />
                  </div>
                  
                  <div className="item-details">
                    <h3 className="item-name">{item.product.name}</h3>
                    {item.product.brand && (
                      <p className="item-brand">by {item.product.brand}</p>
                    )}
                    
                    <div className="item-price">
                      <span className="current-price">
                        ${(item.product.sale_price || item.product.price).toFixed(2)}
                      </span>
                      {item.product.sale_price && (
                        <span className="original-price">
                          ${item.product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {item.product.rating && (
                      <div className="item-rating">
                        <div className="stars">
                          {Array.from({ length: 5 }, (_, i) => (
                            <FontAwesomeIcon
                              key={i}
                              icon={faStar}
                              className={i < Math.floor(item.product.rating!) ? 'star-filled' : 'star-empty'}
                            />
                          ))}
                        </div>
                        <span className="rating-text">
                          ({item.product.reviews_count} reviews)
                        </span>
                      </div>
                    )}
                    
                    <p className="added-date">
                      Added on {new Date(item.added_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="item-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={faShoppingCart}
                      onClick={() => handleAddToCart(item.product)}
                      disabled={!item.product.in_stock}
                    >
                      {item.product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={faEye}
                    >
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      icon={faTrash}
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="remove-btn"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
