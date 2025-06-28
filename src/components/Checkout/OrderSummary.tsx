import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";

interface OrderSummaryProps {
  isCartComponent?: boolean;
  shipping?: string;
  subtotal?: number;
  tax?: number;
}

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
  isCartComponent = false,
  shipping,
  subtotal,
  tax,
}) => {
  // Use Redux state if props are not provided
  const store = useSelector((state: any) => state.store);

  const _shipping = shipping ?? store.shipping;
  const _subtotal = subtotal ?? store.subtotal;
  const _tax = tax ?? store.tax;

  const shippingNumeric = mapShippingStringToNumeric(_shipping);
  const afterTax = _tax * _subtotal;
  const total = _subtotal + afterTax + shippingNumeric;

  return (
    <Card variant="elevated" padding="lg">
      <h6 className="text-uppercase font-weight-bold mb-3">Order Summary</h6>
      
      <div className="d-flex justify-content-between my-3">
        <span>Order Subtotal</span>
        <span>£{_subtotal.toFixed(2)}</span>
      </div>
      <hr />
      
      <div className="d-flex justify-content-between my-3">
        <span>Shipping</span>
        <span>
          {shippingNumeric > 0 ? (
            `£${shippingNumeric.toFixed(2)}`
          ) : (
            <strong className="text-success">FREE</strong>
          )}
        </span>
      </div>
      <hr />
      
      <div className="d-flex justify-content-between my-3">
        <span>Tax (20%)</span>
        <span>£{afterTax.toFixed(2)}</span>
      </div>
      <hr />
      
      <div className="d-flex justify-content-between my-3">
        <span className="font-weight-bold">Total</span>
        <span className="font-weight-bold text-primary">
          £{total.toFixed(2)}
        </span>
      </div>
      
      <div className="mt-4">
        <div className={`d-flex justify-content-${
          isCartComponent ? "between" : "center"
        } flex-column flex-lg-row gap-2`}>
          <Button
            as={Link}
            to="/"
            variant="outline"
            size="sm"
          >
            <FontAwesomeIcon icon="angle-left" /> Continue shopping
          </Button>
          {isCartComponent && (
            <Button
              as={Link}
              to="/checkout"
              variant="primary"
              size="sm"
            >
              Checkout <FontAwesomeIcon icon="angle-right" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
export default OrderSummary;