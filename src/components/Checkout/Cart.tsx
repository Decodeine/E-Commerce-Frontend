import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faTrash,
  faHeart,
  faPlus,
  faMinus,
  faShoppingBag,
  faLock,
  faShippingFast,
  faGift,
  faArrowRight,
  faRefresh
} from "@fortawesome/free-solid-svg-icons";
import OrderSummary from "./OrderSummary";
import * as actions from "../../store/actions/storeActions";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import { useToast } from "../UI/Toast/ToastProvider";
import { API_PATH } from "../../backend_url";
import type { AppDispatch } from "../../store/store";

interface CartItem {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  picture: string;
  quantity: number;
  brand?: {
    name: string;
  };
  in_stock?: boolean;
  [key: string]: any;
}

const Cart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const cart = useSelector((state: any) => state.store.cart);
  const subtotal = useSelector((state: any) => state.store.subtotal);
  const shipping = useSelector((state: any) => state.store.shipping);
  const tax = useSelector((state: any) => state.store.tax);

  useEffect(() => {
    dispatch(actions.calculateCart());
    if (subtotal >= 100) {
      dispatch(actions.setShipping("free"));
    } else {
      dispatch(actions.setShipping("standard"));
    }
  }, [dispatch, cart, subtotal]);

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

  const handleRemoveItem = (item: CartItem) => {
    dispatch(actions.removeProductFromCart(item));
    showToast({
      type: 'success',
      title: 'Item Removed',
      message: `${item.name} has been removed from your cart.`
    });
  };

  const handleEmptyCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(actions.emptyCart());
      showToast({
        type: 'success',
        title: 'Cart Cleared',
        message: 'All items have been removed from your cart.'
      });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <Card className="p-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
              <FontAwesomeIcon icon={faShoppingCart} className="text-5xl text-slate-400" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-slate-900">Your cart is empty</h3>
            <p className="mb-8 text-slate-600">Why not add something? :)</p>
            <Button 
              variant="primary"
              size="lg"
              onClick={() => navigate('/products')}
              icon={faShoppingBag}
            >
              Continue Shopping
            </Button>
          </Card>
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
                {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleEmptyCart}
            icon={faTrash}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Cart Header */}
            <Card className="hidden border-b border-slate-200 bg-slate-50 p-4 md:block">
              <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-slate-700">
                <div className="col-span-5">Item</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Total</div>
                <div className="col-span-1"></div>
              </div>
            </Card>

            {/* Cart Items */}
            <div className="space-y-4">
              {cart.map((item: CartItem) => {
                const imageUrl = getImageUrl(item.picture);
                const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                const quantity = typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : item.quantity;
                const itemTotal = (price * quantity).toFixed(2);
                const priceFormatted = price.toFixed(2);

                return (
                  <Card key={item.id} className="border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                      {/* Product Image & Name */}
                      <div className="flex flex-1 items-center gap-4">
                        <Link 
                          to={`/product/${item.slug}`}
                          className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 transition-transform hover:scale-105 md:h-32 md:w-32"
                        >
                          {item.picture ? (
                            <img
                              src={imageUrl}
                              alt={item.name}
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
                            style={{ display: item.picture ? 'none' : 'flex' }}
                          >
                            <FontAwesomeIcon icon={faShoppingBag} className="text-4xl" />
                          </div>
                        </Link>
                        <div className="flex-1">
                          <Link
                            to={`/product/${item.slug}`}
                            className="block text-base font-semibold text-slate-900 transition-colors hover:text-blue-600 md:text-lg"
                          >
                            {item.name}
                          </Link>
                          {item.brand?.name && (
                            <div className="mt-1 text-sm text-slate-600">{item.brand.name}</div>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-center md:w-24">
                        <div className="text-sm font-semibold text-slate-600 md:hidden">Price</div>
                        <div className="text-lg font-bold text-slate-900">${priceFormatted}</div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-center gap-2 md:w-32">
                        <div className="text-sm font-semibold text-slate-600 md:hidden">Quantity</div>
                        <div className="flex items-center rounded-lg border-2 border-slate-200 bg-white">
                          <button
                            className="flex h-10 w-10 items-center justify-center rounded-l-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            onClick={() => dispatch(actions.decProductQuantity(item))}
                          >
                            <FontAwesomeIcon icon={faMinus} className="text-sm" />
                          </button>
                          <div className="flex h-10 min-w-[3rem] items-center justify-center border-x border-slate-200 bg-slate-50 text-sm font-bold text-slate-900">
                            {quantity}
                          </div>
                          <button
                            className="flex h-10 w-10 items-center justify-center rounded-r-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            onClick={() => dispatch(actions.incProductQuantity(item))}
                            disabled={item.in_stock === false}
                          >
                            <FontAwesomeIcon icon={faPlus} className="text-sm" />
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="text-center md:w-24">
                        <div className="text-sm font-semibold text-slate-600 md:hidden">Total</div>
                        <div className="text-xl font-bold text-slate-900">${itemTotal}</div>
                      </div>

                      {/* Remove Button */}
                      <div className="flex justify-center md:w-12">
                        <button
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition-colors hover:bg-red-50"
                          onClick={() => handleRemoveItem(item)}
                          title="Remove item"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Free Shipping Banner */}
            {subtotal < 100 && (
              <Card className="border-blue-200 bg-blue-50 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                    <FontAwesomeIcon icon={faShippingFast} />
                  </div>
                  <div className="flex-1">
                    <strong className="block text-sm font-semibold text-slate-900">
                      Add ${(100 - subtotal).toFixed(2)} more for FREE shipping!
                    </strong>
                    <p className="text-xs text-slate-600">Free shipping on orders over $100</p>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                  />
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              isCartComponent={true}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
            />

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
        </div>
      </div>
    </div>
  );
};

export default Cart;
