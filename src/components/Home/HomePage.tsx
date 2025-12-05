import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faShippingFast,
  faUndo,
  faShieldAlt,
  faHeadset,
  faStar,
  faHeart,
  faEye,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import ProductCard from '../Products/ProductCard';
import FeaturedProducts from '../Products/FeaturedProducts';
import Newsletter from '../Misc/Newsletter';
import { fetchCategories } from '../../store/actions/storeActions';
import { AppDispatch } from '../../store/store';
import { productsApi } from '../../services/productsApi';

// Use the Product type from productsApi
import type { Product } from '../../services/productsApi';


const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load categories into Redux store
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch featured hero products from API
  useEffect(() => {
    setIsLoading(true);
    productsApi.getFeaturedProducts()
      .then((products) => {
        setHeroProducts(products);
      })
      .catch((error) => {
        console.error('Failed to fetch featured products:', error);
        setHeroProducts([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const featuredCategories = [
    {
      id: 1,
      name: "Smartphones",
      slug: "smartphones",
      image: "/images/categories/smartphones.jpg",
      productCount: 156,
      color: "#667eea"
    },
    {
      id: 2,
      name: "Laptops",
      slug: "laptops",
      image: "/images/categories/laptops.jpg",
      productCount: 89,
      color: "#764ba2"
    },
    {
      id: 3,
      name: "Audio & Headphones",
      slug: "audio",
      image: "/images/categories/audio.jpg",
      productCount: 234,
      color: "#f093fb"
    },
    {
      id: 4,
      name: "Gaming",
      slug: "gaming",
      image: "/images/categories/gaming.jpg",
      productCount: 178,
      color: "#4facfe"
    }
  ];

  const keyFeatures = [
    {
      icon: faShippingFast,
      title: "Free Shipping",
      description: "Free delivery on orders over $50"
    },
    {
      icon: faUndo,
      title: "Easy Returns",
      description: "30-day hassle-free returns"
    },
    {
      icon: faShieldAlt,
      title: "Secure Payment",
      description: "Your payment info is safe"
    },
    {
      icon: faHeadset,
      title: "24/7 Support",
      description: "Round-the-clock customer service"
    }
  ];

  const handleCategoryClick = (slug: string) => {
    // Navigate to hierarchical brand selection instead of direct products
    navigate(`/category/${slug}/brands`);
  };

  const handleSearchProducts = () => {
    navigate('/products');
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-16 pt-6 md:pt-10">
        {/* Hero */}
        <section className="grid items-start gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              Your trusted tech marketplace
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Discover Amazing{" "}
              <span className="bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
                Tech Products
              </span>
            </h1>
            <p className="max-w-xl text-sm text-slate-600 md:text-base">
              Shop the latest smartphones, laptops, audio gear, and gaming devices with
              unbeatable prices and fast, free shipping on orders over $50.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSearchProducts}
                icon={<FontAwesomeIcon icon={faSearch} />}
              >
                Shop Now
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleViewAllProducts}
                icon={<FontAwesomeIcon icon={faEye} />}
              >
                Browse All
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-slate-700">
              <div>
                <div className="text-lg font-semibold text-slate-900">10K+</div>
                <div className="text-slate-500">Products</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">50K+</div>
                <div className="text-slate-500">Happy customers</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-lg font-semibold text-slate-900">
                  4.8
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                </div>
                <div className="text-slate-500">Average rating</div>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="relative w-full" style={{ height: '500px' }}>
              {isLoading ? (
                <div className="absolute right-0 top-0 flex items-start">
                  <div className="flex gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-96 w-64 rounded-xl bg-slate-200" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : heroProducts.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50 p-8 shadow-sm">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-blue-600">Featured</div>
                    <div className="text-2xl font-bold text-slate-900">Latest Tech</div>
                    <div className="text-sm text-slate-600">Discover our handpicked selection</div>
                  </div>
                </div>
              ) : (
                heroProducts.slice(0, 3).map((product, index) => {
                  const fixedProduct = {
                    ...product,
                    price: Number(product.price),
                    original_price: product.original_price ? Number(product.original_price) : undefined,
                    rating: product.rating ? Number(product.rating) : 0,
                  };

                  // Calculate rotation and offset for fan effect - organized spread from top
                  const rotation = (index - 1) * 6; // -6, 0, 6 degrees (less rotation)
                  const rightOffset = index * 28; // 0, 28, 56px from right (better spacing)
                  const topOffset = index * 20; // 0, 20, 40px from top (organized spread)
                  const zIndex = 10 - index; // Higher z-index for cards on top

                  return (
                    <div
                      key={product.id}
                      className="group absolute cursor-pointer transition-all duration-500 ease-out"
                      style={{
                        right: `${rightOffset}px`,
                        top: `${topOffset}px`,
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: 'top center',
                        zIndex: zIndex,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'rotate(0deg) translateY(-30px) scale(1.12)';
                        e.currentTarget.style.zIndex = '50';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = `rotate(${rotation}deg)`;
                        e.currentTarget.style.zIndex = `${zIndex}`;
                      }}
                      onClick={() => navigate(`/product/${product.slug}`)}
                    >
                      <div className="h-96 w-64 rounded-xl border-2 border-slate-200 bg-white p-5 shadow-lg transition-all duration-500 group-hover:border-blue-300 group-hover:shadow-2xl overflow-hidden flex flex-col">
                        {/* Product Image - Portrait */}
                        <div className="relative mb-3 h-56 w-full flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {product.picture ? (
                            <img
                              src={product.picture}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                // Fallback if image fails to load
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="hidden h-full w-full items-center justify-center text-slate-400"
                            style={{ display: product.picture ? 'none' : 'flex' }}
                          >
                            <span className="text-5xl">📦</span>
                          </div>
                          {product.featured && (
                            <div className="absolute right-2 top-2 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
                              Featured
                            </div>
                          )}
                        </div>

                        {/* Product Info - Flex to fill remaining space */}
                        <div className="flex flex-col flex-1 min-h-0 space-y-1.5 overflow-hidden">
                          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600 leading-tight">
                            {product.name}
                          </h3>
                          {product.brand && (
                            <p className="text-xs font-medium text-slate-600 truncate">
                              {typeof product.brand === 'object' ? product.brand.name : product.brand}
                            </p>
                          )}
                          <div className="flex flex-col gap-1 mt-auto">
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-base font-bold text-slate-900">
                                ${fixedProduct.price.toFixed(2)}
                              </span>
                              {fixedProduct.original_price && fixedProduct.original_price > fixedProduct.price && (
                                <span className="text-xs text-slate-500 line-through">
                                  ${fixedProduct.original_price.toFixed(2)}
                                </span>
                              )}
                            </div>
                            {fixedProduct.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <FontAwesomeIcon icon={faStar} className="text-xs text-yellow-400" />
                                <span className="text-xs font-semibold text-slate-700">
                                  {fixedProduct.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Shop by Category
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Find exactly what you're looking for
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                id: 1,
                name: "Smartphones",
                slug: "smartphones",
                icon: "📱"
              },
              {
                id: 2,
                name: "Laptops",
                slug: "laptops",
                icon: "💻"
              },
              {
                id: 3,
                name: "Audio",
                slug: "audio",
                icon: "🎧"
              },
              {
                id: 4,
                name: "Gaming",
                slug: "gaming",
                icon: "🎮"
              }
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className="group flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:border-blue-600 hover:shadow-md"
              >
                <div className="text-4xl">{category.icon}</div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                  {category.name}
                </h3>
              </button>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Featured Products
            </h2>
          </div>
          <FeaturedProducts />
        </section>

        {/* Key features */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Why shop with us
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Experience the difference with our premium service
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {keyFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FontAwesomeIcon icon={feature.icon} className="text-lg" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust / social proof */}
        <section>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">4.8/5</div>
                  <p className="mt-1 text-xs text-slate-600">Average Rating</p>
                  <div className="mt-2 flex justify-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">50,000+</div>
                  <p className="mt-1 text-xs text-slate-600">Happy Customers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">99.9%</div>
                  <p className="mt-1 text-xs text-slate-600">Uptime</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="italic">
                  "Amazing product quality and super fast shipping. This is now my go‑to store for all
                  tech needs!"
                </p>
                <p className="text-xs font-medium text-slate-600">
                  — Sarah M., Verified Customer
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section>
          <Newsletter />
        </section>
      </main>
    </div>
  );
};

export default HomePage;
