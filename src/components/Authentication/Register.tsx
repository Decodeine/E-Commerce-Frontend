import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faCheckCircle,
  faExclamationCircle,
  faUserPlus,
  faUserCheck
} from "@fortawesome/free-solid-svg-icons";
import { authClearErrors, authSignup } from "../../store/actions/authActions";
import { useToast } from "../UI/Toast/ToastProvider";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import SuccessModal from "./SuccessModal"; // Import the success modal
import { validateEmail, validatePassword } from "../../services/accountsApi";
import type { AppDispatch } from "../../store/store";
import "./css/Register.css";

interface PasswordStrength {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

interface ValidationField {
  valid: boolean;
  message: string;
  strength?: PasswordStrength;
}

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, loading, error } = useSelector((state: any) => state.auth);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Helper function to convert password strength
  const convertPasswordStrength = (strength: Record<string, boolean>): PasswordStrength => ({
    minLength: strength.minLength || false,
    hasUpper: strength.hasUpper || false,
    hasLower: strength.hasLower || false,
    hasNumber: strength.hasNumber || false,
    hasSpecial: strength.hasSpecial || false
  });

  const [form, setForm] = useState({
    email: "",
    password1: "",
    password2: "",
    first_name: "",
    last_name: "",
  });

  const [validation, setValidation] = useState<{
    email: ValidationField;
    password1: ValidationField;
    password2: ValidationField;
    first_name: ValidationField;
    last_name: ValidationField;
  }>({
    email: { valid: true, message: "" },
    password1: { valid: true, message: "", strength: { minLength: false, hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false } },
    password2: { valid: true, message: "" },
    first_name: { valid: true, message: "" },
    last_name: { valid: true, message: "" }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    dispatch(authClearErrors());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      // Show success modal instead of toast
      setShowSuccessModal(true);
    }
  }, [token]);

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);

    // Navigate after modal closes
    navigate("/", { replace: true });
  };

  const validateField = (name: string, value: string) => {
    const newValidation = { ...validation };

    switch (name) {
      case 'first_name':
        if (!value.trim()) {
          newValidation.first_name = { valid: false, message: 'First name is required' };
        } else if (value.trim().length < 2) {
          newValidation.first_name = { valid: false, message: 'First name must be at least 2 characters' };
        } else {
          newValidation.first_name = { valid: true, message: '' };
        }
        break;

      case 'last_name':
        if (!value.trim()) {
          newValidation.last_name = { valid: false, message: 'Last name is required' };
        } else if (value.trim().length < 2) {
          newValidation.last_name = { valid: false, message: 'Last name must be at least 2 characters' };
        } else {
          newValidation.last_name = { valid: true, message: '' };
        }
        break;

      case 'email':
        if (!value.trim()) {
          newValidation.email = { valid: false, message: 'Email is required' };
        } else if (!validateEmail(value)) {
          newValidation.email = { valid: false, message: 'Please enter a valid email address' };
        } else {
          newValidation.email = { valid: true, message: '' };
        }
        break;

      case 'password1':
        if (!value) {
          newValidation.password1 = {
            valid: false,
            message: 'Password is required',
            strength: { minLength: false, hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false }
          };
        } else {
          const passwordCheck = validatePassword(value);
          if (!passwordCheck.valid) {
            newValidation.password1 = {
              valid: false,
              message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
              strength: convertPasswordStrength(passwordCheck.strength)
            };
          } else {
            newValidation.password1 = {
              valid: true,
              message: 'Strong password!',
              strength: convertPasswordStrength(passwordCheck.strength)
            };
          }
        }
        break;

      case 'password2':
        if (!value) {
          newValidation.password2 = { valid: false, message: 'Please confirm your password' };
        } else if (value !== form.password1) {
          newValidation.password2 = { valid: false, message: 'Passwords do not match' };
        } else {
          newValidation.password2 = { valid: true, message: 'Passwords match' };
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
      await dispatch(authSignup(
        form.email,
        form.password1,
        form.password2,
        form.first_name,
        form.last_name
      ));
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Registration Failed',
        message: 'An error occurred during registration. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPasswordStrength = () => {
    if (!form.password1 || !validation.password1.strength) return null;

    const { strength } = validation.password1;
    const requirements = [
      { key: 'minLength', label: 'At least 8 characters', met: strength.minLength },
      { key: 'hasUpper', label: 'Uppercase letter', met: strength.hasUpper },
      { key: 'hasLower', label: 'Lowercase letter', met: strength.hasLower },
      { key: 'hasNumber', label: 'Number', met: strength.hasNumber },
      { key: 'hasSpecial', label: 'Special character', met: strength.hasSpecial }
    ];

    return (
      <div className="password-strength">
        <div className="password-requirements">
          {requirements.map(req => (
            <div key={req.key} className={`requirement ${req.met ? 'met' : 'unmet'}`}>
              <FontAwesomeIcon
                icon={req.met ? faCheckCircle : faExclamationCircle}
                className={req.met ? 'text-success' : 'text-danger'}
              />
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
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
    if (field.valid && field.message && fieldName !== 'password1') {
      return (
        <div className="field-success">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>{field.message}</span>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="register-container">
        <Loading variant="spinner" size="lg" text="Creating your account..." />
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-content">
        <Card className="register-card" padding="xl">
          <div className="register-header">
            <div className="register-icon">
              <FontAwesomeIcon icon={faUserPlus} />
            </div>
            <h1>Create Account</h1>
            <p>Join our community and start shopping today</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {/* Name Fields Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">
                  <FontAwesomeIcon icon={faUser} />
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={form.first_name}
                  onChange={handleChange}
                  className={`form-input ${!validation.first_name.valid ? 'error' : validation.first_name.valid && form.first_name ? 'success' : ''}`}
                  placeholder="Enter your first name"
                  required
                />
                {renderFieldError('first_name')}
              </div>

              <div className="form-group">
                <label htmlFor="last_name">
                  <FontAwesomeIcon icon={faUser} />
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={form.last_name}
                  onChange={handleChange}
                  className={`form-input ${!validation.last_name.valid ? 'error' : validation.last_name.valid && form.last_name ? 'success' : ''}`}
                  placeholder="Enter your last name"
                  required
                />
                {renderFieldError('last_name')}
              </div>
            </div>

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
              <label htmlFor="password1">
                <FontAwesomeIcon icon={faLock} />
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password1"
                  name="password1"
                  type={showPassword ? "text" : "password"}
                  value={form.password1}
                  onChange={handleChange}
                  className={`form-input ${!validation.password1.valid ? 'error' : validation.password1.valid && form.password1 ? 'success' : ''}`}
                  placeholder="Create a strong password"
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
              {form.password1 && renderPasswordStrength()}
              {renderFieldError('password1')}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="password2">
                <FontAwesomeIcon icon={faLock} />
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password2"
                  name="password2"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.password2}
                  onChange={handleChange}
                  className={`form-input ${!validation.password2.valid ? 'error' : validation.password2.valid && form.password2 ? 'success' : ''}`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {renderFieldError('password2')}
            </div>

            {/* Server Errors */}
            {error && (
              <div className="server-error">
                <FontAwesomeIcon icon={faExclamationCircle} />
                <span>
                  {error.response?.data?.detail ||
                    error.response?.data?.non_field_errors?.[0] ||
                    'Registration failed. Please try again.'}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isFormValid() || isSubmitting}
              icon={faUserPlus}
              className="register-submit"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Login Link */}
            <div className="register-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="login-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Account Created Successfully!"
        message={`Welcome to our platform, ${form.first_name}! Your account has been created and you're now ready to start shopping.`}
        icon={faUserCheck}
        autoClose={true}
        autoCloseDelay={3000}
        confirmText="Continue to Dashboard"
      />
    </div>
  );
};

export default Register;