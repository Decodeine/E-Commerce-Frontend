import axios from 'axios';
import { API_PATH } from '../backend_url';

// Types based on backend documentation
export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  description: string;
  website: string;
  founded_year: number;
  product_count: number;
}

export interface Category {
  id: number;
  name: string;
  parent?: string;
  icon: string;
  description: string;
  product_count: number;
}

export interface ProductReview {
  id: number;
  product: string;
  user: string;
  rating: number;
  title: string;
  review_text: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: Brand;
  model_number: string;
  price: string;
  original_price?: string;
  discount_percentage?: number;
  is_on_sale: boolean;
  quantity: number;
  in_stock: boolean;
  featured: boolean;
  condition: string;
  rating: string;
  review_count: number;
  release_date: string;
  warranty_months: number;
  description: string;
  picture: string;
  category: Category[];
  specifications?: Record<string, any>;
  tags: string[];
  reviews_summary?: {
    average_rating: number;
    total_reviews: number;
    rating_breakdown: Record<string, number>;
  };
  estimated_delivery?: string;
  price_history?: Array<{
    date: string;
    price: string;
  }>;
  color_variants?: Array<{
    name: string;
    hex: string;
    available: boolean;
  }>;
  eco_friendly: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface FilterParams {
  search?: string;
  brand__slug?: string;
  category__name?: string;
  condition?: string;
  featured?: boolean;
  price__gte?: number;
  price__lte?: number;
  rating__gte?: number;
  release_date__gte?: string;
  release_date__lte?: string;
  tags?: string;
  in_stock?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
  // Specifications filters
  [key: string]: any; // For specs__ prefixed filters
}

export interface WishlistItem {
  product: Product;
  added_to_wishlist: string;
}

export interface Wishlist {
  id: number;
  user: string;
  products: WishlistItem[];
  total_items: number;
  total_value: string;
  created_at: string;
}

export interface PriceAlert {
  id: number;
  user: string;
  product: string;
  target_price: string;
  is_active: boolean;
  created_at: string;
  notified_at: string | null;
}

export interface ProductComparison {
  id: number;
  user: string;
  products: Product[];
  created_at: string;
}

class ProductsAPI {
  private baseUrl = `${API_PATH}products/`;

  // Utility method to check if user is authenticated
  private isAuthenticated(token?: string): boolean {
    return !!(token && token.trim() !== '');
  }

  // Utility method to handle authentication errors
  private requireAuth(token?: string, action: string = 'perform this action'): void {
    if (!this.isAuthenticated(token)) {
      throw new Error(`Authentication required: Please login to ${action}`);
    }
  }

  // Core Product Endpoints
  async getProducts(params: FilterParams = {}): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await axios.get(`${this.baseUrl}?${searchParams}`);
    return response.data;
  }

  async getProduct(slug: string): Promise<Product> {
    const response = await axios.get(`${this.baseUrl}${slug}/`);
    return response.data;
  }

  async getProductById(id: number): Promise<Product> {
    const response = await axios.get(`${this.baseUrl}${id}/`);
    return response.data;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const response = await axios.get(`${this.baseUrl}featured/`);
    return response.data;
  }

  async getDealsProducts(): Promise<Product[]> {
    const response = await axios.get(`${this.baseUrl}deals/`);
    return response.data;
  }

  async getNewArrivals(): Promise<Product[]> {
    const response = await axios.get(`${this.baseUrl}new-arrivals/`);
    return response.data;
  }

  async getTopRated(): Promise<Product[]> {
    const response = await axios.get(`${this.baseUrl}top-rated/`);
    return response.data;
  }

  async getProductReviewsBySlug(slug: string): Promise<ProductReview[]> {
    const response = await axios.get(`${this.baseUrl}${slug}/reviews/`);
    return response.data;
  }

