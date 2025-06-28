import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import PersonalDetails from "./PersonalDetails";
import BillingAddress from "./BillingAddress";
import DeliveryAddress from "./DeliveryAddress";
import PrivateRoute from "../Utilities/PrivateRoute";

const Profile: React.FC = () => {
  return (
    <React.Fragment>
      <div className="row">
        <div className="col-md-3">
          <ul className="list-unstyled">
            <li>
              <Link to="">Personal details</Link>
            </li>
            <li>
              <Link to="billing">Billing details</Link>
            </li>
            <li>
              <Link to="delivery">Delivery details</Link>
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
              path="billing"
              element={
                <PrivateRoute>
                  <BillingAddress />
                </PrivateRoute>
              }
            />
            <Route
              path="delivery"
              element={
                <PrivateRoute>
                  <DeliveryAddress />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Profile;