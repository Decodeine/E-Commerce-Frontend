import React from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { connect } from "react-redux";
import {
  addProductToCart,
  removeProductFromCart
} from "../../store/actions/storeActions";
import { API_PATH } from "../../backend_url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Default from "../Misc/Default";
import { Spinner } from "react-bootstrap";
import "./css/products.css";

// Types
interface Product {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  picture: string;
  description: string;
  quantity: number;
  [key: string]: any;
}

interface ProductDetailsProps {
  cart: Product[];
  addProductToCart: (item: Product) => void;
  removeProductFromCart: (item: Product) => void;
}

interface ProductDetailsState {
  product: Product | null;
  loading: boolean;
  error: any;
  selectValue: number;
}

const mapStateToProps = (state: any) => state.store;

const mapDispatchToProps = (dispatch: any) => ({
  addProductToCart: (item: Product) => dispatch(addProductToCart(item, 1)),
  removeProductFromCart: (item: Product) => dispatch(removeProductFromCart(item))
});

class ProductDetails extends React.Component<ProductDetailsProps, ProductDetailsState> {
  constructor(props: ProductDetailsProps) {
    super(props);
    this.state = {
      product: null,
      loading: true,
      error: null,
      selectValue: 1
    };
    this.handleChange = this.handleChange.bind(this);
  }

  async componentDidMount() {
    // @ts-ignore
    const { slug } = this.props.params || {};
    try {
      const res = await axios.get(`${API_PATH}products/${slug}`);
      this.setState({ product: res.data, loading: false });
    } catch (err) {
      this.setState({ error: err, loading: false });
    }
  }

  inCart = () => {
    const { cart } = this.props;
    const { product } = this.state;
    if (!product) return 0;
    const res = cart.find(e => e.id === product.id);
    return res ? res.quantity : 0;
  };

  quantityRange = (product: Product) => {
    let result: number[] = [];
    if (product.quantity > 0) {
      for (let i = 1; i <= product.quantity; i++) {
        result.push(i);
      }
      return result;
    }
    return result;
  };

  handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ selectValue: Number(e.target.value) });
  }

  addMultiple = (item: Product, qnt: number) => {
    for (let i = 0; i < qnt; i++) {
      this.props.addProductToCart(item);
    }
  };

  render() {
    const { product, loading, error } = this.state;

    if (error) {
      return <Default />;
    }
    if (loading || !product) {
      return (
        <Spinner
          animation="border"
          variant="secondary"
          style={{ width: "3rem", height: "3rem" }}
          className="m-auto"
        />
      );
    }

    const productQuantityRange = this.quantityRange(product);

    return (
      <div className="row">
        <div className="col-md-6">
          <div className="card rounded-0">
            <img
              className="w-100 rounded-0"
              src={product.picture}
              alt={product.name}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="card rounded-0">
            <div className="card-body">
              <h3 className="font-weight-bold">{product.name}</h3>
              <p className="card-text pt-2">{product.description}</p>
              <p className="card-text pt-2">
                <strong>Price:</strong> £{product.price}
              </p>
              <p className="card-text py-3 border-bottom">
                <strong>Availability:</strong>
                {product.quantity > 0
                  ? product.quantity > 20
                    ? " Plenty in stock!"
                    : " Just a few left!"
                  : " Out of stock"}
              </p>

              <div className="input-group justify-content-center">
                <div className="input-group-prepend">
                  <button className="btn btn-info" type="button">
                    <Link to="/" className="text-white">
                      <FontAwesomeIcon icon="list-alt" /> Products
                    </Link>
                  </button>
                </div>
                {product.quantity === 0 ? (
                  <div className="input-group-append">
                    <button className="btn btn-success" disabled>
                      <FontAwesomeIcon icon="cart-plus" />
                    </button>
                  </div>
                ) : (
                  <div className="input-group-append">
                    <select
                      className="form-control rounded-0"
                      value={this.state.selectValue}
                      onChange={this.handleChange}
                    >
                      {productQuantityRange
                        .slice(0, 10)
                        .map(item => (
                          <option value={item} key={item}>
                            {item}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() =>
                        this.addMultiple(product, this.state.selectValue)
                      }
                    >
                      <FontAwesomeIcon icon="cart-plus" />
                    </button>
                    {this.inCart() > 0 ? (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() =>
                          this.props.removeProductFromCart(product)
                        }
                      >
                        <FontAwesomeIcon icon="trash-alt" />
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// React Router v6: useParams HOC for class components
function withParams(Component: any) {
  return (props: any) => {
    const params = useParams();
    return <Component {...props} params={params} />;
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withParams(ProductDetails));