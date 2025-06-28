import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authClearErrors, authLogin } from "../../store/actions/authActions";
import { Spinner, Row, Col, Form } from "react-bootstrap";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import type { AppDispatch } from "../../store/store"; 

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); 
  const { token, error, loading } = useSelector((state: any) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    dispatch(authClearErrors());
  }, [dispatch]);

  useEffect(() => {
    if (token && !error) {
      const from =
        (location.state && (location.state as any).from?.pathname) ||
        "/";
      navigate(from, { replace: true });
    }
  }, [token, error, location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(authLogin(email, password)); 
  };

  if (loading) {
    return (
      <Spinner
        animation="border"
        variant="secondary"
        style={{ width: "3rem", height: "3rem" }}
        className="m-auto"
      />
    );
  }

  return (
    <div className="login-container">
      {error && (
        <Card variant="outlined" padding="md" className="mb-4 border-danger">
          <h5 className="text-danger text-center mb-0 font-weight-bold">
            Invalid credentials!
          </h5>
        </Card>
      )}
      {token === null && (
        <Row>
          <Col md="7" className="mx-auto">
            <Card variant="elevated" padding="xl">
              <Form onSubmit={handleSubmit}>
                <h3 className="text-center font-weight-bold mb-4">Login</h3>
                <Form.Group>
                  <Form.Label htmlFor="email">
                    <strong>Email address</strong>
                  </Form.Label>
                  <Form.Control
                    placeholder="Enter email"
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="mb-3"
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label htmlFor="password">
                    <strong>Password</strong>
                  </Form.Label>
                  <Form.Control
                    placeholder="Enter password"
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="mb-4"
                  />
                </Form.Group>

                <div className="text-center">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg"
                    loading={loading}
                    className="w-100 mb-4"
                  >
                    Login
                  </Button>
                  <div className="d-flex justify-content-between flex-column flex-lg-row">
                    <span>
                      <Link to="/password_reset">Forgot your password?</Link>
                    </span>
                    <span>
                      Don't have an account? <Link to="/register">Register</Link>
                    </span>
                  </div>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Login;