import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faPlus, 
  faTrash, 
  faEdit,
  faArrowDown,
  faArrowUp,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import { useToast } from '../UI/Toast/ToastProvider';
import { fetchPriceAlerts, createPriceAlert, deletePriceAlert } from '../../store/actions/storeActions';
import type { AppDispatch } from '../../store/store';
import './css/PriceAlerts.css';

interface PriceAlert {
  id: number;
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    sale_price?: number;
    image: string;
    brand?: string;
  };
  target_price: number;
  current_price: number;
  is_active: boolean;
  triggered: boolean;
  created_at: string;
  triggered_at?: string;
}

interface CreateAlertForm {
  productId: number;
  targetPrice: string;
  productName: string;
  currentPrice: number;
}

const PriceAlerts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { priceAlerts, loading } = useSelector((state: any) => state.store);
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const { showToast } = useToast();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateAlertForm>({
    productId: 0,
    targetPrice: '',
    productName: '',
    currentPrice: 0
  });
  const [filter, setFilter] = useState<'all' | 'active' | 'triggered'>('all');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPriceAlerts());
    }
  }, [dispatch, isAuthenticated]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.productId || !createForm.targetPrice) return;
    
    try {
      await dispatch(createPriceAlert({
        product_id: createForm.productId,
        target_price: parseFloat(createForm.targetPrice)
      }));
      
      setShowCreateForm(false);
      setCreateForm({
        productId: 0,
        targetPrice: '',
        productName: '',
        currentPrice: 0
      });
      
      showToast({
        type: 'success',
        title: 'Price Alert Created',
        message: `You'll be notified when ${createForm.productName} drops to $${createForm.targetPrice}`
      });
      
    } catch (error) {
      console.error('Error creating price alert:', error);
      showToast({
        type: 'error',
        title: 'Failed to Create Alert',
        message: 'Unable to create price alert. Please try again.'
      });
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    try {
      await dispatch(deletePriceAlert(alertId));
      showToast({
        type: 'success',
        title: 'Alert Deleted',
        message: 'Price alert has been removed successfully.'
      });
    } catch (error) {
      console.error('Error deleting price alert:', error);
      showToast({
        type: 'error',
        title: 'Failed to Delete Alert',
        message: 'Unable to delete price alert. Please try again.'
      });
    }
  };

  const filteredAlerts = React.useMemo(() => {
    if (!priceAlerts) return [];
    
    switch (filter) {
      case 'active':
        return priceAlerts.filter((alert: PriceAlert) => alert.is_active && !alert.triggered);
      case 'triggered':
        return priceAlerts.filter((alert: PriceAlert) => alert.triggered);
      default:
        return priceAlerts;
    }
  }, [priceAlerts, filter]);

  const getAlertStatus = (alert: PriceAlert) => {
    if (alert.triggered) return 'triggered';
    if (!alert.is_active) return 'inactive';
    if (alert.current_price <= alert.target_price) return 'ready';
    return 'waiting';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'triggered': return 'var(--success-color)';
      case 'ready': return 'var(--warning-color)';
      case 'inactive': return 'var(--text-secondary)';
      default: return 'var(--primary-color)';
    }
  };

  const getPriceChange = (alert: PriceAlert) => {
    const change = alert.current_price - alert.target_price;
    const percentage = (change / alert.target_price) * 100;
    return { change, percentage };
  };

  if (!isAuthenticated) {
    return (
      <div className="price-alerts-container">
        <Card className="auth-required-card" padding="xl">
          <div className="auth-required-content">
            <FontAwesomeIcon icon={faBell} className="auth-icon" />
            <h2>Sign in to set price alerts</h2>
            <p>Get notified when products drop to your desired price!</p>
            <Button variant="primary" size="lg">
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="price-alerts-container">
      {/* Header */}
      <div className="alerts-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="alerts-title">
              <FontAwesomeIcon icon={faBell} />
              Price Alerts
            </h1>
            <p className="alerts-description">
              Get notified when products reach your target price
            </p>
          </div>
          
          <Button
            variant="primary"
            icon={faPlus}
            onClick={() => setShowCreateForm(true)}
          >
            Create Alert
          </Button>
        </div>
        
        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Alerts ({priceAlerts?.length || 0})
          </button>
          <button
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({priceAlerts?.filter((a: PriceAlert) => a.is_active && !a.triggered).length || 0})
          </button>
          <button
            className={`filter-tab ${filter === 'triggered' ? 'active' : ''}`}
            onClick={() => setFilter('triggered')}
          >
            Triggered ({priceAlerts?.filter((a: PriceAlert) => a.triggered).length || 0})
          </button>
        </div>
      </div>

      {/* Create Alert Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <Card className="create-alert-modal" padding="lg">
            <div className="modal-header">
              <h3>Create Price Alert</h3>
              <button
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleCreateAlert} className="create-alert-form">
              <div className="form-group">
                <label htmlFor="productSearch">Product</label>
                <input
                  type="text"
                  id="productSearch"
                  placeholder="Search for a product..."
                  className="form-input"
                  // TODO: Implement product search autocomplete
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="targetPrice">Target Price ($)</label>
                <input
                  type="number"
                  id="targetPrice"
                  value={createForm.targetPrice}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, targetPrice: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="form-input"
                  required
                />
                {createForm.currentPrice > 0 && (
                  <p className="current-price-info">
                    Current price: ${createForm.currentPrice.toFixed(2)}
                  </p>
                )}
              </div>
              
              <div className="form-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!createForm.productId || !createForm.targetPrice}
                >
                  Create Alert
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Alerts List */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading price alerts...</span>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <Card className="empty-alerts-card" padding="xl">
          <div className="empty-alerts-content">
            <FontAwesomeIcon icon={faBell} className="empty-icon" />
            <h3>No price alerts yet</h3>
            <p>Create your first price alert to get notified when products drop in price!</p>
            <Button
              variant="primary"
              icon={faPlus}
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Alert
            </Button>
          </div>
        </Card>
      ) : (
        <div className="alerts-list">
          {filteredAlerts.map((alert: PriceAlert) => {
            const status = getAlertStatus(alert);
            const priceChange = getPriceChange(alert);
            
            return (
              <Card key={alert.id} className="alert-item" padding="lg">
                <div className="alert-content">
                  <div className="alert-product">
                    <img
                      src={alert.product.image}
                      alt={alert.product.name}
                      className="product-image"
                    />
                    
                    <div className="product-info">
                      <h4 className="product-name">{alert.product.name}</h4>
                      {alert.product.brand && (
                        <p className="product-brand">by {alert.product.brand}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="alert-prices">
                    <div className="price-row">
                      <span className="price-label">Target Price:</span>
                      <span className="target-price">${alert.target_price.toFixed(2)}</span>
                    </div>
                    <div className="price-row">
                      <span className="price-label">Current Price:</span>
                      <span className="current-price">${alert.current_price.toFixed(2)}</span>
                    </div>
                    <div className="price-difference">
                      {priceChange.change > 0 ? (
                        <span className="price-higher">
                          <FontAwesomeIcon icon={faArrowUp} />
                          ${Math.abs(priceChange.change).toFixed(2)} above target
                        </span>
                      ) : (
                        <span className="price-lower">
                          <FontAwesomeIcon icon={faArrowDown} />
                          ${Math.abs(priceChange.change).toFixed(2)} below target
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="alert-status">
                    <div
                      className={`status-indicator ${status}`}
                      style={{ backgroundColor: getStatusColor(status) }}
                    >
                      {status === 'triggered' && <FontAwesomeIcon icon={faCheck} />}
                      {status === 'ready' && <FontAwesomeIcon icon={faBell} />}
                    </div>
                    <div className="status-info">
                      <span className="status-text">
                        {status === 'triggered' && 'Alert Triggered!'}
                        {status === 'ready' && 'Target Reached!'}
                        {status === 'waiting' && 'Monitoring...'}
                        {status === 'inactive' && 'Inactive'}
                      </span>
                      <span className="created-date">
                        Created {new Date(alert.created_at).toLocaleDateString()}
                      </span>
                      {alert.triggered_at && (
                        <span className="triggered-date">
                          Triggered {new Date(alert.triggered_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="alert-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={faEdit}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={faTrash}
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="delete-btn"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PriceAlerts;
