import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHome, 
  faSearch, 
  faArrowLeft,
  faExclamationTriangle 
} from "@fortawesome/free-solid-svg-icons";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";

const Default: React.FC = () => {
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const popularPages = [
    { label: "Shop All Products", href: "/products", icon: faSearch },
    { label: "About Us", href: "/about", icon: faHome },
    { label: "Contact", href: "/contact", icon: faHome }
  ];

  return (
    <div className="error-page">
      <div className="error-container">
        <Card variant="glass" className="error-card" padding="xl">
          <div className="error-content">
            
            {/* Error Icon & Code */}
            <div className="error-visual">
              <div className="error-icon">
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <div className="error-code">404</div>
            </div>

            {/* Error Message */}
            <div className="error-message">
              <h1 className="error-title">Page Not Found</h1>
              <p className="error-description">
                Oops! The page you're looking for seems to have wandered off into the digital wilderness. 
                Don't worry though, we'll help you find your way back.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="error-actions">
              <Button
                variant="primary"
                size="lg"
                as={Link}
                to="/"
                icon={<FontAwesomeIcon icon={faHome} />}
                className="primary-action"
              >
                Go to Homepage
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={goBack}
                icon={<FontAwesomeIcon icon={faArrowLeft} />}
                className="secondary-action"
              >
                Go Back
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="helpful-links">
              <h3 className="links-title">Or try these popular pages:</h3>
              <div className="links-grid">
                {popularPages.map((page) => (
                  <Link
                    key={page.label}
                    to={page.href}
                    className="help-link"
                  >
                    <FontAwesomeIcon icon={page.icon} />
                    <span>{page.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Search Suggestion */}
            <div className="search-suggestion">
              <p>Looking for something specific?</p>
              <Link to="/products" className="search-link">
                <FontAwesomeIcon icon={faSearch} />
                <span>Search our products</span>
              </Link>
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
};

export default Default;