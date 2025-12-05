import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight, faLock, faShippingFast, faGift } from "@fortawesome/free-solid-svg-icons";
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
  const navigate = useNavigate();
  const store = useSelector((state: any) => state.store);

  const _shipping = shipping ?? store.shipping;
  const _subtotal = subtotal ?? store.subtotal;
  const _tax = tax ?? store.tax;

  const shippingNumeric = mapShippingStringToNumeric(_shipping);
  const afterTax = _tax * _subtotal;
  const total = _subtotal + afterTax + shippingNumeric;

  return (
    <Card className="sticky top-6 p-6 shadow-md">
      <h3 className="mb-6 text-xl font-bold text-slate-900">Order Summary</h3>
      
      <div className="space-y-4 border-b border-slate-200 pb-6">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Order Subtotal</span>
          <span className="font-semibold text-slate-900">${_subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Shipping</span>
          <span className="font-semibold text-slate-900">
            {shippingNumeric > 0 ? (
              `$${shippingNumeric.toFixed(2)}`
            ) : (
              <span className="text-green-600">FREE</span>
            )}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Tax (20%)</span>
          <span className="font-semibold text-slate-900">${afterTax.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between border-t border-slate-200 pt-4">
          <span className="text-lg font-bold text-slate-900">Total</span>
          <span className="text-2xl font-bold text-blue-600">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
      
      <div className="mt-6 space-y-3">
        {isCartComponent && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/checkout')}
            icon={faLock}
          >
            Secure Checkout
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => navigate('/products')}
          icon={faAngleLeft}
        >
          Continue Shopping
        </Button>
      </div>

      {isCartComponent && (
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <span className="text-xs font-medium text-slate-600">Secure Payment</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FontAwesomeIcon icon={faShippingFast} />
            </div>
            <span className="text-xs font-medium text-slate-600">Fast Delivery</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FontAwesomeIcon icon={faGift} />
            </div>
            <span className="text-xs font-medium text-slate-600">Easy Returns</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default OrderSummary;
