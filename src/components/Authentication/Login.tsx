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
  faCheckCircle,
  faUserCheck
} from "@fortawesome/free-solid-svg-icons";
import { authClearErrors, authLogin } from "../../store/actions/authActions";
import { useToast } from "../UI/Toast/ToastProvider";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import SuccessModal from "./SuccessModal"; // Import the success modal
import { validateEmail } from "../../services/accountsApi";
import type { AppDispatch } from "../../store/store";

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    dispatch(authClearErrors());
  }, [dispatch]);

  useEffect(() => {
    if (token && !error) {
      // Check if admin and redirect immediately, otherwise show success modal
      const checkAndRedirect = async () => {
        try {
          const { accountsApi } = await import("../../services/accountsApi");
          const user = await accountsApi.getUserProfile();
          const isAdmin = (user as any).is_staff || (user as any).is_superuser;
          
          if (isAdmin) {
            // Redirect admin immediately to admin dashboard
            navigate("/admin", { replace: true });
          } else {
            // Show success modal for regular users
            setShowSuccessModal(true);
          }
        } catch (error) {
          // If check fails, show success modal
          console.error('Error checking admin status:', error);
          setShowSuccessModal(true);
        }
      };
      
      checkAndRedirect();
    }
  }, [token, error, navigate]);

  useEffect(() => {
    if (error) {
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: error.response?.data?.detail || 'Invalid credentials. Please check your email and password.'
      });
    }
  }, [error, showToast]);

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate regular users to their intended destination or home
    const from = (location.state && (location.state as any).from?.pathname) || "/";
    navigate(from, { replace: true });
  };

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
        <div className="mt-2 flex items-center gap-2 rounded-lg border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>{field.message}</span>
        </div>
      );
    }
    if (field.valid && field.message) {
      return (
        <div className="mt-2 flex items-center gap-2 rounded-lg border-l-4 border-green-500 bg-green-50 px-3 py-2 text-sm text-green-700">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>{field.message}</span>
        </div>
      );
    }
    return null;
  };

  if (loading && !isSubmitting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50 p-4">
        <Loading variant="spinner" size="lg" text="Signing you in..." />
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
              <FontAwesomeIcon icon={faSignInAlt} className="text-2xl text-white" />
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
              Welcome Back
            </h1>
            <p className="text-slate-600">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
              <label htmlFor="password" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FontAwesomeIcon icon={faLock} className="text-blue-600" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className={`
                    w-full rounded-lg border px-4 py-3 pr-12 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${!validation.password.valid 
                      ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : validation.password.valid && form.password 
                        ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500'
                        : 'border-slate-300 bg-white'
                    }
                  `}
                  placeholder="Enter your password"
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
              {renderFieldError('password')}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>
              <Link 
                to="/password_reset" 
                className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
              >
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
              className="mt-2"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Register Link */}
            <div className="mt-6 border-t border-slate-200 pt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
                  Create one here
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
        title="Welcome Back!"
        message="You have successfully signed in to your account. Redirecting you to the dashboard..."
        icon={faUserCheck}
        autoClose={true}
        autoCloseDelay={2500}
        confirmText="Continue to Dashboard"
      />
    </div>
  );
};

export default Login;