import React, { useState } from "react";
import axios from "axios";
import { API_PATH } from "../../backend_url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import Card from "../UI/Card/Card";
import Button from "../UI/Button/Button";

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
    <Card variant="glass" className="rounded-2xl border border-slate-200 bg-white shadow-md" padding="xl">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-md">
            <FontAwesomeIcon icon={faEnvelope} className="text-2xl text-white" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-slate-900">Stay Updated</h3>
          <p className="text-slate-600">
            Get the latest tech news, exclusive deals, and early access to new products 
            delivered straight to your inbox.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-base transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-100"
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !email.trim()}
              icon={<FontAwesomeIcon icon={faPaperPlane} />}
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
        </form>

        {message && (
          <div className={`rounded-lg px-4 py-3 text-sm ${
            message.includes("🎉") 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-xl">🚀</span>
            <span>Early access to sales</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-xl">📱</span>
            <span>Latest tech updates</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-xl">🎁</span>
            <span>Exclusive member deals</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Newsletter;