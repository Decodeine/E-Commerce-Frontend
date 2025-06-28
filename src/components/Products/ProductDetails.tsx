import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  addProductToCart,
  removeProductFromCart
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
  faChevronLeft,
  faChevronRight,
  faExpand
} from "@fortawesome/free-solid-svg-icons";
import Card from "../UI/Card/Card";
import Button from "../UI/Button/Button";
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
  
  const cart = useSelector((state: any) => state.store.cart);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<{ color?: string; size?: string }>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [showReviews, setShowReviews] = useState(false);

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
          fetchRecommendations(res.data.id)
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
    }
  };

  const handleRemoveFromCart = () => {
    if (product) {
      dispatch(removeProductFromCart(product));
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

  // Product image gallery
  const productImages = product ? [
    product.picture,
    ...(product.gallery || [])
  ] : [];

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setActiveImageIndex(prev => 
        prev === 0 ? productImages.length - 1 : prev - 1
      );
    } else {
      setActiveImageIndex(prev => 
        prev === productImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const renderImageGallery = () => {
    if (productImages.length <= 1) {
      return (
        <div className="product-image-container">
          <img
            src={product?.picture}
            alt={product?.name}
            className="product-main-image"
          />
        </div>
      );
    }

    return (
      <div className="product-gallery">
        <div className="main-image-container">
          <img
            src={productImages[activeImageIndex]}
            alt={product?.name}
            className="product-main-image"
          />
          
          {productImages.length > 1 && (
            <>
              <button 
                className="gallery-nav gallery-nav-prev"
                onClick={() => handleImageNavigation('prev')}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button 
                className="gallery-nav gallery-nav-next"
                onClick={() => handleImageNavigation('next')}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </>
          )}
        </div>
        
        <div className="thumbnail-list">
          {productImages.map((image, index) => (
            <button
              key={index}
              className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
              onClick={() => setActiveImageIndex(index)}
            >
              <img src={image} alt={`${product?.name} ${index + 1}`} />
            </button>
          ))}
        </div>
      </div>
    );
  };

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
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        icon={faArrowLeft} 
        onClick={() => navigate('/')}
        className="back-button"
      >
        Back to Products
      </Button>

      <div className="product-details-content">
        {/* Product Images */}
        <div className="product-images-section">
          <Card className="product-image-card" padding="none">
            {renderImageGallery()}
            {discountPercentage > 0 && (
              <div className="product-badge product-badge--sale">
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
              <h1 className="product-title">{product.name}</h1>
              {product.brand && (
                <p className="product-brand">by {product.brand}</p>
              )}
              
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
            </div>

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
      </div>
    </div>
  );
};

export default ProductDetails;