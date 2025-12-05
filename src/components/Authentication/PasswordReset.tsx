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
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="space-y-2">
          {requirements.map(req => (
            <div key={req.key} className={`flex items-center gap-2 text-sm ${req.met ? 'text-green-700' : 'text-slate-600'}`}>
              <FontAwesomeIcon 
                icon={req.met ? faCheckCircle : faExclamationCircle} 
                className={req.met ? 'text-green-600' : 'text-slate-400'}
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
        <div className="mt-2 flex items-center gap-2 rounded-lg border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>{field.message}</span>
        </div>
      );
    }
    if (field.valid && field.message && fieldName !== 'new_password1') {
      return (
        <div className="mt-2 flex items-center gap-2 rounded-lg border-l-4 border-green-500 bg-green-50 px-3 py-2 text-sm text-green-700">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>{field.message}</span>
        </div>
      );
    }
    return null;
  };

  if (isSubmitting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50 p-4">
        <Loading variant="spinner" size="lg" text={isConfirmMode ? "Resetting password..." : "Sending reset email..."} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 p-4 py-8">
      <div className="relative z-10 w-full max-w-md">
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-md" padding="xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-md transition-transform hover:scale-110 hover:shadow-lg">
              <FontAwesomeIcon icon={isConfirmMode ? faLock : faKey} className="text-2xl text-white" />
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
              {isConfirmMode ? 'Set New Password' : 'Reset Password'}
            </h1>
            <p className="text-slate-600">
              {isConfirmMode 
                ? 'Enter your new password below' 
                : isEmailSent 
                  ? 'Check your email for reset instructions'
                  : 'Enter your email to receive reset instructions'
              }
            </p>
          </div>

          {!isConfirmMode && !isEmailSent && (
            <form onSubmit={handleResetSubmit} className="flex flex-col gap-6">
              {/* Email Field */}
              <div className="flex flex-col">
                <label htmlFor="email" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FontAwesomeIcon icon={faEnvelope} className="text-blue-600" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={resetForm.email}
                  onChange={handleResetFormChange}
                  className={`
                    w-full rounded-lg border px-4 py-3 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${!validation.email.valid 
                      ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : validation.email.valid && resetForm.email 
                        ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500'
                        : 'border-slate-300 bg-white'
                    }
                  `}
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
                className="mt-2"
              >
                Send Reset Email
              </Button>

              {/* Back to Login */}
              <div className="mt-6 border-t border-slate-200 pt-6 text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {!isConfirmMode && isEmailSent && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-white" />
              </div>
              <div>
                <h3 className="mb-2 text-2xl font-bold text-slate-900">Email Sent!</h3>
                <p className="text-slate-600">
                  We've sent password reset instructions to <strong className="text-slate-900">{resetForm.email}</strong>
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Click the link in the email to reset your password. 
                  The link will expire in 24 hours.
                </p>
              </div>
              
              <div className="flex w-full flex-col gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setIsEmailSent(false)}
                  fullWidth
                >
                  Send Another Email
                </Button>
                <Link 
                  to="/login" 
                  className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Back to Login
                </Link>
              </div>
            </div>
          )}

          {isConfirmMode && (
            <form onSubmit={handleConfirmSubmit} className="flex flex-col gap-6">
              {/* New Password Field */}
              <div className="flex flex-col">
                <label htmlFor="new_password1" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FontAwesomeIcon icon={faLock} className="text-blue-600" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new_password1"
                    name="new_password1"
                    type={showPassword ? "text" : "password"}
                    value={confirmForm.new_password1}
                    onChange={handleConfirmFormChange}
                    className={`
                      w-full rounded-lg border px-4 py-3 pr-12 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${!validation.new_password1.valid 
                        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                        : validation.new_password1.valid && confirmForm.new_password1 
                          ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500'
                          : 'border-slate-300 bg-white'
                      }
                    `}
                    placeholder="Enter your new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {confirmForm.new_password1 && renderPasswordStrength()}
                {renderFieldError('new_password1')}
              </div>

              {/* Confirm New Password Field */}
              <div className="flex flex-col">
                <label htmlFor="new_password2" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FontAwesomeIcon icon={faLock} className="text-blue-600" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="new_password2"
                    name="new_password2"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmForm.new_password2}
                    onChange={handleConfirmFormChange}
                    className={`
                      w-full rounded-lg border px-4 py-3 pr-12 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${!validation.new_password2.valid 
                        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                        : validation.new_password2.valid && confirmForm.new_password2 
                          ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500'
                          : 'border-slate-300 bg-white'
                      }
                    `}
                    placeholder="Confirm your new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
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
                className="mt-2"
              >
                Update Password
              </Button>

              {/* Back to Login */}
              <div className="mt-6 border-t border-slate-200 pt-6 text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
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
