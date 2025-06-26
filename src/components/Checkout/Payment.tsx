import React from "react";
import { useForm } from "react-hook-form";
import { Accordion } from "../Utilities/Accordion";
import { Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface PaymentProps {
  previousPage: () => void;
  onSubmit: () => void;
}

const Payment: React.FC<PaymentProps> = ({ previousPage, onSubmit }) => {
  const { handleSubmit, formState: { isSubmitting } } = useForm();

  // Placeholder for Paystack or card payment logic
  const submitHandler = () => {
    onSubmit();
  };

  return (
    <React.Fragment>
      <Form onSubmit={handleSubmit(submitHandler)}>
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>Pay by card</Accordion.Header>
            <Accordion.Body>
              <div className="p-2 mb-2 shadow border">
                {/* Integrate Paystack or card payment UI here */}
                <div className="text-muted">Card payment form goes here.</div>
              </div>
              <div className="d-flex">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-dark ml-auto"
                >
                  Order & Pay
                </Button>
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <Button
          type="button"
          className="btn btn-link text-muted bg-white my-4"
          onClick={previousPage}
        >
          <FontAwesomeIcon icon="angle-left" />
          <span className="ml-2">Go back</span>
        </Button>
      </Form>
    </React.Fragment>
  );
};

export default Payment;