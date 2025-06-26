import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import OrderSummary from "./OrderSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as actions from "../../store/actions/storeActions";
import "./css/cart.css";


interface CartItem {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  picture: string;
  quantity: number;
  [key: string]: any;
}

interface CartProps {
  cart: CartItem[];
  subtotal: number;
  shipping: string; 
  tax: number; 
  addProductToCart: (product: CartItem) => void;
  removeProductFromCart: (product: CartItem) => void;
  updateProductQuantity: (product: CartItem, qnt: number) => void;
  incProductQuantity: (item: CartItem) => void;
  decProductQuantity: (item: CartItem) => void;
  emptyCart: () => void;
  calculateCart: () => void;
  setShipping: (value: string) => void;
}

const mapStateToProps = (state: any) => ({
  ...state.store,});

const mapDispatchToProps = (dispatch: any) => ({
  addProductToCart: (product: CartItem) => dispatch(actions.addProductToCart(product, 1)),
  removeProductFromCart: (product: CartItem) => dispatch(actions.removeProductFromCart(product)),
  updateProductQuantity: (product: CartItem, qnt: number) => dispatch(actions.updateProductQuantity(product, qnt)),
  incProductQuantity: (item: CartItem) => dispatch(actions.incProductQuantity(item)),
  decProductQuantity: (item: CartItem) => dispatch(actions.decProductQuantity(item)),
  emptyCart: () => dispatch(actions.emptyCart()),
  calculateCart: () => dispatch(actions.calculateCart()),
  setShipping: (value: string) => dispatch(actions.setShipping(value)),
});

class Cart extends React.Component<CartProps> {
  calculateCartSetShipping() {
    this.props.calculateCart();
    if (this.props.subtotal >= 100) {
      this.props.setShipping("free");
    } else {
      this.props.setShipping("standard");
    }
  }

  componentDidMount() {
    this.calculateCartSetShipping();
  }

  componentDidUpdate(prevProps: CartProps) {
    if (prevProps.cart !== this.props.cart || prevProps.subtotal !== this.props.subtotal) {
      this.calculateCartSetShipping();
    }
  }

  render() {
    const { cart } = this.props;

    return cart.length === 0 ? (
      <React.Fragment>
        <h3 className="text-center mt-2">
          Your cart is empty. Why not add something? :)
        </h3>
      </React.Fragment>
    ) : (
      <React.Fragment>
        <h3>My Cart</h3>
        <div className="row">
          <div className="col-lg-8">
            <div className="cart">
              <div className="cart-wrapper">
                <div className="cart-header text-uppercase text-center font-weight-bold">
                  <div className="row">
                    <div className="col-5">Item</div>
                    <div className="col-2">Price</div>
                    <div className="ml-1 col-2">Quantity</div>
                    <div className="col-2">Total</div>
                    <div className="col-1"> </div>
                  </div>
                </div>
                <div className="border-bottom">
                  {cart.map((item) => (
                    <div className="p-4 border-top" key={item.id}>
                      <div className="row d-flex align-items-center text-center">
                        <div className="col-5">
                          <div className="d-flex align-items-center">
                            <img
                              className="product-image"
                              alt={item.name}
                              src={item.picture}
                            />
                            <Link
                              to={`/product/${item.slug}`}
                              className="cart-title"
                            >
                              {item.name}
                            </Link>
                          </div>
                        </div>
                        <div className="col-2">£{item.price}</div>
                        <div className="col-2">
                          <div className="d-flex align-items-center">
                            <div
                              className="p-1"
                              onClick={() => this.props.decProductQuantity(item)}
                              style={{ cursor: "pointer" }}
                            >
                              <FontAwesomeIcon icon={["far", "minus-square"]} />
                            </div>
                            <input
                              disabled
                              className="form-control rounded-0"
                              type="number"
                              value={item.quantity}
                            />
                            <div
                              className="p-1"
                              onClick={() => this.props.incProductQuantity(item)}
                              style={{ cursor: "pointer" }}
                            >
                              <FontAwesomeIcon icon={["far", "plus-square"]} />
                            </div>
                          </div>
                        </div>
                        <div className="col-2 text-center">
                          £{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="col-1 text-center">
                          <Link
                            to="/cart"
                            onClick={() => this.props.removeProductFromCart(item)}
                          >
                            <FontAwesomeIcon
                              icon={["far", "times-circle"]}
                              className="text-danger"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="d-flex my-4">
              <button
                type="button"
                className="btn btn-sm btn-danger ml-auto"
                onClick={() => this.props.emptyCart()}
              >
                <FontAwesomeIcon icon="trash-alt" /> Empty cart
              </button>
            </div>
          </div>
          <div className="col-lg-4">
  <OrderSummary
    isCartComponent={true}
    subtotal={this.props.subtotal}
    shipping={this.props.shipping}
    tax={this.props.tax}
  />
</div>
        </div>
      </React.Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Cart);