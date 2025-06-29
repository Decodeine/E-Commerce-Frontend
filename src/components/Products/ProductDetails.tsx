import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  addProductToCart,
  removeProductFromCart,
  addToWishlist,
  removeFromWishlist
} from "../../store/actions/storeActions";
import { API_PATH } from "../../backend_url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCartPlus, 
  faTrashAlt, 
  faArrowLeft, 
  faHeart,
  faStar,
  faStarHalfAlt,
  faShoppingCart,
  faShield,
  faTruck,
  faShare,
  faCodeCompare,
  faBell,
  faTag
} from "@fortawesome/free-solid-svg-icons";
import Card from "../UI/Card/Card";
import Button from "../UI/Button/Button";
import { useToast } from "../UI/Toast/ToastProvider";
import ProductGallery from "./ProductGallery";
import FeaturedProducts from "./FeaturedProducts";
import "./css/ProductDetails.css";

// Types
interface Product {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  picture: string;
  description: string;
  quantity: number;
  sale_price?: number;
  rating?: number;
  reviews_count?: number;
  brand?: string;
  category?: string;
  gallery?: string[];
  variants?: {
    colors?: string[];
    sizes?: string[];
  };
  specifications?: {
    [key: string]: string;
  };
  [key: string]: any;
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  const cart = useSelector((state: any) => state.store.cart);
  const wishlist = useSelector((state: any) => state.store.wishlist || []);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<{ color?: string; size?: string }>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const res = await axios.get(`${API_PATH}products/${slug}`);
        setProduct(res.data);
        
        // Fetch additional data
        await Promise.all([
          fetchProductReviews(res.data.id),
          fetchRecommendations(res.data.id),
          fetchRelatedProducts(res.data.category, res.data.id)
        ]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const fetchProductReviews = async (productId: string | number) => {
    try {
      const res = await axios.get(`${API_PATH}products/${productId}/reviews/`);
      setReviews(res.data.results || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const fetchRecommendations = async (productId: string | number) => {
    try {
      const res = await axios.get(`${API_PATH}products/${productId}/recommendations/`);
      setRecommendations(res.data.results || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  const fetchRelatedProducts = async (category: string, currentProductId: string | number) => {
    try {
      const res = await axios.get(`${API_PATH}products/?category=${category}&limit=8`);
      const filtered = res.data.results?.filter((p: Product) => p.id !== currentProductId) || [];
      setRelatedProducts(filtered.slice(0, 4));
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  };

  const isInWishlist = () => {
    return product ? wishlist.some((item: any) => 
      item.product?.id === product.id || item.id === product.id
    ) : false;
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isInWishlist()) {
      // Find the wishlist item to get its ID for removal
      const wishlistItem = wishlist.find((item: any) => 
        item.product?.id === product.id || item.id === product.id
      );
      if (wishlistItem) {
        dispatch(removeFromWishlist(wishlistItem.id) as any);
        showToast({
          type: 'info',
          title: 'Removed from Wishlist',
          message: `${product.name} removed from wishlist.`
        });
      }
    } else {
      dispatch(addToWishlist(Number(product.id)) as any);
      showToast({
        type: 'success',
        title: 'Added to Wishlist',
        message: `${product.name} added to wishlist.`
      });
    }
  };

  const handleShare = (platform?: string) => {
    const url = window.location.href;
    const title = product?.name || 'Check out this product';
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        showToast({
          type: 'success',
          title: 'Link Copied',
          message: 'Product link has been copied to clipboard.'
        });
        break;
      default:
        setShareDropdownOpen(!shareDropdownOpen);
    }
  };

  const navigateToCategory = () => {
    if (product?.category) {
      navigate(`/products?category=${encodeURIComponent(product.category)}`);
    }
  };

  const inCart = () => {
    if (!product) return 0;
    const res = cart.find((e: Product) => e.id === product.id);
    return res ? res.quantity : 0;
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < selectedQuantity; i++) {
        dispatch(addProductToCart(product, 1));
      }
      showToast({
        type: 'success',
        title: 'Added to Cart',
        message: `${selectedQuantity} x ${product.name} added to cart.`
      });
    }
  };

  const handleRemoveFromCart = () => {
    if (product) {
      dispatch(removeProductFromCart(product));
      showToast({
        type: 'info',
        title: 'Removed from Cart',
        message: `${product.name} removed from cart.`
      });
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQuantity(Number(e.target.value));
  };

  const getQuantityOptions = () => {
    if (!product || product.quantity === 0) return [];
    const maxQuantity = Math.min(product.quantity, 10);
    return Array.from({ length: maxQuantity }, (_, i) => i + 1);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={i} icon={faStar} className="star-filled" />);
    }

    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} className="star-filled" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="star-empty" />);
    }

    return stars;
  };

