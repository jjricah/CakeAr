import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import * as Icons from '../../components/Icons';
import { StatusPill } from '../../components/common/StatusHelpers';
import AlertModal from '../../components/common/AlertModal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';

const DesignInbox = () => {
    const navigate = useNavigate();
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'broadcast'

    // Modal States
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    useEffect(() => {
        fetchInbox();
    }, []);

    const fetchInbox = async () => {
        try {
            const res = await api.get('/designs/seller-inbox');
            setDesigns(res.data);
        } catch (err) {
            console.error("Failed to load inbox", err);
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS ---

    const handleView3D = (design) => {
        navigate('/cake-builder', {
            state: {
                initialConfig: design.config,
                isReadOnly: true,
                mode: 'review',
                customerName: design.user?.name || 'Customer'
            }
        });
    };

    const handleChat = async (design) => {
        try {
            // Start or find the conversation for this design
            const res = await api.post('/chat/start', { designId: design._id });
            
            // Navigate to the messages tab with the chat active
            navigate('/seller-dashboard', {
                state: {
                    activeTab: 'messages',
                    activeChat: {
                        _id: res.data.conversationId,
                        otherUser: res.data.otherUser,
                        design: design
                    }
                }
            });
        } catch (err) {
            console.error("Chat start failed", err);
            setAlertModal({ isOpen: true, title: 'Error', message: 'Could not start chat. Please try again.' });
        }
    };

    const handleAcceptRequest = async (design) => {
        try {
            // Assign to self and set status to discussion
            const res = await api.put(`/designs/${design._id}/status`, { 
                status: 'discussion',
                bakerNote: 'Request accepted. Reviewing details.'
            });
            
            // If a conversation was created/found, redirect to chat immediately
            if (res.data.conversationId) {
                navigate('/seller-dashboard', {
                    state: {
                        activeTab: 'messages',
                        activeChat: {
                            _id: res.data.conversationId,
                            otherUser: design.user?.name || 'Buyer',
                            design: design
                        }
                    }
                });
            } else {
                fetchInbox(); // Fallback refresh
                setActiveTab('direct'); 
            }
        } catch (err) {
            console.error("Accept failed", err);
            setAlertModal({ isOpen: true, title: 'Error', message: 'Failed to accept request.' });
        }
    };

    const handleReleaseRequest = async (design) => {
        setConfirmModal({
            isOpen: true,
            title: 'Release Request?',
            message: 'Are you sure you want to release this request? It will be available to other sellers again.',
            onConfirm: async () => {
                try {
                    await api.put(`/designs/${design._id}/status`, { status: 'released' });
                    fetchInbox();
                    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                } catch (err) {
                    console.error("Release failed", err);
                    setAlertModal({ isOpen: true, title: 'Error', message: 'Failed to release request.' });
                }
            }
        });
    };

    // --- FILTERING LOGIC ---
    // Robust check for request type, defaulting based on assignment if missing
    const getRequestType = (d) => d.requestType || (d.baker ? 'direct' : 'broadcast');

    const directRequests = designs.filter(d => getRequestType(d) === 'direct');
    const marketplaceRequests = designs.filter(d => getRequestType(d) === 'broadcast');

    const displayedDesigns = activeTab === 'direct' ? directRequests : marketplaceRequests;

    if (loading) return <div className="p-10 text-center text-[#B0A69D]">Loading requests...</div>;

    return (
        <>
            <AlertModal 
                isOpen={alertModal.isOpen}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
            />
            <ConfirmationModal 
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
            />
            <div className="space-y-6 animate-fade-in">
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6DCCF] dark:border-[#4A403A] pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[#4A403A] dark:text-[#F3EFE0]">Design Requests</h2>
                        <p className="text-sm text-[#B0A69D] dark:text-[#E6DCCF]">Manage custom cake inquiries.</p>
                    </div>
                    
                    <div className="flex bg-[#E6DCCF] dark:bg-[#2C2622] p-1 rounded-xl self-end sm:self-center">
                        <button 
                            onClick={() => setActiveTab('direct')}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'direct' ? 'bg-white dark:bg-[#4A403A] shadow-sm text-[#4A403A] dark:text-[#F3EFE0]' : 'text-[#B0A69D] dark:text-[#E6DCCF]'}`}
                        >
                            Direct ({directRequests.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('broadcast')}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'broadcast' ? 'bg-white dark:bg-[#4A403A] shadow-sm text-[#4A403A] dark:text-[#F3EFE0]' : 'text-[#B0A69D] dark:text-[#E6DCCF]'}`}
                        >
                            Marketplace ({marketplaceRequests.length})
                        </button>
                    </div>
                </div>

                {/* Request List */}
                <div className="grid grid-cols-1 gap-4">
                    {displayedDesigns.length === 0 ? (
                        <div className="text-center py-20 opacity-50 bg-white dark:bg-[#2C2622] rounded-2xl border border-dashed border-[#E6DCCF] dark:border-[#4A403A]">
                            <Icons.CakeOutline />
                            <p className="mt-2">No {activeTab === 'direct' ? 'direct' : 'marketplace'} requests found.</p>
                        </div>
                    ) : (
                        displayedDesigns.map(design => (
                            <div key={design._id} className="bg-white dark:bg-[#4A403A] p-4 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#2C2622] flex flex-col md:flex-row gap-4 transition hover:shadow-md">
                                <div className="w-full md:w-48 h-40 md:h-auto bg-[#F9F7F2] dark:bg-[#1E1A17] rounded-xl overflow-hidden border border-[#E6DCCF] dark:border-[#4A403A] relative group shrink-0">
                                    {design.snapshotImage ? (
                                        <img src={design.snapshotImage} alt="Design Snapshot" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#C59D5F]"><Icons.CakeSolid className="w-16 h-16 opacity-50"/></div>
                                    )}
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <button onClick={() => handleView3D(design)} className="bg-white/90 text-[#4A403A] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:scale-105 transition shadow-lg">
                                            <Icons.Edit3D /> View 3D
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-[#B0A69D] dark:text-[#E6DCCF]">#{design._id.slice(-6)}</span>
                                                    <StatusPill status={design.status} />
                                                </div>
                                                <h3 className="text-md font-bold text-[#4A403A] dark:text-[#F3EFE0]">
                                                    {design.config?.shape} Cake ({design.config?.layers?.length} Tier)
                                                </h3>
                                            </div>
                                            <div className="text-left sm:text-right mt-2 sm:mt-0">
                                                <p className="text-xs text-[#B0A69D] dark:text-[#E6DCCF]">Needed by</p>
                                                <p className="font-bold text-sm text-[#4A403A] dark:text-[#F3EFE0]">
                                                    {new Date(design.targetDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-[#F9F7F2] dark:bg-[#2C2622] p-3 rounded-xl border border-[#E6DCCF] dark:border-[#4A403A] mb-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Icons.User className="w-4 h-4 text-[#C59D5F]" />
                                                <span className="text-sm font-bold text-[#4A403A] dark:text-[#F3EFE0]">{design.user?.name || 'Guest'}</span>
                                            </div>
                                            {design.userNote && (
                                                <p className="text-xs text-[#4A403A] dark:text-[#F3EFE0] italic">"{design.userNote}"</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-[#F3EFE0] dark:border-[#2C2622]">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-[#B0A69D]">Budget</span>
                                            <span className="block text-md font-bold text-[#C59D5F]">~₱{design.estimatedPrice?.toLocaleString()}</span>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button onClick={() => handleView3D(design)} className="px-3 py-2 rounded-lg border border-[#E6DCCF] dark:border-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] font-bold text-xs hover:bg-[#F9F7F2] dark:hover:bg-[#4A403A] transition">
                                                Review
                                            </button>
                                            {activeTab === 'broadcast' ? (
                                                <button onClick={() => handleAcceptRequest(design)} className="px-3 py-2 rounded-lg bg-[#4A403A] text-white font-bold text-xs shadow-md hover:bg-[#2C2622] transition flex items-center gap-1.5">
                                                    <Icons.Check className="w-4 h-4" /> Accept
                                                </button>
                                            ) : (
                                                <>
                                                    {design.requestType === 'broadcast' && (
                                                        <button onClick={() => handleReleaseRequest(design)} className="px-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition">
                                                            Release
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleChat(design)} className="px-3 py-2 rounded-lg bg-[#C59D5F] text-white font-bold text-xs shadow-md hover:bg-[#B0894F] transition flex items-center gap-1.5">
                                                        <Icons.Chat /> Chat
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default DesignInbox;