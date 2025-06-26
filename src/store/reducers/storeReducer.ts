import {
  FETCH_PRODUCTS_START,
  FETCH_PRODUCTS_SUCCESS,
  FETCH_PRODUCTS_FAIL,
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


interface CartItem {
  id: string;
  price: number;
  quantity: number;
  [key: string]: any;
}

interface StoreState {
  products: CartItem[];
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
}

interface Action {
  type: string;
  [key: string]: any;
}

const initialState: StoreState = {
  products: [],
  loading: false,
  error: null,
  cart: [],
  subtotal: 0,
  tax: 0.2,
  shipping: "standard",
  isDifferentBillingAddress: false,
  paymentStatus: "",
  isCheckoutComplete: false,
  didPaymentGoThrough: false
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
      return updateObject(state, { products: action.products, loading: false });

    case FETCH_PRODUCTS_FAIL:
      return updateObject(state, {
        products: [],
        loading: false,
        error: action.error
      });

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
