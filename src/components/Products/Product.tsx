import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addProductToCart,
  removeProductFromCart
} from "../../store/actions/storeActions";
import ProductCard from "./ProductCard";

// Type definitions for the legacy product item structure
interface ProductItem {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  picture: string;
  quantity: number;
  sale_price?: number;
  rating?: number;
  reviews_count?: number;
  [key: string]: any;
}

interface ProductProps {
  item: ProductItem;
}

const Product: React.FC<ProductProps> = ({ item }) => {
  const dispatch = useDispatch();
  const cart = useSelector((state: any) => state.store.cart);

  // Check if product is in cart
  const inCart = () => {
    const res = cart.find((e: ProductItem) => e.id === item.id);
    return res ? res.quantity : 0;
  };

  // Convert legacy item structure to modern product structure for ProductCard
  const product = {
    id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
    name: item.name,
    slug: item.slug,
    price: item.price,
    sale_price: item.sale_price,
    image: item.picture,
    rating: item.rating,
    reviews_count: item.reviews_count,
    in_stock: item.quantity > 0
  };

  const handleAddToCart = (productId: number) => {
    dispatch(addProductToCart(item, 1));
  };

  const handleToggleWishlist = (productId: number) => {
    // TODO: Implement wishlist functionality when available
    console.log('Wishlist toggle for product:', productId);
  };

  return (
    <ProductCard
      product={product}
      onAddToCart={handleAddToCart}
      onToggleWishlist={handleToggleWishlist}
      isInWishlist={false} // TODO: Implement wishlist state when available
    />
  );
};

export default Product;