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

  // Core Product Endpoints
  async getProducts(params: FilterParams = {}): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await axios.get(`${this.baseUrl}products/?${searchParams}`);
    return response.data;
  }

  async getProduct(slug: string): Promise<Product> {
    const response = await axios.get(`${this.baseUrl}products/${slug}/`);
    return response.data;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const response = await axios.get(`${this.baseUrl}products/featured/`);
    return response.data;
  }

  async getDealsProducts(): Promise<Product[]> {
    const response = await axios.get(`${this.baseUrl}products/deals/`);
    return response.data;
  }

  async getNewArrivals(): Promise<Product[]> {
    const response = await axios.get(`${this.baseUrl}products/new-arrivals/`);
    return response.data;
  }

  async getTopRated(): Promise<Product[]> {
    const response = await axios.get(`${this.baseUrl}products/top-rated/`);
    return response.data;
  }

  async getProductReviewsBySlug(slug: string): Promise<ProductReview[]> {
    const response = await axios.get(`${this.baseUrl}products/${slug}/reviews/`);
    return response.data;
  }

  async addProductReview(slug: string, reviewData: {
    rating: number;
    title: string;
    review_text: string;
  }, token: string): Promise<ProductReview> {
    const response = await axios.post(
      `${this.baseUrl}products/${slug}/add-review/`,
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
    const response = await axios.get(`${this.baseUrl}products/${slug}/recommendations/`);
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

  async getCategories(): Promise<Category[]> {
    const response = await axios.get(`${this.baseUrl}categories/`);
    return response.data;
  }

  async getCategory(id: number): Promise<Category> {
    const response = await axios.get(`${this.baseUrl}categories/${id}/`);
    return response.data;
  }

  // User-Specific Endpoints (Require Authentication)
  async getWishlists(token: string): Promise<Wishlist[]> {
    const response = await axios.get(`${this.baseUrl}wishlist/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
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

  // Wishlist APIs
  async getWishlist(token: string): Promise<any[]> {
    const response = await axios.get(`${this.baseUrl}wishlist/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async addToWishlist(productId: number, token: string): Promise<any> {
    const response = await axios.post(`${this.baseUrl}wishlist/`, 
      { product: productId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async removeFromWishlist(wishlistItemId: number, token: string): Promise<void> {
    await axios.delete(`${this.baseUrl}wishlist/${wishlistItemId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async updateWishlistItem(wishlistItemId: number, data: any, token: string): Promise<any> {
    const response = await axios.patch(`${this.baseUrl}wishlist/${wishlistItemId}/`, 
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
  async getComparison(productIds: number[]): Promise<any[]> {
    const response = await axios.get(`${this.baseUrl}compare/`, {
      params: {
        products: productIds.join(','),
      },
    });
    return response.data;
  }

  async addToComparison(productId: number): Promise<any> {
    const response = await axios.post(`${this.baseUrl}compare/add/`, {
      product: productId,
    });
    return response.data;
  }

  async removeFromComparison(productId: number): Promise<void> {
    await axios.post(`${this.baseUrl}compare/remove/`, {
      product: productId,
    });
  }

  async clearComparison(): Promise<void> {
    await axios.post(`${this.baseUrl}compare/clear/`);
  }

  // Product Reviews APIs
  async getProductReviews(productId: number, params?: any): Promise<any> {
    const response = await axios.get(`${this.baseUrl}products/${productId}/reviews/`, {
      params,
    });
    return response.data;
  }

  async createReview(productId: number, data: any, token: string): Promise<any> {
    const response = await axios.post(`${this.baseUrl}products/${productId}/reviews/`, 
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
    const response = await axios.patch(`${this.baseUrl}products/${productId}/reviews/${reviewId}/`, 
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
    await axios.delete(`${this.baseUrl}products/${productId}/reviews/${reviewId}/`, {
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

    const response = await axios.post(`${this.baseUrl}products/${productId}/reviews/${reviewId}/helpful/`, 
      {},
      { headers }
    );
    return response.data;
  }
}

// Export singleton instance
export const productsApi = new ProductsAPI();
export default productsApi;
