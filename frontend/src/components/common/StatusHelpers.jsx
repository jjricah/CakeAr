// frontend/src/components/common/StatusHelpers.js
import React from 'react';

// --- HELPER: Get Status Color for Payment Status ---
export const getPaymentStatusColor = (status) => {
    switch (status) {
        case 'pending_verification': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'verified': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
        case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
        default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    }
};

// --- HELPER: Get Status Color for Design/Order Status ---
export const getOrderStatusColor = (status) => {
    switch (status) {
        case 'pending':
        case 'pending_review': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
        case 'quoted':
            return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300';
        case 'reviewed':
        case 'approved':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
        case 'ordered': // Design accepted, order placed
        case 'baking':
        case 'ready_to_ship':
            return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
        case 'declined':
            return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300';
    }
};

export const getStatusText = (status) => {
    switch (status) {
        case 'pending':
            return 'AWAITING BAKER';
        case 'discussion':
            return 'IN DISCUSSION';
        case 'quoted':
            return 'QUOTE READY';
        case 'reviewed':
            return 'REVIEWED';
        case 'approved':
            return 'APPROVED';
        case 'ordered':
            return 'ORDERED';
        case 'declined':
            return 'DECLINED';
        default:
            return 'UNKNOWN';
    }
};

export const StatusPill = ({ status }) => {
    const colorClass = getOrderStatusColor(status);
    const text = getStatusText(status);

    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${colorClass}`}>
            {text}
        </span>
    );
};

export const OrderProgressTracker = ({ status }) => {
    const steps = [
        { name: 'Order Review', statusKey: 'pending_review' },
        { name: 'Accepted/Baking', statusKey: 'baking' }, // This step now correctly matches the 'baking' status
        { name: 'Ready for Pickup', statusKey: 'ready_to_ship' },
        { name: 'Shipped / OTD', statusKey: 'shipped' },
        { name: 'Delivered', statusKey: 'completed' },
    ];

    let currentStepIndex = steps.findIndex(step => step.statusKey === status);
    if (status === 'accepted') currentStepIndex = 1;

    return (
        <div className="flex justify-between w-full mt-4 pt-4 px-2 border-t border-[#F3EFE0] dark:border-[#2C2622]">
            {steps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                    <div key={step.statusKey} className="flex flex-col items-center flex-1 relative px-1">

                        {/* Status Circle */}
                        <div className={`w-3 h-3 rounded-full mb-1 transition-all duration-500 ${isActive
                                ? isCurrent ? 'bg-[#C59D5F] ring-4 ring-[#C59D5F]/30' : 'bg-[#C59D5F]'
                                : 'bg-[#E6DCCF] dark:bg-[#2C2622]'
                            }`}></div>

                        {/* Status Label */}
                        <p className={`text-center text-[8px] sm:text-[10px] font-bold mt-1 leading-tight transition-colors ${isCurrent ? 'text-[#C59D5F] scale-110' : isActive ? 'text-[#4A403A] dark:text-[#F3EFE0]' : 'text-[#B0A69D]'
                            }`}>
                            {step.name}
                        </p>

                        {/* Connecting Line (Hidden for the last step) */}
                        {index < steps.length - 1 && (
                            <div className={`absolute top-[6px] left-[50%] w-[100%] h-0.5 transition-all duration-500 ${isActive ? 'bg-[#C59D5F]' : 'bg-[#E6DCCF] dark:bg-[#2C2622]'
                                }`}></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
