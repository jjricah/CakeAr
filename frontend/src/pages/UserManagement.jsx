import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import SubHeader from '../components/SubHeader';
import * as Icons from '../components/Icons';
import ConfirmationModal from '../components/admin/ConfirmationModal'; // Import the new modal
import AlertModal from '../components/common/AlertModal';

// --- NEW: Mobile Actions Dropdown ---
const ActionsDropdown = ({ user, onRoleChange, onBan, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const actions = [];
    if (user.role === 'buyer') actions.push({ label: 'Promote to Seller', action: () => onRoleChange(user._id, 'seller') });
    if (user.role === 'seller') actions.push({ label: 'Revoke Seller Role', action: () => onRoleChange(user._id, 'buyer') });
    if (user.role !== 'admin') {
        actions.push({ label: 'Make Admin', action: () => onRoleChange(user._id, 'admin') });
        actions.push({ label: user.isBanned ? 'Unban User' : 'Ban User', action: () => onBan(user._id, user.isBanned) });
        actions.push({ label: 'Delete User', action: () => onDelete(user), danger: true });
    }

    if (actions.length === 0) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <Icons.MoreVertical />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                    {actions.map(action => (
                        <button 
                            key={action.label} 
                            onClick={() => { action.action(); setIsOpen(false); }} 
                            className={`block w-full text-left px-4 py-2 text-sm ${action.danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // --- NEW: Search query state ---
    const [searchQuery, setSearchQuery] = useState('');
    
    // --- NEW: Modal State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });
    const [actionConfirmModal, setActionConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    useEffect(() => {
        // Debounce search to prevent too many API calls
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [page, searchQuery]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Call the API with pagination and search params
            const res = await api.get(`/users?pageNumber=${page}&keyword=${searchQuery}`);
            
            // The backend now returns { users, page, pages, total }
            setUsers(res.data.users);
            setTotalPages(res.data.pages);
            
            setError(null);
        } catch (err) {
            console.error("Error fetching users:", err.response?.data?.message || err.message);
            setError(err.response?.data?.message || "Failed to load user list. Check Admin role.");
        } finally {
            setLoading(false);
        }
    };
    
    // --- ROLE CHANGE HANDLER ---
    const handleRoleChange = async (userId, newRole) => {
        setActionConfirmModal({
            isOpen: true,
            title: 'Confirm Role Change',
            message: `Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`,
            onConfirm: async () => {
                try {
                    await api.put(`/users/${userId}/role`, { role: newRole });
                    // Optimistic UI Update
                    setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
                    setActionConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                } catch (err) {
                    setAlertModal({ isOpen: true, title: 'Error', message: err.response?.data?.message || "Failed to update role" });
                }
            }
        });
    };

    // --- BAN HANDLER ---
    const handleBanUser = async (userId, currentStatus) => {
        const action = currentStatus ? 'Unban' : 'Ban';
        setActionConfirmModal({
            isOpen: true,
            title: `Confirm ${action}`,
            message: `Are you sure you want to ${action} this user?`,
            onConfirm: async () => {
                try {
                    const res = await api.put(`/users/${userId}/ban`);
                    setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: res.data.isBanned } : u));
                    setActionConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                } catch (err) {
                    setAlertModal({ isOpen: true, title: 'Error', message: err.response?.data?.message || "Failed to update ban status" });
                }
            }
        });
    };

    // --- DELETE MODAL HANDLERS ---
    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setUserToDelete(null);
        setIsModalOpen(false);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        
        setIsDeleting(true);
        try {
            // Call the new DELETE API endpoint
            await api.delete(`/users/${userToDelete._id}`);

            // Optimistic UI Update: Remove user from local state
            setUsers(prevUsers => prevUsers.filter(user => user._id !== userToDelete._id));
            setAlertModal({ isOpen: true, title: 'Success', message: `Successfully deleted user ${userToDelete.name}.` });

        } catch (err) {
            console.error("Deletion failed:", err.response?.data);
            setAlertModal({ isOpen: true, title: 'Error', message: err.response?.data?.message || "Failed to delete user." });
        } finally {
            setIsDeleting(false);
            closeDeleteModal();
        }
    };
    // ------------------------------------

    return (
        <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#1E1A17] pb-8">
            <SubHeader title="Manage Users" />

            <AlertModal
                isOpen={alertModal.isOpen}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
            />

            <ConfirmationModal
                isOpen={actionConfirmModal.isOpen}
                onClose={() => setActionConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
                onConfirm={actionConfirmModal.onConfirm}
                title={actionConfirmModal.title}
                message={actionConfirmModal.message}
                confirmText="Confirm"
                cancelText="Cancel"
                variant="primary"
            />

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDeleteUser}
                title="Confirm Deletion"
                message={`Are you sure you want to permanently delete the user "${userToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete User"
                cancelText="Cancel"
                isLoading={isDeleting}
                variant="danger"
            />

            <div className="max-w-4xl mx-auto p-4 md:p-6">
                {/* --- NEW: Search Bar --- */}
                <div className="mb-6 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} // Reset to page 1 on search
                        placeholder="Search by name or email..." // ✅ FIX: Added text-base to prevent mobile zoom on focus
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E6DCCF] dark:border-[#4A403A] shadow-sm bg-white dark:bg-[#2C2622] text-base text-[#4A403A] dark:text-[#F3EFE0] placeholder-[#B0A69D] focus:ring-2 focus:ring-[#C59D5F]/50 outline-none transition-all"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0A69D] dark:text-[#E6DCCF]">
                        <Icons.Search />
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-4">User List</h3>

                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading user data...</div>
                ) : error ? (
                    <div className="text-red-500 bg-red-100 p-4 rounded-xl">{error}</div>
                ) : (
                    <>
                        <div className="hidden md:block bg-white dark:bg-[#2C2622] rounded-2xl shadow-lg overflow-hidden border border-[#E6DCCF]">
                            <table className="min-w-full divide-y divide-[#E6DCCF] dark:divide-[#4A403A]">
                                <thead className="bg-[#F9F7F2] dark:bg-[#4A403A]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[#B0A69D] uppercase tracking-wider">Name / Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[#B0A69D] uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-[#B0A69D] uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F3EFE0] dark:divide-[#4A403A]">
                                    {users.map((user) => (
                                        <tr key={user._id} className={`hover:bg-[#F9F7F2]/50 dark:hover:bg-[#2C2622]/50 ${user.isBanned ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-[#4A403A] dark:text-[#F3EFE0]">
                                                    {user.name}
                                                    {user.isBanned && <span className="ml-2 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">BANNED</span>}
                                                </div>
                                                <div className="text-xs text-[#B0A69D]">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                        user.role === 'seller' ? 'bg-green-100 text-green-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                                                {/* Role Management Buttons */}
                                                {user.role === 'buyer' && (
                                                    <button onClick={() => handleRoleChange(user._id, 'seller')} className="text-[#C59D5F] hover:text-[#8B5E3C] mr-2">Promote</button>
                                                )}
                                                {user.role === 'seller' && (
                                                    <button onClick={() => handleRoleChange(user._id, 'buyer')} className="text-orange-500 hover:text-orange-700 mr-2">Revoke Seller</button>
                                                )}
                                                {user.role !== 'admin' && (
                                                    <button onClick={() => handleRoleChange(user._id, 'admin')} className="text-purple-500 hover:text-purple-700 mr-2">Make Admin</button>
                                                )}

                                                {/* Ban Button */}
                                                {user.role !== 'admin' && (
                                                    <button onClick={() => handleBanUser(user._id, user.isBanned)} className={`${user.isBanned ? 'text-green-500 hover:text-green-700' : 'text-gray-500 hover:text-gray-700'} mr-2`}>
                                                        {user.isBanned ? 'Unban' : 'Ban'}
                                                    </button>
                                                )}

                                                {/* --- DELETE BUTTON --- */}
                                                <button
                                                    onClick={() => openDeleteModal(user)}
                                                    className="text-red-500 hover:text-red-700 ml-4 p-1 rounded-full hover:bg-red-50/50 transition"
                                                    // Disable button if user is an Admin
                                                    disabled={user.role === 'admin'}
                                                    title={user.role === 'admin' ? "Cannot delete Admin account" : "Delete User"}
                                                >
                                                    <Icons.Trash />
                                                </button>
                                                {/* --- END DELETE BUTTON --- */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* --- NEW: Mobile Card View --- */}
                        <div className="block md:hidden space-y-4">
                            {users.map((user) => (
                                <div key={user._id} className={`bg-white dark:bg-[#2C2622] rounded-2xl p-4 shadow-lg border border-[#E6DCCF] dark:border-[#2C2622] ${user.isBanned ? 'border-red-500/50' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-sm font-medium text-[#4A403A] dark:text-[#F3EFE0]">
                                                {user.name}
                                                {user.isBanned && <span className="ml-2 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">BANNED</span>}
                                            </div>
                                            <div className="text-xs text-[#B0A69D]">{user.email}</div>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center gap-1">
                                            {/* Direct Delete Button for Mobile */}
                                            {user.role !== 'admin' && (
                                                <button 
                                                    onClick={() => openDeleteModal(user)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            )}
                                            <ActionsDropdown 
                                                user={user}
                                                onRoleChange={handleRoleChange}
                                                onBan={handleBanUser}
                                                onDelete={openDeleteModal}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'seller' ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* --- PAGINATION CONTROLS --- */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg bg-white dark:bg-[#2C2622] border border-[#E6DCCF] dark:border-[#4A403A] disabled:opacity-50 hover:bg-[#F9F7F2] dark:hover:bg-[#4A403A] transition"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-bold text-[#4A403A] dark:text-[#F3EFE0]">Page {page} of {totalPages}</span>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-lg bg-white dark:bg-[#2C2622] border border-[#E6DCCF] dark:border-[#4A403A] disabled:opacity-50 hover:bg-[#F9F7F2] dark:hover:bg-[#4A403A] transition"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;