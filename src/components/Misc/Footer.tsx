import React from "react";
import { Link } from "react-router-dom";
import Newsletter from "./Newsletter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faPhone,
  faEnvelope,
  faClock,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faFacebookF,
  faLinkedinIn,
  faPinterest,
  faCcVisa,
  faCcMastercard,
  faCcPaypal,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import Card from "../UI/Card/Card";
import Button from "../UI/Button/Button";

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Customer Service",
      links: [
        { label: "Order Tracking", href: "/order_tracking" },
        { label: "Returns & Exchanges", href: "/returns_and_exchanges" },
        { label: "Refunds", href: "/refunds" },
        { label: "Delivery & Collections", href: "/delivery_and_collections" },
        { label: "Size Guide", href: "/size_guide" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Information",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Terms of Use", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Sustainability", href: "/sustainability" },
      ],
    },
    {
      title: "Shop",
      links: [
        { label: "All Products", href: "/products" },
        { label: "Smartphones", href: "/products?category=smartphones" },
        { label: "Laptops", href: "/products?category=laptops" },
        { label: "Audio", href: "/products?category=audio" },
        { label: "Gaming", href: "/products?category=gaming" },
        { label: "Sale", href: "/products?sale=true" },
      ],
    },
  ];

  const socialLinks = [
    { icon: faTwitter, href: "https://twitter.com", label: "Twitter" },
    { icon: faFacebookF, href: "https://facebook.com", label: "Facebook" },
    { icon: faInstagram, href: "https://instagram.com", label: "Instagram" },
    { icon: faLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: faPinterest, href: "https://pinterest.com", label: "Pinterest" },
  ];

  const paymentMethods = [
    { icon: faCcVisa, label: "Visa" },
    { icon: faCcMastercard, label: "Mastercard" },
    { icon: faCcPaypal, label: "PayPal" },
  ];

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <div className="grid gap-10 md:grid-cols-[2fr,1.5fr,1.5fr,2fr]">
          {/* Brand & contact */}
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-brand-light to-brand bg-clip-text text-2xl font-extrabold tracking-tight text-transparent"
            >
              eCommerce
            </Link>
            <p className="text-sm text-slate-300">
              Your trusted destination for the latest tech products. Quality, innovation, and
              exceptional service since 2020.
            </p>

            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="text-brand-light" />
                <span>+44 (0) 20 1234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-brand-light" />
                <span>support@ecommerce.com</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-brand-light" />
                <span>Mon-Fri: 9AM-6PM GMT</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-brand-light" />
                <span>London, United Kingdom</span>
              </div>
            </div>
          </div>

          {/* Navigation sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                {section.title}
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="transition-colors hover:text-brand-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter + social */}
          <div className="space-y-5">
            <Card variant="glass" padding="lg" className="bg-slate-900/80 border-slate-800">
              <Newsletter />
            </Card>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Follow Us
              </h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition-colors hover:border-brand-light hover:text-brand-light"
                  >
                    <FontAwesomeIcon icon={social.icon} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-400">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p>
              &copy; {currentYear} eCommerce. All rights reserved.{" "}
              <span className="mx-1">•</span>
              <Link to="/privacy" className="hover:text-brand-light">
                Privacy
              </Link>
              <span className="mx-1">•</span>
              <Link to="/terms" className="hover:text-brand-light">
                Terms
              </Link>
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-lg text-slate-200">
                {paymentMethods.map((method) => (
                  <span key={method.label} title={method.label}>
                    <FontAwesomeIcon icon={method.icon} />
                  </span>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                icon={<FontAwesomeIcon icon={faArrowUp} />}
                className="border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                Back to Top
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;