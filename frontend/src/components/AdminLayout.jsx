import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/orders', label: 'Orders', icon: '📦' },
    { path: '/admin/products', label: 'Products', icon: '🎂' },
    { path: '/admin/categories', label: 'Categories', icon: '📁' },
    { path: '/admin/customers', label: 'Customers', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-purple-900 to-purple-700 text-white fixed h-screen">
        <div className="p-6 border-b border-purple-600">
          <h1 className="text-2xl font-bold">🎂 Cake AR</h1>
          <p className="text-purple-200 text-sm mt-1">Admin Panel</p>
        </div>
        
        <nav className="p-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition flex items-center gap-3 ${
                isActive(item.path)
                  ? 'bg-white text-purple-900 font-semibold'
                  : 'text-purple-100 hover:bg-purple-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-purple-600">
          <div className="mb-3 px-2">
            <p className="text-purple-200 text-sm">Logged in as</p>
            <p className="text-white font-semibold truncate">{user?.name}</p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="w-full mb-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition text-sm"
          >
            🛍️ View Store
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
