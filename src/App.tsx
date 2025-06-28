/// <reference types="vite/client" />
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { connect, ConnectedProps } from "react-redux";
import { authCheckState } from "./store/actions/authActions";

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/App.css";
import "./styles/globals.css";

import Navbar from "./components/Misc/Navbar";
import Footer from "./components/Misc/Footer";
import About from "./components/Misc/About";
import Default from "./components/Misc/Default";

import ProductList from "./components/Products/ProductList";
import ProductDetails from "./components/Products/ProductDetails";
import SearchResults from "./components/Products/SearchResults";

import Cart from "./components/Checkout/Cart";
import Checkout from "./components/Checkout/Checkout";

import ScrollToTop from "./components/Utilities/ScrollToTop";
import PrivateRoute from "./components/Utilities/PrivateRoute";

import Login from "./components/Authentication/Login";
import Register from "./components/Authentication/Register";

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
    authCheckState();
  }, [authCheckState]);

  return (
    <Elements stripe={stripePromise}>
      <ScrollToTop>
        <Navbar />
        <Container className="content my-4">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/search/:query" element={<SearchResults />} />
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
  );
};

export default connector(App);