import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SubHeader from '../components/SubHeader';
import * as Icons from '../components/Icons';

const AdminReports = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            // Call the new Admin summary route
            const res = await api.get('/users/admin/summary'); 
            setMetrics(res.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load metrics. Admin access required.");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return `₱${(amount || 0).toLocaleString()}`;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2] dark:bg-[#1E1A17]">Loading Analytics...</div>;
    if (error) return (
        <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#1E1A17]">
            <SubHeader title="Sales & System Reports" />
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-red-500 bg-red-100 p-4 rounded-xl">{error}</div>
            </div>
        </div>
    );

    const userCounts = metrics?.userCounts || {};
    const sales = metrics?.sales || {};

    return (
        <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#1E1A17] pb-8">
            <SubHeader title="Sales & System Reports" />
            
            <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                
                <h3 className="text-xl font-bold text-[#4A403A] dark:text-[#F3EFE0]">Platform Overview</h3>

                {/* --- SALES & TRANSACTION METRICS --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-[#4A403A] p-5 rounded-2xl shadow-md border border-[#E6DCCF] dark:border-[#2C2622]">
                        <p className="text-xs font-bold text-[#B0A69D] uppercase mb-2">Total Recognized Sales</p>
                        <h2 className="text-3xl font-extrabold text-green-600 dark:text-green-400">{formatCurrency(sales.totalSales)}</h2>
                    </div>
                    <div className="bg-white dark:bg-[#4A403A] p-5 rounded-2xl shadow-md border border-[#E6DCCF] dark:border-[#2C2622]">
                        <p className="text-xs font-bold text-[#B0A69D] uppercase mb-2">Completed Orders</p>
                        <h2 className="text-3xl font-extrabold text-[#C59D5F]">{sales.completedOrders}</h2>
                    </div>
                </div>

                {/* --- USER DISTRIBUTION --- */}
                <h3 className="text-xl font-bold text-[#4A403A] dark:text-[#F3EFE0] pt-4 border-t border-[#E6DCCF] dark:border-[#2C2622]">User Distribution</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-[#4A403A] p-5 rounded-2xl text-center shadow-md border border-[#E6DCCF] dark:border-[#2C2622]">
                        <p className="text-xs font-bold text-[#B0A69D] uppercase mb-1">Total Users</p>
                        <h2 className="text-3xl font-extrabold text-[#4A403A] dark:text-[#F3EFE0]">{Object.values(userCounts).reduce((a, b) => a + b, 0)}</h2>
                    </div>
                    <div className="bg-white dark:bg-[#4A403A] p-5 rounded-2xl text-center shadow-md border border-[#E6DCCF] dark:border-[#2C2622]">
                        <p className="text-xs font-bold text-[#B0A69D] uppercase mb-1">Buyers</p>
                        <h2 className="text-3xl font-extrabold text-blue-500">{userCounts.buyer || 0}</h2>
                    </div>
                    <div className="bg-white dark:bg-[#4A403A] p-5 rounded-2xl text-center shadow-md border border-[#E6DCCF] dark:border-[#2C2622]">
                        <p className="text-xs font-bold text-[#B0A69D] uppercase mb-1">Sellers</p>
                        <h2 className="text-3xl font-extrabold text-purple-500">{userCounts.seller || 0}</h2>
                    </div>
                </div>

                {/* --- TOP PERFORMER --- */}
                <h3 className="text-xl font-bold text-[#4A403A] dark:text-[#F3EFE0] pt-4 border-t border-[#E6DCCF] dark:border-[#2C2622]">Top Seller</h3>
                <div className="bg-white dark:bg-[#4A403A] p-5 rounded-2xl shadow-xl border-2 border-[#C59D5F] flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-[#8B5E3C] uppercase mb-1">Highest Recognized Revenue</p>
                        <h4 className="text-2xl font-extrabold text-[#4A403A] dark:text-[#F3EFE0]">{metrics.topSeller?.name || 'N/A'}</h4>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-bold text-[#B0A69D] uppercase">Earnings:</span>
                        <h4 className="text-2xl font-extrabold text-green-600 dark:text-green-400">{formatCurrency(metrics.topSeller?.earnings)}</h4>
                    </div>
                </div>

                <button onClick={fetchMetrics} className="mt-6 w-full py-3 border border-[#E6DCCF] dark:border-[#4A403A] bg-white dark:bg-[#2C2622] text-[#4A403A] dark:text-[#F3EFE0] rounded-xl font-bold text-sm hover:bg-[#F3EFE0] transition">
                    <span className="flex items-center justify-center gap-2"><Icons.History /> Refresh Data</span>
                </button>
            </div>
        </div>
    );
};

export default AdminReports;