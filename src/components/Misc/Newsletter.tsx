import React, { useState } from "react";
import { InputGroup, Button, Form, FormControl } from "react-bootstrap";
import axios from "axios";
import { API_PATH } from "../../backend_url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_PATH}subscribers/`, { email });
      alert("Successfully subscribed!");
    } catch (err) {
      alert(`The email ${email} is already a subscriber!`);
    }
    setEmail("");
  };

  return (
    <div>
      <h5 className="font-weight-bold mb-3">Newsletter</h5>
      <p className="text-muted mb-3">Get updates on new products and exclusive offers!</p>
      <Form onSubmit={handleSubmit}>
        <InputGroup className="mb-2">
          <FormControl
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="rounded-left"
          />
          <Button variant="primary" type="submit" className="rounded-right">
            <FontAwesomeIcon icon="paper-plane" />
          </Button>
        </InputGroup>
      </Form>
    </div>
  );
};

export default Newsletter;