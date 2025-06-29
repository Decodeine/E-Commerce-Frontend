import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLock, 
  faEye, 
  faEyeSlash,
  faCheckCircle,
  faExclamationCircle,
  faKey
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../UI/Toast/ToastProvider";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import { validatePassword, changeUserPassword } from "../../services/accountsApi";
import "./css/ChangePassword.css";

interface ChangePasswordFormData {
  old_password: string;
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

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Helper function to convert password strength
  const convertPasswordStrength = (strength: Record<string, boolean>): PasswordStrength => ({
    minLength: strength.minLength || false,
    hasUpper: strength.hasUpper || false,
    hasLower: strength.hasLower || false,
    hasNumber: strength.hasNumber || false,
    hasSpecial: strength.hasSpecial || false
  });

  const [form, setForm] = useState<ChangePasswordFormData>({
    old_password: "",
    new_password1: "",
    new_password2: ""
  });

  const [validation, setValidation] = useState<{
    old_password: ValidationField;
    new_password1: ValidationField;
    new_password2: ValidationField;
  }>({
    old_password: { valid: true, message: "" },
    new_password1: { valid: true, message: "", strength: { minLength: false, hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false } },
    new_password2: { valid: true, message: "" }
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: string) => {
    const newValidation = { ...validation };

    switch (name) {
      case 'old_password':
        if (!value) {
          newValidation.old_password = { valid: false, message: 'Current password is required' };
        } else {
          newValidation.old_password = { valid: true, message: '' };
        }
        break;

      case 'new_password1':
        if (!value) {
          newValidation.new_password1 = { 
            valid: false, 
            message: 'New password is required', 
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
          newValidation.new_password2 = { valid: false, message: 'Please confirm your new password' };
        } else if (value !== form.new_password1) {
          newValidation.new_password2 = { valid: false, message: 'Passwords do not match' };
        } else {
          newValidation.new_password2 = { valid: true, message: 'Passwords match' };
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
      await changeUserPassword(form.old_password, form.new_password1, form.new_password2);
      showToast({
        type: 'success',
        title: 'Password Changed!',
        message: 'Your password has been updated successfully.'
      });
      
      // Reset form
      setForm({
        old_password: "",
        new_password1: "",
        new_password2: ""
      });
      
      // Navigate back to profile or dashboard
      navigate('/profile');
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Change Failed',
        message: error.response?.data?.detail || 
                error.response?.data?.old_password?.[0] ||
                'Failed to change password. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPasswordStrength = () => {
    if (!form.new_password1 || !validation.new_password1.strength) return null;

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

  return (
    <div className="change-password-container">
      <div className="change-password-content">
        <Card className="change-password-card" padding="xl">
          <div className="change-password-header">
            <div className="change-password-icon">
              <FontAwesomeIcon icon={faKey} />
            </div>
            <h1>Change Password</h1>
            <p>Update your password to keep your account secure</p>
          </div>

          <form onSubmit={handleSubmit} className="change-password-form">
            {/* Current Password Field */}
            <div className="form-group">
              <label htmlFor="old_password">
                <FontAwesomeIcon icon={faLock} />
                Current Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="old_password"
                  name="old_password"
                  type={showOldPassword ? "text" : "password"}
                  value={form.old_password}
                  onChange={handleChange}
                  className={`form-input ${!validation.old_password.valid ? 'error' : validation.old_password.valid && form.old_password ? 'success' : ''}`}
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {renderFieldError('old_password')}
            </div>

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
                  type={showNewPassword ? "text" : "password"}
                  value={form.new_password1}
                  onChange={handleChange}
                  className={`form-input ${!validation.new_password1.valid ? 'error' : validation.new_password1.valid && form.new_password1 ? 'success' : ''}`}
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {form.new_password1 && renderPasswordStrength()}
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
                  value={form.new_password2}
                  onChange={handleChange}
                  className={`form-input ${!validation.new_password2.valid ? 'error' : validation.new_password2.valid && form.new_password2 ? 'success' : ''}`}
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
              disabled={!isFormValid() || isSubmitting}
              icon={faKey}
              className="change-password-submit"
            >
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </Button>

            {/* Cancel Button */}
            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => navigate('/profile')}
              className="change-password-cancel"
            >
              Cancel
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
