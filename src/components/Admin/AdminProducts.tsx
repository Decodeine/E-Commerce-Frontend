import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faSpinner,
  faImage,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import Loading from '../UI/Loading/Loading';
import Modal from '../UI/Modal/Modal';
import { adminApi } from '../../services/adminApi';
import { productsApi, Product } from '../../services/productsApi';
import { useToast } from '../UI/Toast/ToastProvider';
import { API_PATH } from '../../backend_url';

const AdminProducts: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    price: '',
    original_price: '',
    quantity: '',
    brand: '',
    category: '',
    condition: 'new',
    featured: false,
    picture: null as File | null
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getProducts({ limit: 100 });
      setProducts(response.results || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load products.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      quantity: '',
      brand: '',
      category: '',
      condition: 'new',
      featured: false,
      picture: null
    });
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      original_price: product.original_price || '',
      quantity: product.quantity || '',
      brand: typeof product.brand === 'object' ? product.brand.id : product.brand || '',
      category: Array.isArray(product.category) ? product.category[0]?.id : product.category || '',
      condition: product.condition || 'new',
      featured: product.featured || false,
      picture: null
    });
    setShowModal(true);
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await adminApi.deleteProduct(productId);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Product deleted successfully.'
      });
      fetchProducts();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to delete product.'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'picture' && formData.picture) {
          formDataToSend.append('picture', formData.picture);
        } else if (key !== 'picture' && formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, formDataToSend);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Product updated successfully.'
        });
      } else {
        await adminApi.createProduct(formDataToSend);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Product created successfully.'
        });
      }

      setShowModal(false);
      fetchProducts();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to save product.'
      });
    }
  };

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const backendBaseUrl = API_PATH.replace('/api/', '');
    return `${backendBaseUrl}${imagePath}`;
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading variant="spinner" size="lg" text="Loading products..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Product Management</h2>
          <p className="mt-1 text-slate-600">Add, edit, and delete products</p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreate}
          icon={<FontAwesomeIcon icon={faPlus} />}
        >
          Add Product
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 pl-10 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <FontAwesomeIcon icon={faImage} className="text-4xl text-slate-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900">No Products Found</h3>
          <p className="text-slate-600">
            {searchQuery ? "No products match your search." : "Get started by adding your first product."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="mb-3 h-48 overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={getImageUrl(product.picture)}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.png';
                  }}
                />
              </div>
              <h3 className="mb-1 font-semibold text-slate-900">{product.name}</h3>
              <p className="mb-2 text-sm text-slate-600 line-clamp-2">{product.description}</p>
              <div className="mb-3 flex items-center justify-between">
                <span className="font-bold text-blue-600">${parseFloat(product.price || '0').toFixed(2)}</span>
                {product.featured && (
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                  icon={<FontAwesomeIcon icon={faEdit} />}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  icon={<FontAwesomeIcon icon={faTrash} />}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Create Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Original Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Quantity *</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="new">New</option>
                <option value="refurbished">Refurbished</option>
                <option value="used">Used</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, picture: e.target.files?.[0] || null })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            <label htmlFor="featured" className="text-sm font-medium text-slate-700">
              Featured Product
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setEditingProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<FontAwesomeIcon icon={faSave} />}
            >
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProducts;

