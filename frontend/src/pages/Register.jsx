import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/creake_logo.png';
import { CheckCircleIcon, Eye, EyeOff } from '../components/Icons';

// --- BACKGROUND DECORATION ICON ---
const CakePattern = () => (
  <svg className="absolute w-64 h-64 md:w-96 md:h-96 text-[#C59D5F] opacity-10 -top-10 -left-10 transform -rotate-12 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3a3 3 0 00-3 3v2h6V6a3 3 0 00-3-3z"/><path d="M5 10a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2H5z"/>
  </svg>
);

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const response = await register(name, email, password);
      setSuccessMessage(response.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Replaced min-h-screen with min-h-[100dvh] and added overflow-y-auto for safe scrolling
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#F3EFE0] text-[#4A403A] relative overflow-y-auto px-4 py-8">
      
      <CakePattern />
      <div className="absolute top-10 right-10 w-32 h-32 bg-[#C59D5F] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#8B5E3C] rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>

      <div className="bg-white rounded-[2rem] border border-[#E6DCCF] shadow-xl p-6 md:p-8 w-full max-w-md relative z-10">
        
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="CREAKE Logo" className="h-20 md:h-24 w-auto object-contain drop-shadow-sm" />
        </div>

        {successMessage ? (
          <div className="text-center animate-fade-in">
            <div className="text-green-500 w-16 h-16 mx-auto mb-4"><CheckCircleIcon className="w-full h-full" /></div>
            <h3 className="text-xl font-bold text-[#4A403A]">Registration Successful!</h3>
            <p className="text-sm text-[#B0A69D] my-4">{successMessage}</p>
            <button onClick={() => navigate('/login')} className="w-full bg-[#C59D5F] text-white font-bold py-3.5 rounded-xl hover:bg-[#B0894F] transition-all">
              Proceed to Login
            </button>
          </div>
        ) : (
        <>
        {error && (
          <div className="bg-[#FFF8F0] border border-[#E6DCCF] text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#8B5E3C] text-sm font-bold mb-2 ml-1">Full Name</label>
            <input type="text" name="name" value={name} onChange={handleChange} required placeholder="Baker Doe"
              className="w-full px-5 py-3.5 bg-[#F9F7F2] border border-transparent rounded-xl text-base text-[#4A403A] placeholder-[#B0A69D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59D5F]/50 focus:border-[#C59D5F] transition-all" />
          </div>

          <div>
            <label className="block text-[#8B5E3C] text-sm font-bold mb-2 ml-1">Email Address</label>
            <input type="email" name="email" value={email} onChange={handleChange} required placeholder="hello@creake.app"
              className="w-full px-5 py-3.5 bg-[#F9F7F2] border border-transparent rounded-xl text-base text-[#4A403A] placeholder-[#B0A69D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59D5F]/50 focus:border-[#C59D5F] transition-all" />
          </div>

          <div>
            <label className="block text-[#8B5E3C] text-sm font-bold mb-2 ml-1">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={password} onChange={handleChange} required placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-[#F9F7F2] border border-transparent rounded-xl text-base text-[#4A403A] placeholder-[#B0A69D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59D5F]/50 focus:border-[#C59D5F] transition-all pr-12" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#B0A69D] hover:text-[#8B5E3C] focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#8B5E3C] text-sm font-bold mb-2 ml-1">Confirm Password</label>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={confirmPassword} onChange={handleChange} required placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-[#F9F7F2] border border-transparent rounded-xl text-base text-[#4A403A] placeholder-[#B0A69D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59D5F]/50 focus:border-[#C59D5F] transition-all pr-12" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#B0A69D] hover:text-[#8B5E3C] focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#C59D5F] text-white font-bold py-3.5 rounded-xl hover:bg-[#B0894F] hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 mt-6">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[#8B5E3C] text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#C59D5F] font-bold hover:underline decoration-2 underline-offset-2">Log in here</Link>
          </p>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default Register;