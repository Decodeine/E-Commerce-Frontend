import React from "react";
import { connect } from "react-redux";
import { fetchProducts } from "../../store/actions/storeActions";
import { Spinner } from "react-bootstrap";
import Product from "./Product";
import "./css/products.css";

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

interface ProductListProps {
  dispatch: (action: any) => void;
  loading: boolean;
  products: ProductItem[];
}

const mapStateToProps = (state: any) => state.store;

class ProductList extends React.Component<ProductListProps> {
  componentDidMount() {
    this.props.dispatch(fetchProducts());
  }

  render() {
    const { products, loading } = this.props;

    return loading ? (
      <Spinner
        animation="border"
        variant="secondary"
        style={{ width: "3rem", height: "3rem" }}
        className="m-auto"
      />
    ) : (
      <>
        <h1 className="mb-3 text-center">All Products</h1>
        <ul className="grid list-unstyled mb-4">
          {products.map(item => (
            <li key={item.id}>
              <Product item={item} />
            </li>
          ))}
        </ul>
      </>
    );
  }
}

export default connect(mapStateToProps)(ProductList);