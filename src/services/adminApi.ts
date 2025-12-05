import axios from 'axios';
import { API_PATH } from '../backend_url';

// Admin API Service
export interface AdminStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_swaps: number;
  pending_swaps: number;
  total_revenue: number;
  recent_orders: any[];
  recent_swaps: any[];
}

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface AdminSwapRequest {
  id: number;
  user_email: string;
  user_device: any;
  estimated_value: number;
  final_value?: number;
  target_device: number;
  target_device_name: string;
  target_device_price: number;
  difference: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

class AdminAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_PATH}admin/`;
  }

  private getHeaders() {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<AdminStats> {
    try {
      const response = await axios.get(`${this.baseURL}stats/`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }

  // User Management
  async getUsers(params?: { search?: string; page?: number; limit?: number }): Promise<{ results: AdminUser[]; count: number }> {
    try {
      const response = await axios.get(`${this.baseURL}users/`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUser(userId: number): Promise<AdminUser> {
    try {
      const response = await axios.get(`${this.baseURL}users/${userId}/`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async updateUser(userId: number, data: Partial<AdminUser>): Promise<AdminUser> {
    try {
      const response = await axios.patch(`${this.baseURL}users/${userId}/`, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}users/${userId}/`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Product Management
  async createProduct(productData: FormData): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await axios.post(`${API_PATH}products/`, productData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(productId: number, productData: FormData | any): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await axios.patch(`${API_PATH}products/${productId}/`, productData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(productData instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(productId: number): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      await axios.delete(`${API_PATH}products/${productId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Swap Management
  async getAllSwaps(params?: { status?: string; page?: number; limit?: number }): Promise<{ results: AdminSwapRequest[]; count: number }> {
    try {
      console.log('🔄 AdminApi.getAllSwaps called with:', params);
      console.log('🔄 Base URL:', this.baseURL);
      const response = await axios.get(`${this.baseURL}swaps/`, {
        headers: this.getHeaders(),
        params,
      });
      console.log('📥 AdminApi response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ AdminApi error fetching swaps:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  }

  async getSwap(swapId: number): Promise<AdminSwapRequest> {
    try {
      const response = await axios.get(`${this.baseURL}swaps/${swapId}/`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching swap:', error);
      throw error;
    }
  }

  async approveSwap(swapId: number, finalValue: number, adminNotes?: string): Promise<AdminSwapRequest> {
    try {
      const response = await axios.post(`${this.baseURL}swaps/${swapId}/approve/`, {
        final_value: finalValue,
        admin_notes: adminNotes,
      }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error approving swap:', error);
      throw error;
    }
  }

  async rejectSwap(swapId: number, reason: string): Promise<AdminSwapRequest> {
    try {
      const response = await axios.post(`${this.baseURL}swaps/${swapId}/reject/`, {
        admin_notes: reason,
      }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting swap:', error);
      throw error;
    }
  }

  async updateSwapStatus(swapId: number, status: string, adminNotes?: string): Promise<AdminSwapRequest> {
    try {
      const response = await axios.patch(`${this.baseURL}swaps/${swapId}/`, {
        status,
        admin_notes: adminNotes,
      }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating swap:', error);
      throw error;
    }
  }

  // Order Management
  async getAllOrders(params?: { status?: string; page?: number; limit?: number }): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}orders/`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: number, status: string): Promise<any> {
    try {
      const response = await axios.patch(`${this.baseURL}orders/${orderId}/`, {
        status,
      }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }
}

export const adminApi = new AdminAPI();

