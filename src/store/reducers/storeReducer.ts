import {
  FETCH_PRODUCTS_START,
  FETCH_PRODUCTS_SUCCESS,
  FETCH_PRODUCTS_FAIL,
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
  SET_PAYMENT
} from "../actions/storeActions";

import { updateObject } from "../utility";
import { Product, Brand, Category, FilterParams } from "../../services/productsApi";

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
  error: any;
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

    default:
      return state;
  }
}
