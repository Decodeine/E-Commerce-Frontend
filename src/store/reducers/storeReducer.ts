import {
  FETCH_PRODUCTS_START,
  FETCH_PRODUCTS_SUCCESS,
  FETCH_PRODUCTS_FAIL,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
  FETCH_FEATURED_PRODUCTS_SUCCESS,
  FETCH_DEALS_SUCCESS,
  FETCH_NEW_ARRIVALS_SUCCESS,
  FETCH_TOP_RATED_SUCCESS,
  FETCH_BRANDS_SUCCESS,
  FETCH_CATEGORIES_SUCCESS,
  SET_FILTERS,
  SET_PAGINATION,
  ADD_PRODUCT_TO_CART,
  REMOVE_PRODUCT_FROM_CART,
  UPDATE_PRODUCT_QUANTITY,
  INC_PRODUCT_QUANTITY,
  DEC_PRODUCT_QUANTITY,
  EMPTY_CART,
  CALCULATE_CART,
  SET_SHIPPING,
  TOGGLE_CHECKOUT_COMPLETE,
  TOGGLE_DIFFERENT_BILLING_ADDRESS,
  SET_PAYMENT,
  // Wishlist actions
  FETCH_WISHLIST_START,
  FETCH_WISHLIST_SUCCESS,
  FETCH_WISHLIST_FAIL,
  ADD_TO_WISHLIST_SUCCESS,
  REMOVE_FROM_WISHLIST_SUCCESS,
  UPDATE_WISHLIST_ITEM_SUCCESS,
  // Price Alerts actions
  FETCH_PRICE_ALERTS_START,
  FETCH_PRICE_ALERTS_SUCCESS,
  FETCH_PRICE_ALERTS_FAIL,
  CREATE_PRICE_ALERT_SUCCESS,
  UPDATE_PRICE_ALERT_SUCCESS,
  DELETE_PRICE_ALERT_SUCCESS,
  // Product Comparison actions
  FETCH_COMPARISON_SUCCESS,
  ADD_TO_COMPARISON_SUCCESS,
  REMOVE_FROM_COMPARISON_SUCCESS,
  CLEAR_COMPARISON,
  // Product Reviews actions
  FETCH_PRODUCT_REVIEWS_START,
  FETCH_PRODUCT_REVIEWS_SUCCESS,
  FETCH_PRODUCT_REVIEWS_FAIL,
  CREATE_REVIEW_SUCCESS,
  UPDATE_REVIEW_SUCCESS,
  DELETE_REVIEW_SUCCESS,
  MARK_REVIEW_HELPFUL_SUCCESS
} from "../actions/storeActions";

import { updateObject } from "../utility";
import { Product, Brand, Category, FilterParams } from "../../services/productsApi";
import { SerializedError } from "../utils/errorSerializer";

interface CartItem {
  id: string;
  price: number;
  quantity: number;
  [key: string]: any;
}

interface StoreState {
  products: Product[];
  featuredProducts: Product[];
  dealsProducts: Product[];
  newArrivals: Product[];
  topRated: Product[];
  brands: Brand[];
  categories: Category[];
  loading: boolean;
  error: SerializedError | null;
  cart: CartItem[];
  subtotal: number;
  tax: number;
  shipping: string;
  isDifferentBillingAddress: boolean;
  paymentStatus: string;
  isCheckoutComplete: boolean;
  didPaymentGoThrough: boolean;
  filters: FilterParams;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  // New Option B features
  wishlist: any[];
  wishlistLoading: boolean;
  wishlistError: SerializedError | null;
  priceAlerts: any[];
  priceAlertsLoading: boolean;
  priceAlertsError: SerializedError | null;
  comparison: Product[];
  productReviews: any[];
  reviewsLoading: boolean;
  reviewsError: SerializedError | null;
}

interface Action {
  type: string;
  [key: string]: any;
}

const initialState: StoreState = {
  products: [],
  featuredProducts: [],
  dealsProducts: [],
  newArrivals: [],
  topRated: [],
  brands: [],
  categories: [],
  loading: false,
  error: null,
  cart: [],
  subtotal: 0,
  tax: 0,
  shipping: "free",
  isDifferentBillingAddress: false,
  paymentStatus: "",
  isCheckoutComplete: false,
  didPaymentGoThrough: false,
  filters: {},
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false,
  },
  // New Option B features
  wishlist: [],
  wishlistLoading: false,
  wishlistError: null,
  priceAlerts: [],
  priceAlertsLoading: false,
  priceAlertsError: null,
  comparison: [],
  productReviews: [],
  reviewsLoading: false,
  reviewsError: null,
};

export const addProductToCart = (state: StoreState, action: Action): StoreState => {
  const itemInCart = state.cart.find(e => e.id === action.item.id);
  if (itemInCart) {
    return incProductQuantity(state, action);
  } else {
    const newItem = { ...action.item, quantity: action.quantity };
    return updateObject(state, {
      cart: state.cart.concat(newItem)
    });
  }
};

