import React from "react";
import { Link } from "react-router-dom";
import Newsletter from "./Newsletter";
import { Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Card from "../UI/Card/Card";

const Footer: React.FC = () => (
  <footer>
    <div className="bg-light text-dark py-5">
      <Container>
        <Row className="gy-4">
          {/* Customer Service Column */}
          <Col lg={3} md={6} xs={12}>
            <Card variant="default" padding="sm">
              <h5 className="font-weight-bold mb-3">Customer Service</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link to="/order_tracking" className="text-decoration-none">Order Tracking</Link>
                </li>
                <li className="mb-2">
                  <Link to="/returns_and_exchanges" className="text-decoration-none">Returns and Exchanges</Link>
                </li>
                <li className="mb-2">
                  <Link to="/refunds" className="text-decoration-none">Refunds</Link>
                </li>
                <li className="mb-2">
                  <Link to="/delivery_and_collections" className="text-decoration-none">Delivery & Collections</Link>
                </li>
              </ul>
            </Card>
          </Col>

          {/* Information Column */}
          <Col lg={3} md={6} xs={12}>
            <Card variant="default" padding="sm">
              <h5 className="font-weight-bold mb-3">Information</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link to="/about" className="text-decoration-none">About Us</Link>
                </li>
                <li className="mb-2">
                  <Link to="/terms" className="text-decoration-none">Terms of Use</Link>
                </li>
                <li className="mb-2">
                  <Link to="/careers" className="text-decoration-none">Careers</Link>
                </li>
                <li className="mb-2">
                  <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>
                </li>
              </ul>
            </Card>
          </Col>

          {/* Contact Column */}
          <Col lg={3} md={6} xs={12}>
            <Card variant="default" padding="sm">
              <h5 className="font-weight-bold mb-3">Contact</h5>
              <div className="text-muted">
                <p className="mb-2">
                  <strong>Phone:</strong><br />
                  +44 (0) 20 1234 5678
                </p>
                <p className="mb-2">
                  <strong>Email:</strong><br />
                  support@ecommerce.com
                </p>
                <p className="mb-2">
                  <strong>Hours:</strong><br />
                  Mon-Fri: 9AM-6PM GMT
                </p>
              </div>
            </Card>
          </Col>

          {/* Newsletter & Social Column */}
          <Col lg={3} md={6} xs={12}>
            <Card variant="default" padding="sm">
              <Newsletter />
              <div className="mt-4">
                <h6 className="font-weight-bold mb-3">Follow Us</h6>
                <div className="d-flex flex-wrap gap-3">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-primary">
                    <FontAwesomeIcon icon={['fab', 'twitter']} size="2x" />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-primary">
                    <FontAwesomeIcon icon={['fab', 'facebook-f']} size="2x" />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-primary">
                    <FontAwesomeIcon icon={['fab', 'linkedin']} size="2x" />
                  </a>
                  <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="text-primary">
                    <FontAwesomeIcon icon={['fab', 'pinterest']} size="2x" />
                  </a>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>

    {/* Bottom Footer */}
    <div className="bg-dark text-light">
      <Container>
        <Row className="py-4 align-items-center">
          <Col md={8} xs={12} className="text-center text-md-left mb-3 mb-md-0">
            <span>
              &copy; {new Date().getFullYear()} by eCommerce. All rights reserved.{" "}
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-primary text-decoration-none"
              >
                Back to top
              </a>
            </span>
          </Col>
          <Col md={4} xs={12} className="text-center text-md-right">
            <div className="d-flex justify-content-center justify-content-md-end gap-3">
              <span title="Visa">
                <FontAwesomeIcon icon={['fab', 'cc-visa']} size="2x" className="text-primary" />
              </span>
              <span title="Mastercard">
                <FontAwesomeIcon icon={['fab', 'cc-mastercard']} size="2x" className="text-primary" />
              </span>
              <span title="PayPal">
                <FontAwesomeIcon icon={['fab', 'cc-paypal']} size="2x" className="text-primary" />
              </span>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  </footer>
);

export default Footer;