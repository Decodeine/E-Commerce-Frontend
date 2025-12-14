import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLaptop, 
  faMobileAlt, 
  faHeadphones,
  faBell,
  faUser,
  faCog
} from '@fortawesome/free-solid-svg-icons';

import { useToast, useToastActions } from '../UI/Toast/ToastProvider';
import Modal, { ConfirmModal, AlertModal } from '../UI/Modal/Modal';
import Loading, { ProductCardSkeleton, ProductListSkeleton } from '../UI/Loading/Loading';
import LoadingSpinner from '../UI/Loading/LoadingSpinner';
import Dropdown, { MenuDropdown, DropdownOption } from '../UI/Dropdown/Dropdown';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';


// Sample data for dropdowns
const categoryOptions: DropdownOption[] = [
  { value: 'laptops', label: 'Laptops', icon: faLaptop },
  { value: 'smartphones', label: 'Smartphones', icon: faMobileAlt },
  { value: 'audio', label: 'Audio Equipment', icon: faHeadphones },
  { value: 'tablets', label: 'Tablets', icon: faMobileAlt }
];

const sortOptions: DropdownOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' }
];

const UIShowcase: React.FC = () => {
  const { showToast } = useToast();
  const { showSuccess, showError, showWarning, showInfo } = useToastActions();
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);
  
  // Dropdown states
  const [selectedCategory, setSelectedCategory] = useState<string | number>('');
  const [selectedSort, setSelectedSort] = useState<string | number>('newest');
  const [multiSelectValues, setMultiSelectValues] = useState<(string | number)[]>([]);

  // Toast examples
  const handleToastExamples = () => {
    showSuccess('Success!', 'Your action completed successfully');
    setTimeout(() => showError('Error occurred', 'Something went wrong'), 1000);
    setTimeout(() => showWarning('Warning', 'Please check your input'), 2000);
    setTimeout(() => showInfo('Information', 'Here is some useful info'), 3000);
  };

  const handleCustomToast = () => {
    showToast({
      type: 'success',
      title: 'Product Added to Cart',
      message: 'iPhone 14 Pro has been added to your cart',
      action: {
        label: 'View Cart',
        onClick: () => console.log('Navigate to cart')
      }
    });
  };

  // Loading examples
  const handleLoadingExample = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  // Confirm modal example
  const handleDeleteExample = () => {
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    setShowConfirmModal(false);
    showSuccess('Deleted', 'Item has been deleted successfully');
  };

  return (
    <div className="ui-showcase">
      <div className="ui-showcase__container">
        <h1>UI Components Showcase</h1>
        <p className="ui-showcase__description">
          Demonstration of all the new UI components implemented in Option D.
        </p>

        {/* Toast Notifications Section */}
        <section className="ui-section">
          <Card>
            <h2>🍞 Toast Notifications</h2>
            <p>Toast notifications provide feedback to users about actions and system states.</p>
            
            <div className="ui-examples">
              <Button variant="primary" onClick={handleToastExamples}>
                Show All Toast Types
              </Button>
              
              <Button variant="secondary" onClick={handleCustomToast}>
                Custom Toast with Action
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => showInfo('Persistent Toast', 'This toast will stay until manually closed')}
              >
                Persistent Toast
              </Button>
            </div>
            
            <div className="ui-code-example">
              <h4>Usage Example:</h4>
              <pre>{`const { showSuccess, showError } = useToastActions();

// Simple toast
showSuccess('Success!', 'Operation completed');

// Toast with action
showToast({
  type: 'success',
  title: 'Product Added',
  message: 'Added to cart',
  action: {
    label: 'View Cart',
    onClick: () => navigate('/cart')
  }
});`}</pre>
            </div>
          </Card>
        </section>

        {/* Modal Components Section */}
        <section className="ui-section">
          <Card>
            <h2>🏠 Modal Dialogs</h2>
            <p>Modal dialogs for user interactions, confirmations, and content display.</p>
            
            <div className="ui-examples">
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Open Basic Modal
              </Button>
              
              <Button variant="warning" onClick={handleDeleteExample}>
                Confirm Delete
              </Button>
              
              <Button variant="outline" onClick={() => setShowAlertModal(true)}>
                Show Alert
              </Button>
            </div>
            
            <div className="ui-code-example">
              <h4>Usage Example:</h4>
              <pre>{`<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  Modal content goes here
</Modal>

<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleConfirm}
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  type="danger"
/>`}</pre>
            </div>
          </Card>
        </section>

        {/* Loading Components Section */}
        <section className="ui-section">
          <Card>
            <h2>⏳ Loading States</h2>
            <p>Loading indicators and skeleton screens for better user experience.</p>
            
            <div className="ui-examples">
              <div className="loading-examples">
                <h4>Standard Loading Components:</h4>
                <div className="loading-row">
                  <Loading size="sm" variant="spinner" text="Small Spinner" />
                  <Loading size="md" variant="dots" text="Medium Dots" />
                  <Loading size="lg" variant="pulse" text="Large Pulse" />
                </div>
                
                <h4>Dedicated Spinner Component:</h4>
                <div className="loading-row">
                  <div className="spinner-example">
                    <LoadingSpinner size="sm" type="default" />
                    <span>Default</span>
                  </div>
                  <div className="spinner-example">
                    <LoadingSpinner size="md" type="notch" color="#007bff" />
                    <span>Notch</span>
                  </div>
                  <div className="spinner-example">
                    <LoadingSpinner size="lg" type="cog" speed="slow" />
                    <span>Cog (Slow)</span>
                  </div>
                  <div className="spinner-example">
                    <LoadingSpinner size="xl" type="sync" speed="fast" color="#28a745" />
                    <span>Sync (Fast)</span>
                  </div>
                </div>
                
                <div className="loading-actions">
                  <Button variant="primary" onClick={handleLoadingExample}>
                    Show Loading Overlay (3s)
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSkeletons(!showSkeletons)}
                  >
                    Toggle Skeleton Screens
                  </Button>
                </div>
              </div>
              
              {showSkeletons && (
                <div className="skeleton-examples">
                  <h4>Skeleton Screens:</h4>
                  <div className="skeleton-grid">
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                  </div>
                </div>
              )}
            </div>
            
            <div className="ui-code-example">
              <h4>Usage Example:</h4>
              <pre>{`// Standard Loading component
<Loading variant="spinner" size="md" text="Loading..." />
<Loading overlay text="Processing..." />

// Dedicated LoadingSpinner component
<LoadingSpinner size="md" type="default" />
<LoadingSpinner size="lg" type="notch" color="#007bff" speed="slow" />
<LoadingSpinner inline type="sync" /> {/* Inline spinner */}

// Skeleton screens
<ProductCardSkeleton />
<ProductListSkeleton count={6} />`}</pre>
            </div>
          </Card>
        </section>

        {/* Dropdown Components Section */}
        <section className="ui-section">
          <Card>
            <h2>📋 Dropdown Components</h2>
            <p>Dropdown menus and select components for user input and navigation.</p>
            
            <div className="ui-examples">
              <div className="dropdown-examples">
                <div className="dropdown-row">
                  <div className="dropdown-example">
                    <label>Category:</label>
                    <Dropdown
                      options={categoryOptions}
                      value={selectedCategory}
                      placeholder="Select category"
                      onChange={(value) => setSelectedCategory(value as string | number)}
                    />
                  </div>
                  
                  <div className="dropdown-example">
                    <label>Sort by:</label>
                    <Dropdown
                      options={sortOptions}
                      value={selectedSort}
                      onChange={(value) => setSelectedSort(value as string | number)}
                      size="sm"
                    />
                  </div>
                </div>
                
                <div className="dropdown-row">
                  <div className="dropdown-example">
                    <label>Multi-select:</label>
                    <Dropdown
                      options={categoryOptions}
                      value={multiSelectValues}
                      placeholder="Select multiple"
                      multiSelect
                      onChange={(value) => setMultiSelectValues(value as (string | number)[])}
                    />
                  </div>
                  
                  <div className="dropdown-example">
                    <label>Searchable:</label>
                    <Dropdown
                      options={categoryOptions}
                      placeholder="Search categories"
                      searchable
                      onChange={(value) => console.log('Selected:', value)}
                    />
                  </div>
                </div>
                
                <div className="dropdown-row">
                  <MenuDropdown
                    trigger={
                      <Button variant="outline">
                        <FontAwesomeIcon icon={faUser} /> User Menu
                      </Button>
                    }
                  >
                    <button className="menu-item">
                      <FontAwesomeIcon icon={faUser} /> Profile
                    </button>
                    <button className="menu-item">
                      <FontAwesomeIcon icon={faCog} /> Settings
                    </button>
                    <button className="menu-item">
                      <FontAwesomeIcon icon={faBell} /> Notifications
                    </button>
                    <div className="menu-divider"></div>
                    <button className="menu-item menu-item--danger">
                      Logout
                    </button>
                  </MenuDropdown>
                </div>
              </div>
            </div>
            
            <div className="ui-code-example">
              <h4>Usage Example:</h4>
              <pre>{`// Basic dropdown
<Dropdown
  options={options}
  value={value}
  onChange={setValue}
  placeholder="Select option"
/>

// Multi-select with search
<Dropdown
  options={options}
  multiSelect
  searchable
  onChange={handleMultiSelect}
/>

// Menu dropdown
<MenuDropdown trigger={<Button>Menu</Button>}>
  <button className="menu-item">Option 1</button>
  <button className="menu-item">Option 2</button>
</MenuDropdown>`}</pre>
            </div>
          </Card>
        </section>

        {/* Integration Examples */}
        <section className="ui-section">
          <Card>
            <h2>🔗 Real-world Integration</h2>
            <p>Examples of how these components integrate with the ecommerce features.</p>
            
            <div className="integration-examples">
              <h4>Shopping Cart Integration:</h4>
              <ul>
                <li>✅ Toast notifications for add/remove from cart</li>
                <li>✅ Confirm modals for cart item deletion</li>
                <li>✅ Loading states during checkout process</li>
                <li>✅ Dropdown for quantity selection</li>
              </ul>
              
              <h4>Product Management:</h4>
              <ul>
                <li>✅ Category dropdowns in product filters</li>
                <li>✅ Loading skeletons for product lists</li>
                <li>✅ Toast feedback for wishlist actions</li>
                <li>✅ Modal dialogs for price alerts</li>
              </ul>
              
              <h4>User Interface:</h4>
              <ul>
                <li>✅ User menu dropdowns in navigation</li>
                <li>✅ Alert modals for error handling</li>
                <li>✅ Loading overlays for form submissions</li>
                <li>✅ Toast notifications for user feedback</li>
              </ul>
            </div>
          </Card>
        </section>
      </div>

      {/* Modal Examples */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Example Modal"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setShowModal(false)}>
              Save Changes
            </Button>
          </div>
        }
      >
        <p>This is an example modal with a header, body content, and footer actions.</p>
        <p>It demonstrates the modal component with proper focus management and accessibility features.</p>
      </Modal>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="Information"
        message="This is an example alert modal for displaying important information to users."
        type="info"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <Loading 
          overlay 
          variant="spinner" 
          size="lg" 
          text="Processing your request..." 
        />
      )}
    </div>
  );
};

export default UIShowcase;
