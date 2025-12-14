import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLaptop, 
  faMobileAlt, 
  faHeadphones, 
  faGamepad,
  faTv,
  faCamera,
  faTabletAlt,
  faDesktop,
  faKeyboard,
  faMouse,
  faFilter,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import Button from '../UI/Button/Button';

interface Category {
  id: string;
  name: string;
  icon: any;
  count?: number;
  subcategories?: Category[];
}

const CategoryNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Extract current category from URL path
  const getCurrentCategory = () => {
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'category' && pathParts[2]) {
      return pathParts[2];
    }
    if (pathParts[1] === 'brand' && pathParts[3] === 'category' && pathParts[4]) {
      return pathParts[4];
    }
    // Fallback to search params for backward compatibility
    return searchParams.get('category');
  };

  const getCurrentBrand = () => {
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'brand' && pathParts[2]) {
      return pathParts[2];
    }
    return null;
  };

  const currentCategory = getCurrentCategory();
  const currentBrand = getCurrentBrand();
  const currentSubcategory = searchParams.get('subcategory');

  const categories: Category[] = [
    {
      id: 'laptops',
      name: 'Laptops',
      icon: faLaptop,
      subcategories: [
        { id: 'gaming-laptops', name: 'Gaming Laptops', icon: faGamepad },
        { id: 'business-laptops', name: 'Business Laptops', icon: faDesktop },
        { id: 'ultrabooks', name: 'Ultrabooks', icon: faLaptop }
      ]
    },
    {
      id: 'smartphones',
      name: 'Smartphones',
      icon: faMobileAlt,
      subcategories: [
        { id: 'android', name: 'Android', icon: faMobileAlt },
        { id: 'iphone', name: 'iPhone', icon: faMobileAlt }
      ]
    },
    {
      id: 'tablets',
      name: 'Tablets',
      icon: faTabletAlt,
      subcategories: [
        { id: 'ipad', name: 'iPad', icon: faTabletAlt },
        { id: 'android-tablets', name: 'Android Tablets', icon: faTabletAlt }
      ]
    },
    {
      id: 'audio',
      name: 'Audio & Headphones',
      icon: faHeadphones,
      subcategories: [
        { id: 'headphones', name: 'Headphones', icon: faHeadphones },
        { id: 'earbuds', name: 'Earbuds', icon: faHeadphones },
        { id: 'speakers', name: 'Speakers', icon: faTv }
      ]
    },
    {
      id: 'gaming',
      name: 'Gaming',
      icon: faGamepad,
      subcategories: [
        { id: 'consoles', name: 'Consoles', icon: faGamepad },
        { id: 'gaming-accessories', name: 'Accessories', icon: faKeyboard }
      ]
    },
    {
      id: 'accessories',
      name: 'Accessories',
      icon: faKeyboard,
      subcategories: [
        { id: 'keyboards', name: 'Keyboards', icon: faKeyboard },
        { id: 'mice', name: 'Mice', icon: faMouse },
        { id: 'monitors', name: 'Monitors', icon: faTv },
        { id: 'cameras', name: 'Cameras', icon: faCamera }
      ]
    }
  ];

  const handleCategoryClick = (categoryId: string, subcategoryId?: string, viewType: 'products' | 'brands' = 'products') => {
    const actualCategoryId = subcategoryId || categoryId;
    
    // If we're currently viewing a brand and clicking a category, navigate to brand+category
    if (currentBrand && viewType === 'products') {
      navigate(`/brand/${currentBrand}/category/${actualCategoryId}`);
    } else if (subcategoryId) {
      // For subcategories, navigate to the subcategory route
      if (viewType === 'brands') {
        navigate(`/category/${subcategoryId}/brands`);
      } else {
        navigate(`/category/${subcategoryId}`);
      }
    } else {
      // For main categories, navigate to the category route
      if (viewType === 'brands') {
        navigate(`/category/${categoryId}/brands`);
      } else {
        navigate(`/category/${categoryId}`);
      }
    }
    setShowMobileMenu(false);
  };

  const clearFilters = () => {
    navigate('/products');
    setShowMobileMenu(false);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const CategoryItem: React.FC<{ category: Category; isSubcategory?: boolean }> = ({ 
    category, 
    isSubcategory = false 
  }) => {
    const isActive = isSubcategory 
      ? currentSubcategory === category.id
      : currentCategory === category.id;
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedCategory === category.id;

    return (
      <div className={`category-item ${isSubcategory ? 'subcategory' : ''}`}>
        <button
          className={`category-button ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (hasSubcategories && !isSubcategory) {
              toggleCategory(category.id);
            } else {
              handleCategoryClick(
                isSubcategory ? (currentCategory || '') : category.id,
                isSubcategory ? category.id : undefined,
                'products'
              );
            }
          }}
        >
          <div className="category-content">
            <FontAwesomeIcon icon={category.icon} className="category-icon" />
            <span className="category-name">{category.name}</span>
            {category.count && (
              <span className="category-count">({category.count})</span>
            )}
          </div>
          {hasSubcategories && !isSubcategory && (
            <FontAwesomeIcon 
              icon={faChevronDown} 
              className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
            />
          )}
        </button>

        {/* Brand Navigation Button for main categories */}
        {!isSubcategory && (
          <button
            className="brands-button"
            onClick={() => handleCategoryClick(category.id, undefined, 'brands')}
            title={`View brands in ${category.name}`}
          >
            View Brands
          </button>
        )}

        {hasSubcategories && isExpanded && (
          <div className="subcategories">
            {category.subcategories!.map(subcategory => (
              <CategoryItem 
                key={subcategory.id} 
                category={subcategory} 
                isSubcategory 
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="category-navigation">
      {/* Mobile Menu Toggle */}
      <Button
        variant="outline"
        size="sm"
        icon={faFilter}
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="mobile-menu-toggle"
      >
        Categories
      </Button>

      {/* Categories List */}
      <div className={`categories-container ${showMobileMenu ? 'show-mobile' : ''}`}>
        <div className="categories-header">
          <h3>Categories</h3>
          {(currentCategory || currentSubcategory) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="clear-filters"
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="categories-list">
          {categories.map(category => (
            <CategoryItem key={category.id} category={category} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCategoryClick('featured')}
            className={currentCategory === 'featured' ? 'active' : ''}
          >
            Featured Products
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCategoryClick('deals')}
            className={currentCategory === 'deals' ? 'active' : ''}
          >
            Hot Deals
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCategoryClick('new')}
            className={currentCategory === 'new' ? 'active' : ''}
          >
            New Arrivals
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {showMobileMenu && (
        <div 
          className="mobile-overlay"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </div>
  );
};

export default CategoryNavigation;
