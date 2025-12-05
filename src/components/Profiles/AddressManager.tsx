import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faPlus, faEdit, faTrash, faStar, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { accountsApi } from "../../services/accountsApi";
import { showToast } from "../../store/actions/storeActions";
import Modal from "../UI/Modal/Modal";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
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
    const baseClass = "w-full rounded-lg border px-4 py-2 text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/20";
    if (hasError) {
      return `${baseClass} border-red-300 focus:border-red-500`;
    }
    if (formData[fieldName as keyof AddressFormData] && !hasError) {
      return `${baseClass} border-green-300 focus:border-green-500`;
    }
    return `${baseClass} border-slate-300 focus:border-blue-600`;
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'shipping': return 'Shipping';
      case 'billing': return 'Billing';
      case 'both': return 'Both';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loading variant="spinner" size="lg" />
          <p className="mt-4 text-slate-600">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Address Book</h2>
          <p className="mt-1 text-slate-600">Manage your delivery and billing addresses</p>
        </div>
        <Button variant="primary" onClick={handleAddNew} icon={<FontAwesomeIcon icon={faPlus} />}>
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-4xl text-blue-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900">No Addresses Yet</h3>
          <p className="mb-6 text-slate-600">Start by adding a shipping or billing address</p>
          <Button variant="primary" onClick={handleAddNew} icon={<FontAwesomeIcon icon={faPlus} />}>
            Add Your First Address
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <Card 
              key={address.id} 
              className={`p-6 transition-shadow hover:shadow-md ${
                address.is_default ? 'border-2 border-blue-600' : 'border border-slate-200'
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faHome} className="text-blue-600" />
                  <span className="font-semibold text-slate-900">{getAddressTypeLabel(address.type)}</span>
                </div>
                {address.is_default && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    <FontAwesomeIcon icon={faStar} className="text-xs" />
                    Default
                  </span>
                )}
              </div>
              
              <div className="mb-4 space-y-1 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{address.full_name}</p>
                {address.company && <p>{address.company}</p>}
                <p>{address.address_line_1}</p>
                {address.address_line_2 && <p>{address.address_line_2}</p>}
                <p>{address.city}, {address.state} {address.postal_code}</p>
                <p>{countries.find(c => c.code === address.country)?.name || address.country}</p>
                {address.phone_number && <p className="mt-2">{address.phone_number}</p>}
              </div>
              
              <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(address)}
                  icon={<FontAwesomeIcon icon={faEdit} />}
                >
                  Edit
                </Button>
                
                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    icon={<FontAwesomeIcon icon={faStar} />}
                  >
                    Set Default
                  </Button>
                )}
                
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(address.id)}
                  icon={<FontAwesomeIcon icon={faTrash} />}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="type" className="mb-2 block text-sm font-medium text-slate-700">
              Address Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={getFieldClass('type')}
              required
            >
              <option value="shipping">Shipping Address</option>
              <option value="billing">Billing Address</option>
              <option value="both">Both Shipping & Billing</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="full_name" className="mb-2 block text-sm font-medium text-slate-700">
                Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={getFieldClass('full_name')}
                required
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="company" className="mb-2 block text-sm font-medium text-slate-700">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className={getFieldClass('company')}
              />
            </div>
          </div>

          <div>
            <label htmlFor="address_line_1" className="mb-2 block text-sm font-medium text-slate-700">
              Street Address *
            </label>
            <input
              type="text"
              id="address_line_1"
              name="address_line_1"
              value={formData.address_line_1}
              onChange={handleInputChange}
              className={getFieldClass('address_line_1')}
              required
            />
            {errors.address_line_1 && (
              <p className="mt-1 text-sm text-red-600">{errors.address_line_1}</p>
            )}
          </div>

          <div>
            <label htmlFor="address_line_2" className="mb-2 block text-sm font-medium text-slate-700">
              Apartment, suite, etc.
            </label>
            <input
              type="text"
              id="address_line_2"
              name="address_line_2"
              value={formData.address_line_2}
              onChange={handleInputChange}
              className={getFieldClass('address_line_2')}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="city" className="mb-2 block text-sm font-medium text-slate-700">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={getFieldClass('city')}
                required
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="mb-2 block text-sm font-medium text-slate-700">
                State/Province *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={getFieldClass('state')}
                required
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="postal_code" className="mb-2 block text-sm font-medium text-slate-700">
                Postal Code *
              </label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                className={getFieldClass('postal_code')}
                required
              />
              {errors.postal_code && (
                <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>
              )}
            </div>

            <div>
              <label htmlFor="country" className="mb-2 block text-sm font-medium text-slate-700">
                Country *
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className={getFieldClass('country')}
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
              className={getFieldClass('phone_number')}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone_number && (
              <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={formData.is_default}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_default" className="text-sm font-medium text-slate-700">
              Set as default address
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
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
