import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTh, faList, faBuilding, faTimes } from '@fortawesome/free-solid-svg-icons';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import Loading from '../UI/Loading/Loading';
import { fetchBrands } from '../../store/actions/storeActions';
import { productsApi, Brand } from '../../services/productsApi';
import type { AppDispatch, RootState } from '../../store/store';
import { API_PATH } from '../../backend_url';

const CategoryBrands: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [categoryBrands, setCategoryBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  
  const { brands } = useSelector((state: RootState) => state.store);

  useEffect(() => {
    const loadCategoryBrands = async () => {
      if (!categorySlug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get category name
        const categoriesResponse = await productsApi.getCategories();
        const categories = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse.results || []);
        const category = categories.find((cat: any) => {
          const catSlug = cat.slug?.toLowerCase() || cat.name.toLowerCase().replace(/\s+/g, '-');
          const catNameLower = cat.name.toLowerCase();
          const slugLower = categorySlug.toLowerCase();
          
          return catSlug === slugLower ||
                 catNameLower === slugLower ||
                 catNameLower.replace(/\s+/g, '-') === slugLower ||
                 catNameLower === slugLower.replace(/-/g, ' ') ||
                 catNameLower.includes(slugLower) ||
                 slugLower.includes(catNameLower);
        });
        
        if (category) {
          setCategoryName(category.name);
        } else {
          setCategoryName(categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1));
        }
        
        // First get all brands
        await dispatch(fetchBrands() as any);
        
        // Then filter brands that have products in this category
        try {
          const brandsInCategory = await productsApi.getBrandsInCategory(categorySlug);
          setCategoryBrands(brandsInCategory.results || brandsInCategory || []);
        } catch (brandError) {
          console.warn('Failed to load brands for category, using all brands:', brandError);
          // Fallback: use all brands if category-specific brands fail
          const allBrands = await productsApi.getBrands();
          setCategoryBrands(allBrands.results || allBrands || []);
        }
        
      } catch (err: any) {
        console.error('Error loading category brands:', err);
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

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const backendBaseUrl = API_PATH.replace('/api/', '');
    return `${backendBaseUrl}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <Loading variant="spinner" size="lg" text="Loading brands..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <FontAwesomeIcon icon={faTimes} className="text-4xl text-red-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Error Loading Brands</h3>
            <p className="mb-6 text-slate-600">{error}</p>
            <div className="flex justify-center gap-3">
              <Button variant="primary" onClick={() => navigate('/products')}>
                Back to Products
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/products')}
            icon={<FontAwesomeIcon icon={faArrowLeft} />}
          >
            All Products
          </Button>
          <span>/</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/category/${categorySlug}`)}
          >
            {categoryName}
          </Button>
          <span>/</span>
          <span className="font-medium text-slate-900">Brands</span>
        </div>

        {/* Header */}
        <Card className="p-6">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {categoryName} Brands
              </h1>
              <p className="mt-2 text-slate-600">
                Select from our top {categoryName.toLowerCase()} brands
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleViewAllProducts}
              icon={<FontAwesomeIcon icon={faTh} />}
            >
              View All {categoryName}
            </Button>
          </div>
        </Card>

        {/* Brands Grid */}
        {categoryBrands.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <FontAwesomeIcon icon={faBuilding} className="text-4xl text-slate-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">No Brands Found</h3>
            <p className="mb-6 text-slate-600">No brands available for this category yet.</p>
            <Button variant="primary" onClick={() => navigate('/products')}>
              Browse All Products
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryBrands.map(brand => (
              <Card 
                key={brand.id} 
                className="group cursor-pointer p-6 transition-all hover:shadow-md"
                onClick={() => handleBrandClick(brand.slug)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-slate-100 p-4 transition-transform group-hover:scale-105">
                    {brand.logo ? (
                      <img 
                        src={getImageUrl(brand.logo)} 
                        alt={brand.name}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <FontAwesomeIcon icon={faBuilding} className="text-4xl text-slate-400" />
                    )}
                  </div>
                  
                  <h3 className="mb-1 text-lg font-semibold text-slate-900">{brand.name}</h3>
                  
                  <p className="mb-3 text-sm text-slate-600">
                    {brand.product_count || 0} products
                  </p>
                  
                  {brand.description && (
                    <p className="mb-4 line-clamp-2 text-sm text-slate-500">
                      {brand.description}
                    </p>
                  )}
                  
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBrandClick(brand.slug);
                    }}
                  >
                    View Products
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Popular Brands Quick Access */}
        {categoryBrands.length > 5 && (
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Popular {categoryName} Brands</h3>
            <div className="flex flex-wrap gap-2">
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
          </Card>
        )}
      </div>
    </div>
  );
};

export default CategoryBrands;
