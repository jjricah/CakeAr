import React from 'react';
import * as Icons from '../Icons';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger' // 'danger' or 'primary'
}) => {
  if (!isOpen) return null;

  const confirmButtonColor = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-blue-600 hover:bg-blue-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#2C2622] rounded-[2rem] p-6 w-full max-w-md shadow-2xl border border-[#E6DCCF] dark:border-[#4A403A] transform scale-100 transition-all">
        <div className="text-center">
          <div className={`w-14 h-14 ${variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {variant === 'danger' ? <Icons.Trash className="w-6 h-6" /> : <Icons.CheckCircleIcon className="w-6 h-6" />}
          </div>
          <h3 className="text-xl font-bold text-[#4A403A] dark:text-[#F3EFE0] mb-2">{title}</h3>
          <p className="text-sm text-[#B0A69D] dark:text-[#E6DCCF] mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#F3EFE0] dark:bg-[#4A403A] transition"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-3.5 rounded-xl font-bold text-sm text-white ${confirmButtonColor} transition disabled:opacity-70 flex items-center justify-center gap-2`}
            >
              {isLoading ? <Icons.LoadingSpinner className="w-5 h-5" /> : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;