import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import SearchForm from "../Products/SearchForm";
import jwt_decode from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTruck, 
  faShoppingCart, 
  faUser, 
  faSignInAlt, 
  faSignOutAlt, 
  faUserPlus,
  faBars,
  faTimes,
  faHeart,
  faCompressArrowsAlt
} from "@fortawesome/free-solid-svg-icons";
import { authLogout } from "../../store/actions/authActions";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import "./css/Navbar.css";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const cart = useSelector((state: any) => state.store.cart);
  const token = useSelector((state: any) => state.auth.token);
  const isAuthenticated = token !== null;

  const cartItemCount = () =>
    cart.reduce((total: number, item: any) => total + item.quantity, 0);

  let decoded_token: any = undefined;
  if (token) {
    decoded_token = jwt_decode(token);
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(authLogout());
    closeMenus();
  };

  const shopLinks = [
    { label: "All Products", href: "/products" },
    { label: "Smartphones", href: "/products?category=smartphones" },
    { label: "Laptops", href: "/products?category=laptops" },
    { label: "Audio", href: "/products?category=audio" },
    { label: "Gaming", href: "/products?category=gaming" }
  ];

  const quickLinks = [
    { label: "About", href: "/about" },
    { label: "Wishlist", href: "/wishlist", icon: faHeart },
    { label: "Compare", href: "/compare", icon: faCompressArrowsAlt }
  ];

  return (
    <div className="modern-navbar-wrapper">
      {/* Tier 1: Utility Bar */}
      <div className="utility-bar">
        <div className="container">
          <div className="utility-content">
            <div className="utility-left">
              <FontAwesomeIcon icon={faTruck} />
              <span>Free delivery on orders over £100!</span>
            </div>
            <div className="utility-right">
              <Link to="/orders" className="utility-link">
                <FontAwesomeIcon icon={faTruck} />
                <span>Track Order</span>
              </Link>
              <Link to="/about" className="utility-link">
                <span>Help</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2: Main Navigation */}
      <nav className="main-navbar">
      {/* Tier 2: Main Navigation */}
      <nav className="main-navbar">
        <div className="container">
          <div className="navbar-content">
            {/* Brand */}
            <div className="navbar-brand">
              <Link to="/" className="brand-link" onClick={closeMenus}>
                <span className="brand-text">eCommerce</span>
              </Link>
            </div>

            {/* Search Bar (Center) */}
            <div className="navbar-search">
              <SearchForm />
            </div>

            {/* Actions (Right) */}
            <div className="navbar-actions">
              {/* Cart */}
              <Link to="/cart" className="action-link cart-link" onClick={closeMenus}>
                <div className="action-icon">
                  <FontAwesomeIcon icon={faShoppingCart} />
                  {cartItemCount() > 0 && (
                    <span className="cart-badge">{cartItemCount()}</span>
                  )}
                </div>
                <span className="action-label desktop-only">Cart</span>
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="user-menu-container">
                  <button
                    className="user-menu-trigger"
                    onClick={toggleUserMenu}
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="action-icon">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <span className="user-name desktop-only">
                      {decoded_token?.username || decoded_token?.email}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <Card variant="glass" className="user-dropdown">
                      <div className="dropdown-content">
                        <Link
                          to="/profile"
                          className="dropdown-link"
                          onClick={closeMenus}
                        >
                          <FontAwesomeIcon icon={faUser} />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="dropdown-link"
                          onClick={closeMenus}
                        >
                          <FontAwesomeIcon icon={faTruck} />
                          <span>Orders</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          className="dropdown-link"
                          onClick={closeMenus}
                        >
                          <FontAwesomeIcon icon={faHeart} />
                          <span>Wishlist</span>
                        </Link>
                        <div className="dropdown-divider"></div>
                        <button
                          className="dropdown-link logout-btn"
                          onClick={handleLogout}
                        >
                          <FontAwesomeIcon icon={faSignOutAlt} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <Button
                    as={Link}
                    to="/login"
                    variant="ghost"
                    size="sm"
                    className="login-btn"
                    icon={<FontAwesomeIcon icon={faSignInAlt} />}
                    onClick={closeMenus}
                  >
                    <span className="desktop-only">Login</span>
                  </Button>
                  <Button
                    as={Link}
                    to="/register"
                    variant="primary"
                    size="sm"
                    className="register-btn"
                    icon={<FontAwesomeIcon icon={faUserPlus} />}
                    onClick={closeMenus}
                  >
                    <span className="desktop-only">Register</span>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="mobile-menu-toggle mobile-only"
                onClick={toggleMenu}
                aria-expanded={isMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tier 3: Category Navigation */}
      <div className="category-navbar">
        <div className="container">
          <div className="category-content">
            {/* Desktop Categories */}
            <div className="category-nav desktop-nav">
              {shopLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="category-link"
                  onClick={closeMenus}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions desktop-nav">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="quick-link"
                  onClick={closeMenus}
                >
                  {link.icon && <FontAwesomeIcon icon={link.icon} />}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <Card variant="glass" className="mobile-nav">
            <div className="mobile-nav-content">
              {/* Shop Section */}
              <div className="mobile-nav-section">
                <h4 className="mobile-nav-title">Shop</h4>
                {shopLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="mobile-nav-link"
                    onClick={closeMenus}
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>

              {/* Quick Links */}
              <div className="mobile-nav-section">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="mobile-nav-link"
                    onClick={closeMenus}
                  >
                    {link.icon && <FontAwesomeIcon icon={link.icon} />}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
              
              {!isAuthenticated && (
                <div className="mobile-auth-section">
                  <div className="mobile-auth-divider"></div>
                  <Link
                    to="/login"
                    className="mobile-nav-link"
                    onClick={closeMenus}
                  >
                    <FontAwesomeIcon icon={faSignInAlt} />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="mobile-nav-link register-highlight"
                    onClick={closeMenus}
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        )}
      </nav>
    </div>
  );
};

export default Navbar;