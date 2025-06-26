import React from "react";
import { Form } from "react-bootstrap";

interface RenderFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
}

const RenderField: React.FC<RenderFieldProps> = ({
  label,
  type,
  value,
  onChange,
  error,
  touched,
}) => (
  <>
    <Form.Label className="d-flex justify-content-between">
      {label}
      {touched && error && (
        <span className="text-danger font-weight-bold">{error}</span>
      )}
    </Form.Label>
    <Form.Control
      placeholder={label}
      type={type}
      value={value}
      onChange={onChange}
      isInvalid={!!(touched && error)}
    />
    <Form.Control.Feedback type="invalid">
      {touched && error}
    </Form.Control.Feedback>
  </>
);

export default RenderField;