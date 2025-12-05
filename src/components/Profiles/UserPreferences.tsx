import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { accountsApi, UserPreferences as APIUserPreferences } from "../../services/accountsApi";
import { showToast } from "../../store/actions/storeActions";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-slate-300'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      onClick={!disabled ? onChange : undefined}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loading variant="spinner" size="lg" />
          <p className="mt-4 text-slate-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Preferences</h2>
          <p className="mt-1 text-slate-600">Customize your shopping experience and account settings</p>
        </div>
        {hasChanges && (
          <Button 
            variant="primary" 
            onClick={handleSavePreferences}
            disabled={saving}
          >
            {saving ? <Loading size="sm" /> : 'Save Changes'}
          </Button>
        )}
      </div>

      {/* Notification Preferences */}
      <Card className="p-6">
        <h3 className="mb-6 text-xl font-semibold text-slate-900">
          Notification Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">Email Notifications</h4>
              <p className="mt-1 text-sm text-slate-600">Receive important updates and order confirmations via email</p>
            </div>
            <ToggleSwitch 
              checked={preferences.email_notifications}
              onChange={() => handleToggleChange('email_notifications')}
            />
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">Order Updates</h4>
              <p className="mt-1 text-sm text-slate-600">Get notified about order status changes and shipping updates</p>
            </div>
            <ToggleSwitch 
              checked={preferences.order_updates}
              onChange={() => handleToggleChange('order_updates')}
            />
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">Security Alerts</h4>
              <p className="mt-1 text-sm text-slate-600">Receive notifications about account security and login activities</p>
            </div>
            <ToggleSwitch 
              checked={preferences.security_alerts}
              onChange={() => handleToggleChange('security_alerts')}
            />
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">Push Notifications</h4>
              <p className="mt-1 text-sm text-slate-600">Receive push notifications on your device</p>
            </div>
            <ToggleSwitch 
              checked={preferences.push_notifications}
              onChange={() => handleToggleChange('push_notifications')}
            />
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">SMS Notifications</h4>
              <p className="mt-1 text-sm text-slate-600">Receive text messages for urgent updates</p>
            </div>
            <ToggleSwitch 
              checked={preferences.sms_notifications}
              onChange={() => handleToggleChange('sms_notifications')}
            />
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">Newsletter Subscription</h4>
              <p className="mt-1 text-sm text-slate-600">Stay updated with our latest products and exclusive offers</p>
            </div>
            <ToggleSwitch 
              checked={preferences.newsletter_subscribed}
              onChange={() => handleToggleChange('newsletter_subscribed')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">Marketing Emails</h4>
              <p className="mt-1 text-sm text-slate-600">Receive promotional emails and special discount offers</p>
            </div>
            <ToggleSwitch 
              checked={preferences.marketing_emails}
              onChange={() => handleToggleChange('marketing_emails')}
            />
          </div>
        </div>
      </Card>

      {/* Shopping Preferences */}
      <Card className="p-6">
        <h3 className="mb-6 text-xl font-semibold text-slate-900">
          Shopping Preferences
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Currency</label>
            <select
              name="currency"
              value={preferences.currency}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Language</label>
            <select
              name="language"
              value={preferences.language}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              {languages.map(language => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-slate-700">Budget Range</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="budget_range_min"
              value={preferences.budget_range_min}
              onChange={handleInputChange}
              placeholder="Min amount"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              min="0"
              step="10"
            />
            <input
              type="number"
              name="budget_range_max"
              value={preferences.budget_range_max}
              onChange={handleInputChange}
              placeholder="Max amount"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              min="0"
              step="10"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-slate-700">Preferred Categories</label>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {availableCategories.map(category => (
              <label 
                key={category}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors ${
                  preferences.preferred_categories.includes(category) 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={preferences.preferred_categories.includes(category)}
                  onChange={() => handleArrayChange('preferred_categories', category)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-slate-700">Preferred Brands</label>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {availableBrands.map(brand => (
              <label 
                key={brand}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors ${
                  preferences.preferred_brands.includes(brand) 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={preferences.preferred_brands.includes(brand)}
                  onChange={() => handleArrayChange('preferred_brands', brand)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      </Card>

      {/* Display & Accessibility */}
      <Card className="p-6">
        <h3 className="mb-6 text-xl font-semibold text-slate-900">
          Display & Accessibility
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">Theme Preference</h4>
              <p className="mt-1 text-sm text-slate-600">Choose your preferred color scheme</p>
            </div>
            <select
              name="theme"
              value={preferences.theme}
              onChange={handleInputChange}
              className="min-w-[120px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Timezone</label>
            <input
              type="text"
              name="timezone"
              value={preferences.timezone}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              placeholder="Your timezone"
            />
            <p className="mt-1 text-xs text-slate-500">
              Current timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className="p-6">
        <h3 className="mb-6 text-xl font-semibold text-slate-900">
          Privacy Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">Analytics & Performance</h4>
              <p className="mt-1 text-sm text-slate-600">Help us improve our service by sharing anonymous usage data</p>
            </div>
            <ToggleSwitch 
              checked={preferences.privacy_analytics}
              onChange={() => handleToggleChange('privacy_analytics')}
            />
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">Personalization</h4>
              <p className="mt-1 text-sm text-slate-600">Allow us to personalize your shopping experience based on your preferences</p>
            </div>
            <ToggleSwitch 
              checked={preferences.privacy_personalization}
              onChange={() => handleToggleChange('privacy_personalization')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">Third-party Sharing</h4>
              <p className="mt-1 text-sm text-slate-600">Allow sharing of anonymized data with trusted partners for better recommendations</p>
            </div>
            <ToggleSwitch 
              checked={preferences.privacy_third_party}
              onChange={() => handleToggleChange('privacy_third_party')}
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-center">
          <Button 
            variant="primary" 
            onClick={handleSavePreferences}
            disabled={saving}
            className="min-w-[200px]"
          >
            {saving ? <Loading size="sm" /> : 'Save All Preferences'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserPreferences;
