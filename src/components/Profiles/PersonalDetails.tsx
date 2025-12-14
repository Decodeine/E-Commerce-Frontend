import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { accountsApi, validateEmail, validatePassword, validatePhoneNumber } from "../../services/accountsApi";
import { showToast } from "../../store/actions/storeActions";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  phone_number?: string;
  date_of_birth?: string;
  bio?: string;
}

interface PersonalDetailsProps {
  userProfile: UserProfile | null;
  onProfileUpdate: () => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  bio: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface FormErrors {
  [key: string]: string;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ userProfile, onProfileUpdate }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    bio: "",
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        email: userProfile.email || "",
        phone_number: userProfile.phone_number || "",
        date_of_birth: userProfile.date_of_birth || "",
        bio: userProfile.bio || ""
      }));
    }
  }, [userProfile]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "first_name":
      case "last_name":
        return value.trim().length < 2 ? `${name.replace('_', ' ')} must be at least 2 characters` : "";
      
      case "email":
        return !validateEmail(value) ? "Please enter a valid email address" : "";
      
      case "phone_number":
        return value && !validatePhoneNumber(value) ? "Please enter a valid phone number" : "";
      
      case "new_password":
        if (showPasswordFields && value) {
          const validation = validatePassword(value);
          setPasswordStrength(validation.strength);
          return !validation.valid ? "Password must meet all requirements" : "";
        }
        return "";
      
      case "confirm_password":
        return showPasswordFields && value !== formData.new_password ? "Passwords do not match" : "";
      
      case "current_password":
        return showPasswordFields && !value ? "Current password is required to change password" : "";
      
      default:
        return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate basic fields
    newErrors.first_name = validateField("first_name", formData.first_name);
    newErrors.last_name = validateField("last_name", formData.last_name);
    newErrors.email = validateField("email", formData.email);
    
    if (formData.phone_number) {
      newErrors.phone_number = validateField("phone_number", formData.phone_number);
    }

    // Validate password fields if they're shown and have values
    if (showPasswordFields) {
      if (formData.new_password) {
        newErrors.current_password = validateField("current_password", formData.current_password);
        newErrors.new_password = validateField("new_password", formData.new_password);
        newErrors.confirm_password = validateField("confirm_password", formData.confirm_password);
      }
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      dispatch(showToast({
        message: "Please fix the errors before submitting",
        type: "error"
      }));
      return;
    }

    setLoading(true);

    try {
      // Update profile information
      const profileData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth || null,
        bio: formData.bio
      };

      await accountsApi.updateProfile(profileData);

      // Change password if provided
      if (showPasswordFields && formData.new_password) {
        await accountsApi.changePassword(
          formData.current_password,
          formData.new_password,
          formData.confirm_password
        );
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          current_password: "",
          new_password: "",
          confirm_password: ""
        }));
        setShowPasswordFields(false);
      }

      dispatch(showToast({
        message: "Profile updated successfully",
        type: "success"
      }));

      onProfileUpdate();
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          "Failed to update profile";
      
      dispatch(showToast({
        message: errorMessage,
        type: "error"
      }));
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = (isValid: boolean) => {
    return isValid ? "text-green-600" : "text-red-600";
  };

  const getFieldClass = (fieldName: string) => {
    const hasError = errors[fieldName];
    const baseClass = "w-full rounded-lg border px-4 py-2 text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/20";
    if (hasError) {
      return `${baseClass} border-red-300 focus:border-red-500`;
    }
    if (formData[fieldName as keyof FormData] && !hasError) {
      return `${baseClass} border-green-300 focus:border-green-500`;
    }
    return `${baseClass} border-slate-300 focus:border-blue-600`;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Personal Details</h2>
        <p className="mt-1 text-slate-600">Manage your personal information and account settings</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FontAwesomeIcon icon={faUser} className="text-blue-600" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="mb-2 block text-sm font-medium text-slate-700">
                First Name *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={getFieldClass("first_name")}
                required
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="mb-2 block text-sm font-medium text-slate-700">
                Last Name *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={getFieldClass("last_name")}
                required
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`${getFieldClass("email")} bg-slate-50 cursor-not-allowed`}
                disabled
                title="Email cannot be changed. Contact support if needed."
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <div>
              <label htmlFor="phone_number" className="mb-2 block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className={getFieldClass("phone_number")}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="date_of_birth" className="mb-2 block text-sm font-medium text-slate-700">
              Date of Birth
            </label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className={getFieldClass("date_of_birth")}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="mt-6">
            <label htmlFor="bio" className="mb-2 block text-sm font-medium text-slate-700">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className={getFieldClass("bio")}
              rows={4}
              placeholder="Tell us a bit about yourself..."
              maxLength={500}
            />
            <p className="mt-1 text-xs text-slate-500">
              {formData.bio.length}/500 characters
            </p>
          </div>
        </Card>

        {/* Password Change Section */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <FontAwesomeIcon icon={faLock} className="text-blue-600" />
                Change Password
              </h3>
              <p className="mt-1 text-sm text-slate-600">Update your account password for better security</p>
            </div>
            <Button
              type="button"
              variant={showPasswordFields ? "outline" : "primary"}
              onClick={() => setShowPasswordFields(!showPasswordFields)}
            >
              {showPasswordFields ? "Cancel" : "Change Password"}
            </Button>
          </div>

          {showPasswordFields && (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label htmlFor="current_password" className="mb-2 block text-sm font-medium text-slate-700">
                  Current Password *
                </label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  className={getFieldClass("current_password")}
                  required={showPasswordFields}
                />
                {errors.current_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                )}
              </div>

              <div>
                <label htmlFor="new_password" className="mb-2 block text-sm font-medium text-slate-700">
                  New Password *
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  className={getFieldClass("new_password")}
                  required={showPasswordFields}
                />
                {errors.new_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
                )}
                
                {formData.new_password && (
                  <div className="mt-3 space-y-1 text-xs">
                    <p className="font-medium text-slate-700">Password Requirements:</p>
                    <div className={`flex items-center gap-2 ${getPasswordStrengthColor(passwordStrength.minLength)}`}>
                      <FontAwesomeIcon icon={passwordStrength.minLength ? faCheckCircle : faTimesCircle} className="text-xs" />
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${getPasswordStrengthColor(passwordStrength.hasUpper)}`}>
                      <FontAwesomeIcon icon={passwordStrength.hasUpper ? faCheckCircle : faTimesCircle} className="text-xs" />
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 ${getPasswordStrengthColor(passwordStrength.hasLower)}`}>
                      <FontAwesomeIcon icon={passwordStrength.hasLower ? faCheckCircle : faTimesCircle} className="text-xs" />
                      <span>One lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 ${getPasswordStrengthColor(passwordStrength.hasNumber)}`}>
                      <FontAwesomeIcon icon={passwordStrength.hasNumber ? faCheckCircle : faTimesCircle} className="text-xs" />
                      <span>One number</span>
                    </div>
                    <div className={`flex items-center gap-2 ${getPasswordStrengthColor(passwordStrength.hasSpecial)}`}>
                      <FontAwesomeIcon icon={passwordStrength.hasSpecial ? faCheckCircle : faTimesCircle} className="text-xs" />
                      <span>One special character</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirm_password" className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className={getFieldClass("confirm_password")}
                  required={showPasswordFields}
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="min-w-[150px]"
          >
            {loading ? <Loading size="sm" /> : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetails;
