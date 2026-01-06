import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import AdminProductManagement from './pages/AdminProductManagement';
import AdminOrderManagement from './pages/AdminOrderManagement';
import AdminAssetManagement from './pages/AdminAssetManagement';
import AdminReports from './pages/AdminReports';
import Dashboard from './pages/Dashboard';
import CakeBuilder from './pages/CakeBuilder';
import BecomeSeller from './pages/BecomeSeller';
import MyOrders from './pages/MyOrders';
import SellerDashboard from './pages/SellerDashboard';
import ProductDetails from './pages/ProductDetails';
import ShopProfile from './pages/ShopProfile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import NotificationsPage from './pages/NotificationsPage';
import Settings from './pages/Settings';
import PrivateRoute from './components/PrivateRoute';
import ChatPage from './pages/ChatPage';
import AdminLayout from './components/admin/AdminLayout';
import MainLayoutRoute from './components/MainLayoutRoute';

function App() {
  // --- THEME INITIALIZATION LOGIC ---
  useEffect(() => {
    // 1. Check if a theme is already saved in localStorage
    const storedTheme = localStorage.getItem('theme');

    // 2. If 'dark' is explicitly saved, turn on dark mode
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // 3. Otherwise (if 'light' or null/undefined), FORCE Light Mode
      document.documentElement.classList.remove('dark');

      // 4. If nothing was stored, explicitly save 'light' so Settings knows
      if (!storedTheme) {
        localStorage.setItem('theme', 'light');
      }
    }
  }, []);
  // ----------------------------------

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="App min-h-screen">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />

              <Route
                path="/admin-dashboard"
                element={
                  <PrivateRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute>
                    <AdminLayout>
                      <UserManagement />
                    </AdminLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <PrivateRoute>
                    <AdminLayout>
                      <AdminProductManagement />
                    </AdminLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <PrivateRoute>
                    <AdminLayout>
                      <AdminOrderManagement />
                    </AdminLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/assets"
                element={
                  <PrivateRoute>
                    <AdminLayout>
                      <AdminAssetManagement />
                    </AdminLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <PrivateRoute>
                    <AdminLayout>
                      <AdminReports />
                    </AdminLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <MainLayoutRoute showTabs={true} fullWidth={true}>
                    <Dashboard />
                  </MainLayoutRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <PrivateRoute>
                    <ChatPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/cake-builder"
                element={
                  <PrivateRoute>
                    <CakeBuilder />
                  </PrivateRoute>
                }
              />

              {/* NEW: Seller Read-Only Design Viewer Route */}
              <Route
                path="/seller-design-viewer"
                element={
                  <PrivateRoute>
                    <CakeBuilder />
                  </PrivateRoute>
                }
              />

              <Route
                path="/become-seller"
                element={
                  <PrivateRoute>
                    <BecomeSeller />
                  </PrivateRoute>
                }
              />

              <Route
                path="/my-orders"
                element={
                  <PrivateRoute>
                    <MainLayoutRoute showNav={false} fullWidth={true}>
                      <MyOrders />
                    </MainLayoutRoute>
                  </PrivateRoute>
                }
              />

              {/* Redirect legacy /my-cakes route to /my-orders to prevent errors */}
              <Route path="/my-cakes" element={<Navigate to="/my-orders" replace />} />

              <Route
                path="/seller-dashboard"
                element={
                  <PrivateRoute>
                    <SellerDashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/product/:id"
                element={
                  <MainLayoutRoute>
                    <ProductDetails />
                  </MainLayoutRoute>
                }
              />

              <Route
                path="/shop/:bakerId"
                element={
                  <MainLayoutRoute>
                    <ShopProfile />
                  </MainLayoutRoute>
                }
              />

              <Route
                path="/cart"
                element={
                  <PrivateRoute>
                    <MainLayoutRoute fullWidth={true}>
                      <Cart />
                    </MainLayoutRoute>
                  </PrivateRoute>
                }
              />

              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <MainLayoutRoute fullWidth={true}>
                      <Checkout />
                    </MainLayoutRoute>
                  </PrivateRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <NotificationsPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <MainLayoutRoute showNav={false} fullWidth={true}>
                      <Settings />
                    </MainLayoutRoute>
                  </PrivateRoute>
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;