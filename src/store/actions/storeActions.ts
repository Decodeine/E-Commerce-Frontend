import { ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from '../store';
import { AnyAction } from "redux";
import productsApi, { FilterParams, Product, Brand, Category } from "../../services/productsApi";

// Action Types
export const FETCH_PRODUCTS_START = "FETCH_PRODUCTS_START";
export const FETCH_PRODUCTS_SUCCESS = "FETCH_PRODUCTS_SUCCESS";
export const FETCH_PRODUCTS_FAIL = "FETCH_PRODUCTS_FAIL";

// New action types for enhanced functionality
export const FETCH_FEATURED_PRODUCTS_SUCCESS = "FETCH_FEATURED_PRODUCTS_SUCCESS";
export const FETCH_DEALS_SUCCESS = "FETCH_DEALS_SUCCESS";
export const FETCH_NEW_ARRIVALS_SUCCESS = "FETCH_NEW_ARRIVALS_SUCCESS";
export const FETCH_TOP_RATED_SUCCESS = "FETCH_TOP_RATED_SUCCESS";
export const FETCH_BRANDS_SUCCESS = "FETCH_BRANDS_SUCCESS";
export const FETCH_CATEGORIES_SUCCESS = "FETCH_CATEGORIES_SUCCESS";
export const SET_FILTERS = "SET_FILTERS";
export const SET_PAGINATION = "SET_PAGINATION";

// Existing cart actions
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

// Enhanced thunk action for fetching products with filters
export const fetchProducts = (
  filters: FilterParams = {}
): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    dispatch(fetchProductsStart());
    try {
      const response = await productsApi.getProducts(filters);
      dispatch(fetchProductsSuccess(response));
      dispatch(setPagination({
        currentPage: filters.page || 1,
        totalPages: Math.ceil(response.count / (filters.page_size || 20)),
        totalItems: response.count,
        hasNext: !!response.next,
        hasPrevious: !!response.previous
      }));
    } catch (err: any) {
      const serializedError = {
        message: err.message || 'An error occurred',
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      };
      dispatch(fetchProductsFail(serializedError));
    }
  };
};

// Fetch featured products
export const fetchFeaturedProducts = (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    try {
      const products = await productsApi.getFeaturedProducts();
      dispatch(fetchFeaturedProductsSuccess(products));
    } catch (err: any) {
      console.error('Failed to fetch featured products:', err);
    }
  };
};

// Fetch deals/sales products
export const fetchDealsProducts = (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    try {
      const products = await productsApi.getDealsProducts();
      dispatch(fetchDealsSuccess(products));
    } catch (err: any) {
      console.error('Failed to fetch deals:', err);
    }
  };
};

// Fetch new arrivals
export const fetchNewArrivals = (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    try {
      const products = await productsApi.getNewArrivals();
      dispatch(fetchNewArrivalsSuccess(products));
    } catch (err: any) {
      console.error('Failed to fetch new arrivals:', err);
    }
  };
};

// Fetch top rated products
export const fetchTopRated = (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    try {
      const products = await productsApi.getTopRated();
      dispatch(fetchTopRatedSuccess(products));
    } catch (err: any) {
      console.error('Failed to fetch top rated products:', err);
    }
  };
};

// Fetch brands
export const fetchBrands = (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    try {
      const brands = await productsApi.getBrands();
      dispatch(fetchBrandsSuccess(brands));
    } catch (err: any) {
      console.error('Failed to fetch brands:', err);
    }
  };
};

// Fetch categories
export const fetchCategories = (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    try {
      const categories = await productsApi.getCategories();
      dispatch(fetchCategoriesSuccess(categories));
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };
};

// Action creators
export const fetchProductsStart = () => ({
  type: FETCH_PRODUCTS_START
});

export const fetchProductsSuccess = (response: any) => ({
  type: FETCH_PRODUCTS_SUCCESS,
  payload: response
});

export const fetchProductsFail = (error: any) => ({
  type: FETCH_PRODUCTS_FAIL,
  error
});

export const fetchFeaturedProductsSuccess = (products: Product[]) => ({
  type: FETCH_FEATURED_PRODUCTS_SUCCESS,
  payload: products
});

export const fetchDealsSuccess = (products: Product[]) => ({
  type: FETCH_DEALS_SUCCESS,
  payload: products
});

export const fetchNewArrivalsSuccess = (products: Product[]) => ({
  type: FETCH_NEW_ARRIVALS_SUCCESS,
  payload: products
});

export const fetchTopRatedSuccess = (products: Product[]) => ({
  type: FETCH_TOP_RATED_SUCCESS,
  payload: products
});

export const fetchBrandsSuccess = (brands: Brand[]) => ({
  type: FETCH_BRANDS_SUCCESS,
  payload: brands
});

export const fetchCategoriesSuccess = (categories: Category[]) => ({
  type: FETCH_CATEGORIES_SUCCESS,
  payload: categories
});

export const setFilters = (filters: FilterParams) => ({
  type: SET_FILTERS,
  payload: filters
});

export const setPagination = (pagination: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}) => ({
  type: SET_PAGINATION,
  payload: pagination
});

// ...existing code...
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