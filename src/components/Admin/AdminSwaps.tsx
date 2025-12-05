import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExchangeAlt,
  faCheckCircle,
  faTimesCircle,
  faEye,
  faEnvelope,
  faDollarSign,
  faSearch,
  faFilter,
  faSpinner,
  faBox
} from '@fortawesome/free-solid-svg-icons';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import Loading from '../UI/Loading/Loading';
import Modal from '../UI/Modal/Modal';
import { adminApi, AdminSwapRequest } from '../../services/adminApi';
import { useToast } from '../UI/Toast/ToastProvider';
import { formatCurrency, formatDate } from '../../services/cartApi';
import { API_PATH } from '../../backend_url';

const AdminSwaps: React.FC = () => {
  const { showToast } = useToast();
  const [swaps, setSwaps] = useState<AdminSwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSwap, setSelectedSwap] = useState<AdminSwapRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [finalValue, setFinalValue] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSwaps();
  }, [statusFilter]);

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      console.log('🔄 Fetching swaps with params:', params);
      const response = await adminApi.getAllSwaps(params);
      console.log('📥 Swaps response:', response);
      // Handle both paginated and non-paginated responses
      const swapsList = Array.isArray(response) ? response : (response.results || response.data || []);
      console.log('✅ Swaps list:', swapsList);
      setSwaps(swapsList);
    } catch (error: any) {
      console.error('❌ Error fetching swaps:', error);
      console.error('❌ Error response:', error.response?.data);
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to load swap requests.'
      });
      setSwaps([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleViewSwap = (swap: AdminSwapRequest) => {
    setSelectedSwap(swap);
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedSwap || !finalValue) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please enter a final device value.'
      });
      return;
    }

    setProcessing(true);
    try {
      await adminApi.approveSwap(selectedSwap.id, parseFloat(finalValue), adminNotes);
      showToast({
        type: 'success',
        title: 'Swap Approved',
        message: `Swap approved. User will be notified via email with final value: ${formatCurrency(parseFloat(finalValue))}.`
      });
      setShowApproveModal(false);
      setShowModal(false);
      setFinalValue('');
      setAdminNotes('');
      fetchSwaps();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to approve swap.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSwap || !rejectReason.trim()) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please provide a reason for rejection.'
      });
      return;
    }

    setProcessing(true);
    try {
      await adminApi.rejectSwap(selectedSwap.id, rejectReason);
      showToast({
        type: 'success',
        title: 'Swap Rejected',
        message: 'Swap rejected. User will be notified via email.'
      });
      setShowRejectModal(false);
      setShowModal(false);
      setRejectReason('');
      fetchSwaps();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to reject swap.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const filteredSwaps = swaps.filter(swap => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        swap.user_email?.toLowerCase().includes(query) ||
        swap.target_device_name?.toLowerCase().includes(query) ||
        String(swap.id).includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading variant="spinner" size="lg" text="Loading swap requests..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Swap Requests</h2>
          <p className="mt-1 text-slate-600">Verify and approve swap requests from users</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSwaps}
          icon={<FontAwesomeIcon icon={faSpinner} />}
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by email, device, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 pl-10 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Swaps List */}
      {filteredSwaps.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <FontAwesomeIcon icon={faExchangeAlt} className="text-4xl text-slate-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900">No Swap Requests Found</h3>
          <p className="text-slate-600">
            {searchQuery || statusFilter !== 'all' 
              ? "No swaps match your current filters." 
              : "No swap requests have been submitted yet."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSwaps.map((swap) => (
            <Card key={swap.id} className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">Swap Request #{swap.id}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(swap.status)}`}>
                      {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faEnvelope} className="text-slate-400" />
                      <span>{swap.user_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faExchangeAlt} className="text-slate-400" />
                      <span>{swap.user_device?.brand} {swap.user_device?.model}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faDollarSign} className="text-slate-400" />
                      <span>Est. Value: {formatCurrency(swap.estimated_value)}</span>
                      {swap.final_value && (
                        <span className="ml-2 font-semibold text-green-600">
                          Final: {formatCurrency(swap.final_value)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faBox} className="text-slate-400" />
                      <span>Target: {swap.target_device_name}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-slate-500">
                    Submitted: {formatDate(swap.created_at)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewSwap(swap)}
                    icon={<FontAwesomeIcon icon={faEye} />}
                  >
                    View Details
                  </Button>
                  
                  {swap.status === 'pending' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedSwap(swap);
                          setShowApproveModal(true);
                        }}
                        icon={<FontAwesomeIcon icon={faCheckCircle} />}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedSwap(swap);
                          setShowRejectModal(true);
                        }}
                        icon={<FontAwesomeIcon icon={faTimesCircle} />}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Swap Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedSwap(null);
        }}
        title={`Swap Request #${selectedSwap?.id}`}
        size="lg"
      >
        {selectedSwap && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600">Status</p>
                <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(selectedSwap.status)}`}>
                  {selectedSwap.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">User Email</p>
                <p className="text-slate-900">{selectedSwap.user_email}</p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-slate-900">User Device Details</h4>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Category:</strong> {selectedSwap.user_device?.category}</div>
                  <div><strong>Brand:</strong> {selectedSwap.user_device?.brand}</div>
                  <div><strong>Model:</strong> {selectedSwap.user_device?.model}</div>
                  <div><strong>Storage:</strong> {selectedSwap.user_device?.storage}</div>
                  <div><strong>RAM:</strong> {selectedSwap.user_device?.ram}</div>
                  <div><strong>Condition:</strong> {selectedSwap.user_device?.condition}</div>
                  <div><strong>Battery:</strong> {selectedSwap.user_device?.batteryHealth}%</div>
                  <div><strong>Issues:</strong> {selectedSwap.user_device?.issues?.join(', ') || 'None'}</div>
                </div>
                
                {selectedSwap.user_device?.images && selectedSwap.user_device.images.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-slate-700">Device Images:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedSwap.user_device.images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={getImageUrl(img)}
                          alt={`Device ${idx + 1}`}
                          className="h-24 w-full rounded-lg border border-slate-200 object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-slate-900">Pricing</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Estimated Value:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(selectedSwap.estimated_value)}</span>
                </div>
                {selectedSwap.final_value && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Final Value:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(selectedSwap.final_value)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Target Device Price:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(selectedSwap.target_device_price)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="font-semibold text-slate-900">Difference:</span>
                  <span className={`font-bold ${selectedSwap.difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(selectedSwap.difference)}
                  </span>
                </div>
              </div>
            </div>

            {selectedSwap.admin_notes && (
              <div>
                <h4 className="mb-2 font-semibold text-slate-900">Admin Notes</h4>
                <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  {selectedSwap.admin_notes}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setSelectedSwap(null);
                }}
              >
                Close
              </Button>
              {selectedSwap.status === 'pending' && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowModal(false);
                      setShowApproveModal(true);
                    }}
                    icon={<FontAwesomeIcon icon={faCheckCircle} />}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setShowModal(false);
                      setShowRejectModal(true);
                    }}
                    icon={<FontAwesomeIcon icon={faTimesCircle} />}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setFinalValue('');
          setAdminNotes('');
        }}
        title="Approve Swap Request"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Final Device Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={finalValue}
              onChange={(e) => setFinalValue(e.target.value)}
              placeholder="Enter final value after inspection"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              This value will be sent to the user via email. Estimated value: {selectedSwap && formatCurrency(selectedSwap.estimated_value)}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Admin Notes (Optional)</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes about the approval..."
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveModal(false);
                setFinalValue('');
                setAdminNotes('');
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={processing || !finalValue}
              icon={processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} />}
            >
              {processing ? 'Approving...' : 'Approve & Send Email'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        title="Reject Swap Request"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this swap request is being rejected..."
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              This reason will be sent to the user via email.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={processing || !rejectReason.trim()}
              icon={processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faTimesCircle} />}
            >
              {processing ? 'Rejecting...' : 'Reject & Send Email'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSwaps;

