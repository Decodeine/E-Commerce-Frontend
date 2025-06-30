import { API_PATH } from '../backend_url';

// Enhanced Cart API Service with all endpoints
class CartAPI {
  private baseURL: string;
  private cartData: any;

  constructor() {
    this.baseURL = `${API_PATH}cart`;
    this.cartData = null;
  }

  // ===== CART MANAGEMENT =====
  async getCart() {
    try {
      const response = await fetch(`${this.baseURL}/cart/`, {
        headers: this.getHeaders()
      });
      
      if (response.ok) {
        this.cartData = await response.json();
        return this.cartData;
      }
      throw new Error('Failed to fetch cart');
    } catch (error) {
      console.error('Cart fetch error:', error);
      return null;
    }
  }

  async addItem(productId: number, quantity: number = 1, variant?: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/cart/add_item/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity,
          variant: variant
        })
      });

      if (response.ok) {
        const result = await response.json();
        await this.getCart(); // Refresh cart data
        return result;
      }
      
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add item to cart');
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  }

  async updateItemQuantity(productId: number, quantity: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/cart/update_item/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        })
      });

      if (response.ok) {
        await this.getCart(); // Refresh cart data
        return await response.json();
      }
      
      throw new Error('Failed to update item quantity');
    } catch (error) {
      console.error('Update quantity error:', error);
      throw error;
    }
  }

  async removeItem(productId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/cart/remove_item/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify({
          product_id: productId
        })
      });

      if (response.ok) {
        await this.getCart(); // Refresh cart data
        return true;
      }
      
      throw new Error('Failed to remove item from cart');
    } catch (error) {
      console.error('Remove item error:', error);
      throw error;
    }
  }

  // ===== BULK OPERATIONS =====
  async addMultipleItems(items: Array<{product_id: number, quantity: number, variant?: string}>): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/cart/add_multiple/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ items })
      });

      if (response.ok) {
        await this.getCart();
        return await response.json();
      }
      
      throw new Error('Failed to add multiple items');
    } catch (error) {
      console.error('Add multiple items error:', error);
      throw error;
    }
  }

  async removeMultipleItems(productIds: number[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/cart/remove_multiple/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify({ product_ids: productIds })
      });

      if (response.ok) {
        await this.getCart();
        return true;
      }
      
      throw new Error('Failed to remove multiple items');
    } catch (error) {
      console.error('Remove multiple items error:', error);
      throw error;
    }
  }

  // ===== CART SUMMARY & CALCULATIONS =====
  async getCartSummary(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/cart/summary/`, {
        headers: this.getHeaders()
      });

      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Failed to get cart summary');
    } catch (error) {
      console.error('Cart summary error:', error);
      throw error;
    }
  }

  async calculateShipping(shippingMethod: string, address?: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/cart/calculate_shipping/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          shipping_method: shippingMethod,
          address: address
        })
      });

      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Failed to calculate shipping');
    } catch (error) {
      console.error('Calculate shipping error:', error);
      throw error;
    }
  }

  async calculateTax(address: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/cart/calculate_tax/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ address })
      });

      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Failed to calculate tax');
    } catch (error) {
      console.error('Calculate tax error:', error);
      throw error;
    }
  }

  // ===== COUPONS & DISCOUNTS =====
  async applyCoupon(couponCode: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/cart/apply_coupon/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ coupon_code: couponCode })
      });

      if (response.ok) {
        await this.getCart();
        return await response.json();
      }
      
      const error = await response.json();
      throw new Error(error.detail || 'Failed to apply coupon');
    } catch (error) {
      console.error('Apply coupon error:', error);
      throw error;
    }
  }

  async removeCoupon(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/cart/remove_coupon/`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (response.ok) {
        await this.getCart();
        return await response.json();
      }
      
      throw new Error('Failed to remove coupon');
    } catch (error) {
      console.error('Remove coupon error:', error);
      throw error;
    }
  }

  async validateCoupon(couponCode: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/cart/validate_coupon/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ coupon_code: couponCode })
      });

      if (response.ok) {
        return await response.json();
      }
      
      const error = await response.json();
      throw new Error(error.detail || 'Invalid coupon');
    } catch (error) {
      console.error('Validate coupon error:', error);
      throw error;
    }
  }

  // ===== CART PERSISTENCE =====
  async saveCart(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/cart/save/`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Failed to save cart');
    } catch (error) {
      console.error('Save cart error:', error);
      throw error;
    }
  }

  async loadSavedCart(cartId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/cart/load/${cartId}/`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (response.ok) {
        await this.getCart();
        return await response.json();
      }
      
      throw new Error('Failed to load saved cart');
    } catch (error) {
      console.error('Load cart error:', error);
      throw error;
    }
  }

  async getSavedCarts(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/cart/saved/`, {
        headers: this.getHeaders()
      });

      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Failed to get saved carts');
    } catch (error) {
      console.error('Get saved carts error:', error);
      throw error;
    }
  }

  async deleteSavedCart(cartId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/cart/saved/${cartId}/`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Delete saved cart error:', error);
      return false;
    }
  }

  async clearCart() {
    try {
      const response = await fetch(`${this.baseURL}/cart/clear/`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (response.ok) {
        this.cartData = null;
        return true;
      }
      
      throw new Error('Failed to clear cart');
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  }

  async validateStock() {
    try {
      const response = await fetch(`${this.baseURL}/cart/validate_stock/`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Stock validation failed');
    } catch (error) {
      console.error('Stock validation error:', error);
      throw error;
    }
  }

  getHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Get cart item count for badge display
  getItemCount() {
    return this.cartData ? this.cartData.total_items : 0;
  }

  // Get cart subtotal for display
  getSubtotal() {
    return this.cartData ? this.cartData.subtotal : '0.00';
  }
}

// Orders API Service
class OrdersAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_PATH}orders`;
  }

  async getOrders(page = 1, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...filters
      });
      
      const response = await fetch(`${this.baseURL}/orders/?${params}`, {
        headers: this.getHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch orders');
    } catch (error) {
      console.error('Orders fetch error:', error);
      throw error;
    }
  }

  async getOrder(orderNumber: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/orders/${orderNumber}/`, {
        headers: this.getHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch order details');
    } catch (error) {
      console.error('Order fetch error:', error);
      throw error;
    }
  }

  async createOrder(orderData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/orders/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        return await response.json();
      }
      
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create order');
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }

  async cancelOrder(orderNumber: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/orders/${orderNumber}/cancel/`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Failed to cancel order');
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  }

  async getOrderTracking(orderNumber: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/orders/${orderNumber}/tracking/`, {
        headers: this.getHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch tracking information');
    } catch (error) {
      console.error('Tracking fetch error:', error);
      throw error;
    }
  }

  async getOrderSummary() {
    try {
      const response = await fetch(`${this.baseURL}/orders/summary/`, {
        headers: this.getHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch order summary');
    } catch (error) {
      console.error('Order summary error:', error);
      throw error;
    }
  }

  getHeaders() {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
}

// Returns API Service
class ReturnsAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_PATH}orders`;
  }

  async getReturns() {
    try {
      const response = await fetch(`${this.baseURL}/returns/`, {
        headers: this.getHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch return requests');
    } catch (error) {
      console.error('Returns fetch error:', error);
      throw error;
    }
  }

  async createReturnRequest(returnData: any) {
    try {
      const response = await fetch(`${this.baseURL}/returns/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(returnData)
      });

      if (response.ok) {
        return await response.json();
      }
      
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create return request');
    } catch (error) {
      console.error('Create return error:', error);
      throw error;
    }
  }

  getHeaders() {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
}

