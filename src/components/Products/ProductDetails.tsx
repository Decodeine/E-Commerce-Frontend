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
  faTag,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import Card from "../UI/Card/Card";
import Button from "../UI/Button/Button";
import { useToast } from "../UI/Toast/ToastProvider";
import Loading from "../UI/Loading/Loading";
import ProductGallery from "./ProductGallery";
import FeaturedProducts from "./FeaturedProducts";

// Types
interface Product {
  id: string | number;
  slug: string;
  name: string;
  price: number | string;
  picture: string;
  description: string;
  quantity: number;
  sale_price?: number | string;
  original_price?: number | string;
  rating?: number | string;
  reviews_count?: number;
  brand?: string | { name: string; id?: number };
  category?: string | { id?: number; name?: string; slug?: string; parent?: any; icon?: string; description?: string; product_count?: number };
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
        
        // Fetch additional data (don't await - let them fail silently)
        Promise.all([
          fetchProductReviews(res.data.slug),
          fetchRecommendations(res.data.slug),
          fetchRelatedProducts(res.data.category, res.data.id)
        ]).catch(() => {
          // Silently handle any errors
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const fetchProductReviews = async (productSlug: string) => {
    try {
      const res = await axios.get(`${API_PATH}products/${productSlug}/reviews/`);
      setReviews(res.data.results || res.data || []);
    } catch (err: any) {
      // Silently fail - reviews endpoint may not exist
      if (err?.response?.status !== 404) {
        console.error('Error fetching reviews:', err);
      }
    }
  };

  const fetchRecommendations = async (productSlug: string) => {
    try {
      const res = await axios.get(`${API_PATH}products/${productSlug}/recommendations/`);
      setRecommendations(res.data.results || res.data || []);
    } catch (err: any) {
      // Silently fail - recommendations endpoint may not exist
      if (err?.response?.status !== 404) {
        console.error('Error fetching recommendations:', err);
      }
    }
  };

  const fetchRelatedProducts = async (category: string | { name?: string; slug?: string } | undefined, currentProductId: string | number) => {
    try {
      const categorySlug = typeof category === 'object' ? category?.slug || category?.name : category;
      if (!categorySlug) return;
      
      const res = await axios.get(`${API_PATH}products/?category=${categorySlug}&limit=8`);
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
      const categorySlug = typeof product.category === 'object' 
        ? (product.category.slug || product.category.name) 
        : product.category;
      if (categorySlug) {
        navigate(`/products?category=${encodeURIComponent(categorySlug)}`);
      }
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

  const renderStars = (rating: number | string | undefined) => {
    if (!rating) return null;
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    if (isNaN(numRating)) return null;
    
    const stars = [];
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} className="text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(numRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="text-slate-300" />);
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
      <div className="mb-6 space-y-4">
        {product.variants.colors && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Color:</label>
            <div className="flex gap-2">
              {product.variants.colors.map(color => (
                <button
                  key={color}
                  className={`h-10 w-10 rounded-full border-2 transition-all ${
                    selectedVariant.color === color 
                      ? 'border-blue-600 ring-2 ring-blue-200' 
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  onClick={() => setSelectedVariant(prev => ({ ...prev, color }))}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
        
        {product.variants.sizes && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Size:</label>
            <div className="flex gap-2">
              {product.variants.sizes.map(size => (
                <button
                  key={size}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                    selectedVariant.size === size
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                  }`}
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
      <div>
        <h3 className="mb-4 text-xl font-bold text-slate-900">Specifications</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(product.specifications).map(([key, value]) => (
            <div key={key} className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-medium text-slate-600">{key}:</span>
              <span className="text-slate-900">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    if (!showReviews || reviews.length === 0) return null;

    return (
      <div className="mt-4 space-y-4">
        {reviews.slice(0, 5).map(review => (
          <div key={review.id} className="border-b border-slate-200 pb-4 last:border-0">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold text-slate-900">{review.user_name}</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-slate-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="text-slate-700">{review.comment}</p>
          </div>
        ))}
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
      <div className="flex min-h-screen items-center justify-center py-12">
        <Loading variant="spinner" size="lg" text="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="mx-auto max-w-2xl px-4">
          <Card className="p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Product Not Found</h2>
            <p className="mb-6 text-slate-600">Sorry, we couldn't find the product you're looking for.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/products')}
              icon={faArrowLeft}
            >
              Back to Products
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const salePrice = product.sale_price ? (typeof product.sale_price === 'string' ? parseFloat(product.sale_price) : product.sale_price) : null;
  const originalPrice = product.original_price ? (typeof product.original_price === 'string' ? parseFloat(product.original_price) : product.original_price) : price;
  
  const inStock = product.quantity > 0;
  const discountPercentage = salePrice && originalPrice
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;
  const displayPrice = salePrice || price;
  const brandName = typeof product.brand === 'object' ? product.brand.name : product.brand;

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
          >
            Home
          </Button>
          <FontAwesomeIcon icon={faChevronRight} className="text-xs text-slate-400" />
          {product?.category && (
            <>
              <button
                onClick={navigateToCategory}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                {typeof product.category === 'object' ? (product.category.name || product.category.slug) : product.category}
              </button>
              <FontAwesomeIcon icon={faChevronRight} className="text-xs text-slate-400" />
            </>
          )}
          <span className="text-slate-600">{product?.name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Product Images */}
          <div className="relative">
            <Card className="overflow-hidden p-4" padding="none">
              <ProductGallery 
                images={productImages}
                productName={product?.name || 'Product'}
              />
              {discountPercentage > 0 && (
                <div className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-sm font-bold text-white shadow-md">
                  <FontAwesomeIcon icon={faTag} className="mr-1" />
                  -{discountPercentage}% OFF
                </div>
              )}
              {!inStock && (
                <div className="absolute left-4 top-4 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-bold text-white shadow-md">
                  Out of Stock
                </div>
              )}
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <Card className="p-6">
              {/* Product Title & Rating */}
              <div className="mb-4">
                <h1 className="mb-2 text-3xl font-bold text-slate-900">{product.name}</h1>
                {brandName && (
                  <p className="text-lg text-slate-600">by {brandName}</p>
                )}
              </div>
              
              {product.rating && (
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(typeof product.rating === 'string' ? parseFloat(product.rating) : product.rating)}
                  </div>
                  <span className="font-semibold text-slate-700">
                    ({(typeof product.rating === 'string' ? parseFloat(product.rating) : product.rating).toFixed(1)})
                  </span>
                  {product.reviews_count && (
                    <span className="text-slate-600">
                      {product.reviews_count} review{product.reviews_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-slate-900">${displayPrice.toFixed(2)}</span>
                  {salePrice && originalPrice && (
                    <span className="text-xl text-slate-500 line-through">${originalPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>

              {/* Product Variants */}
              {renderProductVariants()}

              {/* Description */}
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold text-slate-900">Description</h3>
                <p className="text-slate-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <div className={`rounded-lg border-2 p-3 ${
                  inStock 
                    ? 'border-green-200 bg-green-50 text-green-800' 
                    : 'border-red-200 bg-red-50 text-red-800'
                }`}>
                  {inStock ? (
                    product.quantity > 20 ? (
                      <span className="font-semibold">✓ In Stock - Ready to ship</span>
                    ) : (
                      <span className="font-semibold">⚠ Only {product.quantity} left in stock</span>
                    )
                  ) : (
                    <span className="font-semibold">✗ Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="space-y-4">
                {inStock && (
                  <div>
                    <label htmlFor="quantity" className="mb-2 block text-sm font-semibold text-slate-700">Quantity:</label>
                    <select
                      id="quantity"
                      value={selectedQuantity}
                      onChange={handleQuantityChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      {getQuantityOptions().map(num => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={faCartPlus}
                    disabled={!inStock}
                    onClick={handleAddToCart}
                    fullWidth
                  >
                    {inStock ? `Add ${selectedQuantity} to Cart` : 'Out of Stock'}
                  </Button>

                  <div className="flex gap-2">
                    {inCart() > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={faTrashAlt}
                        onClick={handleRemoveFromCart}
                        className="flex-1"
                      >
                        Remove from Cart ({inCart()})
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={isInWishlist() ? faHeart : faHeart}
                      onClick={handleWishlistToggle}
                      className={`flex-1 ${isInWishlist() ? 'text-red-600' : ''}`}
                    >
                      {isInWishlist() ? 'In Wishlist' : 'Add to Wishlist'}
                    </Button>
                    
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={faShare}
                        onClick={() => handleShare()}
                      >
                        Share
                      </Button>
                      {shareDropdownOpen && (
                        <div className="absolute right-0 top-full z-10 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-md">
                          <button 
                            onClick={() => handleShare('facebook')}
                            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Facebook
                          </button>
                          <button 
                            onClick={() => handleShare('twitter')}
                            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Twitter
                          </button>
                          <button 
                            onClick={() => handleShare('copy')}
                            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Copy Link
                          </button>
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
              </div>

              {/* Product Features */}
              <div className="mt-6 space-y-3 border-t border-slate-200 pt-6">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <FontAwesomeIcon icon={faTruck} className="text-blue-600" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <FontAwesomeIcon icon={faShield} className="text-blue-600" />
                  <span>1-year warranty included</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-blue-600" />
                  <span>Easy returns within 30 days</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Product Information */}
        <div className="space-y-6">
          {/* Specifications */}
          {product.specifications && (
            <Card className="p-6">
              {renderSpecifications()}
            </Card>
          )}

          {/* Reviews Toggle */}
          {reviews.length > 0 && (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Customer Reviews ({reviews.length})</h3>
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
            <Card className="p-6">
              <h3 className="mb-4 text-xl font-bold text-slate-900">You might also like</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {recommendations.slice(0, 4).map(item => {
                  const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                  const itemSalePrice = item.sale_price ? (typeof item.sale_price === 'string' ? parseFloat(item.sale_price) : item.sale_price) : null;
                  return (
                    <div 
                      key={item.id} 
                      className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
                      onClick={() => navigate(`/product/${item.slug}`)}
                    >
                      <img 
                        src={item.picture} 
                        alt={item.name}
                        className="mb-3 h-32 w-full rounded-lg object-cover"
                      />
                      <h4 className="mb-2 line-clamp-2 text-sm font-semibold text-slate-900">{item.name}</h4>
                      <span className="text-lg font-bold text-slate-900">
                        ${(itemSalePrice || itemPrice).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Related Products from Same Category */}
          {relatedProducts.length > 0 && (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">
                  More from {product?.category ? (typeof product.category === 'object' ? (product.category.name || product.category.slug) : product.category) : 'this category'}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToCategory}
                >
                  View All
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map(item => {
                  const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                  const itemSalePrice = item.sale_price ? (typeof item.sale_price === 'string' ? parseFloat(item.sale_price) : item.sale_price) : null;
                  const itemOriginalPrice = item.original_price ? (typeof item.original_price === 'string' ? parseFloat(item.original_price) : item.original_price) : itemPrice;
                  return (
                    <div 
                      key={item.id} 
                      className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
                      onClick={() => navigate(`/product/${item.slug}`)}
                    >
                      <img 
                        src={item.picture} 
                        alt={item.name}
                        className="mb-3 h-32 w-full rounded-lg object-cover"
                      />
                      <h4 className="mb-2 line-clamp-2 text-sm font-semibold text-slate-900">{item.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900">
                          ${(itemSalePrice || itemPrice).toFixed(2)}
                        </span>
                        {itemSalePrice && (
                          <span className="text-sm text-slate-500 line-through">
                            ${itemOriginalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {item.rating && (
                        <div className="mt-2 flex items-center gap-1">
                          {renderStars(item.rating)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Featured Products Section */}
        <div className="mt-8">
          <FeaturedProducts />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
