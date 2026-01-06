import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Back, Image, Send, CurrencyDollarIcon, XCircleIcon, LoadingSpinner, Search } from './Icons'; 
import { format, isToday, isYesterday } from 'date-fns'; 
// ✅ NEW IMPORT: Import the QuotationCard component
import QuotationCard from './chat/QuotationCard'; 

// Helper function to convert file to Base64 Data URL (for image upload)
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

// This component receives activeChat and setActiveChat as props from the Dashboard
// Note: Removed unused 'role' prop
const MessagesTab = ({ activeChat, setActiveChat, user, designIdFromQuery, mode = 'buyer' }) => { // Assume designIdFromQuery is still passed by ChatPage
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state for initial fetch
  const [messagesLoading, setMessagesLoading] = useState(false); // Loading state for messages
  const [shopData, setShopData] = useState(null); // Store shop details for seller mode
  const [searchTerm, setSearchTerm] = useState(''); // Search state for conversations

  // --- QUOTE MODAL STATE ---
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteNote, setQuoteNote] = useState('');
  const [shippingFee, setShippingFee] = useState('');
  const [downpayment, setDownpayment] = useState('');
  const [paymentPref, setPaymentPref] = useState('any'); // 'any' or 'gcash_only'
  const [submittingQuote, setSubmittingQuote] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Scrolls to the latest message whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- EFFECT: Fetch Shop Data if in Seller Mode ---
  useEffect(() => {
    if (mode === 'seller') {
        api.get('/shop/me')
            .then(res => setShopData(res.data.shop))
            .catch(err => console.error("Failed to fetch shop profile for chat:", err));
    }
  }, [mode]);

  // --- API CALLS ---

  const fetchConversations = useCallback(async (shouldSelectDesignChat = false) => {
    try {
        // Pass the mode to the backend to get the correct list
        const res = await api.get('/chat', { params: { mode } });
        setConversations(res.data);
        
        // Logic to select chat after loading conversations (Handles logic from ChatPage)
        if (shouldSelectDesignChat && designIdFromQuery) {
            const designConv = res.data.find(c => c.design?._id === designIdFromQuery);
            if (designConv) {
                setActiveChat(designConv);
            }
        } else if (activeChat && res.data.length > 0) {
            const updatedChat = res.data.find(c => c._id === activeChat._id);
            if (updatedChat) setActiveChat(updatedChat);
            else setActiveChat(res.data[0]);
        } else if (res.data.length > 0) {
            setActiveChat(res.data[0]);
        } else {
            setActiveChat(null);
        }
    } catch (err) {
        console.error("Conversation fetch failed:", err);
    } finally {
        setLoading(false);
    }
  }, [activeChat, setActiveChat, designIdFromQuery, mode]); // Include designIdFromQuery dependency

  const fetchMessages = useCallback(async () => {
    if (!activeChat?._id) return;
    setMessagesLoading(true);
    try {
        const res = await api.get(`/chat/${activeChat._id}/messages`);
        setMessages(res.data);
    } catch (err) {
        console.error("Message fetch failed:", err);
    } finally {
        setMessagesLoading(false);
    }
  }, [activeChat]);
  
  // --- EFFECT: Handles incoming designId query parameter (from ChatPage.jsx) ---
  useEffect(() => {
    const startDesignChat = async () => {
        if (!designIdFromQuery) return;

        setLoading(true);

        try {
            await api.post('/chat/start', { designId: designIdFromQuery });
            await fetchConversations(true); 
            
        } catch (err) {
            console.error("Failed to start design chat:", err);
            fetchConversations();
        }
    };
    
    if (designIdFromQuery) {
        startDesignChat();
    } else {
        fetchConversations();
    }

  }, [designIdFromQuery]); // Only re-run when designIdFromQuery changes


  useEffect(() => {
    if (activeChat?._id) {
        fetchMessages();
    }
  }, [activeChat, fetchMessages]); 

  useEffect(scrollToBottom, [messages]); // Scroll when messages update

  // --- SEND HANDLERS ---

  const handleSend = async (imageUrl = null) => {
    if (!activeChat?._id || (!inputValue.trim() && !imageUrl)) return;

    const textToSend = inputValue.trim();
    setInputValue("");
    
    // Determine sender identity for Optimistic UI
    const senderProfile = (mode === 'seller' && shopData) 
        ? { _id: shopData._id, name: shopData.shopName, shopName: shopData.shopName }
        : { _id: user._id, name: user.name, shopName: user.shopName };

    // Optimistic UI update for text message
    setMessages(prev => [...prev, {
        _id: Date.now(), // Temp ID
        conversationId: activeChat._id,
        sender: senderProfile, 
        text: textToSend,
        image: imageUrl,
        createdAt: new Date(),
    }]);

    try {
        // Correct endpoint now uses conversationId in URL
        await api.post(`/chat/${activeChat._id}/messages`, {
            content: textToSend, 
            image: imageUrl 
        });

        // Refetch to get server-validated messages and update conversation list
        fetchMessages(); 
        fetchConversations();

    } catch (err) {
        console.error("Send message failed:", err);
        alert("Failed to send message."); 
    }
  };

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64Image = await convertToBase64(file);
      await handleSend(base64Image); // Send the message with the image data
    } catch (err) {
      console.error("Image upload error:", err);
    } finally {
      setUploading(false);
      e.target.value = null; 
    }
  };

  // --- QUOTE HANDLER (SELLER) ---
  const handleSendQuote = async (e) => {
    e.preventDefault();
    if (!quotePrice || !activeChat?.design?._id) return;

    setSubmittingQuote(true);
    try {
        await api.put(`/designs/${activeChat.design._id}/status`, {
            status: 'quoted',
            finalPrice: parseFloat(quotePrice),
            bakerNote: quoteNote,
            shippingFee: parseFloat(shippingFee) || 0,
            paymentPreference: paymentPref,
            downpaymentAmount: parseFloat(downpayment) || 0
        });
        
        setShowQuoteModal(false);
        setQuotePrice('');
        setQuoteNote('');
        fetchMessages(); // Refresh chat to see the new quote message
        fetchConversations(); // Refresh list to update status preview
    } catch (err) {
        console.error("Failed to send quote:", err);
        alert("Failed to send quote.");
    } finally {
        setSubmittingQuote(false);
    }
  };

  // --- HELPERS ---
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => 
      c.otherUser?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  const getMessageDateLabel = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // --- MESSAGE RENDERING ---

  const renderMessage = (message) => {
    // Sender is populated by the backend: message.sender is an object { _id, name, shopName }
    // Optimistic message will have sender as object too.
    const senderName = message.sender?.shopName || message.sender?.name || 'User';
    
    let isSelf = false;
    if (mode === 'seller') {
        isSelf = message.sender?._id === shopData?._id;
    } else {
        isSelf = message.sender?._id === user._id;
    }

    // Base CSS classes for styling
    const baseClasses = "max-w-[85%] md:max-w-[60%] p-3 rounded-xl shadow-md";
    const selfClasses = "bg-[#C59D5F] text-white ml-auto rounded-br-none";
    const otherClasses = "bg-[#F3EFE0] dark:bg-[#2C2622] text-[#4A403A] dark:text-[#E6DCCF] rounded-tl-none";

    // Handle specialized message types
    if (message.messageType === 'quotation') {
        return (
            <div key={message._id} className="my-4 w-full">
                <QuotationCard 
                    message={message} 
                    senderName={senderName} 
                    // Pass a function to refresh messages/conversations after action
                    onUpdateChat={() => { fetchMessages(); fetchConversations(); }}
                />
            </div>
        );
    }

    // Standard Text/Image Message Rendering
    return (
        <div key={message._id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'} my-2`}>
            <div className={`${baseClasses} ${isSelf ? selfClasses : otherClasses}`}>
                {!isSelf && (
                    <p className="text-xs font-bold mb-1 opacity-80">{senderName}</p>
                )}
                {message.text && <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>}
                {message.image && <img src={message.image} alt="Sent Image" className="mt-2 rounded-lg max-h-48" />}
                <p className={`text-[10px] mt-1 ${isSelf ? 'text-white/70' : 'text-[#B0A69D] dark:text-[#F3EFE0]/60'} text-right`}>
                    {/* ✅ FIX 2: Check if createdAt is a valid date before formatting */}
                    {message.createdAt && !isNaN(new Date(message.createdAt)) ? format(new Date(message.createdAt), 'hh:mm a') : '...'}
                </p>
            </div>
        </div>
    );
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = {};
    messages.forEach(msg => {
      const dateLabel = getMessageDateLabel(msg.createdAt);
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(msg);
    });
    return groups;
  }, [messages]);

  // --- MAIN RENDER ---

  if (loading) return <div className="p-10 text-center text-gray-400">Loading Chat...</div>;

  return (
    <div className="flex h-full w-full">
        {/* Left Pane: Conversation List */}
        <div className={`w-full md:w-1/3 border-r border-[#E6DCCF] dark:border-[#2C2622] flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Conversation List Header */}
            <div className="p-4 font-bold text-lg text-[#4A403A] dark:text-[#F3EFE0]">
                Messages
            </div>

            {/* Search Bar */}
            <div className="px-4 pb-4">
                <div className="flex items-center bg-[#F9F7F2] dark:bg-[#1E1A17] border border-[#E6DCCF] dark:border-[#4A403A] rounded-xl px-3 py-2">
                    <Search className="w-4 h-4 text-[#B0A69D]" />
                    <input 
                        type="text" 
                        placeholder="Search chats..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm ml-2 w-full text-[#4A403A] dark:text-[#F3EFE0] placeholder-[#B0A69D]"
                    />
                </div>
            </div>

            {/* Conversation List Items */}
            <div className="flex-1 overflow-y-auto border-t border-[#E6DCCF] dark:border-[#2C2622]">
                {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[#B0A69D]">
                        {searchTerm ? 'No chats found.' : 'No conversations yet.'}
                    </div>
                ) : (
                    filteredConversations.map(conv => {
                        // The backend now sends 'otherUser' and the relevant dates
                        const isSelected = activeChat?._id === conv._id;
                        
                        // Display Design ID in chat list if available
                        const chatTitle = conv.design 
                            ? `${conv.otherUser} (Design #${conv.design._id.slice(-4)})`
                            : conv.otherUser;

                        // ✅ FIX 3: Check if lastMessageAt is a valid date before formatting
                        const displayDate = conv.lastMessageAt && !isNaN(new Date(conv.lastMessageAt)) 
                            ? format(new Date(conv.lastMessageAt), 'MMM dd') 
                            : 'N/A';
                        
                        return (
                            <div
                                key={conv._id}
                                onClick={() => setActiveChat(conv)}
                                className={`flex items-center p-4 cursor-pointer border-l-4 ${
                                    isSelected 
                                        ? 'bg-[#F9F7F2] dark:bg-[#2C2622] border-[#C59D5F]' 
                                        : 'hover:bg-gray-50 dark:hover:bg-[#4A403A] border-transparent'
                                }`}
                            >
                                {/* Avatar: Use the first letter of the other user's name */}
                                <div className="w-10 h-10 rounded-full bg-[#E6DCCF] dark:bg-[#C59D5F] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    {conv.otherUser?.[0] || 'U'}
                                </div>
                                {/* Text */}
                                <div className="flex-1 ml-3 overflow-hidden">
                                    <p className="font-bold text-[#4A403A] dark:text-[#F3EFE0] truncate">
                                        {chatTitle}
                                    </p>
                                    <p className="text-xs text-[#B0A69D] dark:text-[#E6DCCF] truncate">
                                        {conv.lastMessage}
                                    </p>
                                </div>
                                <span className="text-[10px] text-[#B0A69D] dark:text-[#E6DCCF] flex-shrink-0">
                                    {displayDate}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>

        {/* Right Pane: Message Viewer */}
        <div className={`w-full md:w-2/3 flex-col h-full overflow-hidden ${activeChat ? 'flex' : 'hidden md:flex'}`}>
            {!activeChat ? (
                <div className="flex-1 flex items-center justify-center text-[#B0A69D]">Select a conversation to start chatting.</div>
            ) : (
                <>
                    {/* Message Viewer Header */}
                    <div className="p-4 border-b border-[#E6DCCF] dark:border-[#2C2622] flex items-center">
                        <button onClick={() => setActiveChat(null)} className="md:hidden mr-3 p-1 text-[#4A403A] dark:text-[#F3EFE0]">
                            <Back className="w-5 h-5" />
                        </button>
                        <h4 className="font-bold text-lg text-[#4A403A] dark:text-[#F3EFE0]">
                            {activeChat.otherUser || 'Chat'}
                        </h4>
                    </div>

                    {/* Message List */}
                    <div className="flex-1 overflow-y-auto min-h-0 p-2 md:p-4 custom-scrollbar bg-[#F9F7F2]/30 dark:bg-[#1E1A17]/30">
                        <div className="flex flex-col space-y-2">
                            {messagesLoading ? (
                                <div className="text-center text-sm text-[#B0A69D] py-10">Loading messages...</div>
                            ) : (
                                Object.keys(groupedMessages).map(dateLabel => (
                                    <div key={dateLabel}>
                                        <div className="flex justify-center my-4">
                                            <span className="text-[10px] font-bold text-[#B0A69D] bg-[#F9F7F2] dark:bg-[#1E1A17] px-3 py-1 rounded-full border border-[#E6DCCF] dark:border-[#2C2622]">
                                                {dateLabel}
                                            </span>
                                        </div>
                                        {groupedMessages[dateLabel].map(msg => renderMessage(msg))}
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Message Input */}
                    {/* QUOTE MODAL OVERLAY */}
                    {showQuoteModal && (
                        <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-[#2C2622] w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-[#C59D5F] animate-fade-in">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-[#4A403A] dark:text-[#F3EFE0]">Send Counter Offer</h3>
                                    <button onClick={() => setShowQuoteModal(false)} className="text-gray-400 hover:text-red-500"><XCircleIcon className="w-6 h-6" /></button>
                                </div>
                                <form onSubmit={handleSendQuote} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-[#B0A69D] mb-1">Final Price (₱)</label>
                                        <input 
                                            type="number" 
                                            required 
                                            min="0"
                                            step="0.01"
                                            value={quotePrice} 
                                            onChange={(e) => setQuotePrice(e.target.value)} 
                                            className="w-full p-3 bg-[#F9F7F2] dark:bg-[#4A403A] rounded-xl font-bold text-lg text-[#C59D5F] outline-none border-2 border-transparent focus:border-[#C59D5F]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    
                                    {/* NEW: Downpayment Input */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-[#B0A69D] mb-1">Downpayment (Optional)</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            step="0.01"
                                            value={downpayment} 
                                            onChange={(e) => setDownpayment(e.target.value)} 
                                            className="w-full p-3 bg-[#F9F7F2] dark:bg-[#4A403A] rounded-xl font-bold text-[#4A403A] dark:text-[#F3EFE0] outline-none border-2 border-transparent focus:border-[#C59D5F]"
                                            placeholder="e.g., 500"
                                        />
                                    </div>

                                    {/* NEW: Shipping Fee Input */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-[#B0A69D] mb-1">Shipping Fee (₱)</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            step="0.01"
                                            value={shippingFee} 
                                            onChange={(e) => setShippingFee(e.target.value)} 
                                            className="w-full p-3 bg-[#F9F7F2] dark:bg-[#4A403A] rounded-xl font-bold text-[#4A403A] dark:text-[#F3EFE0] outline-none border-2 border-transparent focus:border-[#C59D5F]"
                                            placeholder="0.00 (Leave empty for free/standard)"
                                        />
                                    </div>

                                    {/* NEW: Payment Preference */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-[#B0A69D] mb-1">Payment Terms</label>
                                        <select 
                                            value={paymentPref}
                                            onChange={(e) => setPaymentPref(e.target.value)}
                                            className="w-full p-3 bg-[#F9F7F2] dark:bg-[#4A403A] rounded-xl text-sm outline-none border-2 border-transparent focus:border-[#C59D5F] dark:text-[#F3EFE0]"
                                        >
                                            <option value="any">Allow COD or GCash</option>
                                            <option value="gcash_only">Require GCash (Pre-payment)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-[#B0A69D] mb-1">Note (Optional)</label>
                                        <textarea 
                                            rows="3" 
                                            value={quoteNote} 
                                            onChange={(e) => setQuoteNote(e.target.value)} 
                                            className="w-full p-3 bg-[#F9F7F2] dark:bg-[#4A403A] rounded-xl text-sm outline-none border-2 border-transparent focus:border-[#C59D5F] dark:text-[#F3EFE0]"
                                            placeholder="Details about this offer..."
                                        />
                                    </div>
                                    <button type="submit" disabled={submittingQuote} className="w-full py-3 bg-[#C59D5F] text-white rounded-xl font-bold shadow-md hover:bg-[#B0894F] disabled:opacity-70 flex justify-center items-center gap-2">
                                        {submittingQuote ? <LoadingSpinner className="w-5 h-5" /> : <><CurrencyDollarIcon className="w-5 h-5" /> Send Offer</>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="p-2 md:p-4 border-t border-[#E6DCCF] dark:border-[#2C2622] flex items-center gap-2 bg-white dark:bg-[#4A403A] sticky bottom-0 z-10">
                        {/* Hidden file input for image upload */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            disabled={uploading}
                        />
                        
                        {/* SELLER ACTION: Create Offer Button */}
                        {mode === 'seller' && activeChat?.design && (
                            <button 
                                onClick={() => setShowQuoteModal(true)}
                                className="p-2 rounded-full text-[#C59D5F] bg-[#F9F7F2] dark:bg-[#1E1A17] hover:bg-[#E6DCCF] dark:hover:bg-[#5C5047] flex-shrink-0 border border-[#C59D5F]/30"
                                title="Create Offer"
                            >
                                <CurrencyDollarIcon className="w-5 h-5" />
                            </button>
                        )}

                        <button 
                            onClick={handleImageSelect}
                            disabled={uploading}
                            className="p-2 rounded-full text-[#4A403A] dark:text-[#E6DCCF] bg-[#F9F7F2] dark:bg-[#1E1A17] hover:bg-[#E6DCCF] dark:hover:bg-[#5C5047] disabled:opacity-50 flex-shrink-0"
                        >
                            <Image /> 
                        </button>
                        <div className="flex-1 bg-[#F9F7F2] dark:bg-[#1E1A17] rounded-full px-3 md:px-4 py-2 flex items-center border border-[#E6DCCF] dark:border-[#4A403A]">
                            <input 
                                value={inputValue} 
                                onChange={(e) => setInputValue(e.target.value)} 
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                                placeholder={uploading ? "Uploading..." : "Type message..."}
                                className="flex-1 bg-transparent outline-none text-sm text-[#4A403A] dark:text-[#F3EFE0] placeholder-gray-400"
                                disabled={uploading}
                            />
                        </div>
                        <button onClick={() => handleSend()} disabled={(!inputValue.trim() && !uploading)} className="p-2 rounded-full text-white bg-[#C59D5F] hover:bg-[#B0894F] disabled:opacity-50 flex-shrink-0">
                            <Send />
                        </button>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};

export default MessagesTab;