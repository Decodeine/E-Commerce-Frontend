import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';
import './Dropdown.css';

export interface DropdownOption {
  value: string | number;
  label: string;
  icon?: any;
  disabled?: boolean;
  description?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string | number | (string | number)[];
  placeholder?: string;
  multiSelect?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  onChange: (value: string | number | (string | number)[]) => void;
  onSearch?: (query: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Select an option',
  multiSelect = false,
  searchable = false,
  disabled = false,
  error,
  size = 'md',
  fullWidth = false,
  className = '',
  onChange,
  onSearch
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = searchable && searchQuery
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Get selected option(s) for display
  const getSelectedDisplay = () => {
    if (!value) return placeholder;
    
    if (multiSelect && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0]);
        return option?.label || placeholder;
      }
      return `${value.length} selected`;
    }
    
    const option = options.find(opt => opt.value === value);
    return option?.label || placeholder;
  };

  // Check if option is selected
  const isSelected = (optionValue: string | number) => {
    if (multiSelect && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  // Handle option selection
  const handleOptionSelect = (optionValue: string | number) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleOptionSelect(filteredOptions[highlightedIndex].value);
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Handle search input
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setHighlightedIndex(-1);
    if (onSearch) {
      onSearch(query);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  return (
    <div 
      ref={dropdownRef}
      className={`dropdown dropdown--${size} ${fullWidth ? 'dropdown--full-width' : ''} ${disabled ? 'dropdown--disabled' : ''} ${error ? 'dropdown--error' : ''} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Dropdown Trigger */}
      <button
        type="button"
        className={`dropdown__trigger ${isOpen ? 'dropdown__trigger--open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="dropdown__display">
          {getSelectedDisplay()}
        </span>
        <FontAwesomeIcon 
          icon={faChevronDown} 
          className={`dropdown__arrow ${isOpen ? 'dropdown__arrow--open' : ''}`}
        />
      </button>

      {/* Error Message */}
      {error && (
        <div className="dropdown__error">
          {error}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="dropdown__menu" role="listbox">
          {/* Search Input */}
          {searchable && (
            <div className="dropdown__search">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="dropdown__search-input"
              />
            </div>
          )}

          {/* Options List */}
          <div className="dropdown__options">
            {filteredOptions.length === 0 ? (
              <div className="dropdown__option dropdown__option--empty">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  className={`dropdown__option ${isSelected(option.value) ? 'dropdown__option--selected' : ''} ${index === highlightedIndex ? 'dropdown__option--highlighted' : ''} ${option.disabled ? 'dropdown__option--disabled' : ''}`}
                  onClick={() => !option.disabled && handleOptionSelect(option.value)}
                  disabled={option.disabled}
                  role="option"
                  aria-selected={isSelected(option.value)}
                >
                  {option.icon && (
                    <FontAwesomeIcon icon={option.icon} className="dropdown__option-icon" />
                  )}
                  
                  <div className="dropdown__option-content">
                    <span className="dropdown__option-label">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="dropdown__option-description">
                        {option.description}
                      </span>
                    )}
                  </div>

                  {isSelected(option.value) && (
                    <FontAwesomeIcon icon={faCheck} className="dropdown__option-check" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Menu Dropdown Component (for navigation menus)
interface MenuDropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

export const MenuDropdown: React.FC<MenuDropdownProps> = ({
  trigger,
  children,
  position = 'bottom-left',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`menu-dropdown ${className}`}>
      <div 
        className="menu-dropdown__trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </div>

      {isOpen && (
        <div className={`menu-dropdown__content menu-dropdown__content--${position}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
