import React from 'react';
import * as Icons from '../Icons';

const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  variant = 'primary' // 'primary' or 'danger'
}) => {
  if (!isOpen) return null;

  const iconColor = variant === 'danger'
    ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-500';

  const Icon = variant === 'danger' ? Icons.XCircleIcon : Icons.CheckCircleIcon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#2C2622] rounded-[2rem] p-6 w-full max-w-md shadow-2xl border border-[#E6DCCF] dark:border-[#4A403A] transform scale-100 transition-all">
        <div className="text-center">
          <div className={`w-14 h-14 ${iconColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#4A403A] dark:text-[#F3EFE0] mb-2">{title}</h3>
          <p className="text-sm text-[#B0A69D] dark:text-[#E6DCCF] mb-6">{message}</p>
          <div className="flex">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#C59D5F] text-white transition"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
