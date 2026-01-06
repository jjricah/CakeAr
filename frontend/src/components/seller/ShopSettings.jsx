import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import * as Icons from '../Icons';

// Helper to convert file to Base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

const getCacheBustedUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/150/C59D5F/FFFFFF?text=LOGO';
    return `${url}?t=${new Date().getTime()}`;
}

const DEFAULT_ADDRESS = { street: '', city: '', barangay: '' };
const DEFAULT_PAYOUT = { accountName: '', accountNumber: '', provider: 'GCash' };

const ShopSettings = ({ currentShopDetails, setShopDetails, onLogout }) => {
    const { user, updateUser } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        shopName: currentShopDetails?.shopName || '',
        shopDescription: currentShopDetails?.shopDescription || '',
        specialties: currentShopDetails?.specialties || [''],
        address: currentShopDetails?.address || DEFAULT_ADDRESS,
        payoutInfo: currentShopDetails?.payoutInfo || DEFAULT_PAYOUT,
    });

    const [selectedLogoFile, setSelectedLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(currentShopDetails?.shopLogo || '');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (currentShopDetails) {
            setFormData({
                shopName: currentShopDetails.shopName || '',
                shopDescription: currentShopDetails.shopDescription || '',
                specialties: currentShopDetails.specialties || [''],
                address: currentShopDetails.address || DEFAULT_ADDRESS,
                payoutInfo: currentShopDetails.payoutInfo || DEFAULT_PAYOUT
            });
            setLogoPreview(currentShopDetails.shopLogo || '');
            setSelectedLogoFile(null);
        }
    }, [currentShopDetails]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (['street', 'city', 'barangay'].includes(name)) {
            setFormData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
        } else if (['accountName', 'accountNumber', 'provider'].includes(name)) {
            setFormData(prev => ({ ...prev, payoutInfo: { ...prev.payoutInfo, [name]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };
    
    const handleSpecialtyChange = (e, index) => {
        const newSpecialties = [...formData.specialties];
        newSpecialties[index] = e.target.value;
        setFormData(prev => ({ ...prev, specialties: newSpecialties }));
    };

    const addSpecialty = () => setFormData(prev => ({ ...prev, specialties: [...prev.specialties, ''] }));
    const removeSpecialty = (index) => setFormData(prev => ({ ...prev, specialties: prev.specialties.filter((_, i) => i !== index) }));

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            let logoBase64 = undefined;
            if (selectedLogoFile) {
                logoBase64 = await convertToBase64(selectedLogoFile);
            }

            const payload = {
                ...formData,
                shopName: formData.shopName.trim(),
                specialties: formData.specialties.filter(s => s.trim() !== ''),
                shopLogo: logoBase64
            };

            const res = await api.put('/shop/me', payload);

            setShopDetails(res.data.shop);
            updateUser(res.data.user);
            
            setSelectedLogoFile(null); 
            
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update shop details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-0 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-[#4A403A] dark:text-[#F3EFE0]">Shop Profile Settings</h1>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">{error}</div>}
            {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md flex items-center">
                <Icons.Check className="w-5 h-5 mr-2" />
                Changes saved successfully!
            </div>}

            <form onSubmit={handleSave} className="space-y-6">
                <section className="bg-white dark:bg-[#4A403A] p-4 sm:p-5 shadow-md rounded-2xl border border-[#E6DCCF] dark:border-[#2C2622]">
                    <h2 className="text-lg font-semibold mb-4 border-b dark:border-[#2C2622] pb-2 text-[#4A403A] dark:text-[#C59D5F]">Shop Logo</h2>
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
                        <img
                            className="h-20 w-20 object-cover rounded-full border-4 border-[#C59D5F] p-1 shadow-md"
                            src={logoPreview.startsWith('blob:') ? logoPreview : getCacheBustedUrl(logoPreview)}
                            alt="Shop Logo Preview"
                        />
                        <label className="block flex-1 w-full">
                            <span className="sr-only">Choose file</span>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept="image/jpeg,image/png,image/jpg"
                                className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-[#C59D5F] hover:file:bg-pink-100"
                            />
                        </label>
                    </div>
                </section>

                <section className="bg-white dark:bg-[#4A403A] p-4 sm:p-5 shadow-md rounded-2xl border border-[#E6DCCF] dark:border-[#2C2622]">
                    <h2 className="text-lg font-semibold mb-4 border-b dark:border-[#2C2622] pb-2 text-[#4A403A] dark:text-[#C59D5F]">General Information & Payout</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shop Name</label>
                            <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-[#2C2622] dark:bg-[#2C2622] rounded-xl shadow-sm p-2 dark:text-[#F3EFE0]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shop Description</label>
                            <textarea name="shopDescription" value={formData.shopDescription} onChange={handleChange} rows="3" className="mt-1 block w-full border border-gray-300 dark:border-[#2C2622] dark:bg-[#2C2622] rounded-xl shadow-sm p-2 dark:text-[#F3EFE0]" />
                        </div>
                        <div className='border-t dark:border-[#2C2622] pt-4'>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialties</label>
                            {formData.specialties.map((specialty, index) => (
                                <div key={index} className="flex space-x-2 mb-2">
                                    <input type="text" value={specialty} onChange={(e) => handleSpecialtyChange(e, index)} placeholder="e.g. Fondant Cakes" className="block w-full border border-gray-300 dark:border-[#2C2622] dark:bg-[#2C2622] rounded-xl shadow-sm p-2 dark:text-[#F3EFE0]" />
                                    {formData.specialties.length > 1 && <button type="button" onClick={() => removeSpecialty(index)} className="text-red-600 hover:text-red-900 px-3 border border-red-300 dark:border-red-600 rounded-xl">✕</button>}
                                </div>
                            ))}
                            <button type="button" onClick={addSpecialty} className="text-primary-600 dark:text-[#C59D5F] border border-primary-600 dark:border-[#C59D5F] px-3 py-1.5 rounded-xl hover:bg-primary-50 dark:hover:bg-[#2C2622] text-sm font-medium mt-1">+ Add Specialty</button>
                        </div>
                        <div className='border-t dark:border-[#2C2622] pt-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <h3 className="col-span-full text-base font-medium text-[#4A403A] dark:text-[#F3EFE0] mt-2">Shop Address</h3>
                            {['street', 'barangay', 'city'].map(field => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{field}</label>
                                    <input type="text" name={field} value={formData.address[field] || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-[#2C2622] dark:bg-[#2C2622] rounded-xl shadow-sm p-2 dark:text-[#F3EFE0]" />
                                </div>
                            ))}
                        </div>
                        <div className='border-t dark:border-[#2C2622] pt-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <h3 className="col-span-full text-base font-medium text-[#4A403A] dark:text-[#F3EFE0] mt-2">Payout Information</h3>
                            {['accountName', 'accountNumber'].map(field => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                                    <input type="text" name={field} value={formData.payoutInfo[field] || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-[#2C2622] dark:bg-[#2C2622] rounded-xl shadow-sm p-2 dark:text-[#F3EFE0]" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Provider</label>
                                <select name="provider" value={formData.payoutInfo.provider || 'GCash'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-[#2C2622] dark:bg-[#2C2622] rounded-xl shadow-sm p-3 dark:text-[#F3EFE0]">
                                    <option value="GCash">GCash</option>
                                    <option value="PayMaya">PayMaya</option>
                                    <option value="BankTransfer">Bank Transfer</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white dark:bg-[#4A403A] p-4 sm:p-5 shadow-md rounded-2xl border border-[#E6DCCF] dark:border-[#2C2622]">
                    <button type="submit" disabled={isLoading} className="flex items-center justify-center w-full px-4 py-2.5 border border-transparent text-base font-bold rounded-xl shadow-sm text-white bg-[#C59D5F] hover:bg-[#B0894F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C59D5F] disabled:opacity-50">
                        <Icons.Save className="w-5 h-5 mr-2" />
                        {isLoading ? 'Saving...' : 'Save All Changes'}
                    </button>
                </section>
            </form>
            
            <section className="bg-white dark:bg-[#4A403A] p-4 sm:p-5 shadow-md rounded-2xl border border-[#E6DCCF] dark:border-[#2C2622] mt-6">
                 <button
                    onClick={onLogout}
                    className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Icons.Logout className="w-5 h-5" />
                    Sign Out
                </button>
            </section>
        </div>
    );
};

export default ShopSettings;
