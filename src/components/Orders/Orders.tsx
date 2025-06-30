import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faShoppingBag,
  faBox,
  faTruck,
  faMapMarkerAlt,
  faCalendarAlt,
  faEye,
  faDownload,
  faFilter,
  faSearch,
  faRefresh,
  faTimes,
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faTimesCircle,
  faSpinner,
  faChevronDown,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../UI/Toast/ToastProvider";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import { ordersApi, formatCurrency, formatDate, formatDateTime, getOrderStatusColor, getOrderStatusText } from "../../services/cartApi";
import "./css/Orders.css";

interface Order {
  id: string;
  order_number: string;
  user_email: string;
  user_name: string;
  status: string;
  payment_status: string;
  subtotal: string;
  shipping_cost: string;
  tax_amount: string;
  total_amount: string;
  estimated_delivery_date: string;
  actual_delivery_date?: string;
  tracking_number?: string;
  courier_service?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
  };
  product_name: string;
  product_image: string;
  unit_price: string;
  quantity: number;
  total_price: string;
}

interface OrderFilters {
  status: string;
  payment_status: string;
  date_from: string;
  date_to: string;
  search: string;
}

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState<OrderFilters>({
    status: '',
    payment_status: '',
    date_from: '',
    date_to: '',
    search: ''
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrevious: false
  });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const paymentStatusOptions = [
    { value: '', label: 'All Payment Status' },
    { value: 'pending', label: 'Payment Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Payment Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  useEffect(() => {
    fetchOrders();
  }, [pagination.currentPage, filters]);

  const fetchOrders = async () => {
    try {
      if (pagination.currentPage === 1) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '')
      );

      const response = await ordersApi.getOrders(pagination.currentPage, cleanFilters);
      
      setOrders(response.results || []);
      setPagination({
        currentPage: pagination.currentPage,
        totalPages: Math.ceil((response.count || 0) / 10),
        totalOrders: response.count || 0,
        hasNext: !!response.next,
        hasPrevious: !!response.previous
      });

    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Failed to Load Orders',
        message: error.message || 'Unable to fetch your orders. Please try again.'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFilterChange = (filterName: keyof OrderFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      payment_status: '',
      date_from: '',
      date_to: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleViewOrder = (orderNumber: string) => {
    navigate(`/orders/${orderNumber}`);
  };

  const handleTrackOrder = (orderNumber: string) => {
    navigate(`/orders/${orderNumber}/tracking`);
  };

  const handleCancelOrder = async (orderNumber: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await ordersApi.cancelOrder(orderNumber);
      showToast({
        type: 'success',
        title: 'Order Cancelled',
        message: 'Your order has been cancelled successfully.'
      });
      fetchOrders(); // Refresh orders
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: error.message || 'Unable to cancel order. Please contact support.'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return faSpinner;
      case 'confirmed':
        return faCheckCircle;
      case 'processing':
        return faBox;
      case 'shipped':
        return faTruck;
      case 'out_for_delivery':
        return faMapMarkerAlt;
      case 'delivered':
        return faCheckCircle;
      case 'cancelled':
        return faTimesCircle;
      case 'refunded':
        return faExclamationCircle;
      default:
        return faInfoCircle;
    }
  };

  const canCancelOrder = (order: Order) => {
    return ['pending', 'confirmed'].includes(order.status) && 
           order.payment_status !== 'refunded';
  };

  const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const isExpanded = expandedOrders.has(order.id);
    
    return (
      <Card className="order-card" padding="lg">
        <div className="order-header" onClick={() => toggleOrderExpansion(order.id)}>
          <div className="order-info">
            <div className="order-number">
              <FontAwesomeIcon icon={faShoppingBag} />
              <span>{order.order_number}</span>
            </div>
            <div className="order-date">
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>{formatDate(order.created_at)}</span>
            </div>
          </div>
          
          <div className="order-status">
            <span className={`status-badge status-${getOrderStatusColor(order.status)}`}>
              <FontAwesomeIcon icon={getStatusIcon(order.status)} />
              {getOrderStatusText(order.status)}
            </span>
          </div>
          
          <div className="order-total">
            <span className="total-amount">{formatCurrency(order.total_amount)}</span>
            <span className="item-count">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
          </div>
          
          <div className="expand-icon">
            <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
          </div>
        </div>

        {isExpanded && (
          <div className="order-details">
            <div className="order-items">
              <h4>Order Items</h4>
              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <div className="item-image">
                    <img src={item.product_image} alt={item.product_name} />
                  </div>
                  <div className="item-info">
                    <h5>{item.product_name}</h5>
                    <div className="item-details">
                      <span>Qty: {item.quantity}</span>
                      <span>Price: {formatCurrency(item.unit_price)}</span>
                      <span className="item-total">Total: {formatCurrency(item.total_price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{formatCurrency(order.shipping_cost)}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>{formatCurrency(order.tax_amount)}</span>
              </div>
              <div className="summary-row total-row">
                <span>Total:</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>

            <div className="order-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewOrder(order.order_number)}
                icon={faEye}
              >
                View Details
              </Button>
              
              {order.tracking_number && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTrackOrder(order.order_number)}
                  icon={faTruck}
                >
                  Track Order
                </Button>
              )}
              
              {canCancelOrder(order) && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleCancelOrder(order.order_number)}
                  icon={faTimes}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="orders-container">
        <Loading variant="spinner" size="lg" text="Loading your orders..." />
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-content">
        <div className="orders-header">
          <div className="header-main">
            <div className="orders-icon">
              <FontAwesomeIcon icon={faShoppingBag} />
            </div>
            <div className="header-text">
              <h1>My Orders</h1>
              <p>Track and manage your order history</p>
            </div>
          </div>
          
          <div className="header-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              icon={faFilter}
            >
              Filters
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              disabled={refreshing}
              icon={faRefresh}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="filters-card" padding="lg">
            <div className="filters-header">
              <h3>Filter Orders</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(false)}
                icon={faTimes}
              >
                Close
              </Button>
            </div>
            
            <div className="filters-grid">
              <div className="filter-group">
                <label>Search Orders</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Search by order number..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <label>Order Status</label>
                <select
                  className="filter-select"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Payment Status</label>
                <select
                  className="filter-select"
                  value={filters.payment_status}
                  onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                >
                  {paymentStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>From Date</label>
                <input
                  type="date"
                  className="filter-input"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <label>To Date</label>
                <input
                  type="date"
                  className="filter-input"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                />
              </div>
              
              <div className="filter-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  fullWidth
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="orders-stats">
          <div className="stat-item">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{pagination.totalOrders}</span>
          </div>
        </div>

        <div className="orders-list">
          {orders.length === 0 ? (
            <Card className="empty-state" padding="xl">
              <div className="empty-icon">
                <FontAwesomeIcon icon={faShoppingBag} />
              </div>
              <h3>No Orders Found</h3>
              <p>
                {Object.values(filters).some(filter => filter !== '') 
                  ? "No orders match your current filters." 
                  : "You haven't placed any orders yet."}
              </p>
              {Object.values(filters).some(filter => filter !== '') ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button variant="primary" onClick={() => navigate('/products')}>
                  Start Shopping
                </Button>
              )}
            </Card>
          ) : (
            <>
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
              
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <Button
                    variant="outline"
                    disabled={!pagination.hasPrevious}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  >
                    Previous
                  </Button>
                  
                  <span className="page-info">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    disabled={!pagination.hasNext}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
