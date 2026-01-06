import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { CameraIcon, Back } from '../components/Icons'; 

// Helper to convert file to Base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useContext(AuthContext); 
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    shopName: '', shopDescription: '', specialties: [],
    street: '', barangay: '', city: '', 
    gcashName: '', gcashNumber: '',
    shopLogo: null, // This will hold the file object
    agreedToTerms: false 
  });

  const specialtyOptions = ['Birthday Cakes', 'Wedding Cakes', 'Bento Cakes', 'Themed Cakes'];

  useEffect(() => {
    const checkShop = async () => {
      try {
        await api.get('/shop/me');
        navigate('/seller-dashboard');
      } catch (error) { 
        // 404 means no shop, so stay.
      }
    };
    if (user) checkShop();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const toggleSpecialty = (option) => {
    setFormData(prev => ({
      ...prev, specialties: prev.specialties.includes(option) ? prev.specialties.filter(i => i !== option) : [...prev.specialties, option]
    }));
  };

  const handleSelectAll = () => {
    if (formData.specialties.length === specialtyOptions.length) setFormData({ ...formData, specialties: [] });
    else setFormData({ ...formData, specialties: [...specialtyOptions] });
  };
  
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, shopLogo: file || null });
  }

  const validateCurrentStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.shopName.trim()) return 'Shop Name is required.';
      if (!formData.shopDescription.trim()) return 'Shop Bio is required.';
      if (formData.specialties.length === 0) return 'Please select at least one Specialty.';
    } else if (currentStep === 2) {
      if (!formData.street.trim() || !formData.barangay.trim() || !formData.city.trim()) return 'All address fields are required.';
    } else if (currentStep === 3) {
        if (!formData.gcashName.trim() || !formData.gcashNumber.trim()) return 'GCash Account Name and Number are required for payouts.';
        if (!formData.agreedToTerms) return 'You must agree to the Terms and Conditions.';
    }
    return null;
  };

  const handleNext = () => {
    const validationError = validateCurrentStep(step);
    if (validationError) {
      setError(validationError);
    } else {
      setError('');
      setStep(s => s + 1);
    }
  };

  const handleSubmit = async () => {
    const validationError = validateCurrentStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError('');

    try {
      let logoBase64 = null;
      if (formData.shopLogo) {
        logoBase64 = await convertToBase64(formData.shopLogo);
      }

      const payload = {
        shopName: formData.shopName.trim(),
        shopDescription: formData.shopDescription,
        specialties: formData.specialties,
        address: { 
            street: formData.street, 
            barangay: formData.barangay, 
            city: formData.city 
        },
        payoutInfo: { 
            accountName: formData.gcashName, 
            accountNumber: formData.gcashNumber, 
            provider: 'GCash' 
        },
        shopLogo: logoBase64 // Send as Base64 string or null
      };

      const response = await api.post('/shop/register', payload); // Send JSON payload
      
      if (updateUser) updateUser({ 
        ...user, 
        role: 'seller', 
        shopName: response.data.shop.shopName 
      });
      navigate('/seller-dashboard'); 
    } catch (error) { 
        setError(error.response?.data?.message || 'Failed to register shop.'); 
    } 
    finally { setLoading(false); }
  };

  // --- RENDER STEPS ---
  const renderStep1_Profile = () => (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-xl font-bold text-[#4A403A] dark:text-[#F3EFE0]">Step 1: Shop Profile & Identity</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 bg-[#E6DCCF] dark:bg-[#2C2622] rounded-full flex items-center justify-center cursor-pointer overflow-hidden group">
          {formData.shopLogo ? (
            <img src={URL.createObjectURL(formData.shopLogo)} alt="Shop Logo" className="w-full h-full object-cover" />
          ) : (
            <CameraIcon className="w-8 h-8 text-[#8B5E3C] dark:text-[#C59D5F]" />
          )}
          <label htmlFor="shopLogoUpload" className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold cursor-pointer">
            Upload
          </label>
          <input id="shopLogoUpload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
        </div>
        <div className='flex-1'>
            <label className="text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase">Shop Logo</label>
            {formData.shopLogo ? 
              <p className="text-sm text-green-600 dark:text-green-400">Logo selected: {formData.shopLogo.name}</p> :
              <p className="text-sm text-[#B0A69D] dark:text-[#E6DCCF]">This will be your primary profile image.</p>
            }
        </div>
      </div>
      
      <div>
        <label className="text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase">Shop Name <span className="text-red-500">*</span></label>
        <input name="shopName" value={formData.shopName} onChange={handleChange} className="w-full p-3 bg-[#F9F7F2] dark:bg-[#2C2622] dark:text-[#F3EFE0] rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#C59D5F]" placeholder="e.g. Momma's Oven" />
      </div>
      <div>
        <label className="text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase">Short Bio <span className="text-red-500">*</span></label>
        <textarea name="shopDescription" value={formData.shopDescription} onChange={handleChange} className="w-full p-3 bg-[#F9F7F2] dark:bg-[#2C2622] dark:text-[#F3EFE0] rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#C59D5F]" rows="3" placeholder="Tell us about your baking journey and what makes your cakes special..." />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase">Specialties <span className="text-red-500">*</span></label>
            <button type="button" onClick={handleSelectAll} className="text-xs font-bold text-[#C59D5F] hover:underline">
                {formData.specialties.length === specialtyOptions.length ? 'Deselect All' : 'Select All'}
            </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {specialtyOptions.map(opt => (
            <button type="button" key={opt} onClick={() => toggleSpecialty(opt)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${formData.specialties.includes(opt) ? 'bg-[#C59D5F] text-white border-[#C59D5F]' : 'bg-white dark:bg-[#2C2622] text-[#8B5E3C] dark:text-[#F3EFE0] border-[#E6DCCF] dark:border-[#4A403A]'}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2_Address = () => (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-xl font-bold text-[#4A403A] dark:text-[#F3EFE0]">Step 2: Business Location</h3>
      <p className="text-xs text-[#B0A69D] dark:text-[#E6DCCF]">This address will be used for delivery fee calculations and pickup location.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase">Street / Building <span className="text-red-500">*</span></label>
          <input name="street" value={formData.street} onChange={handleChange} className="w-full p-3 bg-[#F9F7F2] dark:bg-[#2C2622] dark:text-[#F3EFE0] rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#C59D5F]" placeholder="123 Baker St." />
        </div>
        <div>
          <label className="text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase">Barangay <span className="text-red-500">*</span></label>
          <input name="barangay" value={formData.barangay} onChange={handleChange} className="w-full p-3 bg-[#F9F7F2] dark:bg-[#2C2622] dark:text-[#F3EFE0] rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#C59D5F]" />
        </div>
        <div>
          <label className="text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase">City <span className="text-red-500">*</span></label>
          <input name="city" value={formData.city} onChange={handleChange} className="w-full p-3 bg-[#F9F7F2] dark:bg-[#2C2622] dark:text-[#F3EFE0] rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#C59D5F]" />
        </div>
      </div>
    </div>
  );

  const renderStep3_Payout = () => (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-xl font-bold text-[#4A403A] dark:text-[#F3EFE0]">Step 3: Payout & Agreement</h3>
      <p className="text-xs text-[#B0A69D] dark:text-[#E6DCCF]">How should we send your earnings?</p>
      <div className="bg-[#F3EFE0] dark:bg-[#2C2622] p-4 rounded-xl border border-[#C59D5F]/30 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">G</div>
        <div>
          <p className="font-bold text-[#4A403A] dark:text-[#F3EFE0]">GCash</p>
          <p className="text-[10px] text-[#8B5E3C] dark:text-[#C59D5F]">Primary Payout Method</p>
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase">Account Name <span className="text-red-500">*</span></label>
        <input name="gcashName" value={formData.gcashName} onChange={handleChange} className="w-full p-3 bg-[#F9F7F2] dark:bg-[#2C2622] dark:text-[#F3EFE0] rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#C59D5F]" placeholder="Juan Dela Cruz" />
      </div>
      <div>
        <label className="text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase">GCash Number <span className="text-red-500">*</span></label>
        <input name="gcashNumber" value={formData.gcashNumber} onChange={handleChange} className="w-full p-3 bg-[#F9F7F2] dark:bg-[#2C2622] dark:text-[#F3EFE0] rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#C59D5F]" placeholder="0917..." />
      </div>
      <div className="flex items-start pt-4 border-t border-gray-100 dark:border-gray-700">
        <input id="agreedToTerms" name="agreedToTerms" type="checkbox" checked={formData.agreedToTerms} onChange={handleChange} className="mt-1 mr-2 w-4 h-4 text-[#C59D5F] border-gray-300 rounded focus:ring-[#C59D5F]" />
        <label htmlFor="agreedToTerms" className="text-sm text-[#4A403A] dark:text-[#F3EFE0]">
          I agree to the <span className="font-bold text-[#C59D5F] hover:underline cursor-pointer">CREAKE Seller Terms and Conditions</span> and the Payout Policy.
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#1E1A17] text-[#4A403A] dark:text-[#F3EFE0]">
      <div className="p-6 md:p-12">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#4A403A] rounded-full border border-[#E6DCCF] dark:border-[#2C2622] shadow-sm text-[#4A403A] dark:text-[#F3EFE0] hover:text-[#C59D5F] transition">
                    <Back />
                </button>
                <h2 className="text-lg md:text-2xl font-bold leading-tight">Seller Registration</h2>
            </div>
            <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`w-3 h-3 rounded-full transition-all ${ step >= i ? 'bg-[#C59D5F]' : 'bg-gray-200 dark:bg-gray-600' }`}></div>
                ))}
            </div>
        </div>
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm animate-fade-in" role="alert">
                <strong className="font-bold">Oops! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        <div className="bg-white dark:bg-[#4A403A] p-6 rounded-2xl shadow-lg border border-[#E6DCCF] dark:border-[#4A403A]">
            {step === 1 && renderStep1_Profile()}
            {step === 2 && renderStep2_Address()}
            {step === 3 && renderStep3_Payout()}
        </div>
        <div className="flex justify-between mt-4 pt-6">
            <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className={`px-6 py-3 rounded-xl font-bold text-sm ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-[#8B5E3C] bg-[#F3EFE0] dark:bg-[#2C2622] dark:text-[#C59D5F]'}`}>
                Back
            </button>
            {step < 3 ? (
                <button type="button" onClick={handleNext} className="px-8 py-3 bg-[#4A403A] text-white rounded-xl font-bold text-sm hover:bg-[#2C2622] transition shadow-md">Next</button>
            ) : (
                <button type="submit" onClick={handleSubmit} disabled={loading || !formData.agreedToTerms || !formData.shopName.trim()} className={`px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition ${loading || !formData.agreedToTerms || !formData.shopName.trim() ? 'bg-[#B0A69D] text-white cursor-not-allowed' : 'bg-[#C59D5F] text-white hover:bg-[#B0894F]'}`}>
                    {loading ? 'Submitting...' : 'Finish Registration'}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;