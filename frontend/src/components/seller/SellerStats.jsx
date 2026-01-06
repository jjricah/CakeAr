import React, { useState } from 'react';
import api from '../../services/api';
import * as Icons from '../Icons';
import { getOrderStatusColor } from '../common/StatusHelpers';

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-[#4A403A] p-4 rounded-xl shadow-sm border border-[#E6DCCF] dark:border-[#2C2622]">
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F3EFE0] dark:bg-[#2C2622] text-[#C59D5F]">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-lg md:text-xl font-bold text-[#4A403A] dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

const ChartPlaceholder = () => (
    <div className="w-full h-60 rounded-xl bg-gray-50 dark:bg-[#2C2622] p-4 flex flex-col justify-end">
        <svg width="100%" height="100%" preserveAspectRatio="none" className="opacity-50">
            <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C59D5F" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#C59D5F" stopOpacity="0"/>
                </linearGradient>
            </defs>
            <path d="M0,100 C40,80 80,120 120,100 S200,60 240,90 S320,150 360,100" transform="translate(0 50)" fill="url(#chartGradient)" vectorEffect="non-scaling-stroke"/>
            <path d="M0,100 C40,80 80,120 120,100 S200,60 240,90 S320,150 360,100" transform="translate(0 50)" stroke="#C59D5F" fill="none" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
        </svg>
    </div>
);


const StatusBadge = ({ status }) => {
    const colorClass = getOrderStatusColor(status);
    const text = status.replace('_', ' ');
    return (
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full capitalize ${colorClass}`}>
            {text}
        </span>
    );
};

const SellerStats = ({ shopDetails, orders, setActiveTab, setShopDetails }) => {
    const [cashingOut, setCashingOut] = useState(false);
    const pendingCount = orders.filter(o => o.orderStatus === 'pending_review').length;
    const activeCount = orders.filter(o => ['accepted', 'baking', 'ready_to_ship'].includes(o.orderStatus)).length;
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const recognizedRevenue = shopDetails?.totalEarnings || 0;
    const recentOrders = orders.slice(0, 5);

    const handleCashOut = async () => {
        if (recognizedRevenue <= 0) {
            alert("No recognized earnings available for cash out.");
            return;
        }
        if (!window.confirm(`Confirm cash out of ₱${recognizedRevenue.toLocaleString()}?`)) return;

        setCashingOut(true);
        try {
            await api.post('/payouts');
            alert("Payout request submitted successfully!");
            setShopDetails(prev => ({ ...prev, totalEarnings: 0 }));
        } catch (err) {
            alert(err.response?.data?.message || "Cash out failed.");
        } finally {
            setCashingOut(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-white dark:bg-[#4A403A] p-1 overflow-hidden shadow-sm flex-shrink-0">
                    {shopDetails?.shopLogo ? (
                        <img src={`${shopDetails.shopLogo}?t=${new Date().getTime()}`} alt={`${shopDetails.shopName} Logo`} className="w-full h-full object-cover rounded-md" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-[#F3EFE0] text-[#4A403A] rounded-md">
                            {shopDetails?.shopName?.charAt(0) || "S"}
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-[#4A403A] dark:text-white">{shopDetails?.shopName}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{shopDetails?.shopDescription || 'This is your seller dashboard.'}</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Revenue" value={`₱${recognizedRevenue.toLocaleString()}`} icon={<Icons.CurrencyDollarIcon className="w-5 h-5"/>} />
                <StatCard title="Gross Sales" value={`₱${totalSales.toLocaleString()}`} icon={<Icons.Cart className="w-5 h-5"/>} />
                <StatCard title="Pending" value={pendingCount} icon={<Icons.Clock className="w-5 h-5"/>} />
                <StatCard title="Active" value={activeCount} icon={<Icons.CakeSolid className="w-5 h-5"/>} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[#4A403A] p-6 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#2C2622]">
                        <h3 className="font-bold text-lg text-[#4A403A] dark:text-white mb-4">Sales Activity</h3>
                        <ChartPlaceholder />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <button onClick={() => setActiveTab('products')} className="p-3 bg-white dark:bg-[#4A403A] rounded-xl border border-[#E6DCCF] dark:border-[#2C2622] flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-[#2C2622] transition shadow-sm aspect-square">
                            <Icons.Products className="w-6 h-6 text-[#C59D5F]"/>
                            <span className="font-semibold text-xs text-center text-[#4A403A] dark:text-[#F3EFE0]">Manage Cakes</span>
                        </button>
                        <button onClick={() => setActiveTab('orders')} className="p-3 bg-white dark:bg-[#4A403A] rounded-xl border border-[#E6DCCF] dark:border-[#2C2622] flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-[#2C2622] transition shadow-sm aspect-square">
                            <Icons.Orders className="w-6 h-6 text-[#C59D5F]"/>
                            <span className="font-semibold text-xs text-center text-[#4A403A] dark:text-[#F3EFE0]">View All Orders</span>
                        </button>
                        <button onClick={handleCashOut} disabled={recognizedRevenue <= 0 || cashingOut} className="p-3 bg-green-600 text-white rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-green-700 transition shadow-sm aspect-square disabled:opacity-50 disabled:cursor-not-allowed">
                            {cashingOut ? <Icons.LoadingSpinner className="w-6 h-6"/> : <Icons.Money className="w-6 h-6"/>}
                            <span className="font-semibold text-xs text-center">{cashingOut ? 'Processing...' : 'Cash Out'}</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#4A403A] p-6 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#2C2622]">
                    <h3 className="font-bold text-lg text-[#4A403A] dark:text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {recentOrders.length > 0 ? recentOrders.map(order => (
                            <div key={order._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <div className="w-9 h-9 rounded-md bg-gray-100 dark:bg-[#2C2622] overflow-hidden flex-shrink-0">
                                    {order.items[0]?.image && <img src={order.items[0].image} alt={order.items[0].title} className="w-full h-full object-cover"/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#4A403A] dark:text-white truncate">{order.items[0]?.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        by {order.buyer?.name || 'Customer'} &bull; ₱{order.totalAmount.toLocaleString()}
                                    </p>
                                </div>
                                <StatusBadge status={order.orderStatus} />
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <Icons.CakeOutline />
                                <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">No recent orders to display.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerStats;
