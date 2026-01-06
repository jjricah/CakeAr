import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import * as Icons from '../Icons';
import logo from '../../assets/creake_logo.png';

const AdminSidebar = () => {
    const { user, logout } = useContext(AuthContext);

    const navItems = [
        { path: '/admin-dashboard', label: 'Overview', icon: Icons.Home }, // Changed to Home
        { path: '/admin/users', label: 'Users', icon: Icons.User },
        { path: '/admin/products', label: 'Products', icon: Icons.Products },
        { path: '/admin/orders', label: 'Orders', icon: Icons.Orders },
        { path: '/admin/assets', label: '3D Assets', icon: Icons.CakeSolid },
        { path: '/admin/reports', label: 'Reports', icon: Icons.History },
    ];

    return (
        <aside className="w-64 bg-[#2C2622] text-[#F3EFE0] flex-col h-screen fixed left-0 top-0 shadow-2xl z-20 hidden md:flex border-r border-[#4A403A]">
            <div className="p-6 flex items-center gap-3 border-b border-[#4A403A]">
                <img src={logo} alt="CREAKE" className="h-9 w-auto bg-white p-1 rounded-lg" />
                <div>
                    <h2 className="font-bold text-white text-sm tracking-wide">Admin Panel</h2>
                    <p className="text-xs text-[#C59D5F]">{user?.name}</p>
                </div>
            </div>
            <nav className="flex-1 py-6 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin-dashboard'}
                        className={({ isActive }) =>
                            `w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                                isActive
                                    ? 'bg-[#C59D5F] text-white shadow-lg'
                                    : 'hover:bg-white/5 text-[#B0A69D] hover:text-white'
                            }`
                        }
                    >
                        {/* Force icon size consistency */}
                        <div className="w-5 h-5 flex items-center justify-center">
                             <item.icon className="w-5 h-5" />
                        </div>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-[#4A403A]">
                {/* The "Switch to Buying" button has been intentionally removed to improve the admin workflow. The "Back to Admin" button on the main site is the correct replacement. */}
                <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-[#B0A69D] hover:text-red-500 px-2 py-2 text-sm transition hover:bg-white/5 rounded-lg">
                    <Icons.Logout className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

const AdminMobileNav = () => {
    const navItems = [
        { path: '/admin-dashboard', label: 'Home', icon: Icons.Home },
        { path: '/admin/users', label: 'Users', icon: Icons.User },
        { path: '/admin/products', label: 'Products', icon: Icons.Products },
        { path: '/admin/orders', label: 'Orders', icon: Icons.Orders },
        { path: '/admin/assets', label: 'Assets', icon: Icons.CakeSolid },
        { path: '/admin/reports', label: 'Reports', icon: Icons.History },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full bg-[#2C2622] border-t border-[#4A403A] z-50 md:hidden pb-safe">
            <nav className="flex justify-around items-center h-16 px-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin-dashboard'}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                                isActive ? 'text-[#C59D5F]' : 'text-[#B0A69D]'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[9px] font-bold">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

const AdminLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#1E1A17]">
            <AdminSidebar />
            <main className="md:pl-64 pb-20 md:pb-0">
                {children}
            </main>
            <AdminMobileNav />
        </div>
    );
};

export default AdminLayout;