/// <reference types="vite/client" />
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { connect, ConnectedProps } from "react-redux";
import { authCheckState } from "./store/actions/authActions";
import { setupAxiosInterceptors } from "./utils/axiosInterceptor";

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/App.css";
import "./styles/globals.css";

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

import Cart from "./components/Checkout/Cart";
import Checkout from "./components/Checkout/Checkout";

import ScrollToTop from "./components/Utilities/ScrollToTop";
import PrivateRoute from "./components/Utilities/PrivateRoute";

import Login from "./components/Authentication/Login";
import Register from "./components/Authentication/Register";
import PasswordReset from "./components/Authentication/PasswordReset";
import ChangePassword from "./components/Authentication/ChangePassword";

import { Container } from "react-bootstrap";

// Stripe (new way)
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

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

// Redux connector
const mapDispatch = {
  authCheckState,
};

const connector = connect(null, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

const App: React.FC<PropsFromRedux> = ({ authCheckState }) => {
  useEffect(() => {
    // Setup axios interceptors for JWT token handling
    setupAxiosInterceptors();

    // Check authentication state on app load
    authCheckState();
  }, [authCheckState]);

  return (
    <ToastProvider position="top-right" maxToasts={5}>
      <Elements stripe={stripePromise}>
        <ScrollToTop>
          <Navbar />
          <Container className="content" style={{ paddingTop: '1rem' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/category/:categorySlug" element={<CategoryProducts />} />
              <Route path="/category/:categorySlug/brands" element={<CategoryBrands />} />
              <Route path="/brand/:brandSlug" element={<BrandProducts />} />
              <Route path="/brand/:brandSlug/category/:categorySlug" element={<BrandProducts />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/password_reset" element={<PasswordReset />} />
              <Route path="/password_reset/:uid/:token" element={<PasswordReset />} />
              <Route path="/change_password" element={
                <PrivateRoute>
                  <ChangePassword />
                </PrivateRoute>
              } />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/search/:query" element={<SearchResults />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/price-alerts" element={<PriceAlerts />} />
              <Route path="/compare" element={<ProductComparison />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Default />} />
            </Routes>
          </Container>
          <Footer />
        </ScrollToTop>
      </Elements>
    </ToastProvider>
  );
};

export default connector(App);