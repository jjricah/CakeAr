import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/creake_logo.png';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Connect to the backend endpoint
      await api.post('/auth/forgot-password', { email });
      
      setStatus({ 
        type: 'success', 
        message: 'If an account exists with this email, you will receive a password reset link shortly.' 
      });
    } catch (error) {
      // Use the backend's error message if available, otherwise a generic one
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to send reset link. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#F3EFE0] text-[#4A403A] px-4 py-8 relative overflow-hidden">
       {/* Background Elements */}
       <div className="absolute top-10 right-10 w-32 h-32 bg-[#C59D5F] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>
       <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#8B5E3C] rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>

      <div className="bg-white rounded-[2rem] border border-[#E6DCCF] shadow-xl p-6 md:p-8 w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="CREAKE Logo" className="h-16 w-auto object-contain mb-4" />
          <h2 className="text-2xl font-bold text-[#4A403A]">Reset Password</h2>
          <p className="text-sm text-[#B0A69D] text-center mt-2">Enter your email to receive reset instructions.</p>
        </div>

        {status.message && (
          <div className={`px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 border ${
            status.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-[#FFF8F0] border-[#E6DCCF] text-red-600'
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[#8B5E3C] text-sm font-bold mb-2 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="hello@creake.app"
              className="w-full px-5 py-3.5 bg-[#F9F7F2] border border-transparent rounded-xl text-base text-[#4A403A] placeholder-[#B0A69D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59D5F]/50 focus:border-[#C59D5F] transition-all duration-200"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#C59D5F] text-white font-bold py-3.5 rounded-xl hover:bg-[#B0894F] hover:shadow-lg hover:shadow-[#C59D5F]/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Sending...' : 'Send Reset Link'} 
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-[#8B5E3C] text-sm font-bold hover:text-[#C59D5F] transition flex items-center justify-center gap-2">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;