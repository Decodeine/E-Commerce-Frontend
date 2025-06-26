import React, { ReactNode } from "react";
import {Accordion as RBAccordion, Card,useAccordionButton} from "react-bootstrap";

interface CustomAccordionProps {
  defaultActiveKey?: string;
  children: ReactNode;
}

interface CustomAccordionItemProps {
  eventKey: string;
  header: ReactNode;
  children: ReactNode;
}

export const Accordion: React.FC<CustomAccordionProps> & {
  Item: React.FC<CustomAccordionItemProps>;
} = ({ defaultActiveKey, children }) => (
  <RBAccordion defaultActiveKey={defaultActiveKey}>
    {children}
  </RBAccordion>
);

export const AccordionItem: React.FC<CustomAccordionItemProps> = ({
  eventKey,
  header,
  children
}) => (
  <Card>
    <Card.Header>
      <CustomToggle eventKey={eventKey}>{header}</CustomToggle>
    </Card.Header>
    <RBAccordion.Collapse eventKey={eventKey}>
      <Card.Body>{children}</Card.Body>
    </RBAccordion.Collapse>
  </Card>
);

interface CustomToggleProps {
  eventKey: string;
  children: ReactNode;
}

const CustomToggle: React.FC<CustomToggleProps> = ({ eventKey, children }) => {
  const decoratedOnClick = useAccordionButton(eventKey);
  return (
    <h6 className="mb-0" onClick={decoratedOnClick} style={{ cursor: "pointer" }}>
      {children}
    </h6>
  );
};

// Attach subcomponents
Accordion.Item = AccordionItem;