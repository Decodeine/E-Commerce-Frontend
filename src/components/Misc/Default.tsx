import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

const Default: React.FC = () => (
  <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
    <h1 className="font-weight-bold mb-3">Page not found.</h1>
    <p className="mb-4">Sorry, the page you are looking for does not exist.</p>
    <Button as={Link as any} to="/" variant="primary">
      Go to Home
    </Button>
  </div>
);

export default Default;