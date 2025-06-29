import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { accountsApi, validateEmail, validatePassword, validatePhoneNumber } from "../../services/accountsApi";
import { showToast } from "../../store/actions/storeActions";
import Button from "../UI/Button/Button";
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
    return isValid ? "#10b981" : "#ef4444";
  };

  const getFieldClass = (fieldName: string) => {
    const hasError = errors[fieldName];
    const isValid = formData[fieldName as keyof FormData] && !hasError;
    return `form-input ${hasError ? 'error' : ''} ${isValid ? 'success' : ''}`;
  };

  return (
    <div>
      <h2 className="section-title">Personal Details</h2>
      
      <form onSubmit={handleSubmit} className="profile-form">
        {/* Basic Information */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="first_name" className="form-label">First Name *</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className={getFieldClass("first_name")}
              required
            />
            {errors.first_name && <div className="field-error">{errors.first_name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="last_name" className="form-label">Last Name *</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className={getFieldClass("last_name")}
              required
            />
            {errors.last_name && <div className="field-error">{errors.last_name}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={getFieldClass("email")}
              disabled
              title="Email cannot be changed. Contact support if needed."
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
            <small style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Email cannot be changed. Contact support if needed.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="phone_number" className="form-label">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              className={getFieldClass("phone_number")}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone_number && <div className="field-error">{errors.phone_number}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="date_of_birth" className="form-label">Date of Birth</label>
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

        <div className="form-group">
          <label htmlFor="bio" className="form-label">Bio</label>
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
          <small style={{ color: "#64748b", fontSize: "0.875rem" }}>
            {formData.bio.length}/500 characters
          </small>
        </div>

        {/* Password Change Section */}
        <div className="settings-section">
          <div className="setting-item">
            <div className="setting-info">
              <h4>Change Password</h4>
              <p>Update your account password for better security</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="btn-secondary"
            >
              {showPasswordFields ? "Cancel" : "Change Password"}
            </button>
          </div>

          {showPasswordFields && (
            <div className="form-row" style={{ marginTop: "1rem" }}>
              <div className="form-group">
                <label htmlFor="current_password" className="form-label">Current Password *</label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  className={getFieldClass("current_password")}
                  required={showPasswordFields}
                />
                {errors.current_password && <div className="field-error">{errors.current_password}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="new_password" className="form-label">New Password *</label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  className={getFieldClass("new_password")}
                  required={showPasswordFields}
                />
                {errors.new_password && <div className="field-error">{errors.new_password}</div>}
                
                {formData.new_password && (
                  <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
                    <div style={{ marginBottom: "0.25rem", fontWeight: "500" }}>Password Requirements:</div>
                    <div style={{ color: getPasswordStrengthColor(passwordStrength.minLength) }}>
                      ✓ At least 8 characters
                    </div>
                    <div style={{ color: getPasswordStrengthColor(passwordStrength.hasUpper) }}>
                      ✓ One uppercase letter
                    </div>
                    <div style={{ color: getPasswordStrengthColor(passwordStrength.hasLower) }}>
                      ✓ One lowercase letter
                    </div>
                    <div style={{ color: getPasswordStrengthColor(passwordStrength.hasNumber) }}>
                      ✓ One number
                    </div>
                    <div style={{ color: getPasswordStrengthColor(passwordStrength.hasSpecial) }}>
                      ✓ One special character
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password" className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className={getFieldClass("confirm_password")}
                  required={showPasswordFields}
                />
                {errors.confirm_password && <div className="field-error">{errors.confirm_password}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? <Loading size="sm" /> : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetails;