import React from "react";
import { connect } from "react-redux";
import {
  setPayment,
  toggleCheckoutComplete,
  emptyCart,
} from "../../store/actions/storeActions";
import Address from "./Address";
import Delivery from "./Delivery";
import Payment from "./Payment";
import OrderReview from "./OrderReview";
import OrderFinal from "./OrderFinal";
import OrderSummary from "./OrderSummary";
import CheckoutNavbar from "./CheckoutNavbar";
import { Row, Col } from "react-bootstrap";
import "./css/checkout.css";

// Types
interface StoreState {
  cart: any[];
  subtotal: number;
  tax: number;
  shipping: string;
  isCheckoutComplete: boolean;
}

interface CheckoutProps {
  store: StoreState;
  isAuthenticated: boolean;
  setPayment: (value: string) => void;
  emptyCart: () => void;
  toggleCheckoutComplete: () => void;
}

interface CheckoutState {
  page: number;
}

const mapStateToProps = (state: any) => ({
  store: state.store,
  isAuthenticated: state.auth.token !== null,
});

const mapDispatchToProps = (dispatch: any) => ({
  setPayment: (value: string) => dispatch(setPayment(value)),
  emptyCart: () => dispatch(emptyCart()),
  toggleCheckoutComplete: () => dispatch(toggleCheckoutComplete()),
});

const mapShippingStringToNumeric = (value: string): number => {
  switch (value) {
    case "free":
    case "collection":
      return 0.0;
    case "express":
      return 10.0;
    default:
      return 5.0;
  }
};

class Checkout extends React.Component<CheckoutProps, CheckoutState> {
  constructor(props: CheckoutProps) {
    super(props);
    this.state = { page: 1 };
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.handlePayment = this.handlePayment.bind(this);
  }

  componentDidMount() {
    const { cart } = this.props.store;
    try {
      const serializedCart = JSON.stringify(cart);
      localStorage.setItem("cart", serializedCart);
    } catch (err) {
      console.log(err);
    }
  }

  componentWillUnmount() {
    if (this.props.store.isCheckoutComplete) this.props.toggleCheckoutComplete();
    this.props.setPayment("");
  }

  nextPage() {
    this.setState((prev) => ({ page: prev.page + 1 }));
  }

  previousPage() {
    this.setState((prev) => ({ page: prev.page - 1 }));
  }

  calculateTotal() {
    const { subtotal, tax, shipping } = this.props.store;
    const shippingNumeric = mapShippingStringToNumeric(shipping);
    const afterTax = tax * subtotal;
    return parseFloat((subtotal + afterTax + shippingNumeric).toFixed(2));
  }

  handlePayment(/* values: any */) {
    // Integrate Paystack or other payment logic here
    this.props.setPayment("success");
    this.props.emptyCart();
    this.props.toggleCheckoutComplete();
  }

  render() {
    const { page } = this.state;
    const { cart, isCheckoutComplete } = this.props.store;
    const { isAuthenticated } = this.props;

    if (!isAuthenticated) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center">
          <h1 className="font-weight-bold">
            You must be logged in to view this page.
          </h1>
        </div>
      );
    }

    if (isCheckoutComplete) {
      return <OrderFinal />;
    }

    if (cart.length === 0) {
      return (
        <React.Fragment>
          <h3 className="text-center mt-2">
            Add some products to the cart first, then come back here :)
          </h3>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <h3 className="mb-4">Checkout</h3>
        <Row>
          <Col lg={8}>
            <CheckoutNavbar active={page} />
            {page === 1 && <Address onSubmit={this.nextPage} />}
            {page === 2 && (
              <Delivery previousPage={this.previousPage} onSubmit={this.nextPage} />
            )}
            {page === 3 && (
              <OrderReview previousPage={this.previousPage} onSubmit={this.nextPage} />
            )}
            {page === 4 && (
              <Payment previousPage={this.previousPage} onSubmit={this.handlePayment} />
            )}
          </Col>
          <Col lg={4}>
            <OrderSummary
              subtotal={this.props.store.subtotal}
              shipping={this.props.store.shipping}
              tax={this.props.store.tax}
              isCartComponent={false}
            />
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Checkout);