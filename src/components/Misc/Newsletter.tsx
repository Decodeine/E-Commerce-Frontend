import React, { useState } from "react";
import axios from "axios";
import { API_PATH } from "../../backend_url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import Card from "../UI/Card/Card";
import Button from "../UI/Button/Button";
import "./css/Newsletter.css";

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      await axios.post(`${API_PATH}subscribers/`, { email });
      setMessage("🎉 Successfully subscribed! Welcome to our community!");
      setEmail("");
    } catch (err) {
      setMessage(`📧 The email ${email} is already subscribed!`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <Card variant="glass" className="newsletter-card" padding="xl">
      <div className="newsletter-content">
        <div className="newsletter-header">
          <div className="newsletter-icon">
            <FontAwesomeIcon icon={faEnvelope} />
          </div>
          <h3 className="newsletter-title">Stay Updated</h3>
          <p className="newsletter-description">
            Get the latest tech news, exclusive deals, and early access to new products 
            delivered straight to your inbox.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="newsletter-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="newsletter-input"
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !email.trim()}
              className="newsletter-button"
              icon={<FontAwesomeIcon icon={faPaperPlane} />}
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
        </form>

        {message && (
          <div className={`newsletter-message ${message.includes("🎉") ? "success" : "info"}`}>
            {message}
          </div>
        )}

        <div className="newsletter-benefits">
          <div className="benefit-item">
            <span className="benefit-icon">🚀</span>
            <span>Early access to sales</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">📱</span>
            <span>Latest tech updates</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🎁</span>
            <span>Exclusive member deals</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Newsletter;