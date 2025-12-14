import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { productsApi } from '../../services/productsApi';
import type { Product } from '../../services/productsApi';

const FeaturedProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    productsApi.getFeaturedProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-slate-200 bg-white p-3">
            <div className="aspect-square rounded-md bg-slate-200" />
            <div className="mt-2 h-3 rounded bg-slate-200" />
            <div className="mt-1 h-3 w-2/3 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  // Limit to 4-6 products for a compact view
  const displayProducts = products.slice(0, 6);

  return (
    <div className="space-y-3">
      {/* Compact Grid Layout */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {displayProducts.map((product) => {
          const fixedProduct = {
            ...product,
            price: Number(product.price),
            original_price: product.original_price ? Number(product.original_price) : undefined,
            sale_price: product.original_price ? Number(product.original_price) : undefined,
            rating: product.rating ? Number(product.rating) : 0,
          };
          return (
            <div key={product.id} className="group">
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
                {/* Product Image */}
                <div className="relative mb-2 aspect-square overflow-hidden rounded-md bg-slate-100">
                  {product.picture ? (
                    <img
                      src={product.picture}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                  {product.featured && (
                    <div className="absolute right-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                      Featured
                    </div>
                  )}
                </div>
                
                {/* Product Info */}
                <div className="space-y-1">
                  <h3 
                    className="line-clamp-2 cursor-pointer text-xs font-medium text-slate-900 transition-colors hover:text-blue-600"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    {product.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      ${fixedProduct.price.toFixed(2)}
                    </span>
                    {fixedProduct.original_price && fixedProduct.original_price > fixedProduct.price && (
                      <span className="text-xs text-slate-500 line-through">
                        ${fixedProduct.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {/* Rating */}
                  {fixedProduct.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faStar} className="text-xs text-yellow-400" />
                      <span className="text-xs text-slate-600">
                        {fixedProduct.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      {products.length > displayProducts.length && (
        <div className="pt-2 text-center">
          <button
            onClick={() => navigate('/products')}
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            View All Products →
          </button>
        </div>
      )}
    </div>
  );
};

export default FeaturedProducts;