// Saved for Later API Service
class SavedForLaterAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_PATH}cart`;
  }

  async getSavedItems() {
    try {
      const response = await fetch(`${this.baseURL}/saved-for-later/`, {
        headers: this.getHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch saved items');
    } catch (error) {
      console.error('Saved items fetch error:', error);
      throw error;
    }
  }

  async saveItem(productId: string, quantity: number) {
    try {
      const response = await fetch(`${this.baseURL}/saved-for-later/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        })
      });

      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Failed to save item');
    } catch (error) {
      console.error('Save item error:', error);
      throw error;
    }
  }

  async moveToCart(savedItemId: string) {
    try {
      const response = await fetch(`${this.baseURL}/saved-for-later/${savedItemId}/move_to_cart/`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Failed to move item to cart');
    } catch (error) {
      console.error('Move to cart error:', error);
      throw error;
    }
  }

  async removeSavedItem(savedItemId: string) {
    try {
      const response = await fetch(`${this.baseURL}/saved-for-later/${savedItemId}/`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Remove saved item error:', error);
      throw error;
    }
  }

  getHeaders() {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
}

// Utility functions
export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₦${numAmount.toLocaleString()}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getOrderStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    pending: 'orange',
    confirmed: 'blue',
    processing: 'purple',
    shipped: 'teal',
    out_for_delivery: 'indigo',
    delivered: 'green',
    cancelled: 'red',
    refunded: 'gray'
  };
  
  return statusColors[status] || 'gray';
};

export const getOrderStatusText = (status: string): string => {
  const statusText: { [key: string]: string } = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded'
  };
  
  return statusText[status] || 'Unknown';
};

// Export API instances
export const cartApi = new CartAPI();
export const ordersApi = new OrdersAPI();
export const returnsApi = new ReturnsAPI();
export const savedForLaterApi = new SavedForLaterAPI();

export { CartAPI, OrdersAPI, ReturnsAPI, SavedForLaterAPI };
