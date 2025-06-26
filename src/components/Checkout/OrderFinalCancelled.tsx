import React from "react";

const OrderFinalCancelled: React.FC = () => (
  <div className="d-flex flex-column align-items-center justify-content-center">
    <h1 className="font-weight-bold">Order cancelled</h1>
    <p className="text-muted mt-3">
      Your order was cancelled. If this was a mistake, please try again or contact support.
    </p>
  </div>
);

export default OrderFinalCancelled;