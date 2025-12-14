import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCartPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addProductToCart } from '../../store/actions/storeActions';
import { useToast } from '../UI/Toast/ToastProvider';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking add to cart
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

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking wishlist button
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    }
  };

  const handleViewProduct = () => {
    navigate(`/product/${product.slug}`);
  };

  const discountPercent = product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <div 
      className={`
        group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer
        ${viewMode === 'list' ? 'flex-row md:flex-row' : 'flex-col'}
        ${!product.in_stock ? 'opacity-70' : ''}
      `}
      onClick={handleViewProduct}
    >
      {/* Image Section */}
      <div 
        className={`
          relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200
          ${viewMode === 'list' ? 'w-48 h-48 flex-shrink-0 md:w-56 md:h-56' : 'aspect-square h-64'}
        `}
      >
        <img 
          src={product.image || '/images/placeholder-product.jpg'} 
          alt={product.name}
          onClick={handleViewProduct}
          className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewProduct}
            className="h-12 w-12 rounded-full bg-white/90 text-slate-700 shadow-md hover:bg-white hover:scale-110"
            aria-label={`View ${product.name}`}
          >
            <FontAwesomeIcon icon={faEye} />
          </Button>
        </div>

        {/* Sale Badge */}
        {product.sale_price && discountPercent > 0 && (
          <div className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1 text-xs font-semibold uppercase text-white shadow-md">
            {discountPercent}% OFF
          </div>
        )}

        {/* Out of Stock Badge */}
        {!product.in_stock && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black/80 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm">
            Out of Stock
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div 
        className={`
          flex flex-1 flex-col gap-2 p-4
          ${viewMode === 'list' ? 'justify-center' : ''}
        `}
      >
        {product.brand && (
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            {product.brand.name || product.brand}
          </div>
        )}
        
        <h3 
          className="cursor-pointer text-base font-semibold text-slate-900 line-clamp-2 transition-colors hover:text-blue-600"
          onClick={handleViewProduct}
        >
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="flex items-baseline gap-2">
          {product.sale_price ? (
            <>
              <span className="text-xl font-bold text-emerald-600">
                ${parseFloat(String(product.sale_price)).toFixed(2)}
              </span>
              <span className="text-sm text-slate-400 line-through">
                ${parseFloat(String(product.price)).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-emerald-600">
              ${parseFloat(String(product.price)).toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-amber-400">
              {'★'.repeat(Math.floor(Number(product.rating)))}
              {'☆'.repeat(5 - Math.floor(Number(product.rating)))}
            </span>
            <span className="font-semibold text-slate-700">
              ({Number(product.rating).toFixed(1)})
            </span>
            {product.reviews_count && (
              <span className="text-slate-500">
                • {product.reviews_count} reviews
              </span>
            )}
          </div>
        )}
        
        {/* Description (list view only) */}
        {viewMode === 'list' && (
          <p className="mt-2 line-clamp-3 text-sm text-slate-600">
            High-quality product with excellent features and reliable performance.
          </p>
        )}
      </div>
      
      {/* Actions */}
      <div 
        className={`
          flex gap-2 p-4 pt-2
          ${viewMode === 'list' ? 'flex-col justify-center w-48 flex-shrink-0 md:w-56' : 'flex-row'}
        `}
      >
        <Button
          variant="primary"
          onClick={handleAddToCart}
          icon={<FontAwesomeIcon icon={faCartPlus} />}
          className="flex-1"
          disabled={product.in_stock === false}
        >
          {product.in_stock === false ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        
        <Button
          variant={isInWishlist ? "danger" : "outline"}
          onClick={handleToggleWishlist}
          icon={<FontAwesomeIcon icon={faHeart} />}
          className={`${viewMode === 'list' ? 'w-full' : ''} ${isInWishlist ? 'text-red-600' : ''}`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {viewMode === 'list' ? (isInWishlist ? 'Remove' : 'Wishlist') : ''}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;