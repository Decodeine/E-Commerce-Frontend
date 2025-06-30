// Export all API services
export { cartApi, ordersApi, returnsApi, savedForLaterApi, CartAPI, OrdersAPI, ReturnsAPI, SavedForLaterAPI } from './cartApi';
export { ordersApi as modernOrdersApi, OrdersAPI as ModernOrdersAPI } from './ordersApi';
export { default as accountsApi } from './accountsApi';
export { default as productsApi } from './productsApi';

// Export utility functions
export { 
  formatCurrency, 
  formatDate, 
  formatDateTime, 
  getOrderStatusColor, 
  getOrderStatusText 
} from './cartApi';

export {
  formatOrderStatus,
  canCancelOrder,
  canRequestRefund,
  canTrackOrder
} from './ordersApi';

// Export types
export type { 
  Order, 
  OrderItem, 
  Address, 
  OrderStatus, 
  OrderFilters, 
  OrdersResponse, 
  CreateOrderRequest 
} from './ordersApi';
