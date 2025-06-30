import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartApi } from '../services';

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    picture: string;
    brand: {
      id: number;
      name: string;
      slug: string;
    };
    in_stock: boolean;
    quantity: number;
  };
  quantity: number;
  unit_price: string;
  total_price: string;
  savings: string;
  added_at: string;
  updated_at: string;
}

interface CartData {
  id: number;
  items: CartItem[];
  total_items: number;
  subtotal: string;
  total_weight: string;
  total_savings: string;
  created_at: string;
  updated_at: string;
}

interface CartContextType {
  cartData: CartData | null;
  loading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItemQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
  getSubtotal: () => string;
  calculateShipping: () => Promise<number>;
  calculateTax: () => Promise<number>;
  calculateTotal: () => Promise<number>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartApi.getCart();
      setCartData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cart');
      console.error('Failed to refresh cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId: number, quantity: number = 1) => {
    try {
      setError(null);
      await cartApi.addItem(productId, quantity);
      await refreshCart();
    } catch (err: any) {
      setError(err.message || 'Failed to add item to cart');
      throw err;
    }
  };

  const updateItemQuantity = async (productId: number, quantity: number) => {
    try {
      setError(null);
      
      // Optimistic update
      setCartData(prevCart => {
        if (!prevCart) return prevCart;
        
        const updatedItems = prevCart.items.map(item => {
          if (item.product.id === productId) {
            const unitPrice = parseFloat(item.unit_price);
            return {
              ...item,
              quantity: quantity,
              total_price: (unitPrice * quantity).toFixed(2)
            };
          }
          return item;
        });
        
        const newSubtotal = updatedItems.reduce((sum, item) => 
          sum + parseFloat(item.total_price), 0
        );
        
        return {
          ...prevCart,
          items: updatedItems,
          subtotal: newSubtotal.toFixed(2),
          total_items: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        };
      });

      await cartApi.updateItemQuantity(productId, quantity);
      await refreshCart(); // Refresh with server data
    } catch (err: any) {
      await refreshCart(); // Revert on error
      setError(err.message || 'Failed to update item quantity');
      throw err;
    }
  };

  const removeItem = async (productId: number) => {
    try {
      setError(null);
      await cartApi.removeItem(productId);
      await refreshCart();
    } catch (err: any) {
      setError(err.message || 'Failed to remove item from cart');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      await cartApi.clearCart();
      setCartData(null);
    } catch (err: any) {
      setError(err.message || 'Failed to clear cart');
      throw err;
    }
  };

  const getItemCount = (): number => {
    return cartData ? cartData.total_items : 0;
  };

  const getSubtotal = (): string => {
    return cartData ? cartData.subtotal : '0.00';
  };

  const calculateShipping = async (): Promise<number> => {
    if (!cartData) return 0;
    try {
      const result = await cartApi.calculateShipping('standard', {});
      return typeof result === 'number' ? result : parseFloat(result.amount || '0');
    } catch (error) {
      console.error('Error calculating shipping:', error);
      return 0;
    }
  };

  const calculateTax = async (): Promise<number> => {
    if (!cartData) return 0;
    try {
      const result = await cartApi.calculateTax({ subtotal: cartData.subtotal });
      return typeof result === 'number' ? result : parseFloat(result.amount || '0');
    } catch (error) {
      console.error('Error calculating tax:', error);
      return 0;
    }
  };

  const calculateTotal = async (): Promise<number> => {
    if (!cartData) return 0;
    try {
      const subtotal = parseFloat(cartData.subtotal);
      const shipping = await calculateShipping();
      const tax = await calculateTax();
      return subtotal + shipping + tax;
    } catch (error) {
      console.error('Error calculating total:', error);
      return parseFloat(cartData.subtotal);
    }
  };

  // Initialize cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  // Auto-refresh cart every 5 minutes to sync with server
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refreshCart();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [loading]);

  const value: CartContextType = {
    cartData,
    loading,
    error,
    refreshCart,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    getItemCount,
    getSubtotal,
    calculateShipping,
    calculateTax,
    calculateTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
