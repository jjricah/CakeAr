import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SubHeader from '../components/SubHeader';
import * as Icons from '../components/Icons';
import { getOrderStatusColor, getPaymentStatusColor } from '../components/common/StatusHelpers';

const AdminOrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Call the new Admin-only route
            const res = await api.get('/orders/admin/all'); 
            setOrders(res.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching all orders:", err.response?.data?.message || err.message);
            // This error likely means the user isn't an Admin
            setError(err.response?.data?.message || "Failed to load order list. Check Admin privileges.");
        } finally {
            setLoading(false);
        }
    };
    
    // --- ADMIN DELETE HANDLER ---
    const handleDeleteOrder = async (orderId, orderNum) => {
        if (!window.confirm(`WARNING: Are you sure you want to PERMANENTLY delete Order #${orderNum}? This action cannot be undone.`)) {
            return;
        }

        try {
            // Call the new DELETE API endpoint
            await api.delete(`/orders/admin/${orderId}`); 
            
            // Optimistic UI Update: Remove order from local state
            setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
            alert(`Successfully deleted Order #${orderNum}.`);
            
        } catch (err) {
            console.error("Deletion failed:", err.response?.data);
            alert(err.response?.data?.message || "Failed to delete order.");
        }
    };
    // ----------------------------

    return (
        <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#1E1A17] pb-8">
            <SubHeader title="Manage All Orders" />
            
            <div className="max-w-7xl mx-auto p-4 md:p-6">
                <h3 className="text-xl font-bold mb-4">Total Orders: {orders.length}</h3>
                
                <button onClick={fetchOrders} className="text-[#C59D5F] text-sm font-bold mb-4 flex items-center gap-2">
                     <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Refresh List
                </button>


                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading all order data...</div>
                ) : error ? (
                    <div className="text-red-500 bg-red-100 p-4 rounded-xl">{error}</div>
                ) : (
                    <>
                        <div className="hidden md:block bg-white dark:bg-[#2C2622] rounded-2xl shadow-lg overflow-hidden border border-[#E6DCCF]">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-[#F9F7F2] dark:bg-[#4A403A] text-[#B0A69D] dark:text-[#E6DCCF] uppercase font-bold text-xs">
                                <tr>
                                    <th className="px-6 py-4">ID / Customer</th>
                                    <th className="px-6 py-4">Amount / Items</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4">Order Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F3EFE0] dark:divide-[#4A403A]">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-[#F9F7F2]/50 dark:hover:bg-[#2C2622]/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-[#4A403A] dark:text-[#F3EFE0]">#{order._id.slice(-6)}</div>
                                                <div className="text-xs text-[#B0A69D]">{order.buyer?.name || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-[#C59D5F]">₱{order.totalAmount.toLocaleString()}</div>
                                                <div className="text-xs text-[#B0A69D]">{order.items.length} item(s)</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                    {order.paymentStatus?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getOrderStatusColor(order.orderStatus)}`}>
                                                    {order.orderStatus?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleDeleteOrder(order._id, order._id.slice(-6))} 
                                                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50/50 transition"
                                                    title="Permanently Delete Order"
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
                            {orders.map((order) => (
                                <div key={order._id} className="bg-white dark:bg-[#2C2622] rounded-2xl p-4 shadow-lg border border-[#E6DCCF] dark:border-[#2C2622]">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-[#4A403A] dark:text-[#F3EFE0]">#{order._id.slice(-6)}</div>
                                            <div className="text-xs text-[#B0A69D]">{order.buyer?.name || 'N/A'}</div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteOrder(order._id, order._id.slice(-6))}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50/50 dark:hover:bg-red-900/20 transition"
                                            title="Permanently Delete Order"
                                        >
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[#B0A69D]">Amount:</span>
                                            <span className="font-bold text-[#C59D5F]">₱{order.totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[#B0A69D]">Payment:</span>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                {order.paymentStatus?.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[#B0A69D]">Status:</span>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getOrderStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus?.replace('_', ' ')}
                                            </span>
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

export default AdminOrderManagement;