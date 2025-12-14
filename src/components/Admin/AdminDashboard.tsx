import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faBox,
  faExchangeAlt,
  faUsers,
  faShoppingBag,
  faChartLine,
  faCog,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import AdminOverview from './AdminOverview';
import AdminProducts from './AdminProducts';
import AdminSwaps from './AdminSwaps';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';
import { authLogout } from '../../store/actions/authActions';
import { useDispatch } from 'react-redux';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';

interface RootState {
  auth: {
    token: string | null;
  };
}

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);

  const navigationItems = [
    {
      path: '',
      label: 'Overview',
      icon: faTachometerAlt,
      description: 'Dashboard statistics and overview'
    },
    {
      path: 'products',
      label: 'Products',
      icon: faBox,
      description: 'Manage products (add, edit, delete)'
    },
    {
      path: 'swaps',
      label: 'Swap Requests',
      icon: faExchangeAlt,
      description: 'Verify and approve swap requests'
    },
    {
      path: 'users',
      label: 'Users',
      icon: faUsers,
      description: 'Manage user accounts'
    },
    {
      path: 'orders',
      label: 'Orders',
      icon: faShoppingBag,
      description: 'View and manage orders'
    }
  ];

  const handleLogout = () => {
    dispatch(authLogout());
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-600">Manage your e-commerce store</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              icon={<FontAwesomeIcon icon={faSignOutAlt} />}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-64">
            <Card className="p-4">
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === `/admin/${item.path}` ||
                                  (item.path === '' && location.pathname === '/admin') ||
                                  (item.path !== '' && location.pathname.startsWith(`/admin/${item.path}`));
                  return (
                    <Link
                      key={item.path}
                      to={item.path || '.'}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      title={item.description}
                    >
                      <FontAwesomeIcon icon={item.icon} className="text-lg" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              <Route index element={<AdminOverview />} />
              <Route path="products/*" element={<AdminProducts />} />
              <Route path="swaps" element={<AdminSwaps />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

