import React from "react";
import { Link } from "react-router-dom";
import Newsletter from "./Newsletter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowUp,
  faPhone,
  faEnvelope,
  faClock,
  faMapMarkerAlt
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faFacebookF,
  faLinkedinIn,
  faPinterest,
  faCcVisa,
  faCcMastercard,
  faCcPaypal,
  faInstagram
} from "@fortawesome/free-brands-svg-icons";
import Card from "../UI/Card/Card";
import Button from "../UI/Button/Button";
import "./css/Footer.css";

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
        { label: "FAQ", href: "/faq" }
      ]
    },
    {
      title: "Information",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Terms of Use", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Sustainability", href: "/sustainability" }
      ]
    },
    {
      title: "Shop",
      links: [
        { label: "All Products", href: "/products" },
        { label: "Smartphones", href: "/products?category=smartphones" },
        { label: "Laptops", href: "/products?category=laptops" },
        { label: "Audio", href: "/products?category=audio" },
        { label: "Gaming", href: "/products?category=gaming" },
        { label: "Sale", href: "/products?sale=true" }
      ]
    }
  ];

  const socialLinks = [
    { icon: faTwitter, href: "https://twitter.com", label: "Twitter" },
    { icon: faFacebookF, href: "https://facebook.com", label: "Facebook" },
    { icon: faInstagram, href: "https://instagram.com", label: "Instagram" },
    { icon: faLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: faPinterest, href: "https://pinterest.com", label: "Pinterest" }
  ];

  const paymentMethods = [
    { icon: faCcVisa, label: "Visa" },
    { icon: faCcMastercard, label: "Mastercard" },
    { icon: faCcPaypal, label: "PayPal" }
  ];

  return (
    <footer className="modern-footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-grid">
            
            {/* Company Info & Contact */}
            <div className="footer-section company-section">
              <h3 className="section-title">
                <Link to="/" className="footer-logo">
                  eCommerce
                </Link>
              </h3>
              <p className="company-description">
                Your trusted destination for the latest tech products. 
                Quality, innovation, and exceptional service since 2020.
              </p>
              
              <div className="contact-info">
                <div className="contact-item">
                  <FontAwesomeIcon icon={faPhone} />
                  <span>+44 (0) 20 1234 5678</span>
                </div>
                <div className="contact-item">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>support@ecommerce.com</span>
                </div>
                <div className="contact-item">
                  <FontAwesomeIcon icon={faClock} />
                  <span>Mon-Fri: 9AM-6PM GMT</span>
                </div>
                <div className="contact-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>London, United Kingdom</span>
                </div>
              </div>
            </div>

            {/* Navigation Sections */}
            {footerSections.map((section) => (
              <div key={section.title} className="footer-section links-section">
                <h4 className="section-title">{section.title}</h4>
                <ul className="footer-links">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} className="footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter Section */}
            <div className="footer-section newsletter-section">
              <Newsletter />
              
              {/* Social Media */}
              <div className="social-section">
                <h4 className="section-title">Follow Us</h4>
                <div className="social-links">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      aria-label={social.label}
                    >
                      <FontAwesomeIcon icon={social.icon} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>
                &copy; {currentYear} eCommerce. All rights reserved. |{" "}
                <Link to="/privacy" className="footer-link">Privacy</Link> |{" "}
                <Link to="/terms" className="footer-link">Terms</Link>
              </p>
            </div>
            
            <div className="footer-actions">
              <div className="payment-methods">
                {paymentMethods.map((method) => (
                  <span key={method.label} className="payment-icon" title={method.label}>
                    <FontAwesomeIcon icon={method.icon} />
                  </span>
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="back-to-top"
                icon={<FontAwesomeIcon icon={faArrowUp} />}
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