import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter, 
  faSearch, 
  faTimes, 
  faChevronDown,
  faChevronUp,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import { fetchBrands, fetchCategories, setFilters } from '../../store/actions/storeActions';
import { FilterParams } from '../../services/productsApi';
import type { AppDispatch } from '../../store/store';
import './css/ProductFilters.css';

interface ProductFiltersProps {
  onFiltersChange: (filters: FilterParams) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  onFiltersChange,
  isOpen,
  onToggle
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { brands, categories, filters } = useSelector((state: any) => state.store);
  
  const [localFilters, setLocalFilters] = useState<FilterParams>({});
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    price: true,
    brands: true,
    categories: true,
    rating: true,
    features: true
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchBrands());
        await dispatch(fetchCategories());
      } catch (error) {
        console.error('Error loading filter data:', error);
      }
    };
    
    loadData();
  }, [dispatch]);

  useEffect(() => {
    setLocalFilters(filters || {});
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...(localFilters || {}), [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    const filtersToApply = localFilters || {};
    dispatch(setFilters(filtersToApply));
    onFiltersChange(filtersToApply);
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    dispatch(setFilters(clearedFilters));
    onFiltersChange(clearedFilters);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={i < rating ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  const popularTags = [
    '5G', 'wireless-charging', 'face-id', 'waterproof', 
    'bluetooth', 'fast-charging', 'dual-camera', 'fingerprint'
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'refurbished', label: 'Refurbished' },
    { value: 'used', label: 'Used' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: '-name', label: 'Name (Z-A)' },
    { value: 'price', label: 'Price (Low to High)' },
    { value: '-price', label: 'Price (High to Low)' },
    { value: '-rating', label: 'Highest Rated' },
    { value: '-review_count', label: 'Most Reviews' },
    { value: '-release_date', label: 'Newest First' },
    { value: 'release_date', label: 'Oldest First' }
  ];

  return (
    <div className={`product-filters ${isOpen ? 'product-filters--open' : ''}`}>
      <Card className="filters-card" padding="lg">
        <div className="filters-header">
          <h3 className="filters-title">
            <FontAwesomeIcon icon={faFilter} />
            Filters
          </h3>
          <div className="filters-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="clear-filters-btn"
            >
              Clear All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="toggle-filters-btn"
              icon={isOpen ? faChevronUp : faChevronDown}
            >
              {isOpen ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>

        <div className="filters-content">
          {/* Search Filter */}
          <div className="filter-section">
            <div className="search-filter">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={(localFilters || {}).search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="search-input"
              />
              {(localFilters || {}).search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="clear-search-btn"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
          </div>

          {/* Sort Filter */}
          <div className="filter-section">
            <label className="filter-label">Sort by</label>
            <select
              value={(localFilters || {}).ordering || ''}
              onChange={(e) => handleFilterChange('ordering', e.target.value)}
              className="filter-select"
            >
              <option value="">Default</option>
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <button
              className="section-toggle"
              onClick={() => toggleSection('price')}
            >
              <span>Price Range</span>
              <FontAwesomeIcon 
                icon={expandedSections.price ? faChevronUp : faChevronDown} 
              />
            </button>
            {expandedSections.price && (
              <div className="filter-content">
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={(localFilters || {}).price__gte || ''}
                    onChange={(e) => handleFilterChange('price__gte', e.target.value)}
                    className="price-input"
                  />
                  <span className="price-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={(localFilters || {}).price__lte || ''}
                    onChange={(e) => handleFilterChange('price__lte', e.target.value)}
                    className="price-input"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rating Filter */}
          <div className="filter-section">
            <button
              className="section-toggle"
              onClick={() => toggleSection('rating')}
            >
              <span>Minimum Rating</span>
              <FontAwesomeIcon 
                icon={expandedSections.rating ? faChevronUp : faChevronDown} 
              />
            </button>
            {expandedSections.rating && (
              <div className="filter-content">
                {[4, 3, 2, 1].map(rating => (
                  <label key={rating} className="rating-option">
                    <input
                      type="radio"
                      name="rating"
                      value={rating}
                      checked={(localFilters || {}).rating__gte === rating}
                      onChange={(e) => handleFilterChange('rating__gte', Number(e.target.value))}
                    />
                    <span className="rating-display">
                      {renderStars(rating)} & up
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Brands Filter */}
          <div className="filter-section">
            <button
              className="section-toggle"
              onClick={() => toggleSection('brands')}
            >
              <span>Brands</span>
              <FontAwesomeIcon 
                icon={expandedSections.brands ? faChevronUp : faChevronDown} 
              />
            </button>
            {expandedSections.brands && (
              <div className="filter-content">
                {(Array.isArray(brands) ? brands : []).slice(0, 10).map((brand: any) => (
                  <label key={brand.slug} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={(localFilters || {}).brand__slug?.split(',').includes(brand.slug) || false}
                      onChange={(e) => {
                        const filters = localFilters || {};
                        const currentBrands = filters.brand__slug ? filters.brand__slug.split(',') : [];
                        const newBrands = e.target.checked
                          ? [...currentBrands, brand.slug]
                          : currentBrands.filter(b => b !== brand.slug);
                        handleFilterChange('brand__slug', newBrands.join(','));
                      }}
                    />
                    <span className="checkbox-label">
                      {brand.name} ({brand.product_count || 0})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Categories Filter */}
          <div className="filter-section">
            <button
              className="section-toggle"
              onClick={() => toggleSection('categories')}
            >
              <span>Categories</span>
              <FontAwesomeIcon 
                icon={expandedSections.categories ? faChevronUp : faChevronDown} 
              />
            </button>
            {expandedSections.categories && (
              <div className="filter-content">
                {(Array.isArray(categories) ? categories : []).slice(0, 10).map((category: any) => (
                  <label key={category.id} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={(localFilters || {}).category__name?.split(',').includes(category.name) || false}
                      onChange={(e) => {
                        const filters = localFilters || {};
                        const currentCategories = filters.category__name ? filters.category__name.split(',') : [];
                        const newCategories = e.target.checked
                          ? [...currentCategories, category.name]
                          : currentCategories.filter(c => c !== category.name);
                        handleFilterChange('category__name', newCategories.join(','));
                      }}
                    />
                    <span className="checkbox-label">
                      {category.name} ({category.product_count || 0})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Features/Tags Filter */}
          <div className="filter-section">
            <button
              className="section-toggle"
              onClick={() => toggleSection('features')}
            >
              <span>Features</span>
              <FontAwesomeIcon 
                icon={expandedSections.features ? faChevronUp : faChevronDown} 
              />
            </button>
            {expandedSections.features && (
              <div className="filter-content">
                <div className="tags-grid">
                  {popularTags.map(tag => (
                    <button
                      key={tag}
                      className={`tag-button ${
                        (localFilters || {}).tags?.split(',').includes(tag) ? 'tag-button--active' : ''
                      }`}
                      onClick={() => {
                        const filters = localFilters || {};
                        const currentTags = filters.tags ? filters.tags.split(',').filter(t => t) : [];
                        const newTags = currentTags.includes(tag)
                          ? currentTags.filter(t => t !== tag)
                          : [...currentTags, tag];
                        handleFilterChange('tags', newTags.join(','));
                      }}
                    >
                      {tag.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Condition Filter */}
          <div className="filter-section">
            <label className="filter-label">Condition</label>
            <select
              value={(localFilters || {}).condition || ''}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="filter-select"
            >
              <option value="">All Conditions</option>
              {conditions.map(condition => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="filter-section">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={(localFilters || {}).in_stock || false}
                onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
              />
              <span className="checkbox-label">In Stock Only</span>
            </label>
          </div>

          {/* Featured Filter */}
          <div className="filter-section">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={(localFilters || {}).featured || false}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
              />
              <span className="checkbox-label">Featured Products Only</span>
            </label>
          </div>

          {/* Apply Filters Button */}
          <div className="filter-actions">
            <Button
              variant="primary"
              fullWidth
              onClick={applyFilters}
              className="apply-filters-btn"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductFilters;
