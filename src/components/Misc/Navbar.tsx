import React, { useState } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import SearchForm from "../Products/SearchForm";
import jwt_decode from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Navbar as RBNavbar,
  Container,
  Nav,
  NavDropdown,
  ButtonGroup,
  Button,
} from "react-bootstrap";
import { authLogout } from "../../store/actions/authActions";
import "./css/navbar.css";

// Types
interface NavbarProps {
  cart: { quantity: number }[];
  token: string | null;
  isAuthenticated: boolean;
  authLogout: () => void;
}

const mapStateToProps = (state: any) => ({
  cart: state.store.cart,
  token: state.auth.token,
  isAuthenticated: state.auth.token !== null,
});

const mapDispatchToProps = (dispatch: any) => ({
  authLogout: () => dispatch(authLogout()),
});

const Navbar: React.FC<NavbarProps> = ({
  cart,
  token,
  isAuthenticated,
  authLogout,
}) => {
  const [expanded, setExpanded] = useState(false);

  const cartItemCount = () =>
    cart.reduce((total, item) => total + item.quantity, 0);

  let decoded_token: any = undefined;
  if (token) {
    decoded_token = jwt_decode(token);
  }

  return (
    <>
      <div className="bg-light text-center text-dark py-1">
        <FontAwesomeIcon icon="truck" />{" "}
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
              <div id="searchBox">
                <SearchForm />
              </div>
            </Nav>
            <Nav className="ml-auto align-items-center justify-content-center">
              <Nav.Link as={Link} to="/cart" className="text-light">
                <FontAwesomeIcon icon="shopping-cart" />
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
                    <FontAwesomeIcon icon="user" />
                  </Link>
                  <Button
                    className="btn btn-sm btn-warning"
                    onClick={authLogout}
                  >
                    Logout <FontAwesomeIcon icon="sign-out-alt" />
                  </Button>
                </ButtonGroup>
              ) : (
                <ButtonGroup>
                  <Link to="/login" className="btn btn-sm btn-warning">
                    Login <FontAwesomeIcon icon="sign-in-alt" />
                  </Link>
                  <Link to="/register" className="btn btn-sm btn-info">
                    Register <FontAwesomeIcon icon="user-plus" />
                  </Link>
                </ButtonGroup>
              )}
            </Nav>
          </RBNavbar.Collapse>
        </Container>
      </RBNavbar>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);