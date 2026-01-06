import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Cake AR</h1>
          <button
            onClick={handleLogout}
            className="bg-white text-purple-600 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transform hover:-translate-y-0.5 transition duration-200"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome, {user?.name}!</h2>
        <p className="text-gray-600 mb-8">Email: {user?.email}</p>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => navigate('/shop')}
            className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-200"
          >
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold mb-2">Shop Cakes</h3>
            <p className="text-purple-100">Browse our catalog</p>
          </button>

          <button
            onClick={() => navigate('/cake-builder')}
            className="bg-gradient-to-br from-pink-500 to-rose-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-200"
          >
            <div className="text-5xl mb-4">🎂</div>
            <h3 className="text-xl font-bold mb-2">Create Custom Cake</h3>
            <p className="text-pink-100">Design your AR cake</p>
          </button>

          <button
            onClick={() => navigate('/my-orders')}
            className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-200"
          >
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2">My Orders</h3>
            <p className="text-cyan-100">Track your orders</p>
          </button>

          <button
            onClick={() => navigate('/track-order')}
            className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-200"
          >
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-xl font-bold mb-2">Track Order</h3>
            <p className="text-orange-100">Track by order number</p>
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Getting Started</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Welcome to Cake AR! Start creating beautiful 3D cake designs with our interactive builder.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Choose cake size (small, medium, or large)</li>
            <li>Add multiple layers with different flavors</li>
            <li>Select frosting type and color</li>
            <li>Decorate with toppings like cherries, sprinkles, candles, and flowers</li>
            <li>Save your designs for later</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
