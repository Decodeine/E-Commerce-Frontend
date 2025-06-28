import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import SearchForm from "../Products/SearchForm";
import jwt_decode from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTruck, 
  faShoppingCart, 
  faUser, 
  faSignInAlt, 
  faSignOutAlt, 
  faUserPlus 
} from "@fortawesome/free-solid-svg-icons";
import {
  Navbar as RBNavbar,
  Container,
  Nav,
  ButtonGroup,
} from "react-bootstrap";
import { authLogout } from "../../store/actions/authActions";
import Button from "../UI/Button/Button";
import "./css/navbar.css";

const Navbar: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const dispatch = useDispatch();
  const cart = useSelector((state: any) => state.store.cart);
  const token = useSelector((state: any) => state.auth.token);
  const isAuthenticated = token !== null;

  const cartItemCount = () =>
    cart.reduce((total: number, item: any) => total + item.quantity, 0);

  let decoded_token: any = undefined;
  if (token) {
    decoded_token = jwt_decode(token);
  }

  return (
    <>
      <div className="bg-light text-center text-dark py-1">
        <FontAwesomeIcon icon={faTruck} />{" "}
        <em>Free delivery on orders over £100!</em>
      </div>
      <RBNavbar
        bg="dark"
        variant="dark"
        expand="md"
        expanded={expanded}
        onToggle={setExpanded}
        className="mb-3"
      >
        <Container>
          <RBNavbar.Brand as={Link} to="/" className="mr-4 font-weight-bold">
            eCommerce
          </RBNavbar.Brand>
          <RBNavbar.Toggle
            aria-controls="main-navbar"
            className="rounded-0"
            onClick={() => setExpanded((prev) => !prev)}
          />
          <RBNavbar.Collapse id="main-navbar">
            <Nav className="align-items-center justify-content-center flex-grow-1">
              <Nav.Link as={Link} to="/about" className="text-light mx-2">
                About
              </Nav.Link>
              <div id="searchBox">
                <SearchForm />
              </div>
            </Nav>
            <Nav className="ml-auto align-items-center justify-content-center">
              <Nav.Link as={Link} to="/cart" className="text-light">
                <FontAwesomeIcon icon={faShoppingCart} />
                <span className="font-weight-bold"> Cart</span> ({cartItemCount()})
              </Nav.Link>
            </Nav>
            <Nav className="align-items-center justify-content-center">
              {isAuthenticated ? (
                <ButtonGroup id="authBtnGroup">
                  <Link to="/profile" className="btn btn-sm btn-success">
                    {decoded_token?.username
                      ? decoded_token.username
                      : decoded_token?.email}{" "}
                    <FontAwesomeIcon icon={faUser} />
                  </Link>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => dispatch(authLogout())}
                    icon={<FontAwesomeIcon icon={faSignOutAlt} />}
                  >
                    Logout
                  </Button>
                </ButtonGroup>
              ) : (
                <ButtonGroup>
                  <Button
                    as={Link}
                    to="/login"
                    variant="warning"
                    size="sm"
                    icon={<FontAwesomeIcon icon={faSignInAlt} />}
                  >
                    Login
                  </Button>
                  <Button
                    as={Link}
                    to="/register"
                    variant="secondary"
                    size="sm"
                    icon={<FontAwesomeIcon icon={faUserPlus} />}
                  >
                    Register
                  </Button>
                </ButtonGroup>
              )}
            </Nav>
          </RBNavbar.Collapse>
        </Container>
      </RBNavbar>
    </>
  );
};

export default Navbar;