import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faEdit,
  faTrash,
  faSearch,
  faBan,
  faCheckCircle,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import Loading from '../UI/Loading/Loading';
import Modal from '../UI/Modal/Modal';
import { adminApi, AdminUser } from '../../services/adminApi';
import { useToast } from '../UI/Toast/ToastProvider';
import { formatDate } from '../../services/cartApi';

const AdminUsers: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    is_staff: false,
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers({ limit: 100 });
      setUsers(response.results || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load users.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      is_staff: user.is_staff || false,
      is_active: user.is_active !== undefined ? user.is_active : true
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      await adminApi.updateUser(selectedUser.id, formData);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'User updated successfully.'
      });
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to update user.'
      });
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await adminApi.deleteUser(userId);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'User deleted successfully.'
      });
      fetchUsers();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to delete user.'
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading variant="spinner" size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
        <p className="mt-1 text-slate-600">Manage user accounts and permissions</p>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 pl-10 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </Card>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <FontAwesomeIcon icon={faUsers} className="text-4xl text-slate-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900">No Users Found</h3>
          <p className="text-slate-600">
            {searchQuery ? "No users match your search." : "No users in the system."}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <span className="text-sm font-semibold">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faEnvelope} className="text-slate-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {user.is_staff ? (
                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                          Admin
                        </span>
                      ) : (
                        <span className="text-slate-500">User</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {formatDate(user.date_joined)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          icon={<FontAwesomeIcon icon={faEdit} />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          icon={<FontAwesomeIcon icon={faTrash} />}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
        }}
        title="Edit User"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_staff"
                checked={formData.is_staff}
                onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="is_staff" className="text-sm font-medium text-slate-700">
                Admin/Staff User
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                Active Account
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              icon={<FontAwesomeIcon icon={faCheckCircle} />}
            >
              Update User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;

