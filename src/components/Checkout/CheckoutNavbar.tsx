import React from "react";

interface CheckoutNavbarProps {
  active: number;
}

const steps = [
  "Address",
  "Delivery",
  "Review Order",
  "Payment"
];

const CheckoutNavbar: React.FC<CheckoutNavbarProps> = ({ active }) => (
  <div className="d-flex text-center mb-4 font-weight-bold">
    {steps.map((name, idx) => (
      <div
        key={name}
        className={`d-flex align-items-center justify-content-center p-2 ${
          active === idx + 1 ? "bg-dark text-white" : "bg-light text-dark"
        } w-25`}
      >
        {name}
      </div>
    ))}
 </div>
);

export default CheckoutNavbar;