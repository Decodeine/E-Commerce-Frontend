/// <reference types="vite/client" />
import React, { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { connect, ConnectedProps, useSelector } from "react-redux";
import { authCheckState } from "./store/actions/authActions";
import { setupAxiosInterceptors } from "./utils/axiosInterceptor";
import { accountsApi } from "./services/accountsApi";

import ToastProvider from "./components/UI/Toast/ToastProvider";
import Navbar from "./components/Misc/Navbar";
import Footer from "./components/Misc/Footer";
import About from "./components/Misc/About";
import Default from "./components/Misc/Default";

import ProductList from "./components/Products/ProductList";
import ProductDetails from "./components/Products/ProductDetails";
import CategoryProducts from "./components/Products/CategoryProducts";
import BrandProducts from "./components/Products/BrandProducts";
import CategoryBrands from "./components/Products/CategoryBrands";
import SearchResults from "./components/Products/SearchResults";
import HomePage from "./components/Home/HomePage";
import Wishlist from "./components/Wishlist/Wishlist";
import PriceAlerts from "./components/PriceAlerts/PriceAlerts";
import ProductComparison from "./components/Products/ProductComparison";
import SwapPage from "./components/Swap/SwapPage";
import SwapDashboard from "./components/Swap/SwapDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminRoute from "./components/Utilities/AdminRoute";

import Cart from "./components/Checkout/Cart";
import Checkout from "./components/Checkout/Checkout";

import ScrollToTop from "./components/Utilities/ScrollToTop";
import PrivateRoute from "./components/Utilities/PrivateRoute";

import Login from "./components/Authentication/Login";
import Register from "./components/Authentication/Register";
import PasswordReset from "./components/Authentication/PasswordReset";
import ChangePassword from "./components/Authentication/ChangePassword";

// Stripe (new way)
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : Promise.resolve(null);

// FontAwesome icons
import { library } from "@fortawesome/fontawesome-svg-core";

import {
  faTruck,
  faShoppingCart,
  faUser,
  faUserPlus,
  faSignInAlt,
  faSignOutAlt,
  faPaperPlane,
  faCartPlus,
  faTrashAlt,
  faListAlt,
  faSearch,
  faMinusSquare,
  faPlusSquare,
  faTimesCircle,
  faAngleLeft,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";

import {
  faCcVisa,
  faCcMastercard,
  faCcPaypal,
  faFacebookF,
  faTwitter,
  faLinkedin,
  faPinterest,
} from "@fortawesome/free-brands-svg-icons";
import Orders from "./components/Orders/Orders";
import Profile from "./components/Profiles/Profile";

library.add(
  faFacebookF,
  faTwitter,
  faLinkedin,
  faPinterest,
  faCcVisa,
  faCcMastercard,
  faCcPaypal,
  faTruck,
  faShoppingCart,
  faUser,
  faUserPlus,
  faSignInAlt,
  faSignOutAlt,
  faPaperPlane,
  faCartPlus,
  faTrashAlt,
  faListAlt,
  faSearch,
  faMinusSquare,
  faPlusSquare,
  faTimesCircle,
  faAngleLeft,
  faAngleRight
);

// Layout component for regular pages
const RegularLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="pt-[130px]">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-6">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
};

// Redux connector
const mapDispatch = {
  authCheckState,
};

const connector = connect(null, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

const App: React.FC<PropsFromRedux> = ({ authCheckState }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    // Setup axios interceptors for JWT token handling
    setupAxiosInterceptors();

    // Check authentication state on app load
    authCheckState();
  }, [authCheckState]);

  // Redirect admins to admin dashboard if they're on regular pages (but not if already on admin page)
  useEffect(() => {
    // Skip redirect check if already on admin page or auth pages
    const isAuthPage = location.pathname.startsWith('/login') || 
                      location.pathname.startsWith('/register') ||
                      location.pathname.startsWith('/password_reset');
    const isAdminPage = location.pathname.startsWith('/admin');
    
    if (isAdminPage || isAuthPage) {
      return; // Don't redirect if already on admin or auth pages
    }

    const redirectAdminIfNeeded = async () => {
      // Check both Redux state and localStorage for token
      const hasToken = token || localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (hasToken) {
        try {
          const user = await accountsApi.getUserProfile();
          const isAdmin = (user as any).is_staff || (user as any).is_superuser;
          
          if (isAdmin) {
            // Redirect admin to admin dashboard immediately
            navigate("/admin", { replace: true });
          }
        } catch (error) {
          // Silently fail - user might not be fully authenticated yet
          console.log('Could not check admin status for redirect:', error);
        }
      }
    };

    // Only check once after a short delay to avoid loops
    const timer = setTimeout(() => {
      redirectAdminIfNeeded();
    }, 500);

    return () => clearTimeout(timer);
  }, [token, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ToastProvider position="top-right" maxToasts={5}>
        <Elements stripe={stripePromise}>
          <ScrollToTop>
            <Routes>
              {/* Admin routes - render without Navbar/Footer */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              
              {/* Regular routes - render with Navbar/Footer */}
              <Route
                path="/"
                element={
                  <RegularLayout>
                    <HomePage />
                  </RegularLayout>
                }
              />
              <Route
                path="/products"
                element={
                  <RegularLayout>
                    <ProductList />
                  </RegularLayout>
                }
              />
              <Route
                path="/profile/*"
                element={
                  <RegularLayout>
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  </RegularLayout>
                }
              />
              <Route
                path="/orders"
                element={
                  <RegularLayout>
                    <PrivateRoute>
                      <Orders />
                    </PrivateRoute>
                  </RegularLayout>
                }
              />
              <Route
                path="/category/:categorySlug"
                element={
                  <RegularLayout>
                    <CategoryProducts />
                  </RegularLayout>
                }
              />
              <Route
                path="/category/:categorySlug/brands"
                element={
                  <RegularLayout>
                    <CategoryBrands />
                  </RegularLayout>
                }
              />
              <Route
                path="/brand/:brandSlug"
                element={
                  <RegularLayout>
                    <BrandProducts />
                  </RegularLayout>
                }
              />
              <Route
                path="/brand/:brandSlug/category/:categorySlug"
                element={
                  <RegularLayout>
                    <BrandProducts />
                  </RegularLayout>
                }
              />
              <Route
                path="/login"
                element={<Login />}
              />
              <Route
                path="/register"
                element={<Register />}
              />
              <Route
                path="/password_reset"
                element={<PasswordReset />}
              />
              <Route
                path="/password_reset/:uid/:token"
                element={<PasswordReset />}
              />
              <Route
                path="/change_password"
                element={
                  <PrivateRoute>
                    <ChangePassword />
                  </PrivateRoute>
                }
              />
              <Route
                path="/product/:slug"
                element={
                  <RegularLayout>
                    <ProductDetails />
                  </RegularLayout>
                }
              />
              <Route
                path="/search/:query"
                element={
                  <RegularLayout>
                    <SearchResults />
                  </RegularLayout>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <RegularLayout>
                    <Wishlist />
                  </RegularLayout>
                }
              />
              <Route
                path="/price-alerts"
                element={
                  <RegularLayout>
                    <PriceAlerts />
                  </RegularLayout>
                }
              />
              <Route
                path="/compare"
                element={
                  <RegularLayout>
                    <ProductComparison />
                  </RegularLayout>
                }
              />
              <Route
                path="/swap"
                element={
                  <RegularLayout>
                    <SwapPage />
                  </RegularLayout>
                }
              />
              <Route
                path="/account/swaps"
                element={
                  <RegularLayout>
                    <PrivateRoute>
                      <SwapDashboard />
                    </PrivateRoute>
                  </RegularLayout>
                }
              />
              <Route
                path="/cart"
                element={
                  <RegularLayout>
                    <Cart />
                  </RegularLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <RegularLayout>
                    <About />
                  </RegularLayout>
                }
              />
              <Route
                path="/checkout"
                element={
                  <RegularLayout>
                    <PrivateRoute>
                      <Checkout />
                    </PrivateRoute>
                  </RegularLayout>
                }
              />
              <Route
                path="*"
                element={
                  <RegularLayout>
                    <Default />
                  </RegularLayout>
                }
              />
            </Routes>
          </ScrollToTop>
        </Elements>
      </ToastProvider>
    </div>
  );
};

export default connector(App);
