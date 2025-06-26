import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { connect } from "react-redux";
import * as auth from "../../store/actions/authActions";

import PersonalDetails from "./PersonalDetails";
import BillingAddress from "./BillingAddress";
import DeliveryAddress from "./DeliveryAddress";
import PrivateRoute from "../Utilities/PrivateRoute";

const mapStateToProps = (state: any) => {
  return state.auth;
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onAuth: (username: string, password: string) =>
      dispatch(auth.authLogin(username, password))
  };
};

class Profile extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Router basename="/profile">
          <div className="row">
            <div className="col-md-3">
              <ul className="list-unstyled">
                <li>
                  <Link to="/">Personal details</Link>
                </li>
                <li>
                  <Link to="/billing">Billing details</Link>
                </li>
                <li>
                  <Link to="/delivery">Delivery details</Link>
                </li>
              </ul>
            </div>
            <div className="col-md-9">
              <Routes>
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <PersonalDetails />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/billing"
                  element={
                    <PrivateRoute>
                      <BillingAddress />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/delivery"
                  element={
                    <PrivateRoute>
                      <DeliveryAddress />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </Router>
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);