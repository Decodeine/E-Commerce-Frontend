import React from "react";
import { connect } from "react-redux";
import OrderFinalSuccess from "./OrderFinalSuccess";
import OrderFinalCancelled from "./OrderFinalCancelled";
import OrderFinalFailure from "./OrderFinalFailure";

interface OrderFinalProps {
  paymentStatus?: string;
}

const mapStateToProps = (state: any) => ({
  paymentStatus: state.store.paymentStatus,
});

const OrderFinal: React.FC<OrderFinalProps> = ({ paymentStatus }) => {
  switch (paymentStatus) {
    case "success":
      return <OrderFinalSuccess />;
    case "cancelled":
      return <OrderFinalCancelled />;
    default:
      return <OrderFinalFailure />;
  }
};

export default connect(mapStateToProps)(OrderFinal);