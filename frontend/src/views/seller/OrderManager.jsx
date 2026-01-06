import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatusPill } from '../../components/common/StatusHelpers';
import * as Icons from '../../components/Icons';
import AlertModal from '../../components/common/AlertModal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Shipping Modal State
    const [shippingModalOpen, setShippingModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [deliveryForm, setDeliveryForm] = useState({
        courierName: 'Seller Delivery',
        vehicleType: 'Motorcycle',
        trackingNumber: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Modal States
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });


    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/seller-orders');
            setOrders(res.data);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        if (newStatus === 'shipped') {
            // Open modal for shipping details instead of immediate update
            setSelectedOrderId(orderId);
            setDeliveryForm({ courierName: 'Seller Delivery', vehicleType: 'Motorcycle', trackingNumber: '' });
            setShippingModalOpen(true);
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: `Update Order Status?`,
            message: `Are you sure you want to mark this order as ${newStatus.replace('_', ' ')}?`,
            onConfirm: async () => {
                try {
                    await api.put(`/orders/${orderId}/status`, { status: newStatus });
                    fetchOrders(); // Refresh list
                    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                } catch (err) {
                    setAlertModal({ isOpen: true, title: 'Error', message: 'Failed to update status' });
                }
            }
        });
    };

    const submitShipment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/orders/${selectedOrderId}/status`, { 
                status: 'shipped',
                deliveryDetails: deliveryForm
            });
            setShippingModalOpen(false);
            fetchOrders();
        } catch (err) {
            console.error(err);
            setAlertModal({ isOpen: true, title: 'Error', message: 'Failed to update shipment details' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-[#B0A69D]">Loading Orders...</div>;

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
            />
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6DCCF] dark:border-[#4A403A] pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[#4A403A] dark:text-[#F3EFE0]">Order Management</h2>
                        <p className="text-sm text-[#B0A69D] dark:text-[#E6DCCF]">Track and update customer orders.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-20 opacity-50 bg-white dark:bg-[#2C2622] rounded-2xl border border-dashed border-[#E6DCCF] dark:border-[#4A403A]">
                            <Icons.Orders className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto"/>
                            <p className="mt-2">No orders yet.</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order._id} className="bg-white dark:bg-[#4A403A] p-4 sm:p-5 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#2C2622]">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-[#F3EFE0] dark:border-[#2C2622]">
                                    <div>
                                        <p className="text-xs text-[#B0A69D] dark:text-[#E6DCCF]">Order ID</p>
                                        <p className="font-bold text-sm text-[#4A403A] dark:text-[#F3EFE0]">#{order._id.slice(-6)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#B0A69D] dark:text-[#E6DCCF]">Customer</p>
                                        <p className="font-bold text-sm text-[#4A403A] dark:text-[#F3EFE0]">{order.buyer?.name || 'Guest'}</p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-xs text-[#B0A69D] dark:text-[#E6DCCF]">Date</p>
                                        <p className="font-bold text-sm text-[#4A403A] dark:text-[#F3EFE0]">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-xs text-[#B0A69D] dark:text-[#E6DCCF]">Total</p>
                                        <p className="font-bold text-lg text-[#C59D5F]">₱{order.totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-sm">
                                            <img src={item.image} alt={item.title} className="w-10 h-10 rounded-md object-cover bg-gray-100"/>
                                            <span className="text-[#4A403A] dark:text-[#F3EFE0] flex-1 truncate">{item.quantity}x {item.title}</span>
                                            <span className="font-bold text-xs text-gray-500 dark:text-gray-400">₱{item.price.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                {order.deliveryDetails && (order.orderStatus === 'shipped' || order.orderStatus === 'completed') && (
                                    <div className="bg-[#F9F7F2] dark:bg-[#1E1A17] p-3 rounded-lg border-l-4 border-blue-500 mt-4">
                                        <h4 className="text-xs font-bold uppercase text-blue-500 mb-2">Delivery Info</h4>
                                        <div className="text-xs space-y-1 text-[#4A403A] dark:text-[#F3EFE0]">
                                            <p><span className="font-semibold text-[#B0A69D]">Courier:</span> {order.deliveryDetails.courierName}</p>
                                            {order.deliveryDetails.vehicleType && <p><span className="font-semibold text-[#B0A69D]">Vehicle:</span> {order.deliveryDetails.vehicleType}</p>}
                                            {order.deliveryDetails.trackingNumber && <p><span className="font-semibold text-[#B0A69D]">Tracking:</span> <span className="font-mono">{order.deliveryDetails.trackingNumber}</span></p>}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-4 border-t border-[#F3EFE0] dark:border-[#2C2622]">
                                    <StatusPill status={order.orderStatus} />
                                    <div className="flex flex-wrap gap-2">
                                        {order.orderStatus === 'pending_review' && (
                                            <button onClick={() => handleStatusUpdate(order._id, 'baking')} className="px-3 py-1.5 bg-[#4A403A] text-white rounded-lg text-xs font-bold hover:bg-[#2C2622]">Accept & Bake</button>
                                        )}
                                        {order.orderStatus === 'baking' && (
                                            <button onClick={() => handleStatusUpdate(order._id, 'ready_to_ship')} className="px-3 py-1.5 bg-[#C59D5F] text-white rounded-lg text-xs font-bold hover:bg-[#B0894F]">Mark Ready</button>
                                        )}
                                        {order.orderStatus === 'ready_to_ship' && (
                                            <button onClick={() => handleStatusUpdate(order._id, 'shipped')} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-2">
                                                <Icons.Truck className="w-4 h-4" /> Ship Order
                                            </button>
                                        )}
                                        {order.orderStatus === 'shipped' && (
                                            <span className="text-xs font-bold text-blue-600 flex items-center gap-1"><Icons.CheckCircleIcon className="w-4 h-4" /> Shipped</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {shippingModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white dark:bg-[#2C2622] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[#C59D5F]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-[#4A403A] dark:text-[#F3EFE0]">Delivery Details</h3>
                                <button onClick={() => setShippingModalOpen(false)} className="text-gray-400 hover:text-red-500"><Icons.XCircleIcon className="w-6 h-6" /></button>
                            </div>
                            
                            <form onSubmit={submitShipment} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-[#B0A69D] mb-1">Courier / Method</label>
                                    <input type="text" required value={deliveryForm.courierName} onChange={(e) => setDeliveryForm({...deliveryForm, courierName: e.target.value})} className="w-full p-3 bg-[#F9F7F2] dark:bg-[#1E1A17] rounded-xl outline-none border border-[#E6DCCF] dark:border-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0]" placeholder="e.g. Lalamove, Grab"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-[#B0A69D] mb-1">Vehicle Type</label>
                                    <input type="text" value={deliveryForm.vehicleType} onChange={(e) => setDeliveryForm({...deliveryForm, vehicleType: e.target.value})} className="w-full p-3 bg-[#F9F7F2] dark:bg-[#1E1A17] rounded-xl outline-none border border-[#E6DCCF] dark:border-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0]" placeholder="e.g. Motorcycle (Optional)"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-[#B0A69D] mb-1">Tracking Info</label>
                                    <input type="text" value={deliveryForm.trackingNumber} onChange={(e) => setDeliveryForm({...deliveryForm, trackingNumber: e.target.value})} className="w-full p-3 bg-[#F9F7F2] dark:bg-[#1E1A17] rounded-xl outline-none border border-[#E6DCCF] dark:border-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0]" placeholder="Paste tracking link or ID here"/>
                                </div>
                                <button type="submit" disabled={submitting} className="w-full py-3 bg-[#C59D5F] text-white rounded-xl font-bold shadow-md hover:bg-[#B0894F] disabled:opacity-70">
                                    {submitting ? 'Updating...' : 'Confirm Shipment'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default OrderManager;