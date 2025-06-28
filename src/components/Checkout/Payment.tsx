import React from "react";
import { useForm } from "react-hook-form";
import { Accordion, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";

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
    <div className="payment-container">
      <Form onSubmit={handleSubmit(submitHandler)}>
        <Card variant="elevated" padding="lg">
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Pay by card</Accordion.Header>
              <Accordion.Body>
                <Card variant="outlined" padding="md" className="mb-3">
                  {/* Integrate Paystack or card payment UI here */}
                  <div className="text-muted">Card payment form goes here.</div>
                </Card>
                <div className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                  >
                    Order & Pay
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Card>

        <div className="mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={previousPage}
          >
            <FontAwesomeIcon icon="angle-left" /> Go back
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Payment;