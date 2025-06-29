import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEnvelope, 
  faLock, 
  faEye, 
  faEyeSlash,
  faSignInAlt,
  faExclamationCircle,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { authClearErrors, authLogin } from "../../store/actions/authActions";
import { useToast } from "../UI/Toast/ToastProvider";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import { validateEmail } from "../../services/accountsApi";
import type { AppDispatch } from "../../store/store";
import "./css/Login.css";

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, error, loading } = useSelector((state: any) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [validation, setValidation] = useState({
    email: { valid: true, message: "" },
    password: { valid: true, message: "" }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    dispatch(authClearErrors());
  }, [dispatch]);

  useEffect(() => {
    if (token && !error) {
      showToast({
        type: 'success',
        title: 'Welcome Back!',
        message: 'You have successfully logged in.'
      });
      
      const from = (location.state && (location.state as any).from?.pathname) || "/";
      navigate(from, { replace: true });
    }
  }, [token, error, location.state, navigate, showToast]);

  useEffect(() => {
    if (error) {
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: error.response?.data?.detail || 'Invalid credentials. Please check your email and password.'
      });
    }
  }, [error, showToast]);

  const validateField = (name: string, value: string) => {
    const newValidation = { ...validation };

    switch (name) {
      case 'email':
        if (!value.trim()) {
          newValidation.email = { valid: false, message: 'Email is required' };
        } else if (!validateEmail(value)) {
          newValidation.email = { valid: false, message: 'Please enter a valid email address' };
        } else {
          newValidation.email = { valid: true, message: '' };
        }
        break;

      case 'password':
        if (!value) {
          newValidation.password = { valid: false, message: 'Password is required' };
        } else if (value.length < 6) {
          newValidation.password = { valid: false, message: 'Password must be at least 6 characters' };
        } else {
          newValidation.password = { valid: true, message: '' };
        }
        break;
    }

    setValidation(newValidation);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validateField(name, value);
  };

  const isFormValid = () => {
    return Object.values(validation).every(field => field.valid) &&
           Object.values(form).every(value => value.trim() !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix all errors before submitting.'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await dispatch(authLogin(form.email, form.password));
    } catch (error) {
      // Error handling is done in useEffect
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldError = (fieldName: keyof typeof validation) => {
    const field = validation[fieldName];
    if (!field.valid && field.message) {
      return (
        <div className="field-error">
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>{field.message}</span>
        </div>
      );
    }
    if (field.valid && field.message) {
      return (
        <div className="field-success">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>{field.message}</span>
        </div>
      );
    }
    return null;
  };

  if (loading && !isSubmitting) {
    return (
      <div className="login-container">
        <Loading variant="spinner" size="lg" text="Signing you in..." />
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <Card className="login-card" padding="xl">
          <div className="login-header">
            <div className="login-icon">
              <FontAwesomeIcon icon={faSignInAlt} />
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">
                <FontAwesomeIcon icon={faEnvelope} />
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={`form-input ${!validation.email.valid ? 'error' : validation.email.valid && form.email ? 'success' : ''}`}
                placeholder="Enter your email address"
                required
              />
              {renderFieldError('email')}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">
                <FontAwesomeIcon icon={faLock} />
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className={`form-input ${!validation.password.valid ? 'error' : validation.password.valid && form.password ? 'success' : ''}`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {renderFieldError('password')}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link to="/password_reset" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isFormValid() || isSubmitting}
              icon={faSignInAlt}
              className="login-submit"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Register Link */}
            <div className="login-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="register-link">
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;