// frontend/src/components/SubHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from './Icons';

// Modify to accept optional 'showBackButton' prop
const SubHeader = ({ title, rightAction, showBackButton = true }) => { 
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 bg-[#F3EFE0]/95 dark:bg-[#2C2622]/95 backdrop-blur-md z-30 px-4 py-3 flex items-center justify-between border-b border-[#E6DCCF] dark:border-[#4A403A]">
      <div className="flex items-center gap-4">
        {/* CONDITIONAL BACK BUTTON */}
        {showBackButton && ( 
          <button 
            onClick={() => navigate(-1)} 
            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#4A403A] rounded-full border border-[#E6DCCF] dark:border-[#2C2622] shadow-sm text-[#4A403A] dark:text-[#F3EFE0] hover:text-[#C59D5F] transition"
          >
            <Icons.Back />
          </button>
        )}
        <h1 className="text-lg font-bold text-[#4A403A] dark:text-[#F3EFE0] truncate max-w-[200px]">
          {title}
        </h1>
      </div>
      
      {/* Optional Right Side Button (e.g., Logout or Cart) */}
      {rightAction && (
        <div>{rightAction}</div>
      )}
    </div>
  );
};

export default SubHeader;