import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface OrderSummaryProps {
  isCartComponent?: boolean;
  shipping: string;
  subtotal: number;
  tax: number;
}

const mapStateToProps = (state: any) => state.store;

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

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  tax,
  shipping,
  isCartComponent,
}) => {
  const shippingNumeric = mapShippingStringToNumeric(shipping);
  const afterTax = tax * subtotal;
  const total = subtotal + afterTax + shippingNumeric;

  return (
    <div className="bg-light p-4">
      <h6 className="text-uppercase font-weight-bold px-2">Order Summary</h6>
      <hr />
      <div className="d-flex px-2 my-4">
        <span>Order Subtotal</span>
        <span className="ml-auto">£{subtotal.toFixed(2)}</span>
      </div>
      <hr />
      <div className="d-flex px-2 my-4">
        <span>Shipping</span>
        <span className="ml-auto">
          {shippingNumeric > 0 ? (
            `£${shippingNumeric.toFixed(2)}`
          ) : (
            <strong>FREE</strong>
          )}
        </span>
      </div>
      <hr />
      <div className="d-flex px-2 my-4">
        <span>Tax (20%)</span>
        <span className="ml-auto">£{afterTax.toFixed(2)}</span>
      </div>
      <hr />
      <div className="d-flex px-2 my-4">
        <span>Total</span>
        <span className="ml-auto font-weight-bold">
          £{total.toFixed(2)}
        </span>
      </div>
      <div
        className={`d-flex justify-content-${
          isCartComponent ? "between" : "center"
        } flex-column flex-lg-row`}
      >
        <Link to="/" className="btn btn-sm btn-default">
          <FontAwesomeIcon icon="angle-left" /> Continue shopping
        </Link>
        {isCartComponent && (
          <Link to="/checkout" className="btn btn-sm btn-dark">
            Checkout <FontAwesomeIcon icon="angle-right" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default connect(mapStateToProps)(OrderSummary);