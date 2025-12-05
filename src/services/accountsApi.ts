import axios from 'axios';
import { API_PATH } from '../backend_url';

// Types for TypeScript
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  full_name: string;
  initials: string;
  date_joined: string;
  last_login: string | null;
  addresses_count?: number;
}

export interface UserProfile {
  id: number;
  avatar: string | null;
  phone_number: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | '';
  bio: string;
  newsletter_subscribed: boolean;
  sms_notifications: boolean;
  email_notifications: boolean;
  preferred_brands: string[];
  preferred_categories: string[];
  budget_range_min: string;
  budget_range_max: string;
  age: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserAddress {
  id: number;
  type: 'shipping' | 'billing' | 'both';
  full_name: string;
  company: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: number;
  theme: 'light' | 'dark';
  language: string;
  currency: string;
  timezone: string;
  price_alerts_enabled: boolean;
  deal_notifications: boolean;
  new_product_notifications: boolean;
  inventory_notifications: boolean;
  profile_visibility: 'public' | 'private';
  allow_reviews_display: boolean;
  allow_data_collection: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: number;
  activity_type: string;
  description: string;
  metadata: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface ActivitySummary {
  total_activities: number;
  activity_counts: Record<string, number>;
  recent_activities: ActivityLog[];
  most_viewed_categories: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password1: string;
  password2: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}

export interface PasswordChangeData {
  old_password: string;
  new_password1: string;
  new_password2: string;
}

// Create axios instance with base configuration
const accountsApiInstance = axios.create({
  baseURL: `${API_PATH}accounts/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
accountsApiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
accountsApiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_PATH}accounts/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('accessToken', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return accountsApiInstance(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API methods
export const authApi = {
  // User registration
  register: async (userData: RegisterData): Promise<LoginResponse> => {
    const response = await accountsApiInstance.post('auth/register/', userData);
    return response.data;
  },

  // User login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await accountsApiInstance.post('auth/login/', credentials);
    const { access_token, refresh_token, user } = response.data;
    
    // Store tokens
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    
    return response.data;
  },

  // User logout
  logout: async (): Promise<void> => {
    try {
      await accountsApiInstance.post('auth/logout/');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // Password reset request
  requestPasswordReset: async (data: PasswordResetData): Promise<void> => {
    await accountsApiInstance.post('auth/password/reset/', data);
  },

  // Password reset confirmation
  confirmPasswordReset: async (data: PasswordResetConfirmData): Promise<void> => {
    await accountsApiInstance.post('auth/password/reset/confirm/', data);
  },

  // Password change (authenticated)
  changePassword: async (data: PasswordChangeData): Promise<void> => {
    await accountsApiInstance.post('auth/password/change/', data);
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await accountsApiInstance.get('api/users/me/');
    return response.data;
  }
};

// Profile API methods
export const profileApi = {
  // Get enhanced user details
  getUserDetails: async (): Promise<User & { profile: UserProfile; preferences: UserPreferences }> => {
    const response = await accountsApiInstance.get('api/users/me/');
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await accountsApiInstance.get('api/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await accountsApiInstance.patch('api/profile/', profileData);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await accountsApiInstance.post('api/profile/upload_avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Remove avatar
  removeAvatar: async (): Promise<void> => {
    await accountsApiInstance.delete('api/profile/remove_avatar/');
  }
};

// Address API methods
export const addressApi = {
  // Get user addresses
  getAddresses: async (filters?: Record<string, any>): Promise<UserAddress[]> => {
    const response = await accountsApiInstance.get('api/addresses/', { params: filters });
    return response.data.results || response.data;
  },

  // Create new address
  createAddress: async (addressData: Omit<UserAddress, 'id' | 'created_at' | 'updated_at'>): Promise<UserAddress> => {
    const response = await accountsApiInstance.post('api/addresses/', addressData);
    return response.data;
  },

  // Update address
  updateAddress: async (addressId: number, addressData: Partial<UserAddress>): Promise<UserAddress> => {
    const response = await accountsApiInstance.patch(`api/addresses/${addressId}/`, addressData);
    return response.data;
  },

  // Delete address
  deleteAddress: async (addressId: number): Promise<void> => {
    await accountsApiInstance.delete(`api/addresses/${addressId}/`);
  },

  // Set default address
  setDefaultAddress: async (addressId: number): Promise<UserAddress> => {
    const response = await accountsApiInstance.post(`api/addresses/${addressId}/set_default/`);
    return response.data;
  },

  // Get default addresses
  getDefaultAddresses: async (): Promise<{ shipping: UserAddress | null; billing: UserAddress | null }> => {
    const response = await accountsApiInstance.get('api/addresses/defaults/');
    return response.data;
  }
};

// Preferences API methods
export const preferencesApi = {
  // Get user preferences
  getPreferences: async (): Promise<UserPreferences> => {
    const response = await accountsApiInstance.get('api/preferences/');
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferencesData: Partial<UserPreferences>): Promise<UserPreferences> => {
    const response = await accountsApiInstance.patch('api/preferences/', preferencesData);
    return response.data;
  }
};

// Activity API methods
export const activityApi = {
  // Get activity logs
  getActivityLogs: async (filters?: Record<string, any>): Promise<ActivityLog[]> => {
    const response = await accountsApiInstance.get('api/activity-logs/', { params: filters });
    return response.data.results || response.data;
  },

  // Get specific activity
  getActivity: async (activityId: number): Promise<ActivityLog> => {
    const response = await accountsApiInstance.get(`api/activity-logs/${activityId}/`);
    return response.data;
  },

  // Get activity summary
  getActivitySummary: async (): Promise<ActivitySummary> => {
    const response = await accountsApiInstance.get('api/activity-logs/summary/');
    return response.data;
  },

  // Log custom activity
  logActivity: async (activityData: { activity_type: string; description: string; metadata?: Record<string, any> }): Promise<ActivityLog> => {
    const response = await accountsApiInstance.post('api/users/log_activity/', activityData);
    return response.data;
  }
};

// Helper functions for password reset (simpler interface)
export const requestPasswordReset = async (email: string): Promise<void> => {
  return authApi.requestPasswordReset({ email });
};

export const confirmPasswordReset = async (
  uid: string, 
  token: string, 
  new_password1: string, 
  new_password2: string
): Promise<void> => {
  return authApi.confirmPasswordReset({ uid, token, new_password1, new_password2 });
};

export const changeUserPassword = async (
  old_password: string,
  new_password1: string,
  new_password2: string
): Promise<void> => {
  return authApi.changePassword({ old_password, new_password1, new_password2 });
};

// Utility functions
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): { valid: boolean; strength: Record<string, boolean> } => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    valid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
    strength: {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial
    }
  };
};

export const validatePhoneNumber = (phone: string): boolean => {
  const re = /^\+?[1-9]\d{1,14}$/;
  return re.test(phone.replace(/\s|-/g, ''));
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
};

export default accountsApiInstance;

// Unified API export for easy imports
export const accountsApi = {
  // Authentication
  ...authApi,
  
  // Profile management
  getUserProfile: () => authApi.getCurrentUser(),
  updateUserProfile: profileApi.updateProfile,
  uploadAvatar: (formData: FormData) => {
    const file = formData.get('avatar') as File;
    return profileApi.uploadAvatar(file);
  },
  
  // Profile API methods
  getProfile: profileApi.getProfile,
  updateProfile: profileApi.updateProfile,
  removeAvatar: profileApi.removeAvatar,
  
  // Address API methods
  getAddresses: addressApi.getAddresses,
  createAddress: addressApi.createAddress,
  updateAddress: addressApi.updateAddress,
  deleteAddress: addressApi.deleteAddress,
  setDefaultAddress: addressApi.setDefaultAddress,
  
  // Preferences API methods
  getPreferences: preferencesApi.getPreferences,
  updatePreferences: preferencesApi.updatePreferences,
  
  // Activity API methods
  getActivityLogs: activityApi.getActivityLogs,
  getActivitySummary: activityApi.getActivitySummary,
  
  // Password change helper
  changePassword: changeUserPassword
};
