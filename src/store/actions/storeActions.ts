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

// Wishlist action types
export const FETCH_WISHLIST_START = "FETCH_WISHLIST_START";
export const FETCH_WISHLIST_SUCCESS = "FETCH_WISHLIST_SUCCESS";
export const FETCH_WISHLIST_FAIL = "FETCH_WISHLIST_FAIL";
export const ADD_TO_WISHLIST_SUCCESS = "ADD_TO_WISHLIST_SUCCESS";
export const REMOVE_FROM_WISHLIST_SUCCESS = "REMOVE_FROM_WISHLIST_SUCCESS";
export const UPDATE_WISHLIST_ITEM_SUCCESS = "UPDATE_WISHLIST_ITEM_SUCCESS";

// Price Alerts action types
export const FETCH_PRICE_ALERTS_START = "FETCH_PRICE_ALERTS_START";
export const FETCH_PRICE_ALERTS_SUCCESS = "FETCH_PRICE_ALERTS_SUCCESS";
export const FETCH_PRICE_ALERTS_FAIL = "FETCH_PRICE_ALERTS_FAIL";
export const CREATE_PRICE_ALERT_SUCCESS = "CREATE_PRICE_ALERT_SUCCESS";
export const UPDATE_PRICE_ALERT_SUCCESS = "UPDATE_PRICE_ALERT_SUCCESS";
export const DELETE_PRICE_ALERT_SUCCESS = "DELETE_PRICE_ALERT_SUCCESS";

// Product Comparison action types
export const FETCH_COMPARISON_SUCCESS = "FETCH_COMPARISON_SUCCESS";
export const ADD_TO_COMPARISON_SUCCESS = "ADD_TO_COMPARISON_SUCCESS";
export const REMOVE_FROM_COMPARISON_SUCCESS = "REMOVE_FROM_COMPARISON_SUCCESS";
export const CLEAR_COMPARISON = "CLEAR_COMPARISON";

// Product Reviews action types
export const FETCH_PRODUCT_REVIEWS_START = "FETCH_PRODUCT_REVIEWS_START";
export const FETCH_PRODUCT_REVIEWS_SUCCESS = "FETCH_PRODUCT_REVIEWS_SUCCESS";
export const FETCH_PRODUCT_REVIEWS_FAIL = "FETCH_PRODUCT_REVIEWS_FAIL";
export const CREATE_REVIEW_SUCCESS = "CREATE_REVIEW_SUCCESS";
export const UPDATE_REVIEW_SUCCESS = "UPDATE_REVIEW_SUCCESS";
export const DELETE_REVIEW_SUCCESS = "DELETE_REVIEW_SUCCESS";
export const MARK_REVIEW_HELPFUL_SUCCESS = "MARK_REVIEW_HELPFUL_SUCCESS";

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

// Additional missing action types
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

// Wishlist action creators
export const fetchWishlistStart = () => ({
  type: FETCH_WISHLIST_START
});

export const fetchWishlistSuccess = (wishlist: any) => ({
  type: FETCH_WISHLIST_SUCCESS,
  payload: wishlist
});

export const fetchWishlistFail = (error: any) => ({
  type: FETCH_WISHLIST_FAIL,
  error
});

export const addToWishlistSuccess = (item: any) => ({
  type: ADD_TO_WISHLIST_SUCCESS,
  payload: item
});

export const removeFromWishlistSuccess = (itemId: number) => ({
  type: REMOVE_FROM_WISHLIST_SUCCESS,
  payload: itemId
});

export const updateWishlistItemSuccess = (item: any) => ({
  type: UPDATE_WISHLIST_ITEM_SUCCESS,
  payload: item
});

// Price Alerts action creators
export const fetchPriceAlertsStart = () => ({
  type: FETCH_PRICE_ALERTS_START
});

export const fetchPriceAlertsSuccess = (alerts: any) => ({
  type: FETCH_PRICE_ALERTS_SUCCESS,
  payload: alerts
});

export const fetchPriceAlertsFail = (error: any) => ({
  type: FETCH_PRICE_ALERTS_FAIL,
  error
});

export const createPriceAlertSuccess = (alert: any) => ({
  type: CREATE_PRICE_ALERT_SUCCESS,
  payload: alert
});

export const updatePriceAlertSuccess = (alert: any) => ({
  type: UPDATE_PRICE_ALERT_SUCCESS,
  payload: alert
});

