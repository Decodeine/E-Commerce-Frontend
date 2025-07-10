import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCartPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addProductToCart } from '../../store/actions/storeActions';
import { useToast } from '../UI/Toast/ToastProvider'; // Add this import
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import './css/ProductCard.css';

interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number;
  image?: string;
  rating?: number;
  reviews_count?: number;
  in_stock?: boolean;
  slug: string;
  brand?: any;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
  onToggleWishlist?: (productId: number) => void;
  isInWishlist?: boolean;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  viewMode = 'grid'
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast(); // Add toast hook

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id);
    } else {
      dispatch(addProductToCart(product, 1));
    }
    
    // Add toast notification
    showToast({
      type: 'success',
      title: 'Added to Cart!',
      message: `${product.name} has been added to your cart.`,
      duration: 3000
    });
  };

  const handleToggleWishlist = () => {
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
      
      // Add toast notification
      showToast({
        type: isInWishlist ? 'info' : 'success',
        title: isInWishlist ? 'Removed from Wishlist' : 'Added to Wishlist!',
        message: `${product.name} has been ${isInWishlist ? 'removed from' : 'added to'} your wishlist.`,
        duration: 3000
      });
    }
  };

  const handleViewProduct = () => {
    navigate(`/products/${product.slug}`);
  };

  return (
    <Card 
      variant="glass" 
      className={`product-card ${viewMode === 'list' ? 'product-card--list' : 'product-card--grid'} ${!product.in_stock ? 'out-of-stock' : ''}`}
    >
      <div className="product-card__image">
        <img 
          src={product.image || '/images/placeholder-product.jpg'} 
          alt={product.name}
          onClick={handleViewProduct}
        />
        <div className="product-card__overlay">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewProduct}
            className="overlay-btn"
            aria-label={`View ${product.name}`}
          >
            <FontAwesomeIcon icon={faEye} />
          </Button>
        </div>
        {product.sale_price && (
          <div className="product-card__badge">
            {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
          </div>
        )}
        {!product.in_stock && (
          <div className="product-card__out-of-stock">Out of Stock</div>
        )}
      </div>
      
      <div className="product-card__content">
        {product.brand && (
          <div className="product-card__brand">{product.brand.name || product.brand}</div>
        )}
        
        <h3 className="product-card__title" onClick={handleViewProduct}>
          {product.name}
        </h3>
        
        <div className="product-card__price">
          {product.sale_price ? (
            <>
              <span className="current-price">${parseFloat(String(product.sale_price)).toFixed(2)}</span>
              <span className="original-price">${parseFloat(String(product.price)).toFixed(2)}</span>
            </>
          ) : (
            <span className="current-price">${parseFloat(String(product.price)).toFixed(2)}</span>
          )}
        </div>
        
        {product.rating && (
          <div className="product-card__rating">
            <span className="rating-stars">
              {'★'.repeat(Math.floor(Number(product.rating)))}
              {'☆'.repeat(5 - Math.floor(Number(product.rating)))}
            </span>
            <span className="rating-value">({Number(product.rating).toFixed(1)})</span>
            {product.reviews_count && (
              <span className="reviews-count"> • {product.reviews_count} reviews</span>
            )}
          </div>
        )}
        
        {viewMode === 'list' && (
          <div className="product-card__description">
            High-quality product with excellent features and reliable performance.
          </div>
        )}
      </div>
      
      <div className="product-card__actions">
        <Button
          variant="primary"
          onClick={handleAddToCart}
          icon={<FontAwesomeIcon icon={faCartPlus} />}
          className="add-to-cart-btn"
          disabled={product.in_stock === false}
        >
          {product.in_stock === false ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        
        <Button
          variant={isInWishlist ? "danger" : "outline"}
          onClick={handleToggleWishlist}
          icon={<FontAwesomeIcon icon={faHeart} />}
          className="wishlist-btn"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isInWishlist ? 'Remove' : 'Wishlist'}
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;