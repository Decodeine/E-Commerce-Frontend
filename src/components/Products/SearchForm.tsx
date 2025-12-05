import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes, faClock, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import { productsApi } from "../../services/productsApi";
import { API_PATH } from "../../backend_url";

interface SearchSuggestion {
  id: number;
  name: string;
  slug: string;
  picture: string;
  price: string;
  brand?: {
    name: string;
  };
}

const SearchForm: React.FC = () => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const response = await productsApi.getProducts({
          search: query.trim(),
          limit: 5, // Limit to 5 suggestions
        });
        setSuggestions(response.results || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Debounce for 300ms

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
      setQuery("");
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setIsFocused(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    navigate(`/product/${suggestion.slug}`);
    setQuery("");
    setShowSuggestions(false);
    setIsFocused(false);
  };

  const handleViewAllResults = () => {
    if (query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const backendBaseUrl = API_PATH.replace('/api/', '');
    return `${backendBaseUrl}${imagePath}`;
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" ref={searchRef}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <div className={`flex items-center rounded-lg border transition-colors ${
            isFocused ? 'border-blue-600 ring-2 ring-blue-500 ring-offset-2' : 'border-slate-300'
          } bg-white`}>
            <FontAwesomeIcon icon={faSearch} className="ml-3 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              aria-label="Search products"
              value={query}
              onChange={handleInputChange}
              onFocus={() => {
                setIsFocused(true);
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className="w-full border-0 bg-transparent px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="mr-2 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Clear search"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (query.trim().length >= 2) && (
            <Card className="absolute left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto border border-slate-200 bg-white shadow-lg">
              {loadingSuggestions ? (
                <div className="p-4 text-center text-slate-600">
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <span className="ml-2">Searching...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <div className="divide-y divide-slate-100">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-slate-50"
                      >
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          <img
                            src={getImageUrl(suggestion.picture)}
                            alt={suggestion.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/placeholder.png';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-slate-900">{suggestion.name}</p>
                          {suggestion.brand && (
                            <p className="text-xs text-slate-500">{suggestion.brand.name}</p>
                          )}
                          <p className="text-sm font-semibold text-blue-600">${parseFloat(suggestion.price).toFixed(2)}</p>
                        </div>
                        <FontAwesomeIcon icon={faArrowRight} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 p-2">
                    <button
                      type="button"
                      onClick={handleViewAllResults}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                    >
                      <FontAwesomeIcon icon={faSearch} />
                      View all results for "{query}"
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-slate-600">
                  <FontAwesomeIcon icon={faSearch} className="mb-2 text-2xl text-slate-400" />
                  <p className="text-sm">No suggestions found</p>
                </div>
              )}
            </Card>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!query.trim()}
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchForm;
