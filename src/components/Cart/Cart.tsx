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
  faExclamationTriangle,
  faCheckCircle,
  faRefresh,
  faTimes,
  faShoppingBag,
  faGift
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../UI/Toast/ToastProvider";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import { cartApi, savedForLaterApi, formatCurrency } from "../../services";
import "./css/Cart.css";

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
      await fetchCartData(); // Refresh with server data

    } catch (error: any) {
      await fetchCartData(); // Revert on error
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

    // Check stock availability
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
      return parseFloat(cartData.subtotal) * 0.075; // fallback 7.5% tax
    }
  };

  const calculateTotal = async () => {
    if (!cartData) return 0;
    const subtotal = parseFloat(cartData.subtotal);
    const shipping = await calculateShipping();
    const tax = await calculateTax();
    return subtotal + shipping + tax;
  };

  const CartItemCard: React.FC<{ item: CartItem }> = ({ item }) => {
    const isUpdating = updating.has(item.product.id);

    return (
      <Card className="cart-item-card" padding="lg">
        <div className="item-image">
          <img src={item.product.picture} alt={item.product.name} />
          {!item.product.in_stock && (
            <div className="out-of-stock-overlay">
              <span>Out of Stock</span>
            </div>
          )}
        </div>

        <div className="item-details">
          <Link to={`/product/${item.product.slug}`} className="item-name">
            {item.product.name}
          </Link>
          <div className="item-brand">{item.product.brand.name}</div>

          {parseFloat(item.savings) > 0 && (
            <div className="savings-badge">
              <FontAwesomeIcon icon={faTags} />
              Save {formatCurrency(item.savings)}
            </div>
          )}

          <div className="item-price">
            <span className="current-price">{formatCurrency(item.unit_price)}</span>
          </div>
        </div>

        <div className="item-controls">
          <div className="quantity-controls">
            <button
              className="quantity-btn"
              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
            >
              <FontAwesomeIcon icon={faMinus} />
            </button>

            <div className="quantity-display">
              {isUpdating ? (
                <FontAwesomeIcon icon={faRefresh} className="spinning" />
              ) : (
                item.quantity
              )}
            </div>

            <button
              className="quantity-btn"
              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              disabled={isUpdating || !item.product.in_stock}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          <div className="item-actions">
            <button
              className="action-btn save-btn"
              onClick={() => saveForLater(item)}
              disabled={isUpdating}
            >
              <FontAwesomeIcon icon={faHeart} />
              Save for Later
            </button>

            <button
              className="action-btn remove-btn"
              onClick={() => removeItem(item.product.id)}
              disabled={isUpdating}
            >
              <FontAwesomeIcon icon={faTrash} />
              Remove
            </button>
          </div>
        </div>

        <div className="item-total">
          <div className="total-price">{formatCurrency(item.total_price)}</div>
          <div className="added-date">Added {new Date(item.added_at).toLocaleDateString()}</div>
        </div>
      </Card>
    );
  };

  const SavedItemCard: React.FC<{ item: SavedItem }> = ({ item }) => {
    return (
      <Card className="saved-item-card" padding="md">
        <div className="saved-item-image">
          <img src={item.product.picture} alt={item.product.name} />
        </div>

        <div className="saved-item-details">
          <Link to={`/product/${item.product.slug}`} className="saved-item-name">
            {item.product.name}
          </Link>
          <div className="saved-item-brand">{item.product.brand.name}</div>
          <div className="saved-item-price">{formatCurrency(item.product.price)}</div>
        </div>

        <div className="saved-item-actions">
          <Button
            variant="primary"
            size="sm"
            onClick={() => moveToCart(item)}
            disabled={!item.product.in_stock}
          >
            Move to Cart
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => savedForLaterApi.removeSavedItem(item.id.toString())}
          >
            Remove
          </Button>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="cart-container">
        <Loading variant="spinner" size="lg" text="Loading your cart..." />
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-content">
        <div className="cart-header">
          <div className="header-main">
            <div className="cart-icon">
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
            <div className="header-text">
              <h1>Shopping Cart</h1>
              <p>
                {cartData?.total_items || 0} item{(cartData?.total_items || 0) !== 1 ? 's' : ''} in your cart
              </p>
            </div>
          </div>

          {cartData && cartData.items.length > 0 && (
            <div className="header-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                icon={faTrash}
              >
                Clear Cart
              </Button>
            </div>
          )}
        </div>

        <div className="cart-main">
          <div className="cart-items-section">
            {!cartData || cartData.items.length === 0 ? (
              <Card className="empty-cart" padding="xl">
                <div className="empty-icon">
                  <FontAwesomeIcon icon={faShoppingCart} />
                </div>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added any items to your cart yet.</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/products')}
                  icon={faShoppingBag}
                >
                  Continue Shopping
                </Button>
              </Card>
            ) : (
              <>
                <div className="cart-items">
                  {cartData.items.map(item => (
                    <CartItemCard key={item.id} item={item} />
                  ))}
                </div>

                {/* Free Shipping Banner */}
                {parseFloat(cartData.subtotal) < 50000 && (
                  <Card className="shipping-banner" padding="md">
                    <div className="banner-content">
                      <FontAwesomeIcon icon={faShippingFast} />
                      <div className="banner-text">
                        <strong>Add {formatCurrency((50000 - parseFloat(cartData.subtotal)).toString())} more for FREE shipping!</strong>
                        <p>Free shipping on orders over ₦50,000</p>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(parseFloat(cartData.subtotal) / 50000) * 100}%` }}
                      />
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* Saved for Later Section */}
            {savedItems.length > 0 && (
              <div className="saved-items-section">
                <div className="section-header">
                  <h3>Saved for Later ({savedItems.length})</h3>
                  <button
                    className="toggle-btn"
                    onClick={() => setShowSavedItems(!showSavedItems)}
                  >
                    <FontAwesomeIcon icon={showSavedItems ? faMinus : faPlus} />
                  </button>
                </div>

                {showSavedItems && (
                  <div className="saved-items-list">
                    {savedItems.map(item => (
                      <SavedItemCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {cartData && cartData.items.length > 0 && (
            <div className="cart-summary-section">
              <Card className="cart-summary" padding="lg">
                <h3>Order Summary</h3>

                <div className="summary-breakdown">
                  <div className="summary-row">
                    <span>Subtotal ({cartData.total_items} items)</span>
                    <span>{formatCurrency(cartData.subtotal)}</span>
                  </div>

                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost.toString())}
                    </span>
                  </div>

                  <div className="summary-row">
                    <span>Tax (7.5%)</span>
                    <span>{formatCurrency(taxAmount.toString())}</span>
                  </div>

                  {parseFloat(cartData.total_savings) > 0 && (
                    <div className="summary-row savings-row">
                      <span>Total Savings</span>
                      <span className="savings-amount">-{formatCurrency(cartData.total_savings)}</span>
                    </div>
                  )}

                  <div className="summary-row total-row">
                    <span>Total</span>
                    <span>{formatCurrency(calculateTotal().toString())}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={proceedToCheckout}
                  icon={faLock}
                  className="checkout-btn"
                >
                  Secure Checkout
                </Button>

                <div className="security-badges">
                  <div className="security-item">
                    <FontAwesomeIcon icon={faLock} />
                    <span>Secure Payment</span>
                  </div>
                  <div className="security-item">
                    <FontAwesomeIcon icon={faShippingFast} />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="security-item">
                    <FontAwesomeIcon icon={faGift} />
                    <span>Easy Returns</span>
                  </div>
                </div>
              </Card>

              <Card className="continue-shopping" padding="md">
                <Link to="/products" className="continue-link">
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