  async addProductReview(slug: string, reviewData: {
    rating: number;
    title: string;
    review_text: string;
  }, token: string): Promise<ProductReview> {
    const response = await axios.post(
      `${this.baseUrl}${slug}/add-review/`,
      reviewData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async getProductRecommendations(slug: string): Promise<Product[]> {
    const response = await axios.get(`${this.baseUrl}${slug}/recommendations/`);
    return response.data;
  }

  // Brand & Category Endpoints
  async getBrands(): Promise<Brand[]> {
    const response = await axios.get(`${this.baseUrl}brands/`);
    return response.data;
  }

  async getBrand(slug: string): Promise<Brand> {
    const response = await axios.get(`${this.baseUrl}brands/${slug}/`);
    return response.data;
  }

  async getBrandProducts(slug: string, params: FilterParams = {}): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await axios.get(`${this.baseUrl}brands/${slug}/products/?${searchParams}`);
    return response.data;
  }

  async getBrandProductsByCategory(brandSlug: string, categoryName: string, params: FilterParams = {}): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    
    // Add category to params if not already present
    const updatedParams = { ...params, category: categoryName };
    
    Object.entries(updatedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    console.log(`Making API call to: ${this.baseUrl}brands/${brandSlug}/products/?${searchParams}`);
    const response = await axios.get(`${this.baseUrl}brands/${brandSlug}/products/?${searchParams}`);
    console.log('API response:', response.data);
    return response.data;
  }

  async getCategories(): Promise<Category[]> {
    const response = await axios.get(`${this.baseUrl}categories/`);
    return response.data;
  }

  async getCategory(id: number): Promise<Category> {
    const response = await axios.get(`${this.baseUrl}categories/${id}/`);
    return response.data;
  }

  async getCategoryProducts(categoryName: string, params: FilterParams = {}): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    // Use the correct category products endpoint format: /api/products/categories/{categoryName}/products/
    console.log(`Making API call to: ${this.baseUrl}categories/${encodeURIComponent(categoryName)}/products/?${searchParams}`);
    const response = await axios.get(`${this.baseUrl}categories/${encodeURIComponent(categoryName)}/products/?${searchParams}`);
    console.log('API response:', response.data);
    return response.data;
  }

  // User-Specific Endpoints (Require Authentication)
  async getWishlists(token: string): Promise<Wishlist[]> {
    this.requireAuth(token, 'access your wishlists');
    
    console.log('🔍 Making wishlist request:', {
      url: `${this.baseUrl}wishlist/`,
      tokenPresent: !!token
    });
    
    // The axios interceptor will handle adding the Bearer token
    const response = await axios.get(`${this.baseUrl}wishlist/`);
    return response.data;
  }

