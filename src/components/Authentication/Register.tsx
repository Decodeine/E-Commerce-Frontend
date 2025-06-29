import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faEye, 
  faEyeSlash, 
  faUserPlus,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { authClearErrors, authSignup } from "../../store/actions/authActions";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import { useToast } from "../UI/Toast/ToastProvider";
import type { AppDispatch } from "../../store/store";
import "./css/Register.css";

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, error, loading } = useSelector((state: any) => state.auth);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password1: "",
    password2: "",
    first_name: "",
    last_name: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  });

  // Validate form inputs
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!form.first_name.trim()) {
      errors.first_name = "First name is required";
    }

    if (!form.last_name.trim()) {
      errors.last_name = "Last name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!form.password1) {
      errors.password1 = "Password is required";
    } else if (form.password1.length < 8) {
      errors.password1 = "Password must be at least 8 characters long";
    }

    if (!form.password2) {
      errors.password2 = "Please confirm your password";
    } else if (form.password1 !== form.password2) {
      errors.password2 = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  useEffect(() => {
    dispatch(authClearErrors());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      showToast({
        type: "success",
        title: "Registration successful! Welcome!"
      });
      navigate("/", { replace: true });
    }
  }, [token, navigate, showToast]);

  useEffect(() => {
    if (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          showToast({
            type: "error",
            title: "Registration failed",
            message: errorData
          });
        } else if (errorData.detail) {
          showToast({
            type: "error",
            title: "Registration failed",
            message: errorData.detail
          });
        } else {
          // Handle field-specific errors
          const fieldErrors = Object.values(errorData).flat();
          if (fieldErrors.length > 0) {
            showToast({
              type: "error",
              title: "Registration failed",
              message: fieldErrors[0] as string
            });
          }
        }
      } else {
        showToast({
          type: "error",
          title: "Registration failed",
          message: "Please try again."
        });
      }
    }
  }, [error, showToast]);

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