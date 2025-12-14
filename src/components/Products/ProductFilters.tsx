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
    <div className={`w-full transition-all duration-300 ${isOpen ? 'block' : 'hidden'}`}>
      <Card className="p-6" padding="lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FontAwesomeIcon icon={faFilter} className="text-blue-600" />
            Filters
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Clear All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              icon={isOpen ? faChevronUp : faChevronDown}
              className="text-sm"
            >
              {isOpen ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Search Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Search</label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" 
              />
              <input
                type="text"
                placeholder="Search products..."
                value={(localFilters || {}).search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
              {(localFilters || {}).search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
          </div>

          {/* Sort Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Sort by</label>
            <select
              value={(localFilters || {}).ordering || ''}
              onChange={(e) => handleFilterChange('ordering', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
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
          <div className="space-y-2">
            <button
              className="flex w-full items-center justify-between text-sm font-medium text-slate-700"
              onClick={() => toggleSection('price')}
            >
              <span>Price Range</span>
              <FontAwesomeIcon 
                icon={expandedSections.price ? faChevronUp : faChevronDown}
                className="text-slate-400"
              />
            </button>
            {expandedSections.price && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={(localFilters || {}).price__gte || ''}
                    onChange={(e) => handleFilterChange('price__gte', e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                  <span className="text-sm text-slate-500">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={(localFilters || {}).price__lte || ''}
                    onChange={(e) => handleFilterChange('price__lte', e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <button
              className="flex w-full items-center justify-between text-sm font-medium text-slate-700"
              onClick={() => toggleSection('rating')}
            >
              <span>Minimum Rating</span>
              <FontAwesomeIcon 
                icon={expandedSections.rating ? faChevronUp : faChevronDown}
                className="text-slate-400"
              />
            </button>
            {expandedSections.rating && (
              <div className="mt-2 space-y-2">
                {[4, 3, 2, 1].map(rating => (
                  <label 
                    key={rating} 
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-2 transition-colors hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={rating}
                      checked={(localFilters || {}).rating__gte === rating}
                      onChange={(e) => handleFilterChange('rating__gte', Number(e.target.value))}
                      className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-slate-300'}`}
                        />
                      ))}
                      <span className="text-sm text-slate-600">& up</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Brands Filter */}
          <div className="space-y-2">
            <button
              className="flex w-full items-center justify-between text-sm font-medium text-slate-700"
              onClick={() => toggleSection('brands')}
            >
              <span>Brands</span>
              <FontAwesomeIcon 
                icon={expandedSections.brands ? faChevronUp : faChevronDown}
                className="text-slate-400"
              />
            </button>
            {expandedSections.brands && (
              <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
                {(Array.isArray(brands) ? brands : []).slice(0, 10).map((brand: any) => (
                  <label 
                    key={brand.slug} 
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 transition-colors hover:bg-slate-50"
                  >
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
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                    <span className="flex-1 text-sm text-slate-700">
                      {brand.name} <span className="text-slate-400">({brand.product_count || 0})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <button
              className="flex w-full items-center justify-between text-sm font-medium text-slate-700"
              onClick={() => toggleSection('categories')}
            >
              <span>Categories</span>
              <FontAwesomeIcon 
                icon={expandedSections.categories ? faChevronUp : faChevronDown}
                className="text-slate-400"
              />
            </button>
            {expandedSections.categories && (
              <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
                {(Array.isArray(categories) ? categories : []).slice(0, 10).map((category: any) => (
                  <label 
                    key={category.id} 
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 transition-colors hover:bg-slate-50"
                  >
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
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                    <span className="flex-1 text-sm text-slate-700">
                      {category.name} <span className="text-slate-400">({category.product_count || 0})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Features/Tags Filter */}
          <div className="space-y-2">
            <button
              className="flex w-full items-center justify-between text-sm font-medium text-slate-700"
              onClick={() => toggleSection('features')}
            >
              <span>Features</span>
              <FontAwesomeIcon 
                icon={expandedSections.features ? faChevronUp : faChevronDown}
                className="text-slate-400"
              />
            </button>
            {expandedSections.features && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <button
                      key={tag}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        (localFilters || {}).tags?.split(',').includes(tag)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Condition</label>
            <select
              value={(localFilters || {}).condition || ''}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="">All Conditions</option>
              {conditions.map(condition => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
          </div>

          {/* Stock & Featured Filters */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={(localFilters || {}).in_stock || false}
                onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
              <span className="text-sm text-slate-700">In Stock Only</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={(localFilters || {}).featured || false}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
              <span className="text-sm text-slate-700">Featured Products Only</span>
            </label>
          </div>

          {/* Apply Filters Button */}
          <div className="border-t border-slate-200 pt-4">
            <Button
              variant="primary"
              fullWidth
              onClick={applyFilters}
              className="w-full"
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
