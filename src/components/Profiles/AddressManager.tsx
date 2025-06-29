import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { accountsApi } from "../../services/accountsApi";
import { showToast } from "../../store/actions/storeActions";
import Modal from "../UI/Modal/Modal";
import Button from "../UI/Button/Button";
import Loading from "../UI/Loading/Loading";

interface UserAddress {
  id: number;
  type: 'shipping' | 'billing' | 'both';
  full_name: string;
  company: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

interface AddressFormData {
  type: 'shipping' | 'billing' | 'both';
  full_name: string;
  company: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
  is_active: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const AddressManager: React.FC = () => {
  const dispatch = useDispatch();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<AddressFormData>({
    type: 'shipping',
    full_name: '',
    company: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone_number: '',
    is_default: false,
    is_active: true
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' }
  ];

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await accountsApi.getAddresses();
      setAddresses(response);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      dispatch(showToast({
        message: 'Failed to load addresses',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'full_name':
        return value.trim().length < 2 ? 'Full name is required' : '';
      case 'address_line_1':
        return value.trim().length < 5 ? 'Street address is required' : '';
      case 'city':
        return value.trim().length < 2 ? 'City is required' : '';
      case 'state':
        return value.trim().length < 2 ? 'State/Province is required' : '';
      case 'postal_code':
        return value.trim().length < 3 ? 'Postal code is required' : '';
      case 'phone_number':
        return value && !/^\+?[1-9]\d{1,14}$/.test(value.replace(/\s|-/g, '')) 
          ? 'Please enter a valid phone number' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Real-time validation
    if (typeof newValue === 'string') {
      const error = validateField(name, newValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    newErrors.full_name = validateField('full_name', formData.full_name);
    newErrors.address_line_1 = validateField('address_line_1', formData.address_line_1);
    newErrors.city = validateField('city', formData.city);
    newErrors.state = validateField('state', formData.state);
    newErrors.postal_code = validateField('postal_code', formData.postal_code);
    
    if (formData.phone_number) {
      newErrors.phone_number = validateField('phone_number', formData.phone_number);
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      dispatch(showToast({
        message: 'Please fix the errors before submitting',
        type: 'error'
      }));
      return;
    }

    setSubmitting(true);

    try {
      if (editingAddress) {
        await accountsApi.updateAddress(editingAddress.id, formData);
        dispatch(showToast({
          message: 'Address updated successfully',
          type: 'success'
        }));
      } else {
        await accountsApi.createAddress(formData);
        dispatch(showToast({
          message: 'Address added successfully',
          type: 'success'
        }));
      }

      await fetchAddresses();
      handleCloseModal();
    } catch (error: any) {
      console.error('Failed to save address:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to save address';
      
      dispatch(showToast({
        message: errorMessage,
        type: 'error'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      full_name: address.full_name,
      company: address.company,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      phone_number: address.phone_number,
      is_default: address.is_default,
      is_active: address.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (addressId: number) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await accountsApi.deleteAddress(addressId);
      dispatch(showToast({
        message: 'Address deleted successfully',
        type: 'success'
      }));
      await fetchAddresses();
    } catch (error) {
      console.error('Failed to delete address:', error);
      dispatch(showToast({
        message: 'Failed to delete address',
        type: 'error'
      }));
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      await accountsApi.setDefaultAddress(addressId);
      dispatch(showToast({
        message: 'Default address updated',
        type: 'success'
      }));
      await fetchAddresses();
    } catch (error) {
      console.error('Failed to set default address:', error);
      dispatch(showToast({
        message: 'Failed to update default address',
        type: 'error'
      }));
    }
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setFormData({
      type: 'shipping',
      full_name: '',
      company: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      phone_number: '',
      is_default: false,
      is_active: true
    });
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAddress(null);
    setErrors({});
  };

  const getFieldClass = (fieldName: string) => {
    const hasError = errors[fieldName];
    const isValid = formData[fieldName as keyof AddressFormData] && !hasError;
    return `form-input ${hasError ? 'error' : ''} ${isValid ? 'success' : ''}`;
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'shipping': return '📦 Shipping';
      case 'billing': return '💳 Billing';
      case 'both': return '📦💳 Both';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Loading />
        <p>Loading addresses...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="section-title">Address Book</h2>
        <Button variant="primary" onClick={handleAddNew}>
          ➕ Add New Address
        </Button>
      </div>

      <div className="address-grid">
        {addresses.map((address) => (
          <div key={address.id} className={`address-card ${address.is_default ? 'default' : ''}`}>
            <div className="address-type">
              {getAddressTypeLabel(address.type)}
              {address.is_default && <span className="default-badge">Default</span>}
            </div>
            
            <div className="address-details">
              <strong>{address.full_name}</strong><br />
              {address.company && <>{address.company}<br /></>}
              {address.address_line_1}<br />
              {address.address_line_2 && <>{address.address_line_2}<br /></>}
              {address.city}, {address.state} {address.postal_code}<br />
              {countries.find(c => c.code === address.country)?.name || address.country}<br />
              {address.phone_number && <>{address.phone_number}<br /></>}
            </div>
            
            <div className="address-actions">
              <button
                className="btn-link"
                onClick={() => handleEdit(address)}
              >
                ✏️ Edit
              </button>
              
              {!address.is_default && (
                <button
                  className="btn-link"
                  onClick={() => handleSetDefault(address.id)}
                >
                  ⭐ Set Default
                </button>
              )}
              
              <button
                className="btn-link danger"
                onClick={() => handleDelete(address.id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="add-new-card" onClick={handleAddNew}>
            <div className="add-icon">➕</div>
            <h4>Add Your First Address</h4>
            <p>Start by adding a shipping or billing address</p>
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="type" className="form-label">Address Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="shipping">Shipping Address</option>
              <option value="billing">Billing Address</option>
              <option value="both">Both Shipping & Billing</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="full_name" className="form-label">Full Name *</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={getFieldClass('full_name')}
                required
              />
              {errors.full_name && <div className="field-error">{errors.full_name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="company" className="form-label">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address_line_1" className="form-label">Street Address *</label>
            <input
              type="text"
              id="address_line_1"
              name="address_line_1"
              value={formData.address_line_1}
              onChange={handleInputChange}
              className={getFieldClass('address_line_1')}
              required
            />
            {errors.address_line_1 && <div className="field-error">{errors.address_line_1}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="address_line_2" className="form-label">Apartment, suite, etc.</label>
            <input
              type="text"
              id="address_line_2"
              name="address_line_2"
              value={formData.address_line_2}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city" className="form-label">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={getFieldClass('city')}
                required
              />
              {errors.city && <div className="field-error">{errors.city}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="state" className="form-label">State/Province *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={getFieldClass('state')}
                required
              />
              {errors.state && <div className="field-error">{errors.state}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="postal_code" className="form-label">Postal Code *</label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                className={getFieldClass('postal_code')}
                required
              />
              {errors.postal_code && <div className="field-error">{errors.postal_code}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="country" className="form-label">Country *</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone_number" className="form-label">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              className={getFieldClass('phone_number')}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone_number && <div className="field-error">{errors.phone_number}</div>}
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="is_default"
                checked={formData.is_default}
                onChange={handleInputChange}
              />
              Set as default address
            </label>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? <Loading size="sm" /> : (editingAddress ? 'Update Address' : 'Add Address')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddressManager;
