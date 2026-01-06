import React from 'react';
import * as Icons from '../Icons';

const UserProfileCard = ({ user, onEditClick }) => {
  const getInitials = (name) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      : 'U';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="w-full bg-white dark:bg-[#2C2622] rounded-3xl shadow-lg border border-[#E6DCCF] dark:border-[#4A403A] overflow-hidden transition-all duration-300 group">

      {/* Cover Photo Area - Reduced height on mobile */}
      <div className="relative h-24 sm:h-32 bg-gradient-to-r from-[#C59D5F] to-[#8B5E3C] overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('/assets/pattern.png')] opacity-10 mix-blend-overlay"></div>
      </div>

      <div className="px-4 sm:px-6 pb-4 sm:pb-6 relative">
        {/* Avatar Section - Adjusted for mobile */}
        <div className="flex justify-between items-end -mt-10 sm:-mt-12 mb-4">
          <div className="relative">
            <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-full border-[6px] border-white dark:border-[#2C2622] bg-[#F3EFE0] dark:bg-[#4A403A] flex items-center justify-center shadow-md overflow-hidden">
              {user?.image ? (
                <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-[#C59D5F]">
                  {getInitials(user?.name)}
                </span>
              )}
            </div>

            <button
              onClick={onEditClick}
              className="absolute bottom-0 right-0 bg-[#4A403A] text-white p-1.5 sm:p-2 rounded-full border-2 sm:border-4 border-white dark:border-[#2C2622] shadow-sm hover:bg-[#C59D5F] transition-colors"
              title="Edit Profile"
            >
              <Icons.Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="flex flex-col items-end mb-2 gap-2">
             {user?.role === 'seller' && (
                <span className="bg-[#C59D5F] text-white text-[9px] sm:text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Icons.Store className="w-3 h-3" /> Seller
                </span>
             )}
             <span className="bg-[#F3EFE0] dark:bg-[#4A403A] text-[#8B5E3C] dark:text-[#E6DCCF] text-[9px] sm:text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-[#E6DCCF] dark:border-[#5C5047]">
               {user?.role === 'admin' ? 'Admin' : user?.role === 'seller' ? 'Verified' : 'Member'}
            </span>
          </div>
        </div>

        {/* User Info - Adjusted for mobile */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A403A] dark:text-[#F3EFE0] leading-tight truncate">
            {user?.name || "Guest User"}
          </h2>
          <p className="text-xs sm:text-sm text-[#B0A69D] dark:text-[#E6DCCF] truncate font-medium mb-2">
            {user?.email || "No email provided"}
          </p>
          
          <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs text-[#8B5E3C] dark:text-[#C59D5F] mt-3">
             {user?.createdAt && (
                 <div className="flex items-center gap-1 bg-[#F9F7F2] dark:bg-[#4A403A]/30 px-2 py-1 rounded-lg">
                     <Icons.Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                     <span>Joined {formatDate(user.createdAt)}</span>
                 </div>
             )}
             {user?.address && (
                 <div className="flex items-center gap-1 bg-[#F9F7F2] dark:bg-[#4A403A]/30 px-2 py-1 rounded-lg max-w-[150px] sm:max-w-[200px] truncate">
                     <Icons.Location className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                     <span className="truncate">{user.address}</span>
                 </div>
             )}
          </div>
        </div>

        {/* Stats Grid - Adjusted for mobile */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-[#F9F7F2] dark:bg-[#4A403A]/50 p-2 sm:p-3 rounded-2xl text-center border border-[#E6DCCF] dark:border-[#4A403A] hover:border-[#C59D5F] transition-colors">
            <span className="block text-lg sm:text-xl font-extrabold text-[#4A403A] dark:text-[#F3EFE0]">
              {user?.designsCount || 0}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-[#B0A69D] uppercase tracking-wide">
              Designs
            </span>
          </div>

          <div className="bg-[#F9F7F2] dark:bg-[#4A403A]/50 p-2 sm:p-3 rounded-2xl text-center border border-[#E6DCCF] dark:border-[#4A403A] hover:border-[#C59D5F] transition-colors">
            <span className="block text-lg sm:text-xl font-extrabold text-[#4A403A] dark:text-[#F3EFE0]">
              {user?.ordersCount || 0}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-[#B0A69D] uppercase tracking-wide">
              Orders
            </span>
          </div>
          
          <div className="bg-[#F9F7F2] dark:bg-[#4A403A]/50 p-2 sm:p-3 rounded-2xl text-center border border-[#E6DCCF] dark:border-[#4A403A] hover:border-[#C59D5F] transition-colors">
            <span className="block text-lg sm:text-xl font-extrabold text-[#4A403A] dark:text-[#F3EFE0]">
              {user?.following?.length || 0}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-[#B0A69D] uppercase tracking-wide">
              Following
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfileCard;