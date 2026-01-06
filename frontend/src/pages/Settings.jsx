import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import SubHeader from '../components/SubHeader'; // New Component
import AlertModal from '../components/common/AlertModal';
import ConfirmationModal from '../components/admin/ConfirmationModal';

// Simple SVGs for toggle (Too specific to move to global icons if you prefer)
const SunIcon = () => <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>;
const MoonIcon = () => <svg className="w-3 h-3 text-indigo-200" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;

// --- HELPER: Convert File to Base64 (Copied from ReviewModal.jsx) ---
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

const Settings = () => {
    const { user, updateUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
    const [name, setName] = useState(user?.name || '');
    const [address, setAddress] = useState(user?.address || '');
    const [profileImage, setProfileImage] = useState(user?.image || null); 
    const [saving, setSaving] = useState(false);
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    useEffect(() => {
        if (isDark) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); } 
        else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
    }, [isDark]);
    
    // NEW: Image Change Handler
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const base64 = await convertToBase64(file);
                setProfileImage(base64); 
            } catch (error) {
                setAlertModal({ isOpen: true, title: 'Error', message: 'Failed to process image.' });
            }
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault(); 
        if (name.trim() === '') {
            setAlertModal({ isOpen: true, title: 'Validation Error', message: 'Name cannot be empty.' });
            return;
        }
        setSaving(true);
        try {
            // UPDATED PAYLOAD: Include profileImage
            const res = await api.put('/users/profile', { 
                name, 
                address, 
                image: profileImage // Send base64 string or null/URL string
            });
            
            // Assuming backend returns updated user data including the new image URL
            if (updateUser) updateUser({ 
                ...user, 
                name: res.data.name, 
                address: res.data.address,
                image: res.data.image 
            });
            setAlertModal({ isOpen: true, title: 'Success', message: 'Profile updated successfully!' });
        } catch (error) { 
            setAlertModal({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Failed to update profile.' });
        } finally { setSaving(false); }
    };
    
    // Helper for initials
    const getInitials = (userName) => {
        return userName
          ? userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
          : 'U';
    };

    const handleDeleteAccount = async () => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Account?',
            message: 'Are you sure you want to delete your account? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await api.delete('/users/profile');
                    setAlertModal({ isOpen: true, title: 'Success', message: 'Account deleted successfully.' });
                    logout();
                    navigate('/login');
                } catch (error) {
                    console.error("Error deleting account:", error);
                    setAlertModal({ isOpen: true, title: 'Error', message: error.response?.data?.message || "Failed to delete account." });
                }
            }
        });
    };

    return (
        <>
            <AlertModal
                isOpen={alertModal.isOpen}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
            />
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
                variant="danger"
                confirmText="Delete"
            />
            <div className="text-[#4A403A] dark:text-[#F3EFE0] transition-colors duration-300">
                
                {/* --- MODULAR HEADER --- */}
                <SubHeader title="Settings" />

                {/* Content Centered on Web/Desktop */}
                <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2 md:p-6">
                    
                    {/* Profile Picture Upload Section */}
                    <div className="bg-white dark:bg-[#2C2622] p-5 rounded-2xl border border-[#E6DCCF] dark:border-[#4A403A] shadow-sm text-center md:col-span-1">
                        <h3 className="font-bold text-[#C59D5F] text-xs uppercase tracking-wide mb-3">Profile Photo</h3>
                        <div className="relative w-24 h-24 mx-auto mb-3">
                            <div className="w-24 h-24 rounded-full border-4 border-[#F9F7F2] dark:border-[#4A403A] bg-stone-200 flex items-center justify-center shadow-md overflow-hidden">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-stone-500">
                                        {getInitials(user?.name)}
                                    </span>
                                )}
                            </div>
                             {/* File Input */}
                            <label htmlFor="file-upload" className="absolute bottom-0 right-0 bg-[#C59D5F] p-1.5 rounded-full border-2 border-white dark:border-[#2C2622] shadow-md cursor-pointer hover:bg-[#8B5E3C] transition">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                        {profileImage && <button type="button" onClick={() => setProfileImage(null)} className="text-red-400 text-xs hover:underline">Remove Photo</button>}
                    </div>
                    
                    {/* Theme Toggle */}
                    <div className="bg-white dark:bg-[#2C2622] p-5 rounded-2xl border border-[#E6DCCF] dark:border-[#4A403A] shadow-sm flex justify-between items-center md:col-span-1">
                        <div>
                            <h3 className="font-bold text-sm">{isDark ? 'Dark Mode' : 'Light Mode'}</h3>
                            <p className="text-xs text-[#B0A69D]">Switch theme</p>
                        </div>
                        <div onClick={() => setIsDark(!isDark)} className={`relative w-14 h-7 rounded-full cursor-pointer p-1 transition-colors ${isDark ? 'bg-[#4A403A] border border-[#8B5E3C]' : 'bg-[#E6DCCF] border border-[#D4D0C7]'}`}>
                            <div className="absolute inset-0 flex justify-between items-center px-1.5">
                                <MoonIcon />
                                <SunIcon />
                            </div>
                            <div className={`relative z-10 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${isDark ? 'translate-x-7' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                    
                    {/* General Info Form */}
                    <form onSubmit={handleSaveProfile} className="space-y-4 rounded-2xl border border-[#E6DCCF] bg-white p-5 shadow-sm dark:border-[#4A403A] dark:bg-[#2C2622] md:col-span-2">
                        <h3 className="font-bold text-[#C59D5F] text-xs uppercase tracking-wide">General Info</h3>
                        <div>
                            <label className="block text-xs font-bold mb-1 uppercase text-[#B0A69D]">Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-[#F9F7F2] dark:bg-[#1a1614] rounded-xl outline-none border border-transparent focus:border-[#C59D5F] dark:text-[#F3EFE0]" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 uppercase text-[#B0A69D]">Address</label>
                            <textarea rows="3" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 bg-[#F9F7F2] dark:bg-[#1a1614] rounded-xl outline-none border border-transparent focus:border-[#C59D5F] dark:text-[#F3EFE0]" placeholder="Street, City, Zip" />
                        </div>
                        <button type="submit" disabled={saving} className="w-full py-3 bg-[#C59D5F] text-white rounded-xl font-bold hover:bg-[#8B5E3C] transition-all disabled:opacity-70">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>

                    {/* Delete Account Section */}
                    <div className="mt-6 rounded-2xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-900/30 dark:bg-[#2C2622] md:col-span-2">
                        <h3 className="font-bold text-red-500 text-xs uppercase tracking-wide mb-2">Danger Zone</h3>
                        <p className="text-xs text-[#B0A69D] mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                        <button onClick={handleDeleteAccount} className="w-full py-3 border border-red-500 text-red-500 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm">Delete Account</button>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Settings;