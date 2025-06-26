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
    <>
      <h5 className="font-weight-bold">Subscribe to our newsletter!</h5>
      <Form className="d-flex justify-content-center" onSubmit={handleSubmit}>
        <InputGroup>
          <FormControl
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Button variant="secondary" type="submit">
            Subscribe! <FontAwesomeIcon icon="paper-plane" />
          </Button>
        </InputGroup>
      </Form>
    </>
  );
};

export default Newsletter;