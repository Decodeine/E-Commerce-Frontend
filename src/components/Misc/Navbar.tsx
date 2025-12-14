import React, { useState, useEffect } from "react";
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
  faCompressArrowsAlt,
  faExchangeAlt,
  faCog
} from "@fortawesome/free-solid-svg-icons";
import { authLogout } from "../../store/actions/authActions";
import { accountsApi } from "../../services/accountsApi";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dispatch = useDispatch();
  const cart = useSelector((state: any) => state.store.cart);
  const token = useSelector((state: any) => state.auth.token);
  const isAuthenticated = token !== null;

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isAuthenticated && token) {
        try {
          const user = await accountsApi.getUserProfile();
          const adminStatus = (user as any).is_staff || (user as any).is_superuser || false;
          setIsAdmin(adminStatus);
        } catch (error) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [isAuthenticated, token]);

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
    { label: "Smartphones", href: "/category/smartphones/brands" },
    { label: "Laptops", href: "/category/laptops/brands" },
    { label: "Audio", href: "/category/audio/brands" },
    { label: "Gaming", href: "/category/gaming/brands" }
  ];

  const quickLinks = [
    { label: "About", href: "/about" },
    { label: "Wishlist", href: "/wishlist", icon: faHeart },
    { label: "Compare", href: "/compare", icon: faCompressArrowsAlt },
    { label: "Swap Phone", href: "/swap", icon: faExchangeAlt }
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-[1000] bg-white border-b border-slate-200 shadow-sm">
      {/* Utility bar */}
      <div className="hidden sm:block border-b border-slate-200 bg-gradient-to-r from-brand to-brand-light text-white text-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faTruck} />
            <span>Free delivery on orders over £100</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/orders" className="flex items-center gap-1 hover:underline">
              <FontAwesomeIcon icon={faTruck} />
              <span>Track order</span>
            </Link>
            <Link to="/about" className="hover:underline">
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:py-4">
        {/* Brand + mobile menu */}
        <div className="flex flex-1 items-center gap-3">
          <Link
            to="/"
            onClick={closeMenus}
            className="text-xl sm:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light"
          >
            eCommerce
          </Link>
          <button
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 sm:hidden"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
          </button>
        </div>

        {/* Search (desktop) */}
        <div className="hidden flex-1 sm:block">
          <SearchForm />
        </div>

        {/* Actions (desktop) */}
        <div className="hidden items-center gap-4 sm:flex">
          <Link to="/cart" onClick={closeMenus} className="relative flex items-center gap-2 text-slate-700">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200">
              <FontAwesomeIcon icon={faShoppingCart} />
              {cartItemCount() > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {cartItemCount()}
                </span>
              )}
            </span>
            <span className="text-sm font-medium">Cart</span>
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                aria-expanded={isUserMenuOpen}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <FontAwesomeIcon icon={faUser} />
                </span>
                <span className="max-w-[140px] truncate">
                  {decoded_token?.username || decoded_token?.email}
                </span>
              </button>

              {isUserMenuOpen && (
                <Card
                  variant="default"
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-md border border-slate-200"
                >
                  <div className="flex flex-col py-1 text-sm text-slate-700">
                    <Link
                      to="/profile"
                      onClick={closeMenus}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50"
                    >
                      <FontAwesomeIcon icon={faUser} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={closeMenus}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50"
                    >
                      <FontAwesomeIcon icon={faTruck} />
                      <span>Orders</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={closeMenus}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50"
                    >
                      <FontAwesomeIcon icon={faHeart} />
                      <span>Wishlist</span>
                    </Link>
                    <Link
                      to="/swap"
                      onClick={closeMenus}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50"
                    >
                      <FontAwesomeIcon icon={faExchangeAlt} />
                      <span>Swap Phone</span>
                    </Link>
                    <Link
                      to="/account/swaps"
                      onClick={closeMenus}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50"
                    >
                      <FontAwesomeIcon icon={faExchangeAlt} />
                      <span>My Swaps</span>
                    </Link>
                    {isAdmin && (
                      <>
                        <div className="my-1 border-t border-slate-200" />
                        <Link
                          to="/admin"
                          onClick={closeMenus}
                          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 font-semibold"
                        >
                          <FontAwesomeIcon icon={faCog} />
                          <span>Admin Dashboard</span>
                        </Link>
                      </>
                    )}
                    <div className="my-1 border-t border-slate-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} />
                      <span>Logout</span>
                    </button>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                as={Link}
                to="/login"
                variant="ghost"
                size="sm"
                icon={<FontAwesomeIcon icon={faSignInAlt} />}
                onClick={closeMenus}
              >
                Login
              </Button>
              <Button
                as={Link}
                to="/register"
                variant="primary"
                size="sm"
                icon={<FontAwesomeIcon icon={faUserPlus} />}
                onClick={closeMenus}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Category bar (desktop) */}
      <nav className="hidden border-t border-slate-200 bg-white sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-sm text-slate-700">
          <div className="flex items-center gap-4">
            {shopLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={closeMenus}
                className="border-b-2 border-transparent pb-1 hover:border-brand hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden items-center gap-3 md:flex">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={closeMenus}
                className="flex items-center gap-1 text-slate-600 hover:text-brand"
              >
                {link.icon && <FontAwesomeIcon icon={link.icon} />}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white sm:hidden">
          <div className="space-y-4 px-4 py-3 text-sm text-slate-700">
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase text-slate-500">Shop</h4>
              <div className="flex flex-col gap-1">
                {shopLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={closeMenus}
                    className="rounded-md px-2 py-1.5 hover:bg-slate-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase text-slate-500">Quick links</h4>
              <div className="flex flex-col gap-1">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={closeMenus}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50"
                  >
                    {link.icon && <FontAwesomeIcon icon={link.icon} />}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {!isAuthenticated && (
              <div className="border-t border-slate-200 pt-3">
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FontAwesomeIcon icon={faSignInAlt} />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-light"
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    <span>Register</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;