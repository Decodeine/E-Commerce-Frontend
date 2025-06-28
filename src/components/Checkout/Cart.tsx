import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import OrderSummary from "./OrderSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as actions from "../../store/actions/storeActions";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import "./css/cart.css";
import type { AppDispatch } from "../../store/store";

interface CartItem {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  picture: string;
  quantity: number;
  [key: string]: any;
}

const Cart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: any) => state.store.cart);
  const subtotal = useSelector((state: any) => state.store.subtotal);
  const shipping = useSelector((state: any) => state.store.shipping);
  const tax = useSelector((state: any) => state.store.tax);

  // Calculate cart and set shipping when cart or subtotal changes
  useEffect(() => {
    dispatch(actions.calculateCart());
    if (subtotal >= 100) {
      dispatch(actions.setShipping("free"));
    } else {
      dispatch(actions.setShipping("standard"));
    }
  }, [dispatch, cart, subtotal]);

  if (cart.length === 0) {
    return (
      <div className="text-center mt-5">
        <Card variant="outlined" padding="xl" className="max-w-md mx-auto">
          <h3 className="mb-4">Your cart is empty</h3>
          <p className="text-muted mb-4">Why not add something? :)</p>
          <Button 
            as={Link} 
            to="/" 
            variant="primary"
          >
            <FontAwesomeIcon icon="shopping-bag" /> Continue Shopping
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h3>My Cart</h3>
      <div className="row">
        <div className="col-lg-8">
          <Card variant="elevated" padding="lg">
            <div className="cart-header text-uppercase text-center font-weight-bold mb-3">
              <div className="row">
                <div className="col-5">Item</div>
                <div className="col-2">Price</div>
                <div className="ml-1 col-2">Quantity</div>
                <div className="col-2">Total</div>
                <div className="col-1"> </div>
              </div>
            </div>
            <div className="cart-items">
              {cart.map((item: CartItem) => (
                <Card key={item.id} variant="outlined" padding="md" className="mb-3">
                  <div className="row d-flex align-items-center text-center">
                    <div className="col-5">
                      <div className="d-flex align-items-center">
                        <img
                          className="product-image"
                          alt={item.name}
                          src={item.picture}
                        />
                        <Link
                          to={`/product/${item.slug}`}
                          className="cart-title"
                        >
                          {item.name}
                        </Link>
                      </div>
                    </div>
                    <div className="col-2">£{item.price}</div>
                    <div className="col-2">
                      <div className="d-flex align-items-center justify-content-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dispatch(actions.decProductQuantity(item))}
                        >
                          <FontAwesomeIcon icon={["far", "minus-square"]} />
                        </Button>
                        <input
                          disabled
                          className="form-control rounded-0 mx-2"
                          type="number"
                          value={item.quantity}
                          style={{ maxWidth: "60px" }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dispatch(actions.incProductQuantity(item))}
                        >
                          <FontAwesomeIcon icon={["far", "plus-square"]} />
                        </Button>
                      </div>
                    </div>
                    <div className="col-2 text-center">
                      £{(item.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="col-1 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dispatch(actions.removeProductFromCart(item))}
                      >
                        <FontAwesomeIcon icon={["far", "times-circle"]} className="text-danger" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <div className="d-flex my-4">
            <Button
              variant="danger"
              size="sm"
              onClick={() => dispatch(actions.emptyCart())}
              className="ml-auto"
            >
              <FontAwesomeIcon icon="trash-alt" /> Empty cart
            </Button>
          </div>
        </div>
        <div className="col-lg-4">
          <OrderSummary
            isCartComponent={true}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
          />
        </div>
      </div>
    </div>
  );
};

export default Cart;