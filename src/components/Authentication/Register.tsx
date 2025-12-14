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
    if (field.valid && field.message && fieldName !== 'password1') {
      return (
        <div className="mt-2 flex items-center gap-2 rounded-lg border-l-4 border-green-500 bg-green-50 px-3 py-2 text-sm text-green-700">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>{field.message}</span>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50 p-4">
        <Loading variant="spinner" size="lg" text="Creating your account..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 p-4 py-8">
      <div className="relative z-10 w-full max-w-2xl">
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-md" padding="xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-md transition-transform hover:scale-110 hover:shadow-lg">
              <FontAwesomeIcon icon={faUserPlus} className="text-2xl text-white" />
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
              Create Account
            </h1>
            <p className="text-slate-600">Join our community and start shopping today</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Name Fields Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col">
                <label htmlFor="first_name" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={form.first_name}
                  onChange={handleChange}
                  className={`
                    w-full rounded-lg border px-4 py-3 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${!validation.first_name.valid 
                      ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : validation.first_name.valid && form.first_name 
                        ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500'
                        : 'border-slate-300 bg-white'
                    }
                  `}
                  placeholder="Enter your first name"
                  required
                />
                {renderFieldError('first_name')}
              </div>

              <div className="flex flex-col">
                <label htmlFor="last_name" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={form.last_name}
                  onChange={handleChange}
                  className={`
                    w-full rounded-lg border px-4 py-3 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${!validation.last_name.valid 
                      ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : validation.last_name.valid && form.last_name 
                        ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500'
                        : 'border-slate-300 bg-white'
                    }
                  `}
                  placeholder="Enter your last name"
                  required
                />
                {renderFieldError('last_name')}
              </div>
            </div>

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
                value={form.email}
                onChange={handleChange}
                className={`
                  w-full rounded-lg border px-4 py-3 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${!validation.email.valid 
                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                    : validation.email.valid && form.email 
                      ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500'
                      : 'border-slate-300 bg-white'
                  }
                `}
                placeholder="Enter your email address"
                required
              />
              {renderFieldError('email')}
            </div>

            {/* Password Field */}
            <div className="flex flex-col">
              <label htmlFor="password1" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FontAwesomeIcon icon={faLock} className="text-blue-600" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password1"
                  name="password1"
                  type={showPassword ? "text" : "password"}
                  value={form.password1}
                  onChange={handleChange}
                  className={`
                    w-full rounded-lg border px-4 py-3 pr-12 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${!validation.password1.valid 
                      ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : validation.password1.valid && form.password1 
                        ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500'
                        : 'border-slate-300 bg-white'
                    }
                  `}
                  placeholder="Create a strong password"
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
              {form.password1 && renderPasswordStrength()}
              {renderFieldError('password1')}
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col">
              <label htmlFor="password2" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FontAwesomeIcon icon={faLock} className="text-blue-600" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="password2"
                  name="password2"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.password2}
                  onChange={handleChange}
                  className={`
                    w-full rounded-lg border px-4 py-3 pr-12 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${!validation.password2.valid 
                      ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : validation.password2.valid && form.password2 
                        ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500'
                        : 'border-slate-300 bg-white'
                    }
                  `}
                  placeholder="Confirm your password"
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
              {renderFieldError('password2')}
            </div>

            {/* Server Errors */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
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
              className="mt-2"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Login Link */}
            <div className="mt-6 border-t border-slate-200 pt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
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