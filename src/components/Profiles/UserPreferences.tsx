import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { accountsApi, UserPreferences as APIUserPreferences } from "../../services/accountsApi";
import { showToast } from "../../store/actions/storeActions";
import Button from "../UI/Button/Button";
import Loading from "../UI/Loading/Loading";

interface UserPreferences extends APIUserPreferences {
  // Additional client-side preferences
  newsletter_subscribed: boolean;
  sms_notifications: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  order_updates: boolean;
  security_alerts: boolean;
  preferred_brands: string[];
  preferred_categories: string[];
  budget_range_min: string;
  budget_range_max: string;
  privacy_analytics: boolean;
  privacy_personalization: boolean;
  privacy_third_party: boolean;
}

const UserPreferences: React.FC = () => {
  const dispatch = useDispatch();
  const [preferences, setPreferences] = useState<UserPreferences>({
    id: 0,
    theme: 'light',
    language: 'en',
    currency: 'USD',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    price_alerts_enabled: false,
    deal_notifications: false,
    new_product_notifications: false,
    inventory_notifications: false,
    profile_visibility: 'public',
    allow_reviews_display: true,
    allow_data_collection: false,
    created_at: '',
    updated_at: '',
    newsletter_subscribed: false,
    sms_notifications: false,
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    order_updates: true,
    security_alerts: true,
    preferred_brands: [],
    preferred_categories: [],
    budget_range_min: "",
    budget_range_max: "",
    privacy_analytics: false,
    privacy_personalization: true,
    privacy_third_party: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const availableCategories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors',
    'Beauty & Personal Care', 'Books', 'Automotive', 'Toys & Games',
    'Health & Wellness', 'Food & Beverages', 'Music & Movies', 'Travel'
  ];

  const availableBrands = [
    'Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Microsoft',
    'Google', 'Amazon', 'Tesla', 'Dell', 'HP', 'Canon'
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' }
  ];

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await accountsApi.getPreferences();
      setPreferences(prev => ({ ...prev, ...response }));
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      dispatch(showToast({
        message: 'Failed to load preferences',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = (key: keyof UserPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setHasChanges(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
    setHasChanges(true);
  };

  const handleArrayChange = (key: 'preferred_brands' | 'preferred_categories', value: string) => {
    setPreferences(prev => {
      const currentArray = prev[key];
      const updatedArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [key]: updatedArray
      };
    });
    setHasChanges(true);
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    
    try {
      await accountsApi.updatePreferences(preferences);
      dispatch(showToast({
        message: 'Preferences saved successfully',
        type: 'success'
      }));
      setHasChanges(false);
    } catch (error: any) {
      console.error('Failed to save preferences:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to save preferences';
      
      dispatch(showToast({
        message: errorMessage,
        type: 'error'
      }));
    } finally {
      setSaving(false);
    }
  };

  const ToggleSwitch: React.FC<{ 
    checked: boolean; 
    onChange: () => void; 
    disabled?: boolean;
  }> = ({ checked, onChange, disabled = false }) => (
    <div 
      className={`toggle-switch ${checked ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={!disabled ? onChange : undefined}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
    >
      <div className="toggle-slider" />
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Loading />
        <p>Loading preferences...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="section-title">User Preferences</h2>
        {hasChanges && (
          <Button 
            variant="primary" 
            onClick={handleSavePreferences}
            disabled={saving}
          >
            {saving ? <Loading size="sm" /> : '💾 Save Changes'}
          </Button>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="settings-section">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
          🔔 Notification Preferences
        </h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <h4>Email Notifications</h4>
            <p>Receive important updates and order confirmations via email</p>
          </div>
          <ToggleSwitch 
            checked={preferences.email_notifications}
            onChange={() => handleToggleChange('email_notifications')}
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Order Updates</h4>
            <p>Get notified about order status changes and shipping updates</p>
          </div>
          <ToggleSwitch 
            checked={preferences.order_updates}
            onChange={() => handleToggleChange('order_updates')}
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Security Alerts</h4>
            <p>Receive notifications about account security and login activities</p>
          </div>
          <ToggleSwitch 
            checked={preferences.security_alerts}
            onChange={() => handleToggleChange('security_alerts')}
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Push Notifications</h4>
            <p>Receive push notifications on your device</p>
          </div>
          <ToggleSwitch 
            checked={preferences.push_notifications}
            onChange={() => handleToggleChange('push_notifications')}
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>SMS Notifications</h4>
            <p>Receive text messages for urgent updates</p>
          </div>
          <ToggleSwitch 
            checked={preferences.sms_notifications}
            onChange={() => handleToggleChange('sms_notifications')}
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Newsletter Subscription</h4>
            <p>Stay updated with our latest products and exclusive offers</p>
          </div>
          <ToggleSwitch 
            checked={preferences.newsletter_subscribed}
            onChange={() => handleToggleChange('newsletter_subscribed')}
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Marketing Emails</h4>
            <p>Receive promotional emails and special discount offers</p>
          </div>
          <ToggleSwitch 
            checked={preferences.marketing_emails}
            onChange={() => handleToggleChange('marketing_emails')}
          />
        </div>
      </div>

      {/* Shopping Preferences */}
      <div className="settings-section">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
          🛍️ Shopping Preferences
        </h3>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select
              name="currency"
              value={preferences.currency}
              onChange={handleInputChange}
              className="form-input"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Language</label>
            <select
              name="language"
              value={preferences.language}
              onChange={handleInputChange}
              className="form-input"
            >
              {languages.map(language => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Budget Range</label>
          <div className="form-row">
            <input
              type="number"
              name="budget_range_min"
              value={preferences.budget_range_min}
              onChange={handleInputChange}
              placeholder="Min amount"
              className="form-input"
              min="0"
              step="10"
            />
            <input
              type="number"
              name="budget_range_max"
              value={preferences.budget_range_max}
              onChange={handleInputChange}
              placeholder="Max amount"
              className="form-input"
              min="0"
              step="10"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Preferred Categories</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
            {availableCategories.map(category => (
              <label 
                key={category}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer',
                  padding: '0.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  backgroundColor: preferences.preferred_categories.includes(category) ? '#eff6ff' : 'white'
                }}
              >
                <input
                  type="checkbox"
                  checked={preferences.preferred_categories.includes(category)}
                  onChange={() => handleArrayChange('preferred_categories', category)}
                />
                {category}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Preferred Brands</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
            {availableBrands.map(brand => (
              <label 
                key={brand}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer',
                  padding: '0.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  backgroundColor: preferences.preferred_brands.includes(brand) ? '#eff6ff' : 'white'
                }}
              >
                <input
                  type="checkbox"
                  checked={preferences.preferred_brands.includes(brand)}
                  onChange={() => handleArrayChange('preferred_brands', brand)}
                />
                {brand}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Display & Accessibility */}
      <div className="settings-section">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
          🎨 Display & Accessibility
        </h3>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Theme Preference</h4>
            <p>Choose your preferred color scheme</p>
          </div>
          <select
            name="theme"
            value={preferences.theme}
            onChange={handleInputChange}
            className="form-input"
            style={{ width: 'auto', minWidth: '120px' }}
          >
            <option value="light">☀️ Light</option>
            <option value="dark">🌙 Dark</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Timezone</label>
          <input
            type="text"
            name="timezone"
            value={preferences.timezone}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Your timezone"
          />
          <small style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Current timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </small>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="settings-section">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
          🔒 Privacy Settings
        </h3>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Analytics & Performance</h4>
            <p>Help us improve our service by sharing anonymous usage data</p>
          </div>
          <ToggleSwitch 
            checked={preferences.privacy_analytics}
            onChange={() => handleToggleChange('privacy_analytics')}
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Personalization</h4>
            <p>Allow us to personalize your shopping experience based on your preferences</p>
          </div>
          <ToggleSwitch 
            checked={preferences.privacy_personalization}
            onChange={() => handleToggleChange('privacy_personalization')}
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Third-party Sharing</h4>
            <p>Allow sharing of anonymized data with trusted partners for better recommendations</p>
          </div>
          <ToggleSwitch 
            checked={preferences.privacy_third_party}
            onChange={() => handleToggleChange('privacy_third_party')}
          />
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="form-actions" style={{ marginTop: '2rem', justifyContent: 'center' }}>
          <Button 
            variant="primary" 
            onClick={handleSavePreferences}
            disabled={saving}
            style={{ minWidth: '200px' }}
          >
            {saving ? <Loading size="sm" /> : '💾 Save All Preferences'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserPreferences;
