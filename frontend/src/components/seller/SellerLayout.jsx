import * as Icons from '../Icons';
import logo from '../../assets/creake_logo.png';

// 1. Sidebar Component (Desktop)
export const SellerSidebar = ({ shopName, shopRating, shopLogo, activeTab, setActiveTab, onLogout, onSwitchToBuying }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Icons.Dashboard },
    { id: 'designs', label: 'Requests', icon: Icons.Edit },
    { id: 'orders', label: 'Orders', icon: Icons.Orders },
    { id: 'products', label: 'Cakes', icon: Icons.Products },
    { id: 'messages', label: 'Chat', icon: Icons.Message },
    { id: 'settings', label: 'Settings', icon: Icons.Settings },
  ];

  return (
    <aside className="w-64 bg-[#4A403A] text-[#F3EFE0] flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-20 hidden md:flex border-r border-[#C59D5F]/20">
      <div className="p-8 flex items-center gap-3 border-b border-[#C59D5F]/20">
        <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-white">
          {shopLogo ? (
            <img src={`${shopLogo}?t=${new Date().getTime()}`} alt={`${shopName} Logo`} className="w-full h-full object-cover" />
          ) : (
            <img src={logo} alt="CREAKE" className="h-7 w-auto p-1" /> // Fallback to CREAKE logo
          )}
        </div>        <div className="overflow-hidden">
          <h2 className="font-bold text-white text-sm tracking-wide truncate">{shopName || "SELLER"}</h2>
          <div className="flex items-center gap-1 text-[10px] text-[#C59D5F] font-medium tracking-widest mt-1">
            <Icons.Star /> {shopRating} RATING
          </div>
        </div>
      </div>
      <div className="flex-1 py-8 px-4 space-y-2">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm font-medium ${activeTab === item.id ? 'bg-[#C59D5F] text-white shadow-lg' : 'hover:bg-white/5 hover:text-[#C59D5F]'}`}>
            <item.icon /> {item.label}
          </button>
        ))}
      </div>
      <div className="p-6 border-t border-[#C59D5F]/20 space-y-2">
        <button onClick={onSwitchToBuying} className="w-full flex items-center justify-center gap-2 text-[#4A403A] dark:text-[#F3EFE0] bg-[#F3EFE0] dark:bg-[#2C2622] hover:bg-[#E6DCCF] dark:hover:bg-[#4A403A] px-2 py-3 text-sm transition rounded-xl font-bold shadow-sm">
          <Icons.ShoppingBag /> Switch to Buying
        </button>

      </div>
    </aside>
  );
};

// 2. Mobile Navigation Component
export const SellerMobileNav = ({ activeTab, setActiveTab, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Icons.Dashboard },
    { id: 'designs', label: 'Requests', icon: Icons.Edit },
    { id: 'orders', label: 'Orders', icon: Icons.Orders },
    { id: 'products', label: 'Cakes', icon: Icons.Products },
    { id: 'messages', label: 'Chat', icon: Icons.Message },
    { id: 'settings', label: 'Settings', icon: Icons.Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#4A403A] border-t border-[#E6DCCF] dark:border-[#2C2622] flex justify-around items-center h-16 md:hidden z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === item.id ? 'text-[#C59D5F]' : 'text-[#B0A69D]'}`}
        >
          <item.icon />
          <span className="text-[10px] font-bold">{item.label}</span>
        </button>
      ))}

    </div>
  );
};