import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../services/api';
import SubHeader from '../components/SubHeader';
import * as Icons from '../components/Icons';

// NOTE: Updated Asset Types to match the database model enum
const ASSET_TYPES = ['Layer', 'Topper', 'Decoration', 'Shape', 'Frosting', 'Flavor', 'Size', 'Texture', 'LayerHeight'];

// --- NEW: Helper component for guided form inputs ---
const MetadataInput = ({ label, description, children }) => (
    <div>
        <label className="block text-xs font-bold uppercase text-[#B0A69D]">{label}</label>
        {description && <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">{description}</p>}
        {children}
    </div>
);

// --- NEW: Mobile Actions Dropdown for Assets ---
const ActionsDropdown = ({ asset, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <Icons.MoreVertical />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => { onEdit(asset); setIsOpen(false); }} 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                        Edit Asset
                    </button>
                    <button 
                        onClick={() => { onDelete(asset._id); setIsOpen(false); }} 
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        Delete Asset
                    </button>
                </div>
            )}
        </div>
    )
}

const AdminAssetManagement = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [selectedType, setSelectedType] = useState('All'); 

    // NEW: State for the filter modal
    const [showFilterModal, setShowFilterModal] = useState(false);
    
    // Initialize formData to include the metadata object
    const [formData, setFormData] = useState({
        name: '', 
        type: ASSET_TYPES[0], 
        modelUrl: '', 
        thumbnailUrl: '', 
        priceModifier: 0, 
        isAvailable: true,
        metadata: {} // Crucial: Initialize metadata object
    });

    useEffect(() => { fetchAssets(); }, []);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            // Fetch all assets (Admin view, filter happens on backend)
            const res = await api.get('/assets'); 
            setAssets(res.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load assets.");
        } finally {
            setLoading(false);
        }
    };
    
    const resetForm = () => {
        setEditingAsset(null);
        setFormData({ 
            name: '', 
            type: ASSET_TYPES[0], 
            modelUrl: '', 
            thumbnailUrl: '', 
            priceModifier: 0, 
            isAvailable: true,
            metadata: {} // Reset metadata when closing/clearing
        });
        setShowForm(false);
    };

    const handleEditClick = (asset) => {
        setEditingAsset(asset);
        // Ensure metadata is correctly loaded if it exists (defaults to {})
        setFormData({ ...asset, metadata: asset.metadata || {} }); 
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Special handling if the TYPE dropdown changes: reset metadata structure
        if (name === 'type') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                metadata: {} 
            }));
            return;
        }

        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };
    
    // NEW: Handles changes specifically for the nested metadata object
    const handleMetadataChange = (key, value) => {
        // Automatically convert multiplier/value fields to float/number
        let parsedValue = value;
        if (key === 'multiplier' || key === 'value') {
            parsedValue = parseFloat(value) || 0;
        }
        
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                [key]: parsedValue
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingAsset) {
                await api.put(`/assets/${editingAsset._id}`, formData);
                alert("Asset updated successfully!");
            } else {
                await api.post('/assets', formData);
                alert("New asset created successfully!");
            }
            fetchAssets();
            resetForm();
        } catch (err) {
            alert(err.response?.data?.message || "Operation failed.");
        } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently delete this asset? This cannot be undone.")) return;
        try {
            await api.delete(`/assets/${id}`);
            fetchAssets();
        } catch (err) { alert("Deletion failed."); }
    };
    
    // Helper function to render the dynamic metadata inputs
    const renderMetadataInputs = () => {
        switch (formData.type) {
            case 'Flavor': case 'Frosting':
                return (
                    <div className="md:col-span-2 space-y-4 pt-4 border-t border-[#E6DCCF] dark:border-[#4A403A]">
                        <h4 className="text-sm font-bold text-[#8B5E3C] uppercase">Color/Metadata</h4>
                        <MetadataInput label="Hex Color Code" description="The color used for 3D model rendering.">
                            <input 
                                type="text" 
                                value={formData.metadata.color || ''}
                                onChange={(e) => handleMetadataChange('color', e.target.value)} 
                                className="w-full p-3 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-xl outline-none text-base" 
                                placeholder="#F3E5AB"
                            />
                        </MetadataInput>
                    </div>
                );
            case 'Shape':
                return (
                    <div className="md:col-span-2 space-y-4 pt-4 border-t border-[#E6DCCF] dark:border-[#4A403A]">
                        <h4 className="text-sm font-bold text-[#8B5E3C] uppercase">Shape Multiplier</h4>
                        <MetadataInput label="Pricing Multiplier" description="Adjusts price based on complexity. Round is 1.0, Heart might be 1.3 (30% more).">
                            <input 
                                type="number" 
                                step="0.01"
                                value={formData.metadata.multiplier || 1.0}
                                onChange={(e) => handleMetadataChange('multiplier', e.target.value)} 
                                className="w-full p-3 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-xl outline-none text-base" 
                                placeholder="1.0"
                            />
                        </MetadataInput>
                    </div>
                );
            case 'LayerHeight':
                 return (
                    <div className="md:col-span-2 space-y-4 pt-4 border-t border-[#E6DCCF] dark:border-[#4A403A]">
                        <h4 className="text-sm font-bold text-[#8B5E3C] uppercase">Layer Height Configuration</h4>
                        <MetadataInput label="Numeric Value (Inches)" description="The actual height of the cake layer (e.g., 3, 4, 6).">
                            <input 
                                type="number" 
                                value={formData.metadata.value || ''}
                                onChange={(e) => handleMetadataChange('value', e.target.value)}
                                className="w-full p-3 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-xl outline-none text-base" 
                                placeholder="4"
                            />
                        </MetadataInput>
                    </div>
                );
            case 'Size':
                 return (
                    <div className="md:col-span-2 space-y-4 pt-4 border-t border-[#E6DCCF] dark:border-[#4A403A]">
                        <h4 className="text-sm font-bold text-[#8B5E3C] uppercase">Size Configuration</h4>
                        <MetadataInput label="Numeric Value (Inches/Diameter)" description="The actual diameter of the cake layer (e.g., 6, 8, 10).">
                            <input 
                                type="number" 
                                value={formData.metadata.value || ''}
                                onChange={(e) => handleMetadataChange('value', e.target.value)}
                                className="w-full p-3 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-xl outline-none text-base" 
                                placeholder="6"
                            />
                        </MetadataInput>
                    </div>
                );
           case 'Decoration':
                return (
                    <div className="md:col-span-2 space-y-4 pt-4 border-t border-[#E6DCCF] dark:border-[#4A403A]">
                        <h4 className="text-sm font-bold text-[#8B5E3C] uppercase">Decoration Config</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <MetadataInput label="Tab Location" description="Where this decoration appears in the customizer.">
                                <select 
                                    value={formData.metadata.tab || 'decor'}
                                    onChange={(e) => handleMetadataChange('tab', e.target.value)}
                                    className="w-full p-3 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-xl outline-none text-base"
                                >
                                    <option value="decor">Decor Tab</option>
                                    <option value="icing">Icing Tab (Piping)</option>
                                </select>
                            </MetadataInput>
                            <MetadataInput label="Behavior" description="Toggle on/off or allow quantity input?">
                                <div className="bg-[#F9F7F2] dark:bg-[#2C2622] p-3 rounded-xl h-full flex items-center">
                                    <label className="flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={!!formData.metadata.isCountable} 
                                            onChange={(e) => handleMetadataChange('isCountable', e.target.checked)} 
                                            className="w-4 h-4 accent-[#C59D5F]"
                                        />
                                        <span className="text-sm ml-2">Is Countable</span>
                                    </label>
                                </div>
                            </MetadataInput>
                        </div>
                    </div>
                );
            case 'Texture':
                return (
                    <div className="md:col-span-2 space-y-4 pt-4 border-t border-[#E6DCCF] dark:border-[#4A403A]">
                        <h4 className="text-sm font-bold text-[#8B5E3C] uppercase">Texture Metadata</h4>
                        <MetadataInput label="Texture Map URL" description="URL to the normal or displacement map image for this texture.">
                            <input 
                                type="text" 
                                value={formData.metadata.textureUrl || ''}
                                onChange={(e) => handleMetadataChange('textureUrl', e.target.value)}
                                className="w-full p-3 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-xl outline-none text-base" 
                                placeholder="/textures/ribbed_normal.png"
                            />
                        </MetadataInput>
                    </div>
                );
            case 'Topper': case 'Layer':
                // For Layer/Topper, we rely on the main inputs (Name, Price Modifier, Model URL)
                return null; 
            default:
                return null;
        }
    }
    
    // NEW LOGIC: Compute unique types from the fetched assets
    const uniqueTypes = useMemo(() => {
        // Collects unique 'type' values, filters out empty/null ones, and sorts them
        const types = new Set(assets.map(asset => asset.type).filter(Boolean));
        return ['All', ...Array.from(types).sort()];
    }, [assets]);

    // NEW LOGIC: Filter the asset list based on the selected type
    const filteredAssets = useMemo(() => {
        if (selectedType === 'All') {
            return assets;
        } 
        return assets.filter(asset => asset.type === selectedType);
    }, [assets, selectedType]);

    
    return (
        <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#1E1A17] pb-8">
            <SubHeader title="3D Asset Management" />
            
            <div className="max-w-7xl mx-auto p-4 md:p-6">
                
                <button
                    onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
                    className={`w-full md:w-auto mb-6 justify-center text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition active:scale-95 ${showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-[#C59D5F] hover:bg-[#B0894F]'}`}
                >
                    <Icons.Plus /> {showForm ? 'Close Form' : 'Add New Asset'}
                </button>

                {/* --- NEW: ADD/EDIT FORM (Full Screen Modal) --- */}
                {showForm && (
                    <div className="fixed inset-0 z-50 bg-[#F9F7F2] dark:bg-[#1E1A17] flex flex-col animate-fade-in">
                        {/* Header - Fixed at top */}
                        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-[#E6DCCF] dark:border-[#4A403A] bg-white dark:bg-[#2C2622] shadow-sm">
                            <h3 className="font-bold text-lg">{editingAsset ? 'Edit Asset' : 'New 3D Asset'}</h3>
                            <button onClick={resetForm} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition">✕</button>
                        </div>
                        
                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Row 1: Name & Type (Default row) */}
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1">Name</label>
                                    <input name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 bg-white dark:bg-[#2C2622] rounded-xl outline-none text-base" placeholder="e.g. Diamond Ring Topper" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1">Type</label>
                                    <select name="type" value={formData.type} onChange={handleChange} required className="w-full p-3 bg-white dark:bg-[#2C2622] rounded-xl outline-none text-base">
                                        {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                
                                {/* NEW: Conditional Metadata Fields */}
                                {renderMetadataInputs()}

                                {/* Standard Fields (Moved below metadata to prevent scroll jumps) */}
                                <div className="pt-4 border-t border-[#E6DCCF] dark:border-[#4A403A]">
                                    <label className="block text-xs font-bold uppercase mb-1">Model URL (GLB/GLTF - Optional)</label>
                                    <input name="modelUrl" value={formData.modelUrl} onChange={handleChange} className="w-full p-3 bg-white dark:bg-[#2C2622] rounded-xl outline-none text-base" placeholder="https://cdn.models/asset.glb" />
                                </div>
                                <div className="pt-4 border-t border-[#E6DCCF] dark:border-[#4A403A]">
                                    <label className="block text-xs font-bold uppercase mb-1">Thumbnail URL</label>
                                    <input name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} className="w-full p-3 bg-white dark:bg-[#2C2622] rounded-xl outline-none text-base" placeholder="https://cdn.images/thumb.png" />
                                </div>

                                {/* Row 3: Price Modifier & Availability */}
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1">Price Modifier (₱)</label>
                                    <input type="number" name="priceModifier" value={formData.priceModifier} onChange={handleChange} className="w-full p-3 bg-white dark:bg-[#2C2622] rounded-xl outline-none text-base" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 mt-4 cursor-pointer">
                                        <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="w-4 h-4 accent-[#C59D5F]" />
                                        <span className="text-sm font-bold">Available to Users</span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="md:col-span-2 mt-4">
                                    <button type="submit" disabled={loading} className="w-full py-3 bg-[#4A403A] text-white rounded-xl font-bold hover:bg-[#2C2622] transition disabled:opacity-70">
                                        {loading ? 'Saving...' : (editingAsset ? 'Update Asset' : 'Create Asset')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {error && <div className="text-red-500 bg-red-100 p-4 rounded-xl mb-4">{error}</div>}

                {/* --- NEW: FILTER UI (Button opens modal) --- */}
                <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                    <h3 className="text-xl font-bold">Total Assets: {filteredAssets.length}</h3>
                    <div className="flex items-center gap-2 ml-auto">
                        <button onClick={() => setShowFilterModal(true)} className="px-4 py-2 rounded-lg bg-white dark:bg-[#2C2622] border border-[#E6DCCF] dark:border-[#4A403A] text-sm font-bold flex items-center gap-2">
                            Filter: <span className="text-[#C59D5F]">{selectedType}</span>
                        </button>
                        <button onClick={fetchAssets} className="p-2 rounded-lg bg-white dark:bg-[#2C2622] border border-[#E6DCCF] dark:border-[#4A403A]" title="Refresh">
                            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                    </div>
                </div>

                {/* --- NEW: Filter Modal --- */}
                {showFilterModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white dark:bg-[#2C2622] w-full max-w-xs rounded-2xl p-5 shadow-2xl border border-[#C59D5F]">
                            <div className="flex justify-between items-center mb-4 border-b border-[#E6DCCF] dark:border-[#4A403A] pb-3">
                                <h3 className="text-xl font-bold">Filter by Type</h3>
                                <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-red-500">✕</button>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto space-y-2 custom-scrollbar">
                                {uniqueTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => { setSelectedType(type); setShowFilterModal(false); }}
                                        className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                                            type === selectedType 
                                                ? 'bg-[#C59D5F] text-white font-bold' 
                                                : 'bg-[#F9F7F2] dark:bg-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] hover:bg-[#E6DCCF] dark:hover:bg-[#5C5047]'
                                        }`}
                                    >
                                        {type}
                                        {type === selectedType && <Icons.Check />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ASSET LIST (Desktop Table + Mobile Cards) --- */}
                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading assets...</div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block bg-white dark:bg-[#2C2622] rounded-2xl shadow-lg overflow-hidden border border-[#E6DCCF]">
                        <table className="min-w-full divide-y divide-[#E6DCCF] dark:divide-[#4A403A]">
                            <thead className="bg-[#F9F7F2] dark:bg-[#4A403A]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-[#B0A69D] uppercase tracking-wider">Name / Preview</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-[#B0A69D] uppercase tracking-wider">Type / Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-[#B0A69D] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-[#B0A69D] uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F3EFE0] dark:divide-[#4A403A]">
                                {filteredAssets.map((asset) => (
                                    <tr key={asset._id} className="hover:bg-[#F9F7F2]/50 dark:hover:bg-[#2C2622]/50">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <img src={asset.thumbnailUrl || asset.modelUrl || 'https://placehold.co/40'} alt={asset.name} className="w-10 h-10 object-cover rounded-md border border-[#E6DCCF]" />
                                            <div className="font-medium text-[#4A403A] dark:text-[#F3EFE0]">{asset.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-[#B0A69D]">{asset.type}</div>
                                            {asset.metadata?.color && <div style={{backgroundColor: asset.metadata.color}} className="w-4 h-4 rounded-full border border-gray-300 mt-1"></div>}
                                            {asset.metadata?.value && <div className="text-xs text-[#B0A69D] mt-1">{asset.metadata.value} inches</div>}
                                            <div className="text-sm text-[#C59D5F]">₱{asset.priceModifier.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                asset.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {asset.isAvailable ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleEditClick(asset)} 
                                                className="text-[#C59D5F] hover:text-[#8B5E3C] mr-4 p-1 rounded-full hover:bg-[#F9F7F2] transition"
                                                title="Edit Asset"
                                            >
                                                <Icons.Edit />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(asset._id)} 
                                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50/50 transition"
                                                title="Delete Asset"
                                            >
                                                <Icons.Trash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                {/* --- NEW: MOBILE CARD VIEW --- */}
                <div className="block md:hidden space-y-4">
                    {filteredAssets.map((asset) => (
                        <div key={asset._id} className="bg-white dark:bg-[#2C2622] rounded-2xl p-4 shadow-lg border border-[#E6DCCF] dark:border-[#2C2622]">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
                                    <img src={asset.thumbnailUrl || 'https://placehold.co/40'} alt={asset.name} className="w-12 h-12 object-cover rounded-md border border-[#E6DCCF] flex-shrink-0" />
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-[#4A403A] dark:text-[#F3EFE0] truncate">{asset.name}</div>
                                        <div className="text-xs text-[#B0A69D] truncate">{asset.type}</div>
                                    </div>
                                </div>
                                <ActionsDropdown 
                                    asset={asset}
                                    onEdit={handleEditClick}
                                    onDelete={handleDelete}
                                />
                            </div>
                            <div className="mt-3 flex justify-between items-center">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${asset.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {asset.isAvailable ? 'Available' : 'Hidden'}
                                </span>
                                <span className="text-sm font-medium text-[#C59D5F]">₱{asset.priceModifier.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div></>
                )}
            </div>
        </div>
    );
};

export default AdminAssetManagement;