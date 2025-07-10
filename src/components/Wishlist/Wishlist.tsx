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
import Loading from '../UI/Loading/Loading';
import { useToast } from '../UI/Toast/ToastProvider';
import ProductCard from '../Products/ProductCard';
import { fetchWishlist, addProductToCart } from '../../store/actions/storeActions';
import { productsApi } from '../../services/productsApi';
import type { AppDispatch } from '../../store/store';
import './css/Wishlist.css';

interface WishlistItem {
  id: number;
  product: {
    id: number;
    slug: string;
    name: string;
    price: string; // Backend returns string, not number
    original_price?: string;
    picture: string; // Backend uses 'picture', not 'image'
    rating?: string;
    review_count?: number;
    in_stock: boolean;
    brand?: {
      name: string;
    };
  };
  added_at: string; // Backend returns 'added_at', not 'added_to_wishlist'
  notes?: string;
}

const Wishlist: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { wishlist, loading } = useSelector((state: any) => state.store);
  const { token } = useSelector((state: any) => state.auth);
  
  // Derive isAuthenticated from token
  const isAuthenticated = !!(token && token.trim() !== '');
  
  // Debug logging
  useEffect(() => {
    console.log('🐛 Wishlist Debug - Auth State:', {
      token: token ? `${token.substring(0, 20)}...` : 'null',
      isAuthenticated,
      tokenLength: token ? token.length : 0,
      tokenType: typeof token,
      fullToken: token // Temporarily log full token for debugging
    });
  }, [token, isAuthenticated]);
  
  const { showToast } = useToast();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'added' | 'price' | 'name'>('added');

  useEffect(() => {
    console.log('🔄 Wishlist useEffect - isAuthenticated:', isAuthenticated, 'token:', token ? 'Present' : 'Missing');
    if (isAuthenticated && token) {
      dispatch(fetchWishlist());
    } else {
      console.log('⚠️ Not fetching wishlist - authentication missing');
    }
  }, [dispatch, isAuthenticated, token]);

  const handleRemoveFromWishlist = async (productId: number) => {
    if (!token) {
      showToast({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to manage your wishlist.'
      });
      return;
    }

    try {
      // Use the API directly since you need to pass the token
      await productsApi.removeProductFromWishlist(productId, token);
      
      // Refresh wishlist
      dispatch(fetchWishlist());
      
      showToast({
        type: 'success',
        title: 'Removed from Wishlist',
        message: 'Item has been removed from your wishlist.'
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove item from wishlist. Please try again.'
      });
    }
  };

  const handleAddToCart = (product: any) => {
    dispatch(addProductToCart(product, 1));
    showToast({
      type: 'success',
      title: 'Added to Cart',
      message: `${product.name} has been added to your cart.`
    });
  };

  // Adapter function to transform backend data structure to match ProductCard expectations
  const adaptProductForCard = (wishlistItem: WishlistItem) => {
    const basePrice = parseFloat(wishlistItem.product.price);
    const originalPrice = wishlistItem.product.original_price ? parseFloat(wishlistItem.product.original_price) : null;
    
    return {
      id: wishlistItem.product.id,
      name: wishlistItem.product.name,
      slug: wishlistItem.product.slug,
      // If there's an original_price, then the current price is a sale price
      price: originalPrice || basePrice, // Original price for calculating discount
      sale_price: originalPrice ? basePrice : undefined, // Current price if on sale
      image: wishlistItem.product.picture, // Map picture to image
      rating: wishlistItem.product.rating ? parseFloat(wishlistItem.product.rating) : undefined,
      reviews_count: wishlistItem.product.review_count,
      in_stock: wishlistItem.product.in_stock,
      brand: wishlistItem.product.brand
    };
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
      showToast({
        type: 'info',
        title: 'Link Copied',
        message: 'Wishlist link has been copied to clipboard.'
      });
    }
  };

  const sortedWishlist = React.useMemo(() => {
    if (!wishlist || wishlist.length === 0) return [];
    
    const sorted = [...wishlist].sort((a: WishlistItem, b: WishlistItem) => {
      switch (sortBy) {
        case 'added':
          return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
        case 'price':
          const priceA = parseFloat(a.product.price);
          const priceB = parseFloat(b.product.price);
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
        <Loading 
          variant="spinner" 
          size="lg" 
          text="Loading your wishlist..." 
        />
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
                  product={adaptProductForCard(item)}
                  onAddToCart={() => handleAddToCart(item.product)}
                  onToggleWishlist={() => handleRemoveFromWishlist(item.product.id)}
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
                    <img src={item.product.picture} alt={item.product.name} />
                  </div>
                  
                  <div className="item-details">
                    <h3 className="item-name">{item.product.name}</h3>
                    {item.product.brand?.name && (
                      <p className="item-brand">by {item.product.brand.name}</p>
                    )}
                    
                    <div className="item-price">
                      <span className="current-price">
                        ${parseFloat(item.product.price).toFixed(2)}
                      </span>
                      {item.product.original_price && (
                        <span className="original-price">
                          ${parseFloat(item.product.original_price).toFixed(2)}
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
                              className={i < Math.floor(parseFloat(item.product.rating)) ? 'star-filled' : 'star-empty'}
                            />
                          ))}
                        </div>
                        <span className="rating-text">
                          ({item.product.review_count} reviews)
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
                      onClick={() => handleRemoveFromWishlist(item.product.id)}
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
