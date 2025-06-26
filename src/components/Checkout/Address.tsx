import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface AddressFormData {
  firstName: string;
  lastName: string;
  city: string;
  street: string;
  postcode: string;
  phoneNumber: string;
}

const Address: React.FC<{ onSubmit?: (data: AddressFormData) => void }> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AddressFormData>();

  const submitHandler = (data: AddressFormData) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      // Default: log data
      console.log(data);
    }
  };

  return (
    <Form className="mt-3" onSubmit={handleSubmit(submitHandler)}>
      <h6 className="text-uppercase mb-3 font-weight-bold">Shipping address</h6>
      <Row>
        <Col md={6}>
          <Form.Group>
            <Form.Label>First Name</Form.Label>
            <Form.Control
              {...register("firstName", { required: "First name is required" })}
              type="text"
              isInvalid={!!errors.firstName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.firstName?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              {...register("lastName", { required: "Last name is required" })}
              type="text"
              isInvalid={!!errors.lastName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.lastName?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>City</Form.Label>
            <Form.Control
              {...register("city", { required: "City is required" })}
              type="text"
              isInvalid={!!errors.city}
            />
            <Form.Control.Feedback type="invalid">
              {errors.city?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Street</Form.Label>
            <Form.Control
              {...register("street", { required: "Street is required" })}
              type="text"
              isInvalid={!!errors.street}
            />
            <Form.Control.Feedback type="invalid">
              {errors.street?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Postcode</Form.Label>
            <Form.Control
              {...register("postcode", {
                required: "Postcode is required",
                pattern: {
                  value: /^[A-Za-z0-9 ]{3,10}$/,
                  message: "Invalid postcode"
                }
              })}
              type="text"
              isInvalid={!!errors.postcode}
            />
            <Form.Control.Feedback type="invalid">
              {errors.postcode?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              {...register("phoneNumber", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9+\-() ]{7,20}$/,
                  message: "Invalid phone number"
                }
              })}
              type="text"
              isInvalid={!!errors.phoneNumber}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phoneNumber?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <div className="my-4 d-flex justify-content-between flex-column flex-lg-row">
        <Link
         to="/cart"
          className="btn btn-link bg-white text-muted"
        >
          <FontAwesomeIcon icon="angle-left" />
          <span className="ml-2">Back to cart</span>
        </Link>
        <Button variant="dark" type="submit">
          <span className="mr-2">Delivery</span>
          <FontAwesomeIcon icon="angle-right" />
        </Button>
      </div>
    </Form>
  );
};

export default Address;