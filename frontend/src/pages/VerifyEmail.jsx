import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CheckCircleIcon, XCircleIcon } from '../components/Icons';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    const verify = async () => {
      try {
        await api.put(`/auth/verify-email/${token}`);
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('error');
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#F3EFE0] dark:bg-[#1E1A17] text-[#4A403A] dark:text-[#F3EFE0]">
      <div className="bg-white dark:bg-[#2C2622] p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-[#E6DCCF] dark:border-[#4A403A]">
        {status === 'verifying' && (
            <>
                <div className="animate-spin w-12 h-12 border-4 border-[#C59D5F] border-t-transparent rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-bold">Verifying Email...</h2>
            </>
        )}
        {status === 'success' && (
            <>
                <div className="text-green-500 w-16 h-16 mx-auto mb-4"><CheckCircleIcon className="w-full h-full" /></div>
                <h2 className="text-2xl font-bold mb-2">Verified!</h2>
                <p className="text-sm opacity-70">Redirecting to login...</p>
            </>
        )}
        {status === 'error' && (
            <>
                <div className="text-red-500 w-16 h-16 mx-auto mb-4"><XCircleIcon className="w-full h-full" /></div>
                <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
                <p className="text-sm opacity-70 mb-4">Invalid or expired token.</p>
                <button onClick={() => navigate('/login')} className="bg-[#C59D5F] text-white px-6 py-2 rounded-xl font-bold">Go to Login</button>
            </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;