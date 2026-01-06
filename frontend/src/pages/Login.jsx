import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/creake_logo.png';
import { Eye, EyeOff } from '../components/Icons';

// --- BACKGROUND DECORATION ICON ---
const CakePattern = () => (
  <svg className="absolute w-64 h-64 md:w-96 md:h-96 text-[#C59D5F] opacity-10 -top-10 -left-10 transform -rotate-12 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3a3 3 0 00-3 3v2h6V6a3 3 0 00-3-3z"/><path d="M5 10a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2H5z"/>
  </svg>
);

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password } = formData;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Authenticate and capture the user data (which includes the role)
      const user = await login(email, password);
      
      // 2. Determine the intended destination
      const from = location.state?.from?.pathname || null;

      // 3. Determine the correct default dashboard based on user role
      let defaultRedirectPath = '/dashboard'; // Default for 'buyer'
      if (user.role === 'admin') {
        defaultRedirectPath = '/admin-dashboard';
      } else if (user.role === 'seller') {
        defaultRedirectPath = '/seller-dashboard';
      }

      // 4. Decide where to navigate
      // If the user is NOT an admin but was trying to access an admin page,
      // ignore the 'from' location and send them to their correct dashboard.
      if (user.role !== 'admin' && from && from.startsWith('/admin')) {
        navigate(defaultRedirectPath, { replace: true });
      } else {
        // Otherwise, navigate to the page they were trying to access,
        // or fall back to their default dashboard.
        navigate(from || defaultRedirectPath, { replace: true });
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Changed min-h-screen to min-h-[100dvh] for mobile browsers
    // Changed overflow-hidden to overflow-y-auto so keyboard doesn't hide inputs
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#F3EFE0] text-[#4A403A] relative overflow-y-auto px-4 py-8">
      
      {/* Decorative Background Elements */}
      <CakePattern />
      <div className="absolute top-10 right-10 w-32 h-32 bg-[#C59D5F] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#8B5E3C] rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>

      {/* LOGIN CARD */}
      <div className="bg-white rounded-[2rem] border border-[#E6DCCF] shadow-xl p-6 md:p-8 w-full max-w-md relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-6 md:mb-8">
          <img src={logo} alt="CREAKE Logo" className="h-20 md:h-24 w-auto object-contain drop-shadow-sm" />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#FFF8F0] border border-[#E6DCCF] text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-[#8B5E3C] text-sm font-bold mb-2 ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              placeholder="hello@creake.app"
              // text-base prevents iOS zoom on focus
              className="w-full px-5 py-3.5 bg-[#F9F7F2] border border-transparent rounded-xl text-base text-[#4A403A] placeholder-[#B0A69D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59D5F]/50 focus:border-[#C59D5F] transition-all duration-200"
            />
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-[#8B5E3C] text-sm font-bold">Password</label>
              <Link to="/forgot-password" className="text-xs text-[#C59D5F] hover:text-[#8B5E3C] font-bold transition">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-[#F9F7F2] border border-transparent rounded-xl text-base text-[#4A403A] placeholder-[#B0A69D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59D5F]/50 focus:border-[#C59D5F] transition-all duration-200 pr-12"
              />
              <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#B0A69D] hover:text-[#8B5E3C] focus:outline-none"
              >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C59D5F] text-white font-bold py-3.5 rounded-xl hover:bg-[#B0894F] hover:shadow-lg hover:shadow-[#C59D5F]/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Logging in...' : 'Log In'} 
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[#8B5E3C] text-sm">
            New to Creake?{' '}
            <Link to="/register" className="text-[#C59D5F] font-bold hover:underline decoration-2 underline-offset-2">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;