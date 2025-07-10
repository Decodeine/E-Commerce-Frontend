import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTh, faList } from '@fortawesome/free-solid-svg-icons';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import { fetchBrands } from '../../store/actions/storeActions';
import { productsApi, Brand } from '../../services/productsApi';
import type { AppDispatch, RootState } from '../../store/store';
import './css/CategoryBrands.css';

const CategoryBrands: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [categoryBrands, setCategoryBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { brands } = useSelector((state: RootState) => state.store);

  useEffect(() => {
    const loadCategoryBrands = async () => {
      if (!categorySlug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // First get all brands
        await dispatch(fetchBrands());
        
        // Then filter brands that have products in this category
        // This would require a new API endpoint like:
        // GET /api/categories/{categorySlug}/brands/
        const brandsInCategory = await productsApi.getBrandsInCategory(categorySlug);
        setCategoryBrands(brandsInCategory);
        
      } catch (err: any) {
        setError(err.message || 'Failed to load brands');
      } finally {
        setLoading(false);
      }
    };

    loadCategoryBrands();
  }, [categorySlug, dispatch]);

  const handleBrandClick = (brandSlug: string) => {
    // Navigate to brand products page with category context
    navigate(`/brand/${brandSlug}?category=${categorySlug}`);
  };

  const handleViewAllProducts = () => {
    // Navigate to all products in category
    navigate(`/category/${categorySlug}`);
  };

  if (loading) {
    return (
      <div className="category-brands-loading">
        <div className="loading-spinner"></div>
        <p>Loading brands...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-brands-error">
        <h2>Error Loading Brands</h2>
        <p>{error}</p>
        <Button variant="primary" onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="category-brands-container">
      {/* Header */}
      <div className="category-brands-header">
        <Button
          variant="ghost"
          icon={faArrowLeft}
          onClick={() => navigate('/products')}
        >
          Back to Categories
        </Button>
        
        <div className="header-content">
          <h1 className="category-title">
            Choose a {categorySlug} Brand
          </h1>
          <p className="category-description">
            Select from our top {categorySlug} brands
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleViewAllProducts}
          icon={faTh}
        >
          View All {categorySlug}
        </Button>
      </div>

      {/* Brands Grid */}
      <div className="brands-grid">
        {categoryBrands.map(brand => (
          <Card 
            key={brand.id} 
            className="brand-card"
            onClick={() => handleBrandClick(brand.slug)}
          >
            <div className="brand-card-content">
              <div className="brand-logo">
                <img 
                  src={brand.logo || '/images/brand-placeholder.png'} 
                  alt={brand.name}
                />
              </div>
              <div className="brand-info">
                <h3 className="brand-name">{brand.name}</h3>
                <p className="brand-product-count">
                  {brand.product_count} products
                </p>
                <p className="brand-description">
                  {brand.description?.slice(0, 100)}...
                </p>
              </div>
              <div className="brand-actions">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrandClick(brand.slug);
                  }}
                >
                  View Products
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Popular Brands Quick Access */}
      <div className="popular-brands">
        <h3>Popular in {categorySlug}</h3>
        <div className="popular-brands-list">
          {categoryBrands.slice(0, 5).map(brand => (
            <Button
              key={brand.id}
              variant="outline"
              size="sm"
              onClick={() => handleBrandClick(brand.slug)}
            >
              {brand.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBrands;
