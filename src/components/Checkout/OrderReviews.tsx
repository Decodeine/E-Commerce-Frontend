import React, { useEffect } from "react";
import { Row, Col, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./css/cart.css";

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  picture: string;
}

interface OrderReviewProps {
  cart: CartItem[];
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  previousPage: () => void;
}

const OrderReview: React.FC<OrderReviewProps> = ({ cart, handleSubmit, previousPage }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <React.Fragment>
      <Form onSubmit={handleSubmit}>
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
              {cart.map((item) => (
                <div className="p-4 border-top" key={item.id}>
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
                    <Col xs={2} className="ml-1 text-center">
                      £{(item.price * item.quantity).toFixed(2)}
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="my-4 d-flex justify-content-between flex-column flex-lg-row">
          <Button
            type="button"
            variant="link"
            className="text-muted bg-white"
            onClick={previousPage}
          >
            <FontAwesomeIcon icon="angle-left" />
            <span className="ml-2">Go back</span>
          </Button>
          <Button type="submit" variant="dark">
            <span className="mr-2">Choose payment method</span>
            <FontAwesomeIcon icon="angle-right" />
          </Button>
        </div>
      </Form>
    </React.Fragment>
  );
};

export default OrderReview;
