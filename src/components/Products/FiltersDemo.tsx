import React from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSearch, faTags, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import Card from '../UI/Card/Card';

const FiltersDemo: React.FC = () => {
  const filters = useSelector((state: any) => state.store.filters);
  const pagination = useSelector((state: any) => state.store.pagination);
  const products = useSelector((state: any) => state.store.products);

  const activeFiltersCount = filters && typeof filters === 'object' ? Object.keys(filters).filter(key => {
    const value = filters[key];
    return value && value !== '' && value !== false;
  }).length : 0;

  const renderActiveFilters = () => {
    if (!filters || activeFiltersCount === 0) return null;

    return (
      <Card className="active-filters-card" padding="md">
        <h4>Active Filters ({activeFiltersCount}):</h4>
        <div className="active-filters-list">
          {filters.search && (
            <span className="filter-tag">
              <FontAwesomeIcon icon={faSearch} />
              Search: "{filters.search}"
            </span>
          )}
          {filters.price__gte && (
            <span className="filter-tag">
              Min Price: ${filters.price__gte}
            </span>
          )}
          {filters.price__lte && (
            <span className="filter-tag">
              Max Price: ${filters.price__lte}
            </span>
          )}
          {filters.rating__gte && (
            <span className="filter-tag">
              Min Rating: {filters.rating__gte}★
            </span>
          )}
          {filters.brand__slug && (
            <span className="filter-tag">
              Brands: {filters.brand__slug.replace(/,/g, ', ')}
            </span>
          )}
          {filters.category__name && (
            <span className="filter-tag">
              Categories: {filters.category__name.replace(/,/g, ', ')}
            </span>
          )}
          {filters.tags && (
            <span className="filter-tag">
              <FontAwesomeIcon icon={faTags} />
              Tags: {filters.tags.replace(/,/g, ', ').replace(/-/g, ' ')}
            </span>
          )}
          {filters.in_stock && (
            <span className="filter-tag">
              In Stock Only
            </span>
          )}
          {filters.featured && (
            <span className="filter-tag">
              Featured Only
            </span>
          )}
          {filters.condition && (
            <span className="filter-tag">
              Condition: {filters.condition}
            </span>
          )}
          {filters.ordering && (
            <span className="filter-tag">
              Sort: {filters.ordering.replace(/^-/, '').replace(/_/g, ' ')} 
              {filters.ordering.startsWith('-') ? ' (desc)' : ' (asc)'}
            </span>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="filters-demo">
      <Card className="demo-stats" padding="lg">
        <div className="stats-grid">
          <div className="stat-item">
            <FontAwesomeIcon icon={faFilter} className="stat-icon" />
            <div className="stat-content">
              <h3>{activeFiltersCount}</h3>
              <p>Active Filters</p>
            </div>
          </div>
          <div className="stat-item">
            <FontAwesomeIcon icon={faShoppingBag} className="stat-icon" />
            <div className="stat-content">
              <h3>{products?.length || 0}</h3>
              <p>Products Found</p>
            </div>
          </div>
          <div className="stat-item">
            <FontAwesomeIcon icon={faSearch} className="stat-icon" />
            <div className="stat-content">
              <h3>{pagination?.totalItems || 0}</h3>
              <p>Total Results</p>
            </div>
          </div>
        </div>
      </Card>

      {renderActiveFilters()}

      {(pagination?.totalPages || 0) > 1 && (
        <Card className="pagination-info" padding="md">
          <p>
            Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
            {pagination?.hasNext && ' • More results available'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default FiltersDemo;
