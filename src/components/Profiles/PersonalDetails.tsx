import React, { useState } from "react";
import { useSelector } from "react-redux";
import jwt_decode from "jwt-decode";

import { Form, Button, Row, Col } from "react-bootstrap";

interface JwtPayload {
  email: string;
  [key: string]: any;
}

const PersonalDetails: React.FC = () => {
  const token = useSelector((state: any) => state.auth?.token);
  const decoded = token ? (jwt_decode(token) as JwtPayload) : { email: "" };

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: decoded.email || "",
    password1: "",
    password2: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: handle update logic
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mx-auto card w-100 p-4">
        <h3 className="text-center font-weight-bold">Personal Details</h3>
        <Col md={6}>
          <Form.Group className="mb-2">
            <Form.Label>First name</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              disabled
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Last name</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              disabled
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-2">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password1"
              value={form.password1}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Confirm password</Form.Label>
            <Form.Control
              type="password"
              name="password2"
              value={form.password2}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <div className="text-center">
          <Button color="primary" type="submit">
            Update
          </Button>
        </div>
      </Row>
    </Form>
  );
};

export default PersonalDetails;