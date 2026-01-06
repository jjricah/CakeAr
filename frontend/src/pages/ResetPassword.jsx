import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/creake_logo.png';
import { CheckCircleIcon, Eye, EyeOff } from '../components/Icons';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 6) {
        setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
        return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.put(`/auth/reset-password/${token}`, { password: formData.password });
      
      setStatus({ 
        type: 'success', 
        message: 'Password reset successful! Redirecting to login...' 
      });
      
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to reset password. The link may be expired.' 
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
          <h2 className="text-2xl font-bold text-[#4A403A]">Set New Password</h2>
          <p className="text-sm text-[#B0A69D] text-center mt-2">Enter your new password below.</p>
        </div>

        {status.message && (
          <div className={`px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 border ${
            status.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-[#FFF8F0] border-[#E6DCCF] text-red-600'
          }`}>
            {status.type === 'success' && <CheckCircleIcon className="w-5 h-5" />}
            {status.message}
          </div>
        )}

        {status.type !== 'success' && (
            <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-[#8B5E3C] text-sm font-bold mb-2 ml-1">New Password</label>
                <div className="relative">
                    <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
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
            <div>
                <label className="block text-[#8B5E3C] text-sm font-bold mb-2 ml-1">Confirm Password</label>
                <div className="relative">
                    <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 bg-[#F9F7F2] border border-transparent rounded-xl text-base text-[#4A403A] placeholder-[#B0A69D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59D5F]/50 focus:border-[#C59D5F] transition-all duration-200 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#B0A69D] hover:text-[#8B5E3C] focus:outline-none"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#C59D5F] text-white font-bold py-3.5 rounded-xl hover:bg-[#B0894F] hover:shadow-lg hover:shadow-[#C59D5F]/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? 'Resetting...' : 'Reset Password'} 
            </button>
            </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-[#8B5E3C] text-sm font-bold hover:text-[#C59D5F] transition flex items-center justify-center gap-2">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;