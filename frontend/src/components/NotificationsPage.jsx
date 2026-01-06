import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import SubHeader from '../components/SubHeader';
import * as Icons from '../components/Icons';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const handleNotifClick = async (notif) => {
        if (!notif.read) {
            try {
                await api.put(`/notifications/${notif._id}/read`);
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
            } catch (err) {
                console.error("Failed to mark as read", err);
            }
        }

        // Navigate based on notification type
        if (notif.relatedId) {
            if (notif.type === 'order_update' || notif.type === 'design_response') {
                navigate('/my-orders');
            } else if (notif.type === 'design_request') {
                navigate('/seller-dashboard', { state: { activeTab: 'designs' } });
            }
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#1E1A17] text-[#4A403A] dark:text-[#F3EFE0]">
            <SubHeader title="Notifications" />

            <div className="max-w-2xl mx-auto p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold">Recent Activity</h2>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs font-bold text-[#C59D5F] hover:underline">
                            Mark all as read
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-10 text-[#B0A69D]">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <div className="text-4xl mb-2">🔕</div>
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((notif) => (
                            <div
                                key={notif._id}
                                onClick={() => handleNotifClick(notif)}
                                className={`p-4 rounded-xl cursor-pointer transition flex gap-4 items-start ${
                                    notif.read
                                        ? 'bg-white/50 dark:bg-[#2C2622]/50'
                                        : 'bg-white dark:bg-[#2C2622] shadow-md border border-[#E6DCCF] dark:border-[#4A403A]'
                                }`}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 transition-all ${
                                    notif.read ? 'bg-transparent' : 'bg-[#C59D5F]'
                                }`}></div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className={`text-sm ${notif.read ? 'text-[#B0A69D]' : 'font-bold text-[#4A403A] dark:text-[#F3EFE0]'}`}>
                                            {notif.title}
                                        </h4>
                                        <span className="text-[10px] text-[#B0A69D] flex-shrink-0">
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#B0A69D] dark:text-[#E6DCCF] mt-1 line-clamp-2">{notif.message}</p>
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