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

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 p-4 py-8">
      <div className="relative z-10 w-full max-w-md">
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-md" padding="xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-md transition-transform hover:scale-110 hover:shadow-lg">
              <FontAwesomeIcon icon={faKey} className="text-2xl text-white" />
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
              Change Password
            </h1>
            <p className="text-slate-600">Update your password to keep your account secure</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Current Password Field */}
            <div className="flex flex-col">
              <label htmlFor="old_password" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FontAwesomeIcon icon={faLock} className="text-blue-600" />
                Current Password
              </label>
              <div className="relative">
                <input
                  id="old_password"
                  name="old_password"
                  type={showOldPassword ? "text" : "password"}
                  value={form.old_password}
                  onChange={handleChange}
                  className={`
                    w-full rounded-lg border px-4 py-3 pr-12 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${!validation.old_password.valid 
                      ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : validation.old_password.valid && form.old_password 
                        ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500'
                        : 'border-slate-300 bg-white'
                    }
                  `}
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {renderFieldError('old_password')}
            </div>

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
                  type={showNewPassword ? "text" : "password"}
                  value={form.new_password1}
                  onChange={handleChange}
                  className={`
                    w-full rounded-lg border px-4 py-3 pr-12 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${!validation.new_password1.valid 
                      ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : validation.new_password1.valid && form.new_password1 
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
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {form.new_password1 && renderPasswordStrength()}
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
                  value={form.new_password2}
                  onChange={handleChange}
                  className={`
                    w-full rounded-lg border px-4 py-3 pr-12 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${!validation.new_password2.valid 
                      ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : validation.new_password2.valid && form.new_password2 
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
              disabled={!isFormValid() || isSubmitting}
              icon={faKey}
              className="mt-2"
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
