import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faShoppingBag,
  faBox,
  faTruck,
  faMapMarkerAlt,
  faCalendarAlt,
  faEye,
  faFilter,
  faRefresh,
  faTimes,
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faTimesCircle,
  faSpinner,
  faChevronDown,
  faChevronRight,
  faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../UI/Toast/ToastProvider";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import { API_PATH } from "../../backend_url";

interface Order {
  id: string | number;
  order_number: string;
  user_email?: string;
  user_name?: string;
  status: string;
  payment_status?: string;
  subtotal: string | number;
  shipping_cost: string | number;
  tax_amount: string | number;
  total_amount: string | number;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  tracking_number?: string;
  courier_service?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: number;
  product?: {
    id: number;
    name: string;
    slug: string;
    picture?: string;
  };
  product_name: string;
  product_image?: string;
  unit_price: string | number;
  quantity: number;
  total_price: string | number;
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
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string | number>>(new Set());
  
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

      const params = new URLSearchParams();
      params.append('page', pagination.currentPage.toString());
      params.append('page_size', '10');
      
      if (filters.status) params.append('status', filters.status);
      if (filters.payment_status) params.append('payment_status', filters.payment_status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`${API_PATH}orders/orders/?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || ''}`
        }
      });
      
      // Handle both paginated and non-paginated responses
      const data = response.data;
      const ordersList = data.results || data.orders || data || [];
      
      setOrders(Array.isArray(ordersList) ? ordersList : []);
      setPagination({
        currentPage: pagination.currentPage,
        totalPages: data.total_pages || Math.ceil((data.count || ordersList.length) / 10) || 1,
        totalOrders: data.count || ordersList.length || 0,
        hasNext: !!data.next,
        hasPrevious: !!data.previous
      });

    } catch (error: any) {
      console.error('Error fetching orders:', error);
      showToast({
        type: 'error',
        title: 'Failed to Load Orders',
        message: error.response?.data?.detail || error.message || 'Unable to fetch your orders. Please try again.'
      });
      setOrders([]);
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

  const toggleOrderExpansion = (orderId: string | number) => {
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

  const handleTrackOrder = async (orderNumber: string) => {
    try {
      const response = await axios.get(`${API_PATH}orders/orders/${orderNumber}/tracking/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || ''}`
        }
      });
      showToast({
        type: 'info',
        title: 'Tracking Information',
        message: `Tracking: ${response.data.tracking_number || 'N/A'}`
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Tracking Unavailable',
        message: error.response?.data?.detail || 'Tracking information not available yet.'
      });
    }
  };

  const handleCancelOrder = async (orderNumber: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await axios.post(`${API_PATH}orders/orders/${orderNumber}/cancel/`, {
        reason: 'Cancelled by customer'
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || ''}`
        }
      });
      showToast({
        type: 'success',
        title: 'Order Cancelled',
        message: 'Your order has been cancelled successfully.'
      });
      fetchOrders();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: error.response?.data?.detail || error.message || 'Unable to cancel order. Please contact support.'
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

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      out_for_delivery: 'bg-teal-100 text-teal-800 border-teal-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded'
    };
    return texts[status] || 'Unknown';
  };

  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '$0.00';
    return `$${numAmount.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canCancelOrder = (order: Order) => {
    return ['pending', 'confirmed'].includes(order.status) && 
           order.payment_status !== 'refunded';
  };

  const getImageUrl = (picture: string | undefined) => {
    if (!picture) return '';
    if (picture.startsWith('http://') || picture.startsWith('https://')) {
      return picture;
    }
    if (picture.startsWith('/media/') || picture.startsWith('/static/')) {
      const backendBaseUrl = API_PATH.replace('/api/', '');
      return `${backendBaseUrl}${picture}`;
    }
    return `/${picture}`;
  };

  const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const isExpanded = expandedOrders.has(order.id);
    const subtotal = typeof order.subtotal === 'string' ? parseFloat(order.subtotal) : order.subtotal;
    const shipping = typeof order.shipping_cost === 'string' ? parseFloat(order.shipping_cost) : order.shipping_cost;
    const tax = typeof order.tax_amount === 'string' ? parseFloat(order.tax_amount) : order.tax_amount;
    const total = typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount;
    
    return (
      <Card className="border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <div 
          className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-200 p-4 transition-colors hover:bg-slate-50 md:p-6"
          onClick={() => toggleOrderExpansion(order.id)}
        >
          <div className="flex flex-1 items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <FontAwesomeIcon icon={faShoppingBag} className="text-xl" />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-bold text-slate-900">#{order.order_number}</span>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(order.status)}`}>
                  <FontAwesomeIcon icon={getStatusIcon(order.status)} className="mr-1" />
                  {getStatusText(order.status)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
                <span>{formatDate(order.created_at)}</span>
                <span className="mx-1">•</span>
                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-slate-900">{formatCurrency(total)}</div>
            </div>
            <FontAwesomeIcon 
              icon={isExpanded ? faChevronDown : faChevronRight} 
              className="text-slate-400"
            />
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 md:p-6">
            {/* Order Items */}
            <div className="mb-6">
              <h4 className="mb-4 text-lg font-semibold text-slate-900">Order Items</h4>
              <div className="space-y-3">
                {order.items.map(item => {
                  const itemImage = item.product_image || item.product?.picture;
                  const imageUrl = getImageUrl(itemImage);
                  const unitPrice = typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : item.unit_price;
                  const itemTotal = typeof item.total_price === 'string' ? parseFloat(item.total_price) : item.total_price;
                  
                  return (
                    <div key={item.id} className="flex gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <Link 
                        to={`/product/${item.product?.slug || '#'}`}
                        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100"
                      >
                        {itemImage ? (
                          <img 
                            src={imageUrl} 
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="hidden h-full w-full items-center justify-center text-slate-400"
                          style={{ display: itemImage ? 'none' : 'flex' }}
                        >
                          <FontAwesomeIcon icon={faBox} className="text-2xl" />
                        </div>
                      </Link>
                      <div className="flex-1">
                        <Link 
                          to={`/product/${item.product?.slug || '#'}`}
                          className="block font-semibold text-slate-900 transition-colors hover:text-blue-600"
                        >
                          {item.product_name}
                        </Link>
                        <div className="mt-1 flex items-center gap-4 text-sm text-slate-600">
                          <span>Qty: {item.quantity}</span>
                          <span>Price: {formatCurrency(unitPrice)}</span>
                          <span className="font-semibold text-slate-900">Total: {formatCurrency(itemTotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h4 className="mb-3 text-lg font-semibold text-slate-900">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-300 pt-2">
                  <span className="font-bold text-slate-900">Total:</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            <div className="flex flex-wrap gap-2">
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
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelOrder(order.order_number)}
                  icon={faTimes}
                  className="border-red-200 text-red-600 hover:bg-red-50"
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12">
        <Loading variant="spinner" size="lg" text="Loading your orders..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <FontAwesomeIcon icon={faShoppingBag} className="text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
              <p className="text-sm text-slate-600">Track and manage your order history</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              icon={faFilter}
            >
              {showFilters ? 'Hide Filters' : 'Filters'}
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

        {/* Filters */}
        {showFilters && (
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Filter Orders</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                icon={faTimes}
              >
                Close
              </Button>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Search Orders</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Search by order number..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Order Status</label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Payment Status</label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">From Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">To Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                />
              </div>
              
              <div className="flex items-end">
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

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="text-sm font-medium text-slate-600">Total Orders</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{pagination.totalOrders}</div>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <FontAwesomeIcon icon={faShoppingBag} className="text-4xl text-slate-400" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-slate-900">No Orders Found</h3>
              <p className="mb-6 text-slate-600">
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
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    disabled={!pagination.hasPrevious}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    icon={faChevronLeft}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm font-medium text-slate-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    disabled={!pagination.hasNext}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    icon={faChevronRight}
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
