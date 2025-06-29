import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faEnvelope, faLock, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { authClearErrors, authLogin } from "../../store/actions/authActions";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import { useToast } from "../UI/Toast/ToastProvider";
import type { AppDispatch } from "../../store/store";
import "./css/Login.css"; 

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); 
  const { token, error, loading } = useSelector((state: any) => state.auth);
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    dispatch(authClearErrors());
  }, [dispatch]);

  useEffect(() => {
    if (token && !error) {
      const from =
        (location.state && (location.state as any).from?.pathname) ||
        "/";
      navigate(from, { replace: true });
      showToast({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have been successfully logged in.'
      });
    }
  }, [token, error, location.state, navigate, showToast]);

  useEffect(() => {
    if (error) {
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: 'Invalid email or password. Please try again.'
      });
    }
  }, [error, showToast]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await dispatch(authLogin(email, password));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-loading">
          <Loading 
            variant="spinner" 
            size="lg" 
            text="Signing you in..." 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <Card variant="elevated" padding="xl" className="login-card">
          <div className="login-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your account to continue shopping</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <FontAwesomeIcon icon={faEnvelope} className="label-icon" />
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email address"
                  className={`form-input ${validationErrors.email ? 'error' : ''}`}
                  required
                />
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              </div>
              {validationErrors.email && (
                <span className="error-message">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FontAwesomeIcon icon={faLock} className="label-icon" />
                Password
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  className={`form-input ${validationErrors.password ? 'error' : ''}`}
                  required
                />
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {validationErrors.password && (
                <span className="error-message">{validationErrors.password}</span>
              )}
            </div>

            <div className="form-actions">
              <Button 
                type="submit" 
                variant="primary" 
                size="lg"
                fullWidth
                disabled={loading}
                icon={faArrowRight}
                className="login-button"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>
          </form>

          <div className="login-footer">
            <div className="login-links">
              <Link to="/password-reset" className="forgot-password-link">
                Forgot your password?
              </Link>
            </div>
            
            <div className="signup-prompt">
              <span>Don't have an account? </span>
              <Link to="/register" className="signup-link">
                Create Account
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;