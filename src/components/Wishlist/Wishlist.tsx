import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faTrash, 
  faShoppingCart, 
  faShare,
  faEye,
  faStar,
  faThLarge,
  faList,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import Loading from '../UI/Loading/Loading';
import { useToast } from '../UI/Toast/ToastProvider';
import ProductCard from '../Products/ProductCard';
import { fetchWishlist, addProductToCart } from '../../store/actions/storeActions';
import { productsApi } from '../../services/productsApi';
import type { AppDispatch } from '../../store/store';

interface WishlistItem {
  id: number;
  product: {
    id: number;
    slug: string;
    name: string;
    price: string;
    original_price?: string;
    picture: string;
    rating?: string;
    review_count?: number;
    in_stock: boolean;
    brand?: {
      name: string;
    };
  };
  added_at: string;
  notes?: string;
}

const Wishlist: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { wishlist, loading } = useSelector((state: any) => state.store);
  const { token } = useSelector((state: any) => state.auth);
  const { showToast } = useToast();
  
  const isAuthenticated = !!(token && token.trim() !== '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'added' | 'price' | 'name'>('added');

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchWishlist());
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
      await productsApi.removeProductFromWishlist(productId, token);
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

  const adaptProductForCard = (wishlistItem: WishlistItem) => {
    const basePrice = parseFloat(wishlistItem.product.price);
    const originalPrice = wishlistItem.product.original_price ? parseFloat(wishlistItem.product.original_price) : null;
    
    return {
      id: wishlistItem.product.id,
      name: wishlistItem.product.name,
      slug: wishlistItem.product.slug,
      price: originalPrice || basePrice,
      sale_price: originalPrice ? basePrice : undefined,
      image: wishlistItem.product.picture,
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
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <Card className="p-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
              <FontAwesomeIcon icon={faHeart} className="text-5xl text-red-500" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">Sign in to view your wishlist</h2>
            <p className="mb-8 text-slate-600">Save your favorite products and never lose track of them!</p>
            <Button variant="primary" size="lg" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <Loading variant="spinner" size="lg" text="Loading your wishlist..." />
          </div>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <Card className="p-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
              <FontAwesomeIcon icon={faHeart} className="text-5xl text-red-500" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">Your wishlist is empty</h2>
            <p className="mb-8 text-slate-600">Start adding products you love to keep track of them!</p>
            <Button variant="primary" size="lg" onClick={() => navigate('/products')}>
              Browse Products
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-slate-900">
                <FontAwesomeIcon icon={faHeart} className="text-red-500" />
                My Wishlist
              </h1>
              <p className="text-slate-600">
                {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={<FontAwesomeIcon icon={faShare} />}
                onClick={handleShareWishlist}
              >
                Share
              </Button>
              
              <div className="flex rounded-lg border border-slate-200">
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setViewMode('grid')}
                >
                  <FontAwesomeIcon icon={faThLarge} />
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="added">Recently Added</option>
                <option value="price">Price: Low to High</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Wishlist Content */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedWishlist.map((item: WishlistItem) => (
              <div key={item.id} className="space-y-2">
                <ProductCard
                  product={adaptProductForCard(item)}
                  onAddToCart={() => handleAddToCart(item.product)}
                  onToggleWishlist={() => handleRemoveFromWishlist(item.product.id)}
                  isInWishlist={true}
                />
                <div className="text-xs text-slate-500">
                  Added {new Date(item.added_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedWishlist.map((item: WishlistItem) => (
              <Card key={item.id} className="p-6">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-shrink-0">
                    <img 
                      src={item.product.picture} 
                      alt={item.product.name}
                      className="h-32 w-32 rounded-lg object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 
                      className="mb-2 cursor-pointer text-lg font-semibold text-slate-900 transition-colors hover:text-blue-600"
                      onClick={() => navigate(`/product/${item.product.slug}`)}
                    >
                      {item.product.name}
                    </h3>
                    {item.product.brand?.name && (
                      <p className="mb-2 text-sm text-slate-600">by {item.product.brand.name}</p>
                    )}
                    
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="text-xl font-bold text-slate-900">
                        ${parseFloat(item.product.price).toFixed(2)}
                      </span>
                      {item.product.original_price && (
                        <span className="text-sm text-slate-500 line-through">
                          ${parseFloat(item.product.original_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {item.product.rating && (
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex text-yellow-400">
                          {Array.from({ length: 5 }, (_, i) => (
                            <FontAwesomeIcon
                              key={i}
                              icon={faStar}
                              className={i < Math.floor(parseFloat(item.product.rating || '0')) ? 'text-yellow-400' : 'text-slate-300'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600">
                          ({item.product.review_count} reviews)
                        </span>
                      </div>
                    )}
                    
                    <p className="text-xs text-slate-500">
                      Added on {new Date(item.added_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2 md:w-48">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<FontAwesomeIcon icon={faShoppingCart} />}
                      onClick={() => handleAddToCart(item.product)}
                      disabled={!item.product.in_stock}
                      fullWidth
                    >
                      {item.product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FontAwesomeIcon icon={faEye} />}
                      onClick={() => navigate(`/product/${item.product.slug}`)}
                      fullWidth
                    >
                      View Product
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FontAwesomeIcon icon={faTrash} />}
                      onClick={() => handleRemoveFromWishlist(item.product.id)}
                      className="text-red-600 hover:text-red-700"
                      fullWidth
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
