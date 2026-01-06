// frontend/src/pages/Dashboard.jsx
import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Components
import MainLayout from '../components/MainLayout';
import HomeTab from '../views/buyer/HomeTab';
import SearchTab from '../views/buyer/SearchTab';
import ProfileTab from '../views/buyer/ProfileTab';
import MessagesTab from '../components/MessagesTab';

const Dashboard = ({ activeTab, setActiveTab }) => {
  const { user, logout, savedDesigns } = useContext(AuthContext); 
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedChat, setSelectedChat] = useState(null);
  const [initialSearchType, setInitialSearchType] = useState('cakes'); 

  // ✅ FIXED: Handle incoming navigation state (e.g. from "Chat" button on Shop Profile)
  useEffect(() => {
    let initialChatData = null;
    
    // Check for the keys passed by ShopProfile or other components
    if (location.state?.initiateChat) {
        // This is the key used by the ShopProfile fix
        initialChatData = location.state.initiateChat;
    } else if (location.state?.activeConversation) {
        // Kept for backward compatibility if other components use this
        initialChatData = location.state.activeConversation;
    }

    if (initialChatData) {
        setSelectedChat(initialChatData);
        // FIX: Ensure the tab name is set to 'message'
        setActiveTab('message'); 
    } else if (location.state?.activeTab) {
      // Only set tab if no chat initiation is present
      setActiveTab(location.state.activeTab);
    }
    
    // FIX 3: Handle initial search type passed from ProfileTab
    if (location.state?.initialSearchType) {
        setInitialSearchType(location.state.initialSearchType);
    }
    
    // Clean up history state so refresh doesn't reset it
    window.history.replaceState({}, document.title);
    
  }, [location.state, user?.role, setActiveTab]);


  const renderContent = () => {
    if (activeTab === 'home') {
        return (
            <div className="flex-grow">
                <HomeTab user={user} />
            </div>
        );
    } else if (activeTab === 'search') {
        // Search needs to be wrapped for MD
        return (
            <div className="flex-grow">
                <SearchTab navigate={navigate} initialType={initialSearchType} />
            </div>
        );
    } else if (activeTab === 'message') { // ✅ CRITICAL: Tab name is 'message'
        // Guest View for Messages
        if (!user) {
            return (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
                    <div className="w-24 h-24 bg-[#F3EFE0] dark:bg-[#2C2622] rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                        💬
                    </div>
                    <h2 className="text-2xl font-bold text-[#4A403A] dark:text-[#F3EFE0] mb-3">Login to chat</h2>
                    <p className="text-[#B0A69D] dark:text-[#E6DCCF] mb-8 text-sm max-w-xs mx-auto">
                        Connect with bakers, discuss designs, and track your custom orders.
                    </p>
                    <button 
                        onClick={() => navigate('/login')} 
                        className="px-10 py-3.5 bg-[#C59D5F] text-white rounded-xl font-bold shadow-lg hover:bg-[#B0894F] transition w-full max-w-xs active:scale-95"
                    >
                        Login / Sign Up
                    </button>
                </div>
            );
        }

        // Messages needs a fixed size or a controlled container
        return (
            <div className="w-full max-w-7xl mx-auto bg-white dark:bg-[#4A403A] md:rounded-2xl shadow-sm border-y md:border border-[#E6DCCF] dark:border-[#2C2622] overflow-hidden flex-grow flex">
                <MessagesTab 
                    // CRITICAL: Pass the state and setter correctly
                    activeChat={selectedChat} 
                    setActiveChat={setSelectedChat} 
                    user={user} 
                    mode="buyer"
                />
            </div>
        );
    } else if (activeTab === 'profile') {
        // Guest View for Profile Tab
        if (!user) {
            return (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
                    <div className="w-24 h-24 bg-[#F3EFE0] dark:bg-[#2C2622] rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                        👤
                    </div>
                    <h2 className="text-2xl font-bold text-[#4A403A] dark:text-[#F3EFE0] mb-3">Login to view profile</h2>
                    <p className="text-[#B0A69D] dark:text-[#E6DCCF] mb-8 text-sm max-w-xs mx-auto">
                        Sign in to track your orders, save your cake designs, and manage your account settings.
                    </p>
                    <button 
                        onClick={() => navigate('/login')} 
                        className="px-10 py-3.5 bg-[#C59D5F] text-white rounded-xl font-bold shadow-lg hover:bg-[#B0894F] transition w-full max-w-xs active:scale-95"
                    >
                        Login / Sign Up
                    </button>
                </div>
            );
        }

        // Profile is best contained to max-w-lg for readability
        return (
            <div className="flex-grow">
                <ProfileTab 
                    user={user} 
                    navigate={navigate} 
                    logout={() => { logout(); navigate('/login'); }} 
                    savedDesigns={savedDesigns} 
                />
            </div>
        );
    }
    return null;
  };

  return renderContent();
};

export default Dashboard;