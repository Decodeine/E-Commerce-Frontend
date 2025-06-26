import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_PATH } from "../../backend_url";
import { useSelector } from "react-redux";

interface BillingAddressItem {
  id: number;
  address_name: string;
  address_line_1: string;
  address_line_2: string;
  country: string;
  city: string;
  postcode: string;
  owner: number;
}

const BillingAddress: React.FC = () => {
  const [addresses, setAddresses] = useState<BillingAddressItem[]>([]);
  const token = useSelector((state: any) => state.auth?.token);

  useEffect(() => {
    axios
      .get(`${API_PATH}addresses/billing_details/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      .then(res => setAddresses(res.data))
      .catch(err => console.log(err));
  }, [token]);

  return (
    <>
      <h3>My billing details</h3>
      <table className="table table-responsive">
        <tbody>
          {addresses.map((item, index) => (
            <tr key={item.id}>
              <th scope="row">{index + 1}</th>
              <td>{item.address_name}</td>
              <td>
                <div className="d-flex flex-column">
                  <span>{item.address_line_1}</span>
                  <span>{item.address_line_2}</span>
                </div>
              </td>
              <td>{item.country}</td>
              <td>{item.city}</td>
              <td>{item.postcode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default BillingAddress;