import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SubHeader from '../components/SubHeader';
import * as Icons from '../components/Icons';

const AdminProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Call the new Admin-only route
            const res = await api.get('/products/admin/all');
            setProducts(res.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching all products:", err.response?.data?.message || err.message);
            setError(err.response?.data?.message || "Failed to load product list. Check Admin privileges.");
        } finally {
            setLoading(false);
        }
    };

    // Admin Delete Product Handler
    const handleDeleteProduct = async (productId, title) => {
        if (!window.confirm(`WARNING: Are you sure you want to PERMANENTLY delete the product "${title}"?`)) {
            return;
        }

        try {
            // ✅ FIX: Call the correct admin-specific delete route
            await api.delete(`/products/admin/${productId}`);

            setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
            alert(`Successfully deleted product "${title}".`);

        } catch (err) {
            console.error("Deletion failed:", err.response?.data);
            alert(err.response?.data?.message || "Failed to delete product.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#1E1A17] pb-8">
            <SubHeader title="Manage All Products" />

            <div className="max-w-7xl mx-auto p-4 md:p-6">
                <h3 className="text-xl font-bold mb-4">Total Products: {products.length}</h3>
                <button onClick={fetchProducts} className="text-[#C59D5F] text-sm font-bold mb-4 flex items-center gap-2">
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Refresh List
                </button>

                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading product catalog...</div>
                ) : error ? (
                    <div className="text-red-500 bg-red-100 p-4 rounded-xl">{error}</div>
                ) : (
                    <>
                        <div className="hidden md:block bg-white dark:bg-[#2C2622] rounded-2xl shadow-lg overflow-hidden border border-[#E6DCCF]">
                            <table className="min-w-full divide-y divide-[#E6DCCF] dark:divide-[#4A403A]">
                                <thead className="bg-[#F9F7F2] dark:bg-[#4A403A]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[#B0A69D] uppercase tracking-wider">Product / Seller</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[#B0A69D] uppercase tracking-wider">Price / Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[#B0A69D] uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-[#B0A69D] uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F3EFE0] dark:divide-[#4A403A]">
                                    {products.map((p) => (
                                        <tr key={p._id} className="hover:bg-[#F9F7F2]/50 dark:hover:bg-[#2C2622]/50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-[#4A403A] dark:text-[#F3EFE0]">{p.title}</div>
                                                <div className="text-xs text-[#B0A69D]">{p.baker?.shopName || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-[#C59D5F]">₱{p.basePrice.toLocaleString()}</div>
                                                <div className="text-xs text-[#B0A69D]">{p.category}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {p.isAvailable ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDeleteProduct(p._id, p.title)}
                                                    className="text-red-500 hover:text-red-700 ml-4 p-1 rounded-full hover:bg-red-50/50 transition"
                                                    title="Delete Product"
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* --- NEW: Mobile Card View --- */}
                        <div className="block md:hidden space-y-4">
                            {products.map((p) => (
                                <div key={p._id} className="bg-white dark:bg-[#2C2622] rounded-2xl p-4 shadow-lg border border-[#E6DCCF] dark:border-[#2C2622]">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <img src={p.image || 'https://placehold.co/40'} alt={p.title} className="w-12 h-12 object-cover rounded-md border border-[#E6DCCF] flex-shrink-0" />
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-[#4A403A] dark:text-[#F3EFE0] truncate">{p.title}</div>
                                                <div className="text-xs text-[#B0A69D] truncate">{p.baker?.shopName || 'N/A'}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteProduct(p._id, p.title)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50/50 dark:hover:bg-red-900/20 transition flex-shrink-0"
                                            title="Delete Product"
                                        >
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                    <div className="mt-3 flex justify-between items-center">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {p.isAvailable ? 'Available' : 'Unavailable'}
                                        </span>
                                        <div>
                                            <span className="text-sm font-medium text-[#C59D5F]">₱{p.basePrice.toLocaleString()}</span>
                                            <span className="text-xs text-[#B0A69D]"> / {p.category}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminProductManagement;