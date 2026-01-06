import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SubHeader from '../components/SubHeader';
import * as Icons from '../components/Icons';
import { AuthContext } from '../context/AuthContext';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }

        // Navigation logic based on notification type
        if (notification.type === 'order_update' && notification.relatedId) {
            if (user.role === 'seller') {
                 navigate('/seller-dashboard', { state: { activeTab: 'orders' } });
            } else {
                 navigate('/my-orders', { state: { activeTab: 'orders' } });
            }
        } else if (notification.type === 'design_request') {
             if (user.role === 'seller') {
                 navigate('/seller-dashboard', { state: { activeTab: 'designs' } });
             } else {
                 navigate('/my-orders', { state: { activeTab: 'requests' } });
             }
        } else if (notification.type === 'design_response') {
             navigate('/my-orders', { state: { activeTab: 'requests' } });
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order_update': return <Icons.Truck className="w-5 h-5 text-blue-500" />;
            case 'design_request': return <Icons.Edit className="w-5 h-5 text-purple-500" />;
            case 'design_response': return <Icons.Message className="w-5 h-5 text-green-500" />;
            default: return <Icons.Bell className="w-5 h-5 text-[#C59D5F]" />;
        }
    };

    // Header action button
    const rightAction = notifications.some(n => !n.read) ? (
        <button onClick={markAllAsRead} className="text-xs font-bold text-[#C59D5F] hover:text-[#B0894F] transition">
            Read All
        </button>
    ) : null;

    return (
        <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#1E1A17] pb-20">
            <SubHeader title="Notifications" rightAction={rightAction} />
            
            <div className="max-w-3xl mx-auto p-4">
                {loading ? (
                    <div className="text-center py-10 text-[#B0A69D]">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[#B0A69D] opacity-60">
                        <Icons.Bell className="w-16 h-16 mb-4" />
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map(notification => (
                            <div 
                                key={notification._id} 
                                onClick={() => handleNotificationClick(notification)}
                                className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                                    notification.read 
                                        ? 'bg-white dark:bg-[#2C2622] border-[#E6DCCF] dark:border-[#4A403A]' 
                                        : 'bg-[#FFF8F0] dark:bg-[#3E3632] border-[#C59D5F] shadow-sm'
                                }`}
                            >
                                {!notification.read && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#C59D5F]"></div>
                                )}
                                
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    notification.read ? 'bg-[#F9F7F2] dark:bg-[#1E1A17]' : 'bg-white dark:bg-[#2C2622]'
                                }`}>
                                    {getIcon(notification.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-bold truncate pr-2 ${notification.read ? 'text-[#4A403A] dark:text-[#F3EFE0]' : 'text-[#8B5E3C] dark:text-[#C59D5F]'}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-[10px] text-[#B0A69D] whitespace-nowrap">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#4A403A] dark:text-[#E6DCCF] leading-relaxed line-clamp-2">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
