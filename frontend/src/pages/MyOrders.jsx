import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/myorders');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600 cursor-pointer" onClick={() => navigate('/dashboard')}>
            Cake AR
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/shop')}
              className="text-gray-700 hover:text-purple-600 font-medium"
            >
              Shop
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-700 hover:text-purple-600 font-medium"
            >
              Custom Cakes
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-xl text-gray-600 mb-6">You haven't placed any orders yet</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Order #{order.orderNumber}</h3>
                    <p className="text-gray-600 text-sm">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full font-semibold text-sm capitalize ${getStatusColor(order.status)}`}>
                    {order.status.replace('-', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Total Amount</p>
                    <p className="text-xl font-bold text-purple-600">{formatCurrency(order.totalPrice)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Items</p>
                    <p className="font-semibold text-gray-800">{order.orderItems.length} item(s)</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Payment Status</p>
                    <p className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto">
                  {order.orderItems.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0"
                    >
                      <span className="text-2xl">🎂</span>
                    </div>
                  ))}
                  {order.orderItems.length > 5 && (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 text-sm">+{order.orderItems.length - 5}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
