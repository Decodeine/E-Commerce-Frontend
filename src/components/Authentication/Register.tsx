import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authClearErrors, authSignup } from "../../store/actions/authActions";
import { Form, Row, Col, Button } from "react-bootstrap";
import type { AppDispatch } from "../../store/store";

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, error } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password1: "",
    password2: "",
    first_name: "",
    last_name: "",
  });

  useEffect(() => {
    dispatch(authClearErrors());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      authSignup(
        form.email,
        form.password1,
        form.password2,
        form.first_name,
        form.last_name
      )
    );
  };

  const renderError = (field: string) => {
    if (error && error.response && error.response.data[field]) {
      const err = error.response.data[field];
      if (Array.isArray(err)) {
        return (
          <ul className="list-unstyled mb-0">
            {err.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
      }
      return <span>{err}</span>;
    }
    return null;
  };

  return (
    <Row>
      <Col md="7" className="mx-auto card p-4">
        <Form onSubmit={handleSubmit}>
          <h3 className="text-center font-weight-bold">Register</h3>
          <Form.Group>
            <Form.Label htmlFor="first_name" className="font-weight-bold d-flex justify-content-between">
              <span>First name</span>
              <span className="text-danger">{renderError("first_name")}</span>
            </Form.Label>
            <Form.Control
              id="first_name"
              type="text"
              value={form.first_name}
              onChange={handleChange}
              className="mb-2"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="last_name" className="font-weight-bold d-flex justify-content-between">
              <span>Last name</span>
              <span className="text-danger">{renderError("last_name")}</span>
            </Form.Label>
            <Form.Control
              id="last_name"
              type="text"
              value={form.last_name}
              onChange={handleChange}
              className="mb-2"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="email" className="font-weight-bold d-flex justify-content-between">
              <span>Email address</span>
              <span className="text-danger">{renderError("email")}</span>
            </Form.Label>
            <Form.Control
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="mb-2"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="password1" className="font-weight-bold d-flex justify-content-between">
              <span>Password</span>
              <span className="text-danger">{renderError("password1")}</span>
            </Form.Label>
            <Form.Control
              id="password1"
              type="password"
              value={form.password1}
              onChange={handleChange}
              className="mb-2"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="password2" className="font-weight-bold d-flex justify-content-between">
              <span>Confirm password</span>
              <span className="text-danger">{renderError("non_field_errors")}</span>
            </Form.Label>
            <Form.Control
              id="password2"
              type="password"
              value={form.password2}
              onChange={handleChange}
              className="mb-4"
            />
          </Form.Group>
          <div className="text-center">
            <Button variant="primary" type="submit">
              Register
            </Button>
            <p className="mt-4">
              Already a member? <Link to="/login">Login</Link>
            </p>
          </div>
        </Form>
      </Col>
    </Row>
  );
};

export default Register;