export const deletePriceAlertSuccess = (alertId: number) => ({
  type: DELETE_PRICE_ALERT_SUCCESS,
  payload: alertId
});

// Product Comparison action creators
export const fetchComparisonSuccess = (comparisonData: any) => ({
  type: FETCH_COMPARISON_SUCCESS,
  payload: comparisonData
});

export const addToComparisonSuccess = (product: Product) => ({
  type: ADD_TO_COMPARISON_SUCCESS,
  payload: product
});

export const removeFromComparisonSuccess = (productId: number) => ({
  type: REMOVE_FROM_COMPARISON_SUCCESS,
  payload: productId
});

export const clearComparison = () => ({
  type: CLEAR_COMPARISON
});

// Product Reviews action creators
export const fetchProductReviewsStart = () => ({
  type: FETCH_PRODUCT_REVIEWS_START
});

export const fetchProductReviewsSuccess = (reviews: any) => ({
  type: FETCH_PRODUCT_REVIEWS_SUCCESS,
  payload: reviews
});

export const fetchProductReviewsFail = (error: any) => ({
  type: FETCH_PRODUCT_REVIEWS_FAIL,
  error
});

export const createReviewSuccess = (review: any) => ({
  type: CREATE_REVIEW_SUCCESS,
  payload: review
});

export const updateReviewSuccess = (review: any) => ({
  type: UPDATE_REVIEW_SUCCESS,
  payload: review
});

export const deleteReviewSuccess = (reviewId: number) => ({
  type: DELETE_REVIEW_SUCCESS,
  payload: reviewId
});

export const markReviewHelpfulSuccess = (reviewId: number) => ({
  type: MARK_REVIEW_HELPFUL_SUCCESS,
  payload: reviewId
});

// Cart action creators
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

// Wishlist thunk actions
export const fetchWishlist = (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>, getState) => {
    const { auth } = getState() as RootState;
    
    if (!auth.token) {
      console.error('No authentication token available');
      return;
    }

    try {
      dispatch(fetchWishlistStart());
      const wishlist = await productsApi.getWishlist(auth.token);
      dispatch(fetchWishlistSuccess(wishlist));
    } catch (err: any) {
      console.error('Failed to fetch wishlist:', err);
      dispatch(fetchWishlistFail(err.message));
    }
  };
};

export const addToWishlist = (productId: number): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>, getState) => {
    const { auth } = getState() as RootState;
    
    if (!auth.token) {
      console.error('No authentication token available');
      return;
    }

    try {
      const wishlistItem = await productsApi.addToWishlist(productId, auth.token);
      dispatch(addToWishlistSuccess(wishlistItem));
    } catch (err: any) {
      console.error('Failed to add to wishlist:', err);
    }
  };
};

export const removeFromWishlist = (wishlistItemId: number): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>, getState) => {
    const { auth } = getState() as RootState;
    
    if (!auth.token) {
      console.error('No authentication token available');
      return;
    }

    try {
      await productsApi.removeFromWishlist(wishlistItemId, auth.token);
      dispatch(removeFromWishlistSuccess(wishlistItemId));
    } catch (err: any) {
      console.error('Failed to remove from wishlist:', err);
    }
  };
};

export const updateWishlistItem = (wishlistItemId: number, data: any): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>, getState) => {
    const { auth } = getState() as RootState;
    
    if (!auth.token) {
      console.error('No authentication token available');
      return;
    }

    try {
      const updatedItem = await productsApi.updateWishlistItem(wishlistItemId, data, auth.token);
      dispatch(updateWishlistItemSuccess(updatedItem));
    } catch (err: any) {
      console.error('Failed to update wishlist item:', err);
    }
  };
};

// Price Alerts thunk actions
export const fetchPriceAlerts = (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>, getState) => {
    const { auth } = getState() as RootState;
    
    if (!auth.token) {
      console.error('No authentication token available');
      return;
    }

    try {
      dispatch(fetchPriceAlertsStart());
      const alerts = await productsApi.getPriceAlerts(auth.token);
      dispatch(fetchPriceAlertsSuccess(alerts));
    } catch (err: any) {
      console.error('Failed to fetch price alerts:', err);
      dispatch(fetchPriceAlertsFail(err.message));
    }
  };
};

