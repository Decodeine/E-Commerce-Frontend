import React, { ReactNode } from "react";
// Legacy accordion using modern UI component
import ModernAccordion, { AccordionProps, AccordionItemProps } from "../UI/Accordion/Accordion";

interface CustomAccordionProps {
  defaultActiveKey?: string;
  children: ReactNode;
}

interface CustomAccordionItemProps {
  eventKey: string;
  header: ReactNode;
  children: ReactNode;
}

// Legacy wrapper for backward compatibility
export const Accordion: React.FC<CustomAccordionProps> & {
  Item: React.FC<CustomAccordionItemProps>;
} = ({ defaultActiveKey, children }) => {
  // Convert children to accordion items format
  const items: AccordionItemProps[] = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child) && child.type === AccordionItem) {
      return {
        id: child.props.eventKey || index.toString(),
        title: child.props.header,
        children: child.props.children,
        defaultExpanded: child.props.eventKey === defaultActiveKey
      };
    }
    return {
      id: index.toString(),
      title: `Item ${index + 1}`,
      children: child
    };
  }) || [];

  return (
    <ModernAccordion 
      items={items}
      variant="glass"
      allowMultiple={false}
    />
  );
};

export const AccordionItem: React.FC<CustomAccordionItemProps> = ({
  eventKey,
  header,
  children
}) => {
  // This is just a placeholder component for the legacy API
  // The actual rendering is handled by the parent Accordion
  return null;
};

// Set the Item property for backward compatibility
Accordion.Item = AccordionItem;

// Export the modern accordion with different name to avoid conflicts
export { default as ModernAccordion } from "../UI/Accordion/Accordion";
export type { AccordionProps, AccordionItemProps } from "../UI/Accordion/Accordion";

// Attach subcomponents
Accordion.Item = AccordionItem;