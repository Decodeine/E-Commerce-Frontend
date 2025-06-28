import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import Button from "../UI/Button/Button";
import "./css/SearchForm.css";

const SearchForm: React.FC = () => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search/${query}`);
      setQuery("");
      setIsFocused(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsFocused(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className={`search-input-container ${isFocused ? 'search-input-container--focused' : ''}`}>
        <div className="search-input-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            aria-label="Search products"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="search-input"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="search-clear-btn"
              aria-label="Clear search"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        
        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="search-submit-btn"
          disabled={!query.trim()}
        >
          Search
        </Button>
      </div>
      
      {/* Search suggestions could be added here in the future */}
      {isFocused && query && (
        <div className="search-suggestions">
          {/* TODO: Implement search suggestions */}
        </div>
      )}
    </form>
  );
};

export default SearchForm;