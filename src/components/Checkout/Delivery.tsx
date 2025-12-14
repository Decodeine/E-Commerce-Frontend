import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setShipping } from "../../store/actions/storeActions";
import { Form, Button, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface DeliveryProps {
  previousPage: () => void;
  onSubmit: () => void;
}

const Delivery: React.FC<DeliveryProps> = ({ previousPage, onSubmit }) => {
  const dispatch = useDispatch();
  const subtotal = useSelector((state: any) => state.store.subtotal);
  const shipping = useSelector((state: any) => state.store.shipping);

  const [option, setOption] = useState<string>(
    subtotal >= 100 ? "free" : shipping || "standard"
  );

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOption(value);
    dispatch(setShipping(value));
  };

  React.useEffect(() => {
    if (subtotal >= 100 && option !== "free") {
      setOption("free");
      dispatch(setShipping("free"));
    }
    // eslint-disable-next-line
  }, [subtotal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mt-4">
        <Col xs={12} md={6} lg={12}>
          <div className="deliverySelection mb-3">
            <Form.Check
              id="free"
              type="radio"
              name="shipping"
              value="free"
              label={
                <span>
                  <span className="d-block text-uppercase font-weight-bold">
                    Free standard delivery
                  </span>
                  <span className="text-muted my-2">
                    {subtotal < 100 ? (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id="tooltip-free">
                            This option will activate once you add items worth £
                            {parseFloat((100 - subtotal).toString()).toFixed(2)} or more.
                          </Tooltip>
                        }
                      >
                        <span className="cursor-pointer underline">
                          Not eligible yet
                        </span>
                      </OverlayTrigger>
                    ) : (
                      "You are eligible for FREE delivery!"
                    )}
                  </span>
                  <span className="text-muted d-block">
                    Approximately 3-5 working days.
                  </span>
                </span>
              }
              disabled={subtotal < 100}
              checked={option === "free" && subtotal >= 100}
              onChange={handleOptionChange}
            />
          </div>
          <div className="deliverySelection mb-3">
            <Form.Check
              id="standard"
              type="radio"
              name="shipping"
              value="standard"
              label={
                <span>
                  <strong className="d-block text-uppercase mb-2">
                    Standard delivery - £5
                  </strong>
                  <span className="text-muted">
                    Approximately 3-5 working days.
                  </span>
                </span>
              }
              checked={option === "standard"}
              onChange={handleOptionChange}
            />
          </div>
          <div className="deliverySelection mb-3">
            <Form.Check
              id="express"
              type="radio"
              name="shipping"
              value="express"
              label={
                <span>
                  <strong className="d-block text-uppercase mb-2">
                    Express delivery - £10
                  </strong>
                  <span className="text-muted">
                    Fastest option. Delivered within one working day.
                  </span>
                </span>
              }
              checked={option === "express"}
              onChange={handleOptionChange}
            />
          </div>
          <div className="deliverySelection mb-3">
            <Form.Check
              id="collection"
              type="radio"
              name="shipping"
              value="collection"
              label={
                <span>
                  <span className="d-block text-uppercase mb-2 font-weight-bold">
                    Collection
                  </span>
                  <span className="text-muted">
                    Collect your order in person.
                  </span>
                </span>
              }
              checked={option === "collection"}
              onChange={handleOptionChange}
            />
          </div>
        </Col>
      </Row>
      <div className="my-4 d-flex justify-content-between flex-column flex-lg-row">
        <Button
          type="button"
          className="btn btn-link text-muted bg-white"
          onClick={previousPage}
        >
          <FontAwesomeIcon icon="angle-left" />
          <span className="ml-2">Go back</span>
        </Button>
        <Button type="submit" className="btn btn-dark">
          <span className="mr-2">Review order</span>
          <FontAwesomeIcon icon="angle-right" />
        </Button>
      </div>
    </Form>
  );
};
export default Delivery;