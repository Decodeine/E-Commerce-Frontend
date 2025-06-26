import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setPayment,
  toggleCheckoutComplete,
  emptyCart,
} from "../../store/actions/storeActions";
import "./css/cart.css";
import { Row, Col } from "react-bootstrap";

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

const loadCart = () => {
  try {
    const serializedCart = localStorage.getItem("cart");
    if (serializedCart === null) {
      return [];
    }
    return JSON.parse(serializedCart);
  } catch (err) {
    return [];
  }
};

const OrderFinalSuccess: React.FC = () => {
  const dispatch = useDispatch();
  const { shipping, tax, subtotal, formData } = useSelector((state: any) => ({
    shipping: state.store.shipping,
    tax: state.store.tax,
    subtotal: state.store.subtotal,
    formData: state.store.shippingAddress || {},
  }));

  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      dispatch(setPayment(""));
      localStorage.removeItem("cart");
      dispatch(toggleCheckoutComplete());
    };
  }, [dispatch]);

  const cart = loadCart();
  const shippingNumeric = mapShippingStringToNumeric(shipping);
  const afterTax = tax * subtotal;
  const total = subtotal + afterTax + shippingNumeric;

  const {
    firstName = "",
    lastName = "",
    city = "",
    street = "",
    postcode = "",
  } = formData;

  return (
    <React.Fragment>
      <h1 className="text-center">Thank you for your order{firstName && `, ${firstName}`}!</h1>
      <h3 className="text-center my-3">Order Summary</h3>
      <div className="cart">
        <div className="cart-wrapper">
          <div className="cart-header text-uppercase text-center font-weight-bold">
            <Row>
              <Col xs={5}>Item</Col>
              <Col xs={2}>Price</Col>
              <Col xs={2}>Quantity</Col>
              <Col xs={2}>Total</Col>
            </Row>
          </div>
          <div className="cart-body">
            {cart.map((item: any, index: number) => (
              <div className="p-4 border-top" key={index}>
                <Row className="d-flex align-items-center text-center">
                  <Col xs={5}>
                    <div className="d-flex align-items-center">
                      <img
                        className="product-image"
                        alt={item.name}
                        src={item.picture}
                      />
                      <span className="cart-title">{item.name}</span>
                    </div>
                  </Col>
                  <Col xs={2}>£{item.price}</Col>
                  <Col xs={2} className="ml-2">
                    {item.quantity}
                  </Col>
                  <Col xs={2} className="ml-2 text-center">
                    £{(item.price * item.quantity).toFixed(2)}
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Row className="p-4 mt-2">
        <Col md={6} className="p-4">
          <div className="d-flex mb-1">
            <span>Order Subtotal</span>
            <span className="ml-auto">
              £{Number(subtotal).toFixed(2)}
            </span>
          </div>
          <hr />
          <div className="d-flex my-1">
            <span>Tax (20%)</span>
            <span className="ml-auto">
              £{afterTax.toFixed(2)}
            </span>
          </div>
          <hr />
          <div className="d-flex my-1">
            <span>Total</span>
            <span className="ml-auto font-weight-bold">
              £{total.toFixed(2)}
            </span>
          </div>
        </Col>
        <Col md={6} className="p-4">
          <Row>
            <Col xs={4}>
              <strong>Delivery:</strong>
            </Col>
            <Col xs={8}>{shipping}</Col>
          </Row>
          <hr />
          {shipping !== "collection" && (
            <Row>
              <Col xs={4}>
                <strong>Shipping Address:</strong>
              </Col>
              <Col xs={8}>
                <p>
                  {firstName} {lastName}, <br />
                  {street}, <br />
                  {postcode} {city}
                </p>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
      <div className="ml-auto mt-4">
        <Link to="/" className="btn btn-secondary ">
          Back to main page
        </Link>
      </div>
    </React.Fragment>
  );
  };

export default OrderFinalSuccess;