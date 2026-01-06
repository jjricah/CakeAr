import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const OrderTracking = () => {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const { data } = await api.get(`/orders/track/${orderNumber}`);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-indigo-100 text-indigo-800',
      'out-for-delivery': 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusSteps = () => {
    const steps = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered'];
    const currentIndex = steps.indexOf(order?.status);
    return steps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600 cursor-pointer" onClick={() => navigate('/')}>
            Cake AR
          </h1>
          <button
            onClick={() => navigate('/shop')}
            className="text-gray-700 hover:text-purple-600 font-medium"
          >
            Shop
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Track Your Order</h1>

        {/* Tracking Form */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <form onSubmit={handleTrack}>
            <label className="block text-gray-700 font-semibold mb-3">Enter Order Number</label>
            <div className="flex gap-4">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., ORD1234567890-1"
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Tracking...' : 'Track'}
              </button>
            </div>
            {error && <p className="mt-3 text-red-600">{error}</p>}
          </form>
        </div>

        {/* Order Status */}
        {order && (
          <>
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Order #{order.orderNumber}</h2>
                <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                <span className={`inline-block mt-4 px-6 py-2 rounded-full font-semibold capitalize ${getStatusColor(order.status)}`}>
                  {order.status.replace('-', ' ')}
                </span>
              </div>

              {/* Status Timeline */}
              <div className="flex items-center justify-between mb-8">
                {getStatusSteps().map((step, index) => (
                  <div key={step.name} className="flex-1 flex flex-col items-center relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold z-10 ${
                        step.completed ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step.completed ? '✓' : index + 1}
                    </div>
                    <p className={`mt-2 text-xs font-medium capitalize text-center ${step.completed ? 'text-purple-600' : 'text-gray-500'}`}>
                      {step.name.replace('-', ' ')}
                    </p>
                    {index < getStatusSteps().length - 1 && (
                      <div
                        className={`absolute top-6 left-1/2 w-full h-1 ${
                          step.completed ? 'bg-purple-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Payment Status</h3>
                  <p className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                    {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : 'Not Paid'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Delivery Status</h3>
                  <p className={`font-semibold ${order.isDelivered ? 'text-green-600' : 'text-orange-600'}`}>
                    {order.isDelivered
                      ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}`
                      : 'Not Delivered Yet'}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Delivery Address</h3>
              <div className="text-gray-700">
                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Order Items</h3>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-3xl">🎂</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
