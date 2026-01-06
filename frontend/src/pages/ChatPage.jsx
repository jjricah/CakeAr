// frontend/src/pages/ChatPage.jsx
import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import MessagesTab from '../components/MessagesTab';
import { AuthContext } from '../context/AuthContext';

// Helper hook to parse query parameters from the URL
const useQuery = () => new URLSearchParams(useLocation().search);

const ChatPage = () => {
    const { user } = useContext(AuthContext);
    const query = useQuery();
    // Extract the designId from the URL query parameters
    const designId = query.get('designId');
    const mode = query.get('mode') || 'buyer'; // Default to 'buyer' if not specified
    
    // State to track the currently active conversation
    const [activeChat, setActiveChat] = useState(null); 

    // Note: MainLayout should be imported from its actual location if different
    return (
        <MainLayout title="Messages" role={user?.role}>
            {/* The height calculation ensures the chat pane fills the remaining viewport space below the header */}
            <div className="h-[calc(100dvh-80px)] w-full"> 
                {/* Pass the extracted designId to MessagesTab for initialization */}
                <MessagesTab 
                    activeChat={activeChat} 
                    setActiveChat={setActiveChat} 
                    user={user} 
                    designIdFromQuery={designId} 
                    mode={mode}
                />
            </div>
        </MainLayout>
    );
};

export default ChatPage;