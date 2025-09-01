import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ProductCard from "./ProductCard";
import { addProductToCart } from "../../store/actions/storeActions";
import { productsApi } from "../../services/productsApi";

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
  const token = localStorage.getItem("authToken") || "";

  const [isInWishlist, setIsInWishlist] = useState(false);

  // Check if product is in cart
  const inCart = () => {
    const res = cart.find((e: ProductItem) => e.id === item.id);
    return res ? res.quantity : 0;
  };

  // Convert legacy item structure
  const product = {
    id: typeof item.id === "string" ? parseInt(item.id) : item.id,
    name: item.name,
    slug: item.slug,
    price: item.price,
    sale_price: item.sale_price,
    image: item.picture,
    rating: item.rating,
    reviews_count: item.reviews_count,
    in_stock: item.quantity > 0,
  };

  useEffect(() => {
    if (token) {
      const checkWishlist = async () => {
        const inWishlist = await productsApi.isProductInWishlist(product.id, token);
        setIsInWishlist(inWishlist);
      };
      checkWishlist();
    }
  }, [product.id, token]);

  const handleAddToCart = (productId: number) => {
    dispatch(addProductToCart(item, 1));
  };

  const handleToggleWishlist = async (productId: number) => {
    if (!token) return;

    try {
      const result = await productsApi.toggleProductInWishlist(productId, token);
      setIsInWishlist(result.added); // Update local state
    } catch (err) {
      console.error("Error toggling wishlist", err);
    }
  };

  return (
    <ProductCard
      product={product}
      onAddToCart={handleAddToCart}
      onToggleWishlist={handleToggleWishlist}
      isInWishlist={isInWishlist}
    />
  );
};

export default Product;
