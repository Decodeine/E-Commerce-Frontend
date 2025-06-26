import React from "react";
import { Link } from "react-router-dom";
import Newsletter from "./Newsletter";
import { Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Footer: React.FC = () => (
  <footer>
    <div className="bg-light text-dark py-5">
      <Container className="py-3">
        <div className="d-flex flex-column flex-md-row flex-wrap">
          <div className="mr-5 mb-4 mb-md-0">
            <h5 className="font-weight-bold">Customer Service</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/order_tracking">Order Tracking</Link>
              </li>
              <li>
                <Link to="/returns_and_exchanges">Returns and Exchanges</Link>
              </li>
              <li>
                <Link to="/refunds">Refunds</Link>
              </li>
              <li>
                <Link to="/delivery_and_collections">Delivery & Collections</Link>
              </li>
            </ul>
          </div>
          <div className="mr-5 mb-4 mb-md-0">
            <h5 className="font-weight-bold">Information</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/terms">Terms of Use</Link>
              </li>
              <li>
                <Link to="/careers">Careers</Link>
              </li>
            </ul>
          </div>
          <div className="ml-auto">
            <Newsletter />
            <ul className="list-inline mt-4">
              <li className="list-inline-item">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <FontAwesomeIcon icon={['fab', 'twitter']} size="2x" className="pr-2" />
                </a>
              </li>
              <li className="list-inline-item">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FontAwesomeIcon icon={['fab', 'facebook-f']} size="2x" className="pr-2" />
                </a>
              </li>
              <li className="list-inline-item">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <FontAwesomeIcon icon={['fab', 'linkedin']} size="2x" className="pr-2" />
                </a>
              </li>
              <li className="list-inline-item">
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                  <FontAwesomeIcon icon={['fab', 'pinterest']} size="2x" className="pr-2" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </div>

    <div className="bg-dark text-light">
      <Container className="py-4">
        <div className="d-flex align-items-center flex-column flex-md-row">
          <span>
            &copy; {new Date().getFullYear()} by eCommerce. All rights reserved.{" "}
            <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Back to top
            </a>
          </span>
          <div className="ml-md-auto mt-3 mt-md-0">
            <span className="mr-2">
              <FontAwesomeIcon icon={['fab', 'cc-visa']} size="2x" />
            </span>
            <span className="mr-2">
              <FontAwesomeIcon icon={['fab', 'cc-mastercard']} size="2x" />
            </span>
            <FontAwesomeIcon icon={['fab', 'cc-paypal']} size="2x" />
          </div>
        </div>
      </Container>
    </div>
  </footer>
);

export default Footer;