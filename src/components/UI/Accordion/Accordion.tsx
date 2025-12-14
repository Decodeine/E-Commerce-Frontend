import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export interface AccordionItemProps {
  id: string;
  title: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItemProps[];
  variant?: 'default' | 'glass' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  allowMultiple?: boolean;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  variant = 'glass',
  size = 'md',
  allowMultiple = false,
  className = ''
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(items.filter(item => item.defaultExpanded).map(item => item.id))
  );

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(itemId);
      }
      
      return newSet;
    });
  };

  return (
    <div className={`accordion accordion--${variant} accordion--${size} ${className}`}>
      {items.map(item => (
        <AccordionItem
          key={item.id}
          item={item}
          isExpanded={expandedItems.has(item.id)}
          onToggle={() => toggleItem(item.id)}
        />
      ))}
    </div>
  );
};

interface AccordionItemComponentProps {
  item: AccordionItemProps;
  isExpanded: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemComponentProps> = ({
  item,
  isExpanded,
  onToggle
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string>('0px');

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : '0px');
    }
  }, [isExpanded]);

  return (
    <div className={`accordion-item ${isExpanded ? 'accordion-item--expanded' : ''} ${item.disabled ? 'accordion-item--disabled' : ''}`}>
      <button
        className="accordion-header"
        onClick={onToggle}
        disabled={item.disabled}
        aria-expanded={isExpanded}
        aria-controls={`accordion-content-${item.id}`}
      >
        <div className="accordion-header-content">
          {item.icon && (
            <div className="accordion-icon">
              {item.icon}
            </div>
          )}
          <div className="accordion-title">
            {item.title}
          </div>
        </div>
        <div className={`accordion-chevron ${isExpanded ? 'accordion-chevron--expanded' : ''}`}>
          <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
        </div>
      </button>
      
      <div
        className="accordion-content"
        style={{ height }}
        id={`accordion-content-${item.id}`}
      >
        <div ref={contentRef} className="accordion-content-inner">
          {item.children}
        </div>
      </div>
    </div>
  );
};

// Individual Accordion Item Component for more flexible usage
export const AccordionSingle: React.FC<AccordionItemProps & { 
  expanded?: boolean; 
  onToggle?: () => void;
  variant?: 'default' | 'glass' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}> = ({ 
  expanded = false, 
  onToggle,
  variant = 'glass',
  size = 'md',
  ...item 
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`accordion accordion--${variant} accordion--${size}`}>
      <AccordionItem
        item={item}
        isExpanded={onToggle ? expanded : isExpanded}
        onToggle={handleToggle}
      />
    </div>
  );
};

export default Accordion;
