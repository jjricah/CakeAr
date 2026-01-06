import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/admin/orders/${id}`);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Order not found');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Change order status to "${newStatus}"?`)) return;

    setStatusUpdating(true);
    try {
      await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handlePaymentStatusChange = async () => {
    const newStatus = !order.isPaid;
    if (!window.confirm(`Mark this order as ${newStatus ? 'PAID' : 'UNPAID'}?`)) return;

    try {
      await api.put(`/admin/orders/${id}/payment`, { isPaid: newStatus });
      setOrder({ ...order, isPaid: newStatus, paidAt: newStatus ? new Date() : null });
      alert('Payment status updated successfully!');
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      preparing: 'bg-purple-100 text-purple-800 border-purple-300',
      ready: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'out-for-delivery': 'bg-orange-100 text-orange-800 border-orange-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
          >
            ← Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-3xl">🎂</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    {item.customization && (
                      <div className="mt-1 text-sm text-gray-600">
                        <p>Size: {item.customization.size}</p>
                        <p>Flavor: {item.customization.flavor}</p>
                        {item.customization.message && <p>Message: "{item.customization.message}"</p>}
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                      <span className="font-bold text-purple-600">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Address</h2>
            <div className="text-gray-700">
              <p className="font-semibold">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p className="mt-2">
                <span className="font-medium">Phone:</span> {order.shippingAddress.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          {/* Order Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-bold text-gray-800">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-medium text-gray-800">
                  {new Date(order.createdAt).toLocaleDateString()}
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium text-gray-800">{order.user?.name}</p>
                <p className="text-sm text-gray-500">{order.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Status Management</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Order Status</label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusUpdating}
                  className={`w-full px-4 py-2 rounded-lg font-semibold capitalize cursor-pointer border-2 ${getStatusColor(order.status)} disabled:opacity-50`}
                >
                  {statuses.map(status => (
                    <option key={status} value={status} className="capitalize">{status.replace('-', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Status</label>
                <div className="flex items-center justify-between">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                  {order.paymentMethod === 'cash' && (
                    <button
                      onClick={handlePaymentStatusChange}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        order.isPaid
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {order.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 capitalize">Method: {order.paymentMethod || 'N/A'}</p>
              </div>

              {order.isDelivered && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Delivered At</p>
                  <p className="font-medium text-green-600">
                    {new Date(order.deliveredAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Price Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax (12%):</span>
                <span>{formatCurrency(order.taxPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping:</span>
                <span>{formatCurrency(order.shippingPrice)}</span>
              </div>
              <div className="pt-2 border-t border-gray-300">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total:</span>
                  <span className="text-purple-600">{formatCurrency(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