export const removeProductFromCart = (state: StoreState, action: Action): StoreState => {
  const result = state.cart.filter(e => e.id !== action.item.id);
  return updateObject(state, { cart: result });
};

export const incProductQuantity = (state: StoreState, action: Action): StoreState => {
  const cartCopy = JSON.parse(JSON.stringify(state.cart));
  const item = cartCopy.find((e: CartItem) => e.id === action.item.id);
  const itemInStock = state.products.find(e => e.id === action.item.id);
  if (item && itemInStock) {
    if (item.quantity < itemInStock.quantity) {
      item.quantity += 1;
    } else {
      item.quantity = itemInStock.quantity;
    }
  }
  return updateObject(state, { cart: cartCopy });
};

export const decProductQuantity = (state: StoreState, action: Action): StoreState => {
  const cartCopy = JSON.parse(JSON.stringify(state.cart));
  const item = cartCopy.find((e: CartItem) => e.id === action.item.id);
  if (item) {
    item.quantity -= 1;
    if (item.quantity === 0) {
      return removeProductFromCart(state, action);
    }
  }
  return updateObject(state, { cart: cartCopy });
};

export const updateProductQuantity = (state: StoreState, action: Action): StoreState => {
  const cartCopy = JSON.parse(JSON.stringify(state.cart));
  const item = cartCopy.find((e: CartItem) => e.id === action.item.id);
  const itemInStock = state.products.find(e => e.id === action.item.id);

  if (item && itemInStock) {
    if (action.quantity < itemInStock.quantity) {
      if (action.quantity <= 0) {
        return removeProductFromCart(state, action);
      } else {
        item.quantity = action.quantity;
      }
    } else {
      item.quantity = itemInStock.quantity;
    }
  }
  return updateObject(state, { cart: cartCopy });
};

export const emptyCart = (state: StoreState, action: Action): StoreState => {
  return updateObject(state, { cart: [] });
};

export const calculateCart = (state: StoreState, action: Action): StoreState => {
  let subtotal = 0;
  state.cart.forEach(item => (subtotal += item.price * item.quantity));
  return updateObject(state, {
    subtotal: subtotal
  });
};

export const setShipping = (state: StoreState, action: Action): StoreState => {
  return updateObject(state, { shipping: action.value });
};

export const toggleCheckoutComplete = (state: StoreState, action: Action): StoreState => {
  return updateObject(state, { isCheckoutComplete: !state.isCheckoutComplete });
};

export const toggleDifferentBillingAddress = (state: StoreState, action: Action): StoreState => {
  return updateObject(state, {
    isDifferentBillingAddress: !state.isDifferentBillingAddress
  });
};

export const setPayment = (state: StoreState, action: Action): StoreState => {
  return updateObject(state, { paymentStatus: action.value });
};

