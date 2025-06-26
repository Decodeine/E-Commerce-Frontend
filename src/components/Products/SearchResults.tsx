import React from "react";
import { connect } from "react-redux";
import { fetchProducts } from "../../store/actions/storeActions";
import Product from "./Product";
import "./css/products.css";
import { useParams } from "react-router-dom";

// Type definitions
interface ProductItem {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  picture: string;
  quantity: number;
  [key: string]: any;
}

interface SearchResultsProps {
  products: ProductItem[];
  dispatch: (action: any) => void;
}

const mapStateToProps = (state: any) => state.store;

const SearchResults: React.FC<SearchResultsProps> = ({ products, dispatch }) => {
  const { query } = useParams<{ query: string }>();

  React.useEffect(() => {
    if (query) {
      dispatch(fetchProducts(query));
    }
  }, [query, dispatch]);

  const renderSearchResults = () => {
    if (!products || products.length === 0) {
      return <h6 className="pt-2">No products.</h6>;
    }
    return (
      <ul className="grid list-unstyled mb-4">
        {products.map(item => (
          <li key={item.id}>
            <Product item={item} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <h3>Search results for '{query ? query : " "}':</h3>
      {renderSearchResults()}
    </>
  );
};

export default connect(mapStateToProps)(SearchResults);