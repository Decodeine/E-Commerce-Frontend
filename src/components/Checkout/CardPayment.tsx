import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { setPayment, emptyCart, toggleCheckoutComplete } from "../../store/actions/storeActions";
import { Form, Row, Col, Button } from "react-bootstrap";

interface CardPaymentFormData {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
}

const CardPayment: React.FC = () => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CardPaymentFormData>();

  const onSubmit = (data: CardPaymentFormData) => {
    dispatch(setPayment("card"));
    dispatch(toggleCheckoutComplete());
    dispatch(emptyCart());
    // You can handle further payment logic here
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col md={12}>
          <Form.Group>
            <Form.Label>Card Number</Form.Label>
            <Form.Control
              type="text"
              {...register("cardNumber", { required: "Card number is required" })}
              isInvalid={!!errors.cardNumber}
            />
            <Form.Control.Feedback type="invalid">
              {errors.cardNumber?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Expiration Date</Form.Label>
            <Form.Control
              type="text"
              {...register("expirationDate", { required: "Expiration date is required" })}
              isInvalid={!!errors.expirationDate}
            />
            <Form.Control.Feedback type="invalid">
              {errors.expirationDate?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>CVV</Form.Label>
            <Form.Control
              type="text"
              {...register("cvv", { required: "CVV is required" })}
              isInvalid={!!errors.cvv}
            />
            <Form.Control.Feedback type="invalid">
              {errors.cvv?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Button type="submit" variant="dark" className="mt-3">
        Pay Now
      </Button>
    </Form>
    );
};

export default CardPayment;