// reducer
export default function storeReducer(
  state: StoreState = initialState,
  action: Action
): StoreState {
  switch (action.type) {
    case FETCH_PRODUCTS_START:
      return updateObject(state, { loading: true });

    case SET_LOADING:
      return updateObject(state, { loading: action.payload });

    case SET_ERROR:
      return updateObject(state, { error: action.payload });
    
    case CLEAR_ERROR:
      return updateObject(state, { error: null });

    case FETCH_PRODUCTS_SUCCESS:
      return updateObject(state, { 
        products: action.payload.results || action.payload, 
        loading: false 
      });

    case FETCH_PRODUCTS_FAIL:
      return updateObject(state, {
        products: [],
        loading: false,
        error: action.error
      });

    case FETCH_FEATURED_PRODUCTS_SUCCESS:
      return updateObject(state, { featuredProducts: action.payload });

    case FETCH_DEALS_SUCCESS:
      return updateObject(state, { dealsProducts: action.payload });

    case FETCH_NEW_ARRIVALS_SUCCESS:
      return updateObject(state, { newArrivals: action.payload });

    case FETCH_TOP_RATED_SUCCESS:
      return updateObject(state, { topRated: action.payload });

    case FETCH_BRANDS_SUCCESS:
      return updateObject(state, { brands: action.payload });

    case FETCH_CATEGORIES_SUCCESS:
      return updateObject(state, { categories: action.payload });

    case SET_FILTERS:
      return updateObject(state, { filters: action.payload });

    case SET_PAGINATION:
      return updateObject(state, { pagination: action.payload });

    case ADD_PRODUCT_TO_CART:
      return addProductToCart(state, action);

    case REMOVE_PRODUCT_FROM_CART:
      return removeProductFromCart(state, action);

    case UPDATE_PRODUCT_QUANTITY:
      return updateProductQuantity(state, action);

    case INC_PRODUCT_QUANTITY:
      return incProductQuantity(state, action);

    case DEC_PRODUCT_QUANTITY:
      return decProductQuantity(state, action);

    case EMPTY_CART:
      return emptyCart(state, action);

    case CALCULATE_CART:
      return calculateCart(state, action);

    case SET_SHIPPING:
      return setShipping(state, action);

    case TOGGLE_CHECKOUT_COMPLETE:
      return toggleCheckoutComplete(state, action);

    case TOGGLE_DIFFERENT_BILLING_ADDRESS:
      return toggleDifferentBillingAddress(state, action);

    case SET_PAYMENT:
      return setPayment(state, action);

    // Wishlist reducers
    case FETCH_WISHLIST_START:
      return updateObject(state, { wishlistLoading: true, wishlistError: null });

    case FETCH_WISHLIST_SUCCESS:
      return updateObject(state, { 
        wishlist: action.payload, 
        wishlistLoading: false, 
        wishlistError: null 
      });

    case FETCH_WISHLIST_FAIL:
      return updateObject(state, { 
        wishlist: [], 
        wishlistLoading: false, 
        wishlistError: action.error 
      });

    case ADD_TO_WISHLIST_SUCCESS:
      return updateObject(state, { 
        wishlist: [...state.wishlist, action.payload] 
      });

    case REMOVE_FROM_WISHLIST_SUCCESS:
      return updateObject(state, { 
        wishlist: state.wishlist.filter(item => item.id !== action.payload) 
      });

    case UPDATE_WISHLIST_ITEM_SUCCESS:
      return updateObject(state, { 
        wishlist: state.wishlist.map(item => 
          item.id === action.payload.id ? action.payload : item
        ) 
      });

    // Price Alerts reducers
    case FETCH_PRICE_ALERTS_START:
      return updateObject(state, { priceAlertsLoading: true, priceAlertsError: null });

    case FETCH_PRICE_ALERTS_SUCCESS:
      return updateObject(state, { 
        priceAlerts: action.payload, 
        priceAlertsLoading: false, 
        priceAlertsError: null 
      });

    case FETCH_PRICE_ALERTS_FAIL:
      return updateObject(state, { 
        priceAlerts: [], 
        priceAlertsLoading: false, 
        priceAlertsError: action.error 
      });

    case CREATE_PRICE_ALERT_SUCCESS:
      return updateObject(state, { 
        priceAlerts: [...state.priceAlerts, action.payload] 
      });

    case UPDATE_PRICE_ALERT_SUCCESS:
      return updateObject(state, { 
        priceAlerts: state.priceAlerts.map(alert => 
          alert.id === action.payload.id ? action.payload : alert
        ) 
      });

    case DELETE_PRICE_ALERT_SUCCESS:
      return updateObject(state, { 
        priceAlerts: state.priceAlerts.filter(alert => alert.id !== action.payload) 
      });

    // Product Comparison reducers
    case FETCH_COMPARISON_SUCCESS:
      return updateObject(state, { comparison: action.payload });

    case ADD_TO_COMPARISON_SUCCESS:
      return updateObject(state, { 
        comparison: [...state.comparison, action.payload] 
      });

    case REMOVE_FROM_COMPARISON_SUCCESS:
      return updateObject(state, { 
        comparison: state.comparison.filter(product => product.id !== action.payload) 
      });

    case CLEAR_COMPARISON:
      return updateObject(state, { comparison: [] });

    // Product Reviews reducers
    case FETCH_PRODUCT_REVIEWS_START:
      return updateObject(state, { reviewsLoading: true, reviewsError: null });

    case FETCH_PRODUCT_REVIEWS_SUCCESS:
      return updateObject(state, { 
        productReviews: action.payload, 
        reviewsLoading: false, 
        reviewsError: null 
      });

    case FETCH_PRODUCT_REVIEWS_FAIL:
      return updateObject(state, { 
        productReviews: [], 
        reviewsLoading: false, 
        reviewsError: action.error 
      });

    case CREATE_REVIEW_SUCCESS:
      return updateObject(state, { 
        productReviews: [...state.productReviews, action.payload] 
      });

    case UPDATE_REVIEW_SUCCESS:
      return updateObject(state, { 
        productReviews: state.productReviews.map(review => 
          review.id === action.payload.id ? action.payload : review
        ) 
      });

    case DELETE_REVIEW_SUCCESS:
      return updateObject(state, { 
        productReviews: state.productReviews.filter(review => review.id !== action.payload) 
      });

    case MARK_REVIEW_HELPFUL_SUCCESS:
      return updateObject(state, { 
        productReviews: state.productReviews.map(review => 
          review.id === action.payload ? { ...review, helpful_count: review.helpful_count + 1 } : review
        ) 
      });

    default:
      return state;
  }
}
