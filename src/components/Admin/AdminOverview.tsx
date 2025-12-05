import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBox,
  faShoppingBag,
  faExchangeAlt,
  faDollarSign,
  faClock,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import Card from '../UI/Card/Card';
import Loading from '../UI/Loading/Loading';
import { adminApi, AdminStats } from '../../services/adminApi';
import { useToast } from '../UI/Toast/ToastProvider';

const AdminOverview: React.FC = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      // Set empty stats instead of keeping loading state
      setStats({
        total_users: 0,
        total_products: 0,
        total_orders: 0,
        total_swaps: 0,
        pending_swaps: 0,
        total_revenue: 0,
        recent_orders: [],
        recent_swaps: []
      });
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to load dashboard statistics. Some features may not be available.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Fallback: stop loading after 5 seconds even if API fails
    const timeout = setTimeout(() => {
      setLoading(false);
      if (!stats) {
        setStats({
          total_users: 0,
          total_products: 0,
          total_orders: 0,
          total_swaps: 0,
          pending_swaps: 0,
          total_revenue: 0,
          recent_orders: [],
          recent_swaps: []
        });
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading variant="spinner" size="lg" text="Loading dashboard..." />
      </div>
    );
  }
  
  // Show dashboard even if stats failed to load
  const displayStats = stats || {
    total_users: 0,
    total_products: 0,
    total_orders: 0,
    total_swaps: 0,
    pending_swaps: 0,
    total_revenue: 0,
    recent_orders: [],
    recent_swaps: []
  };

  const statCards = [
    {
      label: 'Total Users',
      value: displayStats.total_users || 0,
      icon: faUsers,
      color: 'bg-blue-100 text-blue-600',
      change: '+12%'
    },
    {
      label: 'Total Products',
      value: displayStats.total_products || 0,
      icon: faBox,
      color: 'bg-green-100 text-green-600',
      change: '+5%'
    },
    {
      label: 'Total Orders',
      value: displayStats.total_orders || 0,
      icon: faShoppingBag,
      color: 'bg-purple-100 text-purple-600',
      change: '+8%'
    },
    {
      label: 'Pending Swaps',
      value: displayStats.pending_swaps || 0,
      icon: faExchangeAlt,
      color: 'bg-yellow-100 text-yellow-600',
      change: displayStats.pending_swaps > 0 ? 'Needs attention' : 'All clear'
    },
    {
      label: 'Total Revenue',
      value: `$${((displayStats.total_revenue || 0) / 1000).toFixed(1)}k`,
      icon: faDollarSign,
      color: 'bg-emerald-100 text-emerald-600',
      change: '+15%'
    },
    {
      label: 'Total Swaps',
      value: displayStats.total_swaps || 0,
      icon: faExchangeAlt,
      color: 'bg-indigo-100 text-indigo-600',
      change: '+3%'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="mt-1 text-slate-600">Monitor your store's performance and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <FontAwesomeIcon icon={stat.change.includes('+') ? faArrowUp : faArrowDown} className="text-green-600" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                <FontAwesomeIcon icon={stat.icon} className="text-xl" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
            <Link to="orders" className="text-sm text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>
          {displayStats.recent_orders && displayStats.recent_orders.length > 0 ? (
            <div className="space-y-3">
              {displayStats.recent_orders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">Order #{order.order_number}</p>
                    <p className="text-sm text-slate-600">{order.user_email || 'Guest'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${parseFloat(order.total_amount || 0).toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              <FontAwesomeIcon icon={faShoppingBag} className="mb-2 text-3xl text-slate-300" />
              <p>No recent orders</p>
            </div>
          )}
        </Card>

        {/* Recent Swaps */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Pending Swaps</h3>
            <Link to="swaps" className="text-sm text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>
          {displayStats.recent_swaps && displayStats.recent_swaps.length > 0 ? (
            <div className="space-y-3">
              {displayStats.recent_swaps.slice(0, 5).map((swap: any) => (
                <div key={swap.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">Swap #{swap.id}</p>
                    <p className="text-sm text-slate-600">{swap.user_email || 'Guest'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      swap.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {swap.status}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">{new Date(swap.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              <FontAwesomeIcon icon={faExchangeAlt} className="mb-2 text-3xl text-slate-300" />
              <p>No pending swaps</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;

