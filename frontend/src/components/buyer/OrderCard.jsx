// frontend/src/components/buyer/OrderCard.jsx
import React, { useState } from 'react';
import { getPaymentStatusColor, getOrderStatusColor, OrderProgressTracker } from '../common/StatusHelpers';
import * as Icons from '../Icons';

const OrderCard = ({ order, handleConfirmReceipt, reviewStatus, handleReviewClick }) => {
    const [showTracking, setShowTracking] = useState(false);

    // Calculate the full value of the items to check for downpayments
    const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const remainingBalance = itemsTotal > order.totalAmount ? itemsTotal - order.totalAmount : 0;

    return (
        <>
        <div key={order._id} className="bg-white dark:bg-[#4A403A] p-5 rounded-3xl shadow-sm border border-[#E6DCCF] dark:border-[#2C2622]">
            <div className="flex justify-between items-start mb-4">
                <div>
                    {/* Display Payment Status */}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.replace('_', ' ')}
                    </span>
                    {/* Display Order Status as Secondary */}
                    <span className={`ml-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getOrderStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.replace('_', ' ')}
                    </span>
                    <p className="text-xs text-[#B0A69D] mt-2">Order #{order._id.slice(-6)}</p>
                </div>
                <div className="text-right">
                    <span className="font-bold text-lg text-[#C59D5F]">₱{order.totalAmount.toLocaleString()}</span>
                    {remainingBalance > 0 && (
                        <div className="text-xs text-red-500 font-bold mt-1">
                            Balance: ₱{remainingBalance.toLocaleString()}
                        </div>
                    )}
                    {remainingBalance > 0 && <p className="text-[10px] text-[#B0A69D]">Paid (Downpayment)</p>}
                </div>
            </div>

            <div className="space-y-3">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-xl flex items-center justify-center text-[#C59D5F] overflow-hidden">
                            {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Icons.CakeSolid />}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm dark:text-[#F3EFE0]">{item.title}</h4>
                            <p className="text-xs text-[#B0A69D] dark:text-[#E6DCCF]">Qty: {item.quantity}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <OrderProgressTracker status={order.orderStatus} /> 

            <div className="mt-4 pt-4 border-t border-[#F3EFE0] dark:border-[#2C2622] flex flex-wrap justify-between items-center gap-2">
                <button 
                    onClick={() => setShowTracking(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F3EFE0] dark:bg-[#2C2622] text-[#4A403A] dark:text-[#F3EFE0] hover:bg-[#E6DCCF] transition flex items-center gap-1"
                >
                    <Icons.Truck /> Track Order
                </button>
                <span className="text-xs font-bold text-[#4A403A] dark:text-[#F3EFE0]">
                    {order.paymentStatus === 'pending_verification' ? 'GCash Proof is being verified.' : order.paymentMethod === 'COD' ? 'Payment: COD (Confirmed)' : `Payment: ${order.paymentMethod}`}
                </span>
                
                {order.orderStatus === 'shipped' && (
                    <button onClick={() => handleConfirmReceipt(order._id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-red-600 transition">
                        Confirm Delivery
                    </button>
                )}
                
                {/* Review Button Logic */}
                {order.orderStatus === 'completed' && reviewStatus?.canReview && !reviewStatus?.reviewed && (
                     <button onClick={() => handleReviewClick(order)}
                             className="bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-green-600 transition">
                        Leave Review
                    </button>
                )}
                {reviewStatus?.reviewed && (
                    <span className="text-xs font-bold text-green-500">Reviewed! ★</span>
                )}
            </div>
        </div>

        {showTracking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white dark:bg-[#2C2622] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[#C59D5F]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Order Tracking</h3>
                        <button onClick={() => setShowTracking(false)} className="text-gray-400 hover:text-red-500"><Icons.XCircleIcon className="w-6 h-6" /></button>
                    </div>

                    <div className="bg-[#F9F7F2] dark:bg-[#1E1A17] p-4 rounded-xl border border-[#E6DCCF] dark:border-[#4A403A]">
                        <p className="text-xs text-[#B0A69D]">Order ID</p>
                        <p className="font-mono text-sm font-bold">#{order._id}</p>
                        
                        <div className="mt-4">
                            <OrderProgressTracker status={order.orderStatus} />
                        </div>
                    </div>

                    {order.orderStatus === 'shipped' || order.orderStatus === 'completed' ? (
                        <div className="mt-4 space-y-3">
                            <h4 className="font-bold text-md text-[#4A403A] dark:text-[#F3EFE0]">Delivery Information</h4>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-[#B0A69D]">Courier:</span>
                                    <span className="font-bold">{order.deliveryDetails?.courierName || 'Seller\'s Own Delivery'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#B0A69D]">Vehicle:</span>
                                    <span className="font-bold">{order.deliveryDetails?.vehicleType || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#B0A69D]">Tracking #/Link:</span>
                                    <span className="font-bold text-[#C59D5F]">{order.deliveryDetails?.trackingNumber || 'Not Provided'}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-sm text-[#B0A69D] mt-6">Delivery details will appear here once the order is shipped.</p>
                    )}
                </div>
            </div>
        )}
        </>
    );
};

export default OrderCard;