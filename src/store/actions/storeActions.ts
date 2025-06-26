import axios from "axios";
import { API_PATH } from "../../backend_url";
import { ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from '../store';
import { AnyAction } from "redux";

// Action Types
export const FETCH_PRODUCTS_START = "FETCH_PRODUCTS_START";
export const FETCH_PRODUCTS_SUCCESS = "FETCH_PRODUCTS_SUCCESS";
export const FETCH_PRODUCTS_FAIL = "FETCH_PRODUCTS_FAIL";

export const ADD_PRODUCT_TO_CART = "ADD_PRODUCT_TO_CART";
export const REMOVE_PRODUCT_FROM_CART = "REMOVE_PRODUCT_FROM_CART";
export const UPDATE_PRODUCT_QUANTITY = "UPDATE_PRODUCT_QUANTITY";
export const INC_PRODUCT_QUANTITY = "INC_PRODUCT_QUANTITY";
export const DEC_PRODUCT_QUANTITY = "DEC_PRODUCT_QUANTITY";
export const EMPTY_CART = "EMPTY_CART";
export const CALCULATE_CART = "CALCULATE_CART";
export const SET_SHIPPING = "SET_SHIPPING";
export const TOGGLE_CHECKOUT_COMPLETE = "TOGGLE_CHECKOUT_COMPLETE";
export const TOGGLE_DIFFERENT_BILLING_ADDRESS = "TOGGLE_DIFFERENT_BILLING_ADDRESS";
export const SET_PAYMENT = "SET_PAYMENT";

// Thunk action for fetching products
export const fetchProducts = (
  query = ""
): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    dispatch(fetchProductsStart());
    try {
      const url =
        query === ""
          ? `${API_PATH}products/`
          : `${API_PATH}products/?search=${query}`;
      const res = await axios.get(url);
      dispatch(fetchProductsSuccess(res.data));
    } catch (err) {
      dispatch(fetchProductsFail(err));
    }
  };
};

export const fetchProductsStart = () => {
  return {
    type: FETCH_PRODUCTS_START
  };
};

export const fetchProductsSuccess = (products: any[]) => {
  return {
    type: FETCH_PRODUCTS_SUCCESS,
    products
  };
};

export const fetchProductsFail = (error: any) => {
  return {
    type: FETCH_PRODUCTS_FAIL,
    error
  };
};

export const addProductToCart = (item: any, quantity: number) => {
  return {
    type: ADD_PRODUCT_TO_CART,
    item: item,
    quantity: quantity
  };
};

export const removeProductFromCart = (item: any) => {
  return {
    type: REMOVE_PRODUCT_FROM_CART,
    item: item
  };
};

export const updateProductQuantity = (item: any, quantity: number) => {
  return {
    type: UPDATE_PRODUCT_QUANTITY,
    item: item,
    quantity: quantity
  };
};

export const incProductQuantity = (item: any) => {
  return {
    type: INC_PRODUCT_QUANTITY,
    item: item
  };
};

export const decProductQuantity = (item: any) => {
  return {
    type: DEC_PRODUCT_QUANTITY,
    item: item
  };
};

export const emptyCart = () => {
  return {
    type: EMPTY_CART
  };
};

export const calculateCart = () => {
  return {
    type: CALCULATE_CART
  };
};

export const setShipping = (value: string) => {
  return {
    type: SET_SHIPPING,
    value
  };
};

export const toggleCheckoutComplete = () => {
  return {
    type: TOGGLE_CHECKOUT_COMPLETE
  };
};

export const toggleDifferentBillingAddress = () => {
  return {
    type: TOGGLE_DIFFERENT_BILLING_ADDRESS
  };
};

export const setPayment = (value: string) => {
  return {
    type: SET_PAYMENT,
    value
  };
};