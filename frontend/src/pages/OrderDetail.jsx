import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Order not found');
      navigate('/my-orders');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600 cursor-pointer" onClick={() => navigate('/dashboard')}>
            Cake AR
          </h1>
          <button
            onClick={() => navigate('/my-orders')}
            className="text-gray-700 hover:text-purple-600 font-medium"
          >
            ← My Orders
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Details</h1>
          <p className="text-gray-600">Order Number: <span className="font-semibold">{order.orderNumber}</span></p>
          <p className="text-gray-600">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Order Status</h2>
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
                <p className={`mt-2 text-sm font-medium capitalize ${step.completed ? 'text-purple-600' : 'text-gray-500'}`}>
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
          <div className="text-center">
            <span className={`inline-block px-6 py-2 rounded-full font-semibold capitalize ${getStatusColor(order.status)}`}>
              {order.status.replace('-', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Items</h2>
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
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                      <p className="text-purple-600 font-semibold">{formatCurrency(item.price)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
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
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.itemsPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.shippingPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (12% VAT)</span>
                  <span>{formatCurrency(order.taxPrice)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold text-gray-800 mb-2">Payment Method</h3>
                <p className="text-gray-600 capitalize">{order.paymentMethod}</p>
                <p className={`mt-2 font-semibold ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
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
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