  async createWishlist(token: string, data?: { name?: string }): Promise<Wishlist> {
    this.requireAuth(token, 'create a wishlist');
    
    const response = await axios.post(`${this.baseUrl}wishlist/`, 
      data || {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async getWishlistById(wishlistId: number, token: string): Promise<Wishlist> {
    this.requireAuth(token, 'access wishlist details');
    
    const response = await axios.get(`${this.baseUrl}wishlist/${wishlistId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async updateWishlist(wishlistId: number, data: any, token: string): Promise<Wishlist> {
    this.requireAuth(token, 'update wishlist');
    
    const response = await axios.patch(`${this.baseUrl}wishlist/${wishlistId}/`, 
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async deleteWishlist(wishlistId: number, token: string): Promise<void> {
    this.requireAuth(token, 'delete wishlist');
    
    await axios.delete(`${this.baseUrl}wishlist/${wishlistId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Admin/Staff Endpoints (if needed)
  async getInventoryAlerts(token: string): Promise<any[]> {
    const response = await axios.get(`${this.baseUrl}inventory-alerts/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getLowStockItems(token: string): Promise<any[]> {
    const response = await axios.get(`${this.baseUrl}inventory-alerts/low-stock/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  }

  // Wishlist APIs (Updated to match backend endpoints)
  // Main wishlist method for backward compatibility
  async getWishlist(token: string): Promise<Wishlist[]> {
    console.log('📋 Fetching wishlist with token:', token ? 'Present' : 'Missing');
    console.log('🔍 Token details:', {
      token: token ? `${token.substring(0, 20)}...` : 'null',
      tokenLength: token ? token.length : 0,
      authHeader: `Bearer ${token}`.substring(0, 30) + '...',
      fullToken: token // TEMPORARY: Log full token to debug
    });
    
    // Check if token looks like a JWT
    const tokenParts = token.split('.');
    console.log('🔍 Token analysis:', {
      parts: tokenParts.length,
      isJWT: tokenParts.length === 3,
      header: tokenParts[0] ? atob(tokenParts[0]) : 'invalid'
    });
    
    try {
      const result = await this.getWishlists(token);
      console.log('📋 Wishlist fetched successfully:', result);
      return result;
    } catch (error) {
      console.error('📋 Error fetching wishlist:', error);
      if (error.response) {
        console.error('📋 Response status:', error.response.status);
        console.error('📋 Response data:', error.response.data);
        console.error('📋 Response headers:', error.response.headers);
        console.error('📋 Request headers:', error.config?.headers);
      }
      throw error;
    }
  }

  async addProductToWishlist(productId: number, token: string, wishlistId?: number): Promise<any> {
    console.log('➕ Adding product to wishlist:', { productId, wishlistId });
    this.requireAuth(token, 'add items to wishlist');
    
    // Use the correct backend endpoint for adding products
    const endpoint = `${this.baseUrl}wishlist/add_product/`;
      
    console.log('➕ Making API call to:', endpoint);
    
    try {
      const response = await axios.post(endpoint, 
        { product_id: productId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('➕ Product added to wishlist successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('➕ Error adding to wishlist:', error);
      throw error;
    }
  }

  async removeProductFromWishlist(productId: number, token: string, wishlistId?: number): Promise<any> {
    console.log('➖ Removing product from wishlist:', { productId, wishlistId });
    this.requireAuth(token, 'modify your wishlist');
    
    // Use the correct backend endpoint for removing products
    const endpoint = `${this.baseUrl}wishlist/remove_product/`;
      
    console.log('➖ Making API call to:', endpoint);
    
    try {
      const response = await axios.delete(endpoint, {
        data: { product_id: productId },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('➖ Product removed from wishlist successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('➖ Error removing from wishlist:', error);
      throw error;
    }
  }

  // Check if product is in user's wishlist
  async isProductInWishlist(productId: number, token: string): Promise<boolean> {
    if (!this.isAuthenticated(token)) {
      console.log('🔍 User not authenticated, product not in wishlist');
      return false; // Not authenticated, so product is not in wishlist
    }
    
    try {
      const wishlists = await this.getWishlist(token);
      const isInWishlist = wishlists.some(wishlist => 
        wishlist.products.some(item => item.product.id === productId)
      );
      console.log('🔍 Product in wishlist check:', { productId, isInWishlist });
      return isInWishlist;
    } catch (error) {
      console.error('🔍 Error checking wishlist status:', error);
      return false;
    }
  }

  // Toggle product in wishlist (add if not present, remove if present)
  async toggleProductInWishlist(productId: number, token: string): Promise<{ added: boolean; message: string }> {
    console.log('🔄 Toggling product in wishlist:', productId);
    this.requireAuth(token, 'manage your wishlist');
    
    try {
      const isInWishlist = await this.isProductInWishlist(productId, token);
      
      if (isInWishlist) {
        await this.removeProductFromWishlist(productId, token);
        console.log('🔄 Product removed from wishlist');
        return { added: false, message: 'Product removed from wishlist' };
      } else {
        await this.addProductToWishlist(productId, token);
        console.log('🔄 Product added to wishlist');
        return { added: true, message: 'Product added to wishlist' };
      }
    } catch (error) {
      console.error('🔄 Error toggling wishlist:', error);
      throw new Error(`Failed to update wishlist: ${error}`);
    }
  }

  // Price Alerts APIs
  async getPriceAlerts(token: string): Promise<any[]> {
    const response = await axios.get(`${this.baseUrl}price-alerts/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async createPriceAlert(data: { product: number; target_price: number }, token: string): Promise<any> {
    const response = await axios.post(`${this.baseUrl}price-alerts/`, 
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async updatePriceAlert(alertId: number, data: any, token: string): Promise<any> {
    const response = await axios.patch(`${this.baseUrl}price-alerts/${alertId}/`, 
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async deletePriceAlert(alertId: number, token: string): Promise<void> {
    await axios.delete(`${this.baseUrl}price-alerts/${alertId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Product Comparison APIs
  async getProductComparisons(token: string): Promise<ProductComparison[]> {
    console.log('⚖️ Fetching product comparisons');
    this.requireAuth(token, 'access product comparisons');
    
    // The axios interceptor will handle adding the Bearer token
    const response = await axios.get(`${this.baseUrl}product-comparison/`);
    console.log('⚖️ Product comparisons fetched:', response.data);
    return response.data;
  }

  async createProductComparison(token: string): Promise<ProductComparison> {
    console.log('⚖️ Creating new product comparison');
    this.requireAuth(token, 'create product comparisons');
    
    try {
      const response = await axios.post(`${this.baseUrl}product-comparison/`, 
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('⚖️ Product comparison created:', response.data);
      return response.data;
    } catch (error) {
      console.error('⚖️ Error creating comparison:', error);
      throw error;
    }
  }

  async addProductToComparison(comparisonId: number, productId: number, token: string): Promise<any> {
    console.log('⚖️ Adding product to comparison:', { comparisonId, productId });
    this.requireAuth(token, 'add products to comparison');
    
    try {
      const response = await axios.post(`${this.baseUrl}product-comparison/${comparisonId}/add_product/`, 
        { product_id: productId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('⚖️ Product added to comparison:', response.data);
      return response.data;
    } catch (error) {
      console.error('⚖️ Error adding to comparison:', error);
      throw error;
    }
  }

  async removeProductFromComparison(comparisonId: number, productId: number, token: string): Promise<any> {
    console.log('⚖️ Removing product from comparison:', { comparisonId, productId });
    this.requireAuth(token, 'remove products from comparison');
    
    try {
      const response = await axios.delete(`${this.baseUrl}product-comparison/${comparisonId}/remove_product/`, {
        data: { product_id: productId },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('⚖️ Product removed from comparison:', response.data);
      return response.data;
    } catch (error) {
      console.error('⚖️ Error removing from comparison:', error);
      throw error;
    }
  }

  // Product Reviews APIs
  async getProductReviews(productId: number, params?: any): Promise<any> {
    const response = await axios.get(`${this.baseUrl}${productId}/reviews/`, {
      params,
    });
    return response.data;
  }

  async createReview(productId: number, data: any, token: string): Promise<any> {
    const response = await axios.post(`${this.baseUrl}${productId}/reviews/`, 
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async updateReview(productId: number, reviewId: number, data: any, token: string): Promise<any> {
    const response = await axios.patch(`${this.baseUrl}${productId}/reviews/${reviewId}/`, 
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async deleteReview(productId: number, reviewId: number, token: string): Promise<void> {
    await axios.delete(`${this.baseUrl}${productId}/reviews/${reviewId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async markReviewHelpful(productId: number, reviewId: number, token?: string): Promise<any> {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(`${this.baseUrl}${productId}/reviews/${reviewId}/helpful/`, 
      {},
      { headers }
    );
    return response.data;
  }

  // Get brands that have products in a specific category
  async getBrandsInCategory(categorySlug: string, searchQuery?: string): Promise<Brand[]> {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    
    const url = `${this.baseUrl}categories/${categorySlug}/brands/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await axios.get(url);
    return response.data.results || response.data;
  }
}

// Export singleton instance
export const productsApi = new ProductsAPI();
export default productsApi;
