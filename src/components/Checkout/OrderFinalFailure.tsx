import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPayment, toggleCheckoutComplete } from "../../store/actions/storeActions";

const OrderFinalFailure: React.FC = () => {
  const dispatch = useDispatch();
  const isCheckoutComplete = useSelector((state: any) => state.store.isCheckoutComplete);

  useEffect(() => {
    return () => {
      if (isCheckoutComplete) dispatch(toggleCheckoutComplete());
      dispatch(setPayment(""));
    };
  }, [dispatch, isCheckoutComplete]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <h1 className="font-weight-bold">
        Your order was not completed due to an error.
      </h1>
      <h3>Please try again.</h3>
    </div>
  );
};

export default OrderFinalFailure;