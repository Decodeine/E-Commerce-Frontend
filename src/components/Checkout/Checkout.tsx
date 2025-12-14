import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setPayment,
  toggleCheckoutComplete,
  emptyCart,
} from "../../store/actions/storeActions";
import Address from "./Address";
import Delivery from "./Delivery";
import Payment from "./Payment";
import OrderFinal from "./OrderFinal";
import OrderReview from "./OrderReview";
import OrderSummary from "./OrderSummary";
import CheckoutNavbar from "./CheckoutNavbar";
import { Row, Col } from "react-bootstrap";
import type { AppDispatch } from "../../store/store";

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

const Checkout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cart, subtotal, tax, shipping, isCheckoutComplete } = useSelector(
    (state: any) => state.store
  );
  const isAuthenticated = useSelector((state: any) => state.auth.token !== null);

  const [page, setPage] = useState(1);

  useEffect(() => {
    try {
      const serializedCart = JSON.stringify(cart);
      localStorage.setItem("cart", serializedCart);
    } catch (err) {
      console.log(err);
    }
    // Cleanup on unmount
    return () => {
      if (isCheckoutComplete) dispatch(toggleCheckoutComplete());
      dispatch(setPayment(""));
    };
    // eslint-disable-next-line
  }, [cart, dispatch, isCheckoutComplete]);

  const nextPage = () => setPage((prev) => prev + 1);
  const previousPage = () => setPage((prev) => prev - 1);

  const calculateTotal = () => {
    const shippingNumeric = mapShippingStringToNumeric(shipping);
    const afterTax = tax * subtotal;
    return parseFloat((subtotal + afterTax + shippingNumeric).toFixed(2));
  };

  const handlePayment = () => {
    // Integrate Paystack or other payment logic here
    dispatch(setPayment("success"));
    dispatch(emptyCart());
    dispatch(toggleCheckoutComplete());
  };

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
          {page === 1 && <Address onSubmit={nextPage} />}
          {page === 2 && (
            <Delivery previousPage={previousPage} onSubmit={nextPage} />
          )}
          {page === 3 && (
            <OrderReview
              cart={cart}
              previousPage={previousPage}
              handleSubmit={nextPage}
            />
          )}
          {page === 4 && (
            <Payment previousPage={previousPage} onSubmit={handlePayment} />
          )}
        </Col>
        <Col lg={4}>
          <OrderSummary
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            isCartComponent={false}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Checkout;