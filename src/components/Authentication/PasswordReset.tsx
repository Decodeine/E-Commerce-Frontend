import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEnvelope, 
  faLock, 
  faEye, 
  faEyeSlash,
  faKey,
  faCheckCircle,
  faExclamationCircle,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../UI/Toast/ToastProvider";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import { validateEmail, validatePassword, requestPasswordReset, confirmPasswordReset } from "../../services/accountsApi";
import "./css/PasswordReset.css";

interface PasswordResetFormData {
  email: string;
}

interface PasswordConfirmFormData {
  new_password1: string;
  new_password2: string;
}

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

const PasswordReset: React.FC = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams<{ uid?: string; token?: string }>();
  const { showToast } = useToast();
  const isConfirmMode = !!(uid && token);

  // Helper function to convert password strength
  const convertPasswordStrength = (strength: Record<string, boolean>): PasswordStrength => ({
    minLength: strength.minLength || false,
    hasUpper: strength.hasUpper || false,
    hasLower: strength.hasLower || false,
    hasNumber: strength.hasNumber || false,
    hasSpecial: strength.hasSpecial || false
  });

  // Reset request form state
  const [resetForm, setResetForm] = useState<PasswordResetFormData>({
    email: ""
  });

  // Password confirmation form state
  const [confirmForm, setConfirmForm] = useState<PasswordConfirmFormData>({
    new_password1: "",
    new_password2: ""
  });

  const [validation, setValidation] = useState<{
    email: ValidationField;
    new_password1: ValidationField;
    new_password2: ValidationField;
  }>({
    email: { valid: true, message: "" },
    new_password1: { valid: true, message: "", strength: { minLength: false, hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false } },
    new_password2: { valid: true, message: "" }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

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

      case 'new_password1':
        if (!value) {
          newValidation.new_password1 = { 
            valid: false, 
            message: 'Password is required', 
            strength: { minLength: false, hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false }
          };
        } else {
          const passwordCheck = validatePassword(value);
          if (!passwordCheck.valid) {
            newValidation.new_password1 = { 
              valid: false, 
              message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
              strength: convertPasswordStrength(passwordCheck.strength)
            };
          } else {
            newValidation.new_password1 = { 
              valid: true, 
              message: 'Strong password!',
              strength: convertPasswordStrength(passwordCheck.strength)
            };
          }
        }
        break;

      case 'new_password2':
        if (!value) {
          newValidation.new_password2 = { valid: false, message: 'Please confirm your password' };
        } else if (value !== confirmForm.new_password1) {
          newValidation.new_password2 = { valid: false, message: 'Passwords do not match' };
        } else {
          newValidation.new_password2 = { valid: true, message: 'Passwords match' };
        }
        break;
    }

    setValidation(newValidation);
  };

  const handleResetFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetForm({ ...resetForm, [name]: value });
    validateField(name, value);
  };

  const handleConfirmFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfirmForm({ ...confirmForm, [name]: value });
    validateField(name, value);
  };

  const isResetFormValid = () => {
    return validation.email.valid && resetForm.email.trim() !== '';
  };

  const isConfirmFormValid = () => {
    return validation.new_password1.valid && 
           validation.new_password2.valid && 
           confirmForm.new_password1.trim() !== '' && 
           confirmForm.new_password2.trim() !== '';
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isResetFormValid()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a valid email address.'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await requestPasswordReset(resetForm.email);
      setIsEmailSent(true);
      showToast({
        type: 'success',
        title: 'Email Sent!',
        message: 'Check your email for password reset instructions.'
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Reset Failed',
        message: error.response?.data?.detail || 'Failed to send reset email. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfirmFormValid()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix all errors before submitting.'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await confirmPasswordReset(uid!, token!, confirmForm.new_password1, confirmForm.new_password2);
      showToast({
        type: 'success',
        title: 'Password Reset Successfully!',
        message: 'Your password has been updated. You can now log in with your new password.'
      });
      navigate('/login');
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Reset Failed',
        message: error.response?.data?.detail || 'Failed to reset password. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPasswordStrength = () => {
    if (!confirmForm.new_password1 || !validation.new_password1.strength) return null;

    const { strength } = validation.new_password1;
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
    if (field.valid && field.message && fieldName !== 'new_password1') {
      return (
        <div className="field-success">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>{field.message}</span>
        </div>
      );
    }
    return null;
  };

  if (isSubmitting) {
    return (
      <div className="password-reset-container">
        <Loading variant="spinner" size="lg" text={isConfirmMode ? "Resetting password..." : "Sending reset email..."} />
      </div>
    );
  }

  return (
    <div className="password-reset-container">
      <div className="password-reset-content">
        <Card className="password-reset-card" padding="xl">
          <div className="password-reset-header">
            <div className="password-reset-icon">
              <FontAwesomeIcon icon={isConfirmMode ? faLock : faKey} />
            </div>
            <h1>{isConfirmMode ? 'Set New Password' : 'Reset Password'}</h1>
            <p>
              {isConfirmMode 
                ? 'Enter your new password below' 
                : isEmailSent 
                  ? 'Check your email for reset instructions'
                  : 'Enter your email to receive reset instructions'
              }
            </p>
          </div>

          {!isConfirmMode && !isEmailSent && (
            <form onSubmit={handleResetSubmit} className="password-reset-form">
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
                  value={resetForm.email}
                  onChange={handleResetFormChange}
                  className={`form-input ${!validation.email.valid ? 'error' : validation.email.valid && resetForm.email ? 'success' : ''}`}
                  placeholder="Enter your email address"
                  required
                />
                {renderFieldError('email')}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!isResetFormValid() || isSubmitting}
                icon={faKey}
                className="password-reset-submit"
              >
                Send Reset Email
              </Button>

              {/* Back to Login */}
              <div className="password-reset-footer">
                <Link to="/login" className="back-to-login">
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {!isConfirmMode && isEmailSent && (
            <div className="email-sent-content">
              <div className="email-sent-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h3>Email Sent!</h3>
              <p>
                We've sent password reset instructions to <strong>{resetForm.email}</strong>
              </p>
              <p className="email-instruction">
                Click the link in the email to reset your password. 
                The link will expire in 24 hours.
              </p>
              
              <div className="email-sent-actions">
                <Button
                  variant="secondary"
                  onClick={() => setIsEmailSent(false)}
                  className="resend-button"
                >
                  Send Another Email
                </Button>
                <Link to="/login" className="back-to-login">
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Back to Login
                </Link>
              </div>
            </div>
          )}

          {isConfirmMode && (
            <form onSubmit={handleConfirmSubmit} className="password-reset-form">
              {/* New Password Field */}
              <div className="form-group">
                <label htmlFor="new_password1">
                  <FontAwesomeIcon icon={faLock} />
                  New Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="new_password1"
                    name="new_password1"
                    type={showPassword ? "text" : "password"}
                    value={confirmForm.new_password1}
                    onChange={handleConfirmFormChange}
                    className={`form-input ${!validation.new_password1.valid ? 'error' : validation.new_password1.valid && confirmForm.new_password1 ? 'success' : ''}`}
                    placeholder="Enter your new password"
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
                {confirmForm.new_password1 && renderPasswordStrength()}
                {renderFieldError('new_password1')}
              </div>

              {/* Confirm New Password Field */}
              <div className="form-group">
                <label htmlFor="new_password2">
                  <FontAwesomeIcon icon={faLock} />
                  Confirm New Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="new_password2"
                    name="new_password2"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmForm.new_password2}
                    onChange={handleConfirmFormChange}
                    className={`form-input ${!validation.new_password2.valid ? 'error' : validation.new_password2.valid && confirmForm.new_password2 ? 'success' : ''}`}
                    placeholder="Confirm your new password"
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
                {renderFieldError('new_password2')}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!isConfirmFormValid() || isSubmitting}
                icon={faLock}
                className="password-reset-submit"
              >
                Update Password
              </Button>

              {/* Back to Login */}
              <div className="password-reset-footer">
                <Link to="/login" className="back-to-login">
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PasswordReset;