export const createPriceAlert = (data: { product_id: number; target_price: number }): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>, getState) => {
    const { auth } = getState() as RootState;
    
    if (!auth.token) {
      console.error('No authentication token available');
      return;
    }

    try {
      const alert = await productsApi.createPriceAlert({ 
        product: data.product_id, 
        target_price: data.target_price 
      }, auth.token);
      dispatch(createPriceAlertSuccess(alert));
    } catch (err: any) {
      console.error('Failed to create price alert:', err);
      throw err;
    }
  };
};

export const updatePriceAlert = (alertId: number, data: any): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>, getState) => {
    const { auth } = getState() as RootState;
    
    if (!auth.token) {
      console.error('No authentication token available');
      return;
    }

    try {
      const updatedAlert = await productsApi.updatePriceAlert(alertId, data, auth.token);
      dispatch(updatePriceAlertSuccess(updatedAlert));
    } catch (err: any) {
      console.error('Failed to update price alert:', err);
    }
  };
};

export const deletePriceAlert = (alertId: number): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>, getState) => {
    const { auth } = getState() as RootState;
    
    if (!auth.token) {
      console.error('No authentication token available');
      return;
    }

    try {
      await productsApi.deletePriceAlert(alertId, auth.token);
      dispatch(deletePriceAlertSuccess(alertId));
    } catch (err: any) {
      console.error('Failed to delete price alert:', err);
      throw err;
    }
  };
};

// Product Comparison thunk actions
export const fetchComparison = (productIds: number[]): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    try {
      const comparisonData = await productsApi.getComparison(productIds);
      dispatch(fetchComparisonSuccess(comparisonData));
    } catch (err: any) {
      console.error('Failed to fetch comparison:', err);
    }
  };
};

export const addToComparison = (productId: number): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    try {
      const result = await productsApi.addToComparison(productId);
      // Fetch the product details for the comparison
      const product = await productsApi.getProduct(productId.toString());
      dispatch(addToComparisonSuccess(product));
    } catch (err: any) {
      console.error('Failed to add to comparison:', err);
    }
  };
};

export const removeFromComparison = (productId: number): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    try {
      await productsApi.removeFromComparison(productId);
      dispatch(removeFromComparisonSuccess(productId));
    } catch (err: any) {
      console.error('Failed to remove from comparison:', err);
    }
  };
};

export const clearComparisonList = (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    try {
      await productsApi.clearComparison();
      dispatch(clearComparison());
    } catch (err: any) {
      console.error('Failed to clear comparison:', err);
    }
  };
};

// Product Reviews thunk actions
export const fetchProductReviews = (productId: number, params?: any): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    try {
      dispatch(fetchProductReviewsStart());
      const reviews = await productsApi.getProductReviews(productId, params);
      dispatch(fetchProductReviewsSuccess(reviews));
    } catch (err: any) {
      console.error('Failed to fetch product reviews:', err);
      dispatch(fetchProductReviewsFail(err.message));
    }
  };
};

export const createReview = (productId: number, data: any): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>, getState) => {
    const { auth } = getState() as RootState;
    
    if (!auth.token) {
      console.error('No authentication token available');
      return;
    }

    try {
      const review = await productsApi.createReview(productId, data, auth.token);
      dispatch(createReviewSuccess(review));
    } catch (err: any) {
      console.error('Failed to create review:', err);
      throw err;
    }
  };
};

export const updateReview = (productId: number, reviewId: number, data: any): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>, getState) => {
    const { auth } = getState() as RootState;
    
    if (!auth.token) {
      console.error('No authentication token available');
      return;
    }

    try {
      const updatedReview = await productsApi.updateReview(productId, reviewId, data, auth.token);
      dispatch(updateReviewSuccess(updatedReview));
    } catch (err: any) {
      console.error('Failed to update review:', err);
    }
  };
};

export const deleteReview = (productId: number, reviewId: number): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>, getState) => {
    const { auth } = getState() as RootState;
    
    if (!auth.token) {
      console.error('No authentication token available');
      return;
    }

    try {
      await productsApi.deleteReview(productId, reviewId, auth.token);
      dispatch(deleteReviewSuccess(reviewId));
    } catch (err: any) {
      console.error('Failed to delete review:', err);
    }
  };
};

export const markReviewHelpful = (productId: number, reviewId: number): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>, getState) => {
    const { auth } = getState() as RootState;

    try {
      await productsApi.markReviewHelpful(productId, reviewId, auth.token || undefined);
      dispatch(markReviewHelpfulSuccess(reviewId));
    } catch (err: any) {
      console.error('Failed to mark review as helpful:', err);
    }
  };
};