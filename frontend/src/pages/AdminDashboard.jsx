// frontend/src/pages/AdminDashboard.jsx

import React, { useState, useEffect, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import SubHeader from '../components/SubHeader';
import * as Icons from '../components/Icons'; 
import ConfirmationModal from '../components/admin/ConfirmationModal';
import logo from '../assets/creake_logo.png'; // Import the logo for the favicon

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [metrics, setMetrics] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // State for logout modal

    useEffect(() => {
        // --- Change favicon for Admin section ---
        const link = document.querySelector("link[rel~='icon']");
        if (!link) return;
        const originalHref = link.href;
        link.href = logo;

        // --- Fetch data ---
        const fetchMetrics = async () => {
            try {
                // Fetch both summary and chart data
                const [metricsRes, chartRes] = await Promise.all([
                    api.get('/users/admin/summary'),
                    api.get('/users/admin/sales-chart')
                ]);
                setMetrics(metricsRes.data);
                setChartData(chartRes.data);
            } catch (err) {
                console.error("Failed to load metrics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();

        // --- Cleanup: Reset favicon when component unmounts ---
        return () => {
            link.href = originalHref;
        };
    }, []);

    const formatCurrency = (amount) => `₱${(amount || 0).toLocaleString()}`;
    const userCounts = metrics?.userCounts || {};
    const sales = metrics?.sales || {};

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
    };

    const LogoutButton = (
        <button 
            onClick={() => setShowLogoutConfirm(true)} // Open confirmation modal
            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#2C2622] border border-[#E6DCCF] dark:border-[#4A403A] rounded-full text-red-500 shadow-sm active:scale-95 transition hover:bg-red-50/50 dark:hover:bg-red-900/20"
            title="Log Out"
        >
            <Icons.Logout />
        </button>
    );
    
    return (
        <div className="pb-8">
            {/* --- Logout Confirmation Modal --- */}
            <ConfirmationModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={confirmLogout}
                title="Confirm Logout"
                message="Are you sure you want to log out of the admin panel?"
                confirmText="Log Out"
                variant="danger"
            />

            <SubHeader 
                title="Admin Overview" 
                showBackButton={false}        
                rightAction={LogoutButton}    
            />

            <div className="max-w-7xl mx-auto p-6 space-y-8">
                
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-[#2C2622] to-[#4A403A] rounded-3xl p-8 text-white shadow-xl flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h2>
                        <p className="text-white/70">Here is what's happening in your store today.</p>
                    </div>
                    <div className="hidden md:block opacity-20">
                        <Icons.Dashboard /> 
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading analytics...</div>
                ) : (
                    <>
                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-[#2C2622] p-6 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#4A403A]">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Icons.Money /></div>
                                    <span className="text-xs font-bold text-[#B0A69D] uppercase">Total Revenue</span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-[#4A403A] dark:text-[#F3EFE0]">{formatCurrency(sales.totalSales)}</h3>
                            </div>

                            <div className="bg-white dark:bg-[#2C2622] p-6 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#4A403A]">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Icons.Orders /></div>
                                    <span className="text-xs font-bold text-[#B0A69D] uppercase">Completed Orders</span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-[#4A403A] dark:text-[#F3EFE0]">{sales.completedOrders || 0}</h3>
                            </div>

                            <div className="bg-white dark:bg-[#2C2622] p-6 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#4A403A]">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Icons.User /></div>
                                    <span className="text-xs font-bold text-[#B0A69D] uppercase">Total Users</span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-[#4A403A] dark:text-[#F3EFE0]">
                                    {Object.values(userCounts).reduce((a, b) => a + b, 0)}
                                </h3>
                                <div className="text-xs text-[#B0A69D] mt-1">
                                    {userCounts.buyer || 0} Buyers • {userCounts.seller || 0} Sellers
                                </div>
                            </div>
                        </div>

                        {/* Sales Chart */}
                        <div className="bg-white dark:bg-[#2C2622] p-6 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#4A403A] md:col-span-3">
                            <h3 className="font-bold text-lg mb-4 text-[#4A403A] dark:text-[#F3EFE0]">Sales (Last 30 Days)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tickFormatter={(value) => `₱${value}`} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(44, 38, 34, 0.9)',
                                            borderColor: '#C59D5F',
                                            color: '#F3EFE0',
                                            borderRadius: '0.75rem'
                                        }}
                                        itemStyle={{ color: '#F3EFE0' }}
                                        labelStyle={{ color: '#C59D5F', fontWeight: 'bold' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="sales" stroke="#C59D5F" strokeWidth={2} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top Seller Highlight */}
                        {metrics?.topSeller && (
                            <div className="bg-white dark:bg-[#2C2622] p-6 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#4A403A]">
                                <h3 className="font-bold text-lg mb-4 text-[#4A403A] dark:text-[#F3EFE0]">🏆 Top Performing Seller</h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#F3EFE0] rounded-full flex items-center justify-center text-xl font-bold text-[#8B5E3C]">
                                            {metrics.topSeller.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#4A403A] dark:text-[#F3EFE0]">{metrics.topSeller.name}</h4>
                                            <p className="text-xs text-[#B0A69D]">Highest recognized earnings</p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold text-green-600">{formatCurrency(metrics.topSeller.earnings)}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;