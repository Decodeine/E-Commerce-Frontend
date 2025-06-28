import React from "react";
import { useSelector } from "react-redux";
import OrderFinalSuccess from "./OrderFinalSuccess";
import OrderFinalCancelled from "./OrderFinalCancelled";
import OrderFinalFailure from "./OrderFinalFailure";

const OrderFinal: React.FC = () => {
  const paymentStatus = useSelector((state: any) => state.store.paymentStatus);

  switch (paymentStatus) {
    case "success":
      return <OrderFinalSuccess />;
    case "cancelled":
      return <OrderFinalCancelled />;
    default:
      return <OrderFinalFailure />;
  }
};

export default OrderFinal;