  // Prepare images for gallery
  const productImages = product ? [
    product.picture,
    ...(product.gallery || [])
  ].filter(Boolean) : [];

  const renderProductVariants = () => {
    if (!product?.variants) return null;

    return (
      <div className="product-variants">
        {product.variants.colors && (
          <div className="variant-group">
            <label>Color:</label>
            <div className="color-options">
              {product.variants.colors.map(color => (
                <button
                  key={color}
                  className={`color-option ${selectedVariant.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  onClick={() => setSelectedVariant(prev => ({ ...prev, color }))}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
        
        {product.variants.sizes && (
          <div className="variant-group">
            <label>Size:</label>
            <div className="size-options">
              {product.variants.sizes.map(size => (
                <button
                  key={size}
                  className={`size-option ${selectedVariant.size === size ? 'selected' : ''}`}
                  onClick={() => setSelectedVariant(prev => ({ ...prev, size }))}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSpecifications = () => {
    if (!product?.specifications) return null;

    return (
      <div className="product-specifications">
        <h3>Specifications</h3>
        <div className="specs-grid">
          {Object.entries(product.specifications).map(([key, value]) => (
            <div key={key} className="spec-item">
              <span className="spec-label">{key}:</span>
              <span className="spec-value">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    if (!showReviews || reviews.length === 0) return null;

    return (
      <div className="product-reviews">
        <h3>Customer Reviews ({reviews.length})</h3>
        <div className="reviews-list">
          {reviews.slice(0, 5).map(review => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <span className="reviewer-name">{review.user_name}</span>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
                <span className="review-date">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
        {reviews.length > 5 && (
          <Button variant="outline" size="sm">
            View All Reviews
          </Button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="loading-spinner"></div>
        <span className="loading-text">Loading product details...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-error">
        <Card className="error-card" padding="lg">
          <h2>Product Not Found</h2>
          <p>Sorry, we couldn't find the product you're looking for.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/')}
            icon={faArrowLeft}
          >
            Back to Products
          </Button>
        </Card>
      </div>
    );
  }

  const inStock = product.quantity > 0;
  const discountPercentage = product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;
  const displayPrice = product.sale_price || product.price;

  return (
    <div className="product-details-container">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb-nav">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
        >
          Home
        </Button>
        <span className="breadcrumb-separator">/</span>
        {product?.category && (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={navigateToCategory}
            >
              {product.category}
            </Button>
            <span className="breadcrumb-separator">/</span>
          </>
        )}
        <span className="breadcrumb-current">{product?.name}</span>
      </nav>

      <div className="product-details-content">
        {/* Product Images */}
        <div className="product-images-section">
          <Card className="product-image-card" padding="none">
            <ProductGallery 
              images={productImages}
              productName={product?.name || 'Product'}
              className="product-detail-gallery"
            />
            {discountPercentage > 0 && (
              <div className="product-badge product-badge--sale">
                <FontAwesomeIcon icon={faTag} />
                -{discountPercentage}% OFF
              </div>
            )}
            {!inStock && (
              <div className="product-badge product-badge--out-of-stock">
                Out of Stock
              </div>
            )}
          </Card>
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <Card className="product-info-card" padding="lg">
            {/* Product Title & Rating */}
            <div className="product-header">
              <div className="product-title-section">
                <h1 className="product-title">{product.name}</h1>
                {product.brand && (
                  <p className="product-brand">by {product.brand}</p>
                )}
              </div>
              
              <div className="product-actions">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={faHeart}
                  onClick={handleWishlistToggle}
                  className={`wishlist-btn ${isInWishlist() ? 'active' : ''}`}
                  aria-label={isInWishlist() ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {isInWishlist() ? 'In Wishlist' : 'Add to Wishlist'}
                </Button>
                
                <div className="share-dropdown">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={faShare}
                    onClick={() => handleShare()}
                    className="share-btn"
                  >
                    Share
                  </Button>
                  {shareDropdownOpen && (
                    <div className="share-options">
                      <button onClick={() => handleShare('facebook')}>Facebook</button>
                      <button onClick={() => handleShare('twitter')}>Twitter</button>
                      <button onClick={() => handleShare('copy')}>Copy Link</button>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  icon={faCodeCompare}
                  onClick={() => navigate(`/compare?add=${product.id}`)}
                >
                  Compare
                </Button>
              </div>
            </div>
              
              {product.rating && (
                <div className="product-rating">
                  <div className="stars-container">
                    {renderStars(product.rating)}
                  </div>
                  <span className="rating-value">({product.rating})</span>
                  {product.reviews_count && (
                    <span className="reviews-count">
                      {product.reviews_count} review{product.reviews_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}

            {/* Price */}
            <div className="product-price-section">
              <div className="price-container">
                <span className="current-price">${displayPrice.toFixed(2)}</span>
                {product.sale_price && (
                  <span className="original-price">${product.price.toFixed(2)}</span>
                )}
              </div>
            </div>

            {/* Product Variants */}
            {renderProductVariants()}

            {/* Description */}
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Stock Status */}
            <div className="product-stock">
              <div className={`stock-indicator ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                {inStock ? (
                  product.quantity > 20 ? (
                    <span>✓ In Stock - Ready to ship</span>
                  ) : (
                    <span>⚠ Only {product.quantity} left in stock</span>
                  )
                ) : (
                  <span>✗ Out of Stock</span>
                )}
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="add-to-cart-section">
              {inStock && (
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <select
                    id="quantity"
                    value={selectedQuantity}
                    onChange={handleQuantityChange}
                    className="quantity-select"
                  >
                    {getQuantityOptions().map(num => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="action-buttons">
                <Button
                  variant="primary"
                  size="lg"
                  icon={faCartPlus}
                  disabled={!inStock}
                  onClick={handleAddToCart}
                  className="add-to-cart-btn"
                  fullWidth
                >
                  {inStock ? `Add ${selectedQuantity} to Cart` : 'Out of Stock'}
                </Button>

                <div className="secondary-actions">
                  {inCart() > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={faTrashAlt}
                      onClick={handleRemoveFromCart}
                      className="remove-from-cart-btn"
                    >
                      Remove from Cart ({inCart()})
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    icon={faBell}
                    onClick={() => navigate(`/price-alerts?product=${product.id}`)}
                    className="price-alert-btn"
                  >
                    Price Alert
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Features */}
            <div className="product-features">
              <div className="feature-item">
                <FontAwesomeIcon icon={faTruck} />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="feature-item">
                <FontAwesomeIcon icon={faShield} />
                <span>1-year warranty included</span>
              </div>
              <div className="feature-item">
                <FontAwesomeIcon icon={faShoppingCart} />
                <span>Easy returns within 30 days</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Additional Product Information */}
      <div className="product-additional-info">
        {/* Specifications */}
        {product.specifications && (
          <Card className="specifications-card" padding="lg">
            {renderSpecifications()}
          </Card>
        )}

        {/* Reviews Toggle */}
        {reviews.length > 0 && (
          <Card className="reviews-card" padding="lg">
            <div className="reviews-header">
              <h3>Customer Reviews ({reviews.length})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReviews(!showReviews)}
              >
                {showReviews ? 'Hide Reviews' : 'Show Reviews'}
              </Button>
            </div>
            {renderReviews()}
          </Card>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card className="recommendations-card" padding="lg">
            <h3>You might also like</h3>
            <div className="recommendations-grid">
              {recommendations.slice(0, 4).map(item => (
                <div 
                  key={item.id} 
                  className="recommendation-item"
                  onClick={() => navigate(`/products/${item.slug}`)}
                >
                  <img src={item.picture} alt={item.name} />
                  <div className="recommendation-info">
                    <h4>{item.name}</h4>
                    <span className="recommendation-price">
                      ${item.sale_price || item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Related Products from Same Category */}
        {relatedProducts.length > 0 && (
          <Card className="related-products-card" padding="lg">
            <div className="section-header">
              <h3>More from {product?.category}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToCategory}
              >
                View All
              </Button>
            </div>
            <div className="related-products-grid">
              {relatedProducts.map(item => (
                <div 
                  key={item.id} 
                  className="related-product-item"
                  onClick={() => navigate(`/products/${item.slug}`)}
                >
                  <img src={item.picture} alt={item.name} />
                  <div className="related-product-info">
                    <h4>{item.name}</h4>
                    <div className="price-info">
                      <span className="price">
                        ${item.sale_price || item.price}
                      </span>
                      {item.sale_price && (
                        <span className="original-price">
                          ${item.price}
                        </span>
                      )}
                    </div>
                    {item.rating && (
                      <div className="rating-stars">
                        {renderStars(item.rating)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Featured Products Section */}
      <div className="featured-products-section">
        <FeaturedProducts />
      </div>
    </div>
  );
};

export default ProductDetails;