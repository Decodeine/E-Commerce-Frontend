import { API_PATH } from '../backend_url';

// Types for Orders API
export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  shipping_address: Address;
  billing_address?: Address;
  items: OrderItem[];
  payment_method?: string;
  tracking_number?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sku?: string;
}

export interface Address {
  id?: string;
  name: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderFilters {
  status?: OrderStatus[];
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CreateOrderRequest {
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
  shipping_address: Omit<Address, 'id'>;
  billing_address?: Omit<Address, 'id'>;
  payment_method: string;
  notes?: string;
}

// Enhanced Orders API Class with comprehensive endpoints
export class OrdersAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_PATH}orders`;
  }

  // ===== ORDER MANAGEMENT =====
  // Get all orders with filtering and pagination
  async getOrders(
    page: number = 1,
    pageSize: number = 10,
    filters: OrderFilters = {}
  ): Promise<OrdersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      // Add filters to params
      if (filters.status?.length) {
        params.append('status', filters.status.join(','));
      }
      if (filters.date_from) {
        params.append('date_from', filters.date_from);
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to);
      }
      if (filters.min_amount) {
        params.append('min_amount', filters.min_amount.toString());
      }
      if (filters.max_amount) {
        params.append('max_amount', filters.max_amount.toString());
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const response = await fetch(`${this.baseURL}/?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Get a specific order by ID or order number
  async getOrder(orderIdentifier: string): Promise<Order> {
    try {
      const response = await fetch(`${this.baseURL}/${orderIdentifier}/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Create a new order
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      const response = await fetch(`${this.baseURL}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create order: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Create order from cart
  async createOrderFromCart(orderData: Omit<CreateOrderRequest, 'items'>): Promise<Order> {
    try {
      const response = await fetch(`${this.baseURL}/from_cart/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create order from cart: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order from cart:', error);
      throw error;
    }
  }

  // ===== ORDER STATUS MANAGEMENT =====
  // Update order status (admin only)
  async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<Order> {
    try {
      const response = await fetch(`${this.baseURL}/${orderId}/status/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Cancel an order
  async cancelOrder(orderIdentifier: string, reason?: string): Promise<Order> {
    try {
      const response = await fetch(`${this.baseURL}/${orderIdentifier}/cancel/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel order: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // ===== ORDER MODIFICATIONS =====
  // Update order shipping address
  async updateShippingAddress(orderId: string, address: Omit<Address, 'id'>): Promise<Order> {
    try {
      const response = await fetch(`${this.baseURL}/${orderId}/shipping-address/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ shipping_address: address }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update shipping address: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating shipping address:', error);
      throw error;
    }
  }

  // Update order billing address
  async updateBillingAddress(orderId: string, address: Omit<Address, 'id'>): Promise<Order> {
    try {
      const response = await fetch(`${this.baseURL}/${orderId}/billing-address/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ billing_address: address }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update billing address: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating billing address:', error);
      throw error;
    }
  }

  // Add note to order
  async addOrderNote(orderId: string, note: string, isInternal: boolean = false): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/${orderId}/notes/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ note, is_internal: isInternal }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add order note: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding order note:', error);
      throw error;
    }
  }

  // ===== TRACKING & SHIPPING =====
  // Get order tracking information
  async getOrderTracking(orderIdentifier: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/${orderIdentifier}/tracking/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tracking: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching tracking:', error);
      throw error;
    }
  }

  // Update tracking information (admin only)
  async updateTracking(orderId: string, trackingData: {
    tracking_number?: string;
    courier_service?: string;
    estimated_delivery?: string;
    tracking_url?: string;
  }): Promise<Order> {
    try {
      const response = await fetch(`${this.baseURL}/${orderId}/tracking/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(trackingData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update tracking: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating tracking:', error);
      throw error;
    }
  }

  // Get shipping options for order
  async getShippingOptions(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/${orderId}/shipping-options/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get shipping options: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting shipping options:', error);
      throw error;
    }
  }

  // ===== PAYMENTS & REFUNDS =====
  // Get order payment information
  async getOrderPayments(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/${orderId}/payments/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment info:', error);
      throw error;
    }
  }

  // Process payment for order
  async processPayment(orderId: string, paymentData: {
    payment_method: string;
    payment_token?: string;
    amount?: number;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/${orderId}/payment/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error(`Failed to process payment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Request order refund
  async requestRefund(orderIdentifier: string, refundData: {
    reason: string;
    items?: string[];
    amount?: number;
    refund_shipping?: boolean;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/${orderIdentifier}/refund/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(refundData),
      });

      if (!response.ok) {
        throw new Error(`Failed to request refund: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error requesting refund:', error);
      throw error;
    }
  }

  // Get refund status
  async getRefundStatus(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/${orderId}/refund/status/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get refund status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting refund status:', error);
      throw error;
    }
  }

  // ===== ORDER ANALYTICS & REPORTS =====
  // Get order statistics
  async getOrderStats(filters?: {
    date_from?: string;
    date_to?: string;
    status?: OrderStatus[];
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.status?.length) params.append('status', filters.status.join(','));

      const response = await fetch(`${this.baseURL}/stats/?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get order stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting order stats:', error);
      throw error;
    }
  }

  // Export orders to CSV/Excel
  async exportOrders(format: 'csv' | 'excel', filters?: OrderFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams({ format });
      
      if (filters?.status?.length) params.append('status', filters.status.join(','));
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const response = await fetch(`${this.baseURL}/export/?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to export orders: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error;
    }
  }

  // ===== ORDER REPLICATION =====
  // Reorder items from a previous order
  async reorder(orderIdentifier: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/${orderIdentifier}/reorder/`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to reorder: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reordering:', error);
      throw error;
    }
  }

  // Duplicate order (admin only)
  async duplicateOrder(orderId: string): Promise<Order> {
    try {
      const response = await fetch(`${this.baseURL}/${orderId}/duplicate/`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to duplicate order: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error duplicating order:', error);
      throw error;
    }
  }

  // ===== HELPER METHODS =====
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
    };
  }
}

// Create and export instance
export const ordersApi = new OrdersAPI();

// Utility functions for orders
export const formatOrderStatus = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return statusMap[status] || 'Unknown';
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  const colorMap: Record<OrderStatus, string> = {
    pending: '#f59e0b',
    confirmed: '#10b981',
    processing: '#3b82f6',
    shipped: '#6366f1',
    out_for_delivery: '#8b5cf6',
    delivered: '#059669',
    cancelled: '#ef4444',
    refunded: '#6b7280',
  };
  return colorMap[status] || '#6b7280';
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const canCancelOrder = (status: OrderStatus): boolean => {
  return ['pending', 'confirmed'].includes(status);
};

export const canRequestRefund = (status: OrderStatus): boolean => {
  return ['delivered'].includes(status);
};

export const canTrackOrder = (status: OrderStatus): boolean => {
  return ['confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(status);
};
