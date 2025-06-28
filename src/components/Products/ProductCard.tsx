import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faHeart } from '@fortawesome/free-solid-svg-icons';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import './css/ProductCard.css';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  image: string;
  rating?: number;
  reviews_count?: number;
  in_stock?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
  onToggleWishlist?: (productId: number) => void;
  isInWishlist?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product.id);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist?.(product.id);
  };

  const discountPercentage = product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const displayPrice = product.sale_price || product.price;
  const inStock = product.in_stock ?? true;

  return (
    <Card 
      className="product-card" 
      variant="elevated" 
      padding="none"
      hover
      clickable
      onClick={handleCardClick}
    >
      <div className="product-card__image-container">
        <img 
          src={product.image} 
          alt={product.name}
          className="product-card__image"
          loading="lazy"
        />
        
        {discountPercentage > 0 && (
          <div className="product-card__badge product-card__badge--sale">
            -{discountPercentage}%
          </div>
        )}
        
        {!inStock && (
          <div className="product-card__badge product-card__badge--out-of-stock">
            Out of Stock
          </div>
        )}

        <button
          className={`product-card__wishlist-btn ${isInWishlist ? 'product-card__wishlist-btn--active' : ''}`}
          onClick={handleToggleWishlist}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FontAwesomeIcon icon={faHeart} />
        </button>
      </div>

      <div className="product-card__content">
        <h3 className="product-card__title">{product.name}</h3>
        
        {product.rating && (
          <div className="product-card__rating">
            <div className="product-card__stars">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`product-card__star ${i < Math.floor(product.rating!) ? 'product-card__star--filled' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
            {product.reviews_count && (
              <span className="product-card__reviews-count">
                ({product.reviews_count})
              </span>
            )}
          </div>
        )}

        <div className="product-card__price-container">
          <span className="product-card__price">${displayPrice.toFixed(2)}</span>
          {product.sale_price && (
            <span className="product-card__original-price">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          fullWidth
          icon={faCartPlus}
          disabled={!inStock}
          onClick={handleAddToCart}
          className="product-card__add-to-cart"
        >
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
