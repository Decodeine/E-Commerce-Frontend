// Debug utility for API testing
import { productsApi } from '../services/productsApi';

export class APIDebugger {
  static async testWishlistAPI(token: string) {
    console.group('🔧 Testing Wishlist API');
    
    try {
      console.log('1. Testing getWishlist...');
      const wishlists = await productsApi.getWishlist(token);
      console.log('✅ getWishlist success:', wishlists);
      
      console.log('2. Testing addProductToWishlist...');
      const addResult = await productsApi.addProductToWishlist(1, token);
      console.log('✅ addProductToWishlist success:', addResult);
      
      console.log('3. Testing isProductInWishlist...');
      const isInWishlist = await productsApi.isProductInWishlist(1, token);
      console.log('✅ isProductInWishlist success:', isInWishlist);
      
    } catch (error) {
      console.error('❌ Wishlist API test failed:', error);
    }
    
    console.groupEnd();
  }
  
  static async testComparisonAPI(token: string) {
    console.group('🔧 Testing Comparison API');
    
    try {
      console.log('1. Testing getProductComparisons...');
      const comparisons = await productsApi.getProductComparisons(token);
      console.log('✅ getProductComparisons success:', comparisons);
      
      if (comparisons.length === 0) {
        console.log('2. Creating new comparison...');
        const newComparison = await productsApi.createProductComparison(token);
        console.log('✅ createProductComparison success:', newComparison);
      }
      
    } catch (error) {
      console.error('❌ Comparison API test failed:', error);
    }
    
    console.groupEnd();
  }
  
  static async testAuthentication() {
    console.group('🔧 Testing Authentication');
    
    // Check localStorage for token
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'Present' : 'Missing');
    
    // Check Redux store
    const reduxState = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    if (reduxState) {
      console.log('Redux DevTools available');
    }
    
    console.groupEnd();
  }
}

// Make it available globally for debugging
(window as any).APIDebugger = APIDebugger;

export default APIDebugger;
