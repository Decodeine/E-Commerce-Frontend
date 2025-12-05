import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faTrash,
  faHeart,
  faPlus,
  faMinus,
  faShippingFast,
  faTags,
  faLock,
  faArrowRight,
  faShoppingBag,
  faGift,
  faRefresh
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../UI/Toast/ToastProvider";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import { cartApi, savedForLaterApi, formatCurrency } from "../../services";
import { API_PATH } from "../../backend_url";

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    picture: string;
    brand: {
      id: number;
      name: string;
      slug: string;
    };
    in_stock: boolean;
    quantity: number;
  };
  quantity: number;
  unit_price: string;
  total_price: string;
  savings: string;
  added_at: string;
  updated_at: string;
}

interface CartData {
  id: number;
  items: CartItem[];
  total_items: number;
  subtotal: string;
  total_weight: string;
  total_savings: string;
  created_at: string;
  updated_at: string;
}

interface SavedItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    picture: string;
    brand: {
      id: number;
      name: string;
      slug: string;
    };
    in_stock: boolean;
  };
  quantity: number;
  saved_at: string;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [cartData, setCartData] = useState<CartData | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Set<number>>(new Set());
  const [showSavedItems, setShowSavedItems] = useState(false);

  // Calculation states
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    fetchCartData();
    fetchSavedItems();
  }, []);

  useEffect(() => {
    if (cartData) {
      updateCalculations();
    }
  }, [cartData]);

  const updateCalculations = async () => {
    if (!cartData) return;

    try {
      const shipping = await calculateShipping();
      const tax = await calculateTax();
      const total = parseFloat(cartData.subtotal) + shipping + tax;

      setShippingCost(shipping);
      setTaxAmount(tax);
      setTotalAmount(total);
    } catch (error) {
      console.error('Error updating calculations:', error);
    }
  };

  const fetchCartData = async () => {
    try {
      const data = await cartApi.getCart();
      setCartData(data);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Failed to Load Cart',
        message: error.message || 'Unable to fetch your cart. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedItems = async () => {
    try {
      const data = await savedForLaterApi.getSavedItems();
      setSavedItems(data.results || []);
    } catch (error: any) {
      console.error('Failed to fetch saved items:', error);
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(productId);
      return;
    }

    try {
      setUpdating(prev => new Set(prev).add(productId));

      // Optimistic update
      setCartData(prevCart => {
        if (!prevCart) return prevCart;

        const updatedItems = prevCart.items.map(item => {
          if (item.product.id === productId) {
            const unitPrice = parseFloat(item.unit_price);
            return {
              ...item,
              quantity: newQuantity,
              total_price: (unitPrice * newQuantity).toFixed(2)
            };
          }
          return item;
        });

        const newSubtotal = updatedItems.reduce((sum, item) =>
          sum + parseFloat(item.total_price), 0
        );

        return {
          ...prevCart,
          items: updatedItems,
          subtotal: newSubtotal.toFixed(2),
          total_items: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        };
      });

      await cartApi.updateItemQuantity(productId, newQuantity);
      await fetchCartData();

    } catch (error: any) {
      await fetchCartData();
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update item quantity.'
      });
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const removeItem = async (productId: number) => {
    try {
      await cartApi.removeItem(productId);
      await fetchCartData();

      showToast({
        type: 'success',
        title: 'Item Removed',
        message: 'Item has been removed from your cart.'
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Removal Failed',
        message: error.message || 'Failed to remove item from cart.'
      });
    }
  };

  const saveForLater = async (item: CartItem) => {
    try {
      await savedForLaterApi.saveItem(item.product.id.toString(), item.quantity);
      await removeItem(item.product.id);
      await fetchSavedItems();

      showToast({
        type: 'success',
        title: 'Item Saved',
        message: 'Item has been moved to saved for later.'
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: error.message || 'Failed to save item for later.'
      });
    }
  };

  const moveToCart = async (savedItem: SavedItem) => {
    try {
      await cartApi.addItem(savedItem.product.id, savedItem.quantity);
      await savedForLaterApi.removeSavedItem(savedItem.id.toString());
      await fetchCartData();
      await fetchSavedItems();

      showToast({
        type: 'success',
        title: 'Item Added',
        message: 'Item has been moved to your cart.'
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Move Failed',
        message: error.message || 'Failed to move item to cart.'
      });
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    try {
      await cartApi.clearCart();
      await fetchCartData();

      showToast({
        type: 'success',
        title: 'Cart Cleared',
        message: 'All items have been removed from your cart.'
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Clear Failed',
        message: error.message || 'Failed to clear cart.'
      });
    }
  };

  const proceedToCheckout = () => {
    if (!cartData || cartData.items.length === 0) {
      showToast({
        type: 'warning',
        title: 'Empty Cart',
        message: 'Please add items to your cart before checkout.'
      });
      return;
    }

    const outOfStockItems = cartData.items.filter(item => !item.product.in_stock);
    if (outOfStockItems.length > 0) {
      showToast({
        type: 'error',
        title: 'Stock Issue',
        message: `Some items are out of stock. Please remove them to continue.`
      });
      return;
    }

    navigate('/checkout');
  };

  const calculateShipping = async () => {
    if (!cartData) return 0;
    try {
      const result = await cartApi.calculateShipping('standard', {});
      return typeof result === 'number' ? result : parseFloat(result.amount || '0');
    } catch (error) {
      console.error('Error calculating shipping:', error);
      return 0;
    }
  };

  const calculateTax = async () => {
    if (!cartData) return 0;
    try {
      const result = await cartApi.calculateTax({ subtotal: cartData.subtotal });
      return typeof result === 'number' ? result : parseFloat(result.amount || '0');
    } catch (error) {
      console.error('Error calculating tax:', error);
      return parseFloat(cartData.subtotal) * 0.075;
    }
  };

  const getImageUrl = (picture: string | undefined) => {
    if (!picture) return '';
    if (picture.startsWith('http://') || picture.startsWith('https://')) {
      return picture;
    }
    if (picture.startsWith('/media/') || picture.startsWith('/static/')) {
      const backendBaseUrl = API_PATH.replace('/api/', '');
      return `${backendBaseUrl}${picture}`;
    }
    if (picture.startsWith('/')) {
      return picture;
    }
    return `/${picture}`;
  };

  const CartItemCard: React.FC<{ item: CartItem }> = ({ item }) => {
    const isUpdating = updating.has(item.product.id);
    const imageUrl = getImageUrl(item.product.picture);

    return (
      <Card className="overflow-hidden border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          {/* Product Image */}
          <Link 
            to={`/product/${item.product.slug}`}
            className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 transition-transform hover:scale-105"
          >
            {item.product.picture ? (
              <img 
                src={imageUrl} 
                alt={item.product.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="hidden h-full w-full items-center justify-center text-slate-400"
              style={{ display: item.product.picture ? 'none' : 'flex' }}
            >
              <FontAwesomeIcon icon={faShoppingBag} className="text-4xl" />
            </div>
            {!item.product.in_stock && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70">
                <span className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">Out of Stock</span>
              </div>
            )}
          </Link>

          {/* Product Details */}
          <div className="flex-1 space-y-2">
            <Link 
              to={`/product/${item.product.slug}`} 
              className="block text-lg font-semibold text-slate-900 transition-colors hover:text-blue-600"
            >
              {item.product.name}
            </Link>
            <div className="text-sm font-medium text-slate-600">{item.product.brand?.name || 'Unknown Brand'}</div>

            {parseFloat(item.savings) > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                <FontAwesomeIcon icon={faTags} />
                Save {formatCurrency(item.savings)}
              </div>
            )}

            <div className="text-xl font-bold text-slate-900">
              {formatCurrency(item.unit_price)}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-lg border-2 border-slate-200 bg-white">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-l-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
              >
                <FontAwesomeIcon icon={faMinus} className="text-sm" />
              </button>

              <div className="flex h-10 min-w-[4rem] items-center justify-center border-x border-slate-200 bg-slate-50 text-sm font-bold text-slate-900">
                {isUpdating ? (
                  <FontAwesomeIcon icon={faRefresh} className="animate-spin text-blue-600" />
                ) : (
                  item.quantity
                )}
              </div>

              <button
                className="flex h-10 w-10 items-center justify-center rounded-r-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                disabled={isUpdating || !item.product.in_stock}
              >
                <FontAwesomeIcon icon={faPlus} className="text-sm" />
              </button>
            </div>

            {/* Item Total */}
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(item.total_price)}</div>
              <div className="text-xs text-slate-500">Added {new Date(item.added_at).toLocaleDateString()}</div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => saveForLater(item)}
                disabled={isUpdating}
                title="Save for later"
              >
                <FontAwesomeIcon icon={faHeart} />
              </button>

              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => removeItem(item.product.id)}
                disabled={isUpdating}
                title="Remove item"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const SavedItemCard: React.FC<{ item: SavedItem }> = ({ item }) => {
    const imageUrl = getImageUrl(item.product.picture);

    return (
      <Card className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            to={`/product/${item.product.slug}`}
            className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100"
          >
            {item.product.picture ? (
              <img 
                src={imageUrl} 
                alt={item.product.name}
                className="h-full w-full object-cover transition-transform hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="hidden h-full w-full items-center justify-center text-slate-400"
              style={{ display: item.product.picture ? 'none' : 'flex' }}
            >
              <FontAwesomeIcon icon={faShoppingBag} className="text-2xl" />
            </div>
          </Link>

          <div className="flex-1 space-y-1">
            <Link 
              to={`/product/${item.product.slug}`} 
              className="block text-sm font-semibold text-slate-900 transition-colors hover:text-blue-600"
            >
              {item.product.name}
            </Link>
            <div className="text-xs text-slate-600">{item.product.brand?.name || 'Unknown Brand'}</div>
            <div className="text-sm font-bold text-slate-900">{formatCurrency(item.product.price)}</div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => moveToCart(item)}
              disabled={!item.product.in_stock}
              fullWidth
            >
              Move to Cart
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await savedForLaterApi.removeSavedItem(item.id.toString());
                await fetchSavedItems();
              }}
              fullWidth
            >
              Remove
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <Loading variant="spinner" size="lg" text="Loading your cart..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <FontAwesomeIcon icon={faShoppingCart} className="text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
              <p className="text-sm text-slate-600">
                {cartData?.total_items || 0} item{(cartData?.total_items || 0) !== 1 ? 's' : ''} in your cart
              </p>
            </div>
          </div>

          {cartData && cartData.items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCart}
              icon={faTrash}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              Clear Cart
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-4">
            {!cartData || cartData.items.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-5xl text-slate-400" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-slate-900">Your cart is empty</h3>
                <p className="mb-8 text-slate-600">Looks like you haven't added any items to your cart yet.</p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/products')}
                  icon={faShoppingBag}
                >
                  Continue Shopping
                </Button>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {cartData.items.map(item => (
                    <CartItemCard key={item.id} item={item} />
                  ))}
                </div>

                {/* Free Shipping Banner */}
                {parseFloat(cartData.subtotal) < 50000 && (
                  <Card className="border-blue-200 bg-blue-50 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                        <FontAwesomeIcon icon={faShippingFast} />
                      </div>
                      <div className="flex-1">
                        <strong className="block text-sm font-semibold text-slate-900">
                          Add {formatCurrency((50000 - parseFloat(cartData.subtotal)).toString())} more for FREE shipping!
                        </strong>
                        <p className="text-xs text-slate-600">Free shipping on orders over ₦50,000</p>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${Math.min((parseFloat(cartData.subtotal) / 50000) * 100, 100)}%` }}
                      />
                    </div>
                  </Card>
                )}

                {/* Saved for Later Section */}
                {savedItems.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">
                          Saved for Later ({savedItems.length})
                        </h3>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                          onClick={() => setShowSavedItems(!showSavedItems)}
                        >
                          <FontAwesomeIcon icon={showSavedItems ? faMinus : faPlus} />
                        </button>
                      </div>
                    </Card>

                    {showSavedItems && (
                      <div className="space-y-3">
                        {savedItems.map(item => (
                          <SavedItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Order Summary */}
          {cartData && cartData.items.length > 0 && (
            <div className="lg:col-span-1">
              <Card className="sticky top-6 p-6 shadow-md">
                <h3 className="mb-6 text-xl font-bold text-slate-900">Order Summary</h3>

                <div className="space-y-4 border-b border-slate-200 pb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal ({cartData.total_items} items)</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(cartData.subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-semibold text-slate-900">
                      {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost.toString())}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax (7.5%)</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(taxAmount.toString())}</span>
                  </div>

                  {parseFloat(cartData.total_savings) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Savings</span>
                      <span className="font-semibold text-green-600">-{formatCurrency(cartData.total_savings)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-slate-200 pt-4">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalAmount.toFixed(2))}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={proceedToCheckout}
                  icon={faLock}
                  className="mt-6"
                >
                  Secure Checkout
                </Button>

                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <FontAwesomeIcon icon={faLock} />
                    </div>
                    <span className="text-xs font-medium text-slate-600">Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <FontAwesomeIcon icon={faShippingFast} />
                    </div>
                    <span className="text-xs font-medium text-slate-600">Fast Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <FontAwesomeIcon icon={faGift} />
                    </div>
                    <span className="text-xs font-medium text-slate-600">Easy Returns</span>
                  </div>
                </div>
              </Card>

              <Card className="mt-4 p-4">
                <Link 
                  to="/products" 
                  className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                  Continue Shopping
                </Link>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
