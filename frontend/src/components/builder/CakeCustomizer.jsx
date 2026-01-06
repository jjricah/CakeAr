// frontend/src/components/builder/CakeCustomizer.jsx
import { useState } from 'react';

// ✅ FIX: Import all required icons by their named exports
import {
    ShapeToolIcon, LayersToolIcon, IcingToolIcon, TextureIcon,
    DecorToolIcon, TextToolIcon,
    Check, UndoIcon, RedoIcon // Also need Undo/Redo/Check icons
} from '../Icons';

// --- CUSTOM SVG SHAPE ICONS (unchanged) ---
const ShapeIcons = {
    Round: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8" /></svg>,
    Square: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="1" /></svg>,
    Heart: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>,
    Rectangle: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="6" width="18" height="12" rx="1" /></svg>,
};

// --- FONT OPTIONS FOR MESSAGE CONFIGURATION (NEW) ---
const FONT_OPTIONS = [
    { name: 'Standard (Sans-Serif)', value: 'sans-serif' },
    { name: 'Classic (Serif)', value: 'serif' },
    { name: 'Script (Cursive)', value: 'cursive' },
    { name: 'Block (Monospace)', value: 'monospace' },
];

// Mapping tab names to the actual imported component
const TabComponentMap = {
    shape: ShapeToolIcon,
    layers: LayersToolIcon,
    icing: IcingToolIcon,
    texture: TextureIcon,
    message: TextToolIcon,
    decor: DecorToolIcon,
};

const CakeCustomizer = ({
    config,
    setConfig,
    limits = {},
    assetOptions = {},
    resetConfig,
    undo,
    redo,
    canUndo,
    canRedo
}) => {
    const [activeTab, setActiveTab] = useState('shape');

    const {
        shapes = [],
        flavors = [],
        frostings = [],
        sizes = [],
        toppings = [],
        textures = [],
        heights = []
    } = assetOptions;

    // --- HELPERS ---
    const updateConfig = (key, value) => setConfig({ ...config, [key]: value });

    const updateMessageConfig = (key, value) => setConfig({
        ...config,
        messageConfig: { ...config.messageConfig, [key]: value }
    });

    // --- HANDLERS ---
    const handleLayerChange = (layerIndex, newFlavor) => {
        const newLayers = config.layers.map((layer, index) => {
            if (index === layerIndex) {
                return { ...layer, flavor: newFlavor };
            }
            return layer;
        });
        setConfig({ ...config, layers: newLayers });
    };
    const handleLayerWidthChange = (layerIndex, newWidthStr) => {
        const newWidth = parseInt(newWidthStr, 10);
        
        // ✅ FIX: Use .map for an immutable update, creating a new array with new objects
        let updatedLayers = config.layers.map((layer, index) => {
            if (index === layerIndex) {
                return { ...layer, width: newWidth };
            }
            return layer;
        });

        // Cascade the change downwards: ensure no upper layer is wider than the one below it
        for (let i = layerIndex + 1; i < updatedLayers.length; i++) {
            const layerBelowWidth = updatedLayers[i - 1].width;
            if (updatedLayers[i].width > layerBelowWidth) {
                // Create a new object for the cascaded layer as well
                updatedLayers[i] = { ...updatedLayers[i], width: layerBelowWidth };
            }
        }
        setConfig({ ...config, layers: updatedLayers });
    };
    const handleLayerHeightChange = (layerIndex, newHeightStr) => {
        const newHeight = parseInt(newHeightStr, 10);
        // ✅ FIX: Use .map for an immutable update
        const newLayers = config.layers.map((layer, index) => 
            index === layerIndex ? { ...layer, height: newHeight } : layer
        );
        setConfig({ ...config, layers: newLayers });
    };

    const addLayer = () => !limits.lockLayers && config.layers.length < 5 && setConfig({ ...config, layers: [...config.layers, { id: Date.now(), flavor: 'Vanilla', width: 6, height: 4 }] }); const removeLayer = (i) => !limits.lockLayers && config.layers.length > 1 && setConfig({ ...config, layers: config.layers.filter((_, idx) => idx !== i) });

    const toggleTopping = (t) => !limits.lockToppings && setConfig({ ...config, toppings: { ...config.toppings, [t]: !config.toppings[t] } });
    const updateToppingQuantity = (t, c) => {
        if (limits.lockToppings) return;
        const currentValue = config.toppings[t] || 0;
        const n = Math.max(0, currentValue + c);
        if (n <= 12) setConfig({ ...config, toppings: { ...config.toppings, [t]: n } });
    };


    // --- RENDERERS ---
    const renderShapeTab = () => (
        <div className="animate-fade-in">
            <label className="block text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase tracking-wider mb-3">Base Shape</label>
            <div className="grid grid-cols-2 gap-3">
                {shapes.map((asset) => (
                    <button
                        key={asset.name}
                        onClick={() => updateConfig('shape', asset.name)}
                        className={`py-6 rounded-xl text-sm font-bold transition-all border flex flex-col items-center justify-center gap-2
                    ${config.shape === asset.name
                                ? 'bg-[#4A403A] dark:bg-[#C59D5F] text-white border-[#4A403A] dark:border-[#C59D5F] shadow-md'
                                : 'bg-white dark:bg-[#2C2622] text-[#B0A69D] border-[#E6DCCF] dark:border-[#4A403A] hover:text-[#8B5E3C] dark:hover:text-[#F3EFE0] hover:bg-[#F9F7F2] dark:hover:bg-[#4A403A]'}`}
                    >
                        <span className="scale-125">{ShapeIcons[asset.name] ? ShapeIcons[asset.name]() : <ShapeToolIcon />}</span>
                        {asset.name}
                    </button>
                ))}
                {shapes.length === 0 && <p className="text-xs text-red-500">No shapes configured by admin.</p>}
            </div>
            <p className="text-[10px] text-[#B0A69D] dark:text-[#E6DCCF] mt-4 leading-relaxed">Select the foundation of your cake.</p>
        </div>
    );

    const renderLayersTab = () => (
        <div className="animate-fade-in space-y-4">
            {config.layers.map((layer, index) => {
                // Determine the maximum allowed width for this layer
                const maxWidth = index > 0 ? config.layers[index - 1].width : Infinity;
                // Filter the available sizes based on the layer below
                const availableSizes = sizes.filter(size => (size.metadata?.value || 0) <= maxWidth);

                return (
                    <div key={index} className="bg-[#F9F7F2] dark:bg-[#2C2622] p-3 rounded-xl border border-[#E6DCCF] dark:border-[#4A403A] relative group">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-[#4A403A] dark:text-[#F3EFE0]">Tier {index + 1}</span>
                            {!limits.lockLayers && <button onClick={() => removeLayer(index)} disabled={config.layers.length <= 1} className="text-[#B0A69D] dark:text-[#E6DCCF] text-[10px] font-bold uppercase">Remove</button>}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[9px] text-[#B0A69D] dark:text-[#E6DCCF] uppercase font-bold block mb-1">Diameter</label>
                                <div className="relative">
                                    <select
                                        value={String(layer.width)}
                                        onChange={(e) => handleLayerWidthChange(index, e.target.value)}
                                        disabled={limits.lockSize}
                                        className="w-full bg-white dark:bg-[#4A403A] border border-[#E6DCCF] dark:border-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] text-xs font-bold py-3 px-3 rounded-lg outline-none appearance-none"
                                    >
                                        {availableSizes.map(opt => (
                                            <option key={opt._id} value={String(opt.metadata.value)}>{opt.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#C59D5F]">▼</div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] text-[#B0A69D] dark:text-[#E6DCCF] uppercase font-bold block mb-1">Height</label>
                                <div className="relative">
                                    <select
                                        value={String(layer.height)}
                                        onChange={(e) => handleLayerHeightChange(index, e.target.value)}
                                        disabled={limits.lockLayers}
                                        className="w-full bg-white dark:bg-[#4A403A] border border-[#E6DCCF] dark:border-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] text-xs font-bold py-3 px-3 rounded-lg outline-none appearance-none"
                                    >
                                        {heights.map(opt => (
                                            <option key={opt._id} value={String(opt.metadata.value)}>{opt.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#C59D5F]">▼</div>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="text-[9px] text-[#B0A69D] dark:text-[#E6DCCF] uppercase font-bold block mb-1">Cake Flavor</label>
                                <div className="relative">
                                    <select
                                        value={layer.flavor}
                                        onChange={(e) => handleLayerChange(index, e.target.value)}
                                        className="w-full bg-white dark:bg-[#4A403A] border border-[#E6DCCF] dark:border-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] text-xs font-bold py-3 px-3 rounded-lg outline-none capitalize appearance-none"
                                    >
                                        {flavors.map(f => <option key={f._id} value={f.name}>{f.name}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#C59D5F]">▼</div>
                                </div>
                            </div>

                        </div>
                    </div>
                );
            })}
            {!limits.lockLayers && config.layers.length < 5 && <button onClick={addLayer} className="w-full py-3 border-2 border-dashed border-[#E6DCCF] dark:border-[#4A403A] rounded-xl text-[#8B5E3C] dark:text-[#C59D5F] font-bold text-sm hover:bg-[#F9F7F2] dark:hover:bg-[#4A403A] hover:border-[#C59D5F] transition-all">+ Add Tier</button>}
        </div>
    );

    const renderTextureTab = () => (
        <div className="animate-fade-in">
            <label className="block text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase tracking-wider mb-3">Frosting Texture</label>
            <div className="grid grid-cols-2 gap-3">
                {textures.map((asset) => (
                    <button
                        key={asset.name}
                        onClick={() => updateConfig('texture', asset.name)}
                        className={`py-4 rounded-xl text-sm font-bold transition-all border flex flex-col items-center justify-center gap-2
                    ${config.texture === asset.name
                                ? 'bg-[#4A403A] dark:bg-[#C59D5F] text-white border-[#4A403A] dark:border-[#C59D5F] shadow-md'
                                : 'bg-white dark:bg-[#2C2622] text-[#B0A69D] border-[#E6DCCF] dark:border-[#4A403A] hover:text-[#8B5E3C] dark:hover:text-[#F3EFE0] hover:bg-[#F9F7F2] dark:hover:bg-[#4A403A]'}`}
                    >
                        {asset.thumbnailUrl ? 
                            <img src={asset.thumbnailUrl} alt={asset.name} className="w-12 h-12 object-cover rounded-md" /> : 
                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">?</div>
                        }
                        {asset.name}
                    </button>
                ))}
                {textures.length === 0 && <p className="text-xs text-red-500">No textures configured by admin.</p>}
            </div>
        </div>
    );

    const renderIcingTab = () => {
        const icingDecorations = toppings.filter(t => t.type === 'Decoration' && t.metadata?.tab === 'icing');
        const pipingToggles = icingDecorations.filter(t => !t.metadata?.isCountable);
        const countableIcing = icingDecorations.filter(t => t.metadata?.isCountable);

        return (
            <div className={`animate-fade-in ${limits.fixedFrosting ? 'opacity-50 pointer-events-none' : ''}`}>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase tracking-wider mb-2">Coverage Style</label>
                    <div className="flex bg-[#F9F7F2] dark:bg-[#2C2622] p-1 rounded-xl border border-[#E6DCCF] dark:border-[#4A403A]">
                        <button onClick={() => updateConfig('frostingCoverage', 'full')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${config.frostingCoverage !== 'naked' ? 'bg-white dark:bg-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] shadow-sm' : 'text-[#B0A69D] dark:text-[#E6DCCF]'}`}>Full Cover</button>
                        <button onClick={() => updateConfig('frostingCoverage', 'naked')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${config.frostingCoverage === 'naked' ? 'bg-white dark:bg-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] shadow-sm' : 'text-[#B0A69D] dark:text-[#E6DCCF]'}`}>Naked Cake</button>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase tracking-wider mb-3">Base Flavor</label>
                    <div className="relative">
                        <select value={config.frosting} onChange={(e) => updateConfig('frosting', e.target.value)} className="w-full px-5 py-4 border border-[#E6DCCF] dark:border-[#4A403A] rounded-xl outline-none bg-white dark:bg-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] font-medium appearance-none capitalize cursor-pointer shadow-sm">
                            {frostings.map((f) => <option key={f._id} value={f.name}>{f.name}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#C59D5F]">▼</div>
                    </div>
                </div>

                {pipingToggles.length > 0 && (
                    <>
                        <label className="block text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase tracking-wider mb-3">Decorative Piping (Border)</label>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {pipingToggles.map(topping => (
                                <ToppingToggle
                                    key={topping._id}
                                    name={topping.name}
                                    value={config.toppings[topping.name] || false}
                                    onClick={() => toggleTopping(topping.name)}
                                />
                            ))}
                        </div>
                    </>
                )}

                {countableIcing.length > 0 && (
                    <>
                        <label className="block text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase tracking-wider mb-3">Countable Icing Decor</label>
                        <div className="space-y-3">
                            {countableIcing.map(topping => (
                                <ToppingCounter
                                    key={topping._id}
                                    name={topping.name}
                                    icon={topping.metadata?.icon || topping.name.charAt(0)}
                                    onChange={(v) => updateToppingQuantity(topping.name, v)}
                                    value={config.toppings[topping.name] || 0}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    const renderMessageTab = () => (
        <div className="animate-fade-in space-y-4">
            <div className="bg-[#FFF8F0] dark:bg-[#2C2622]/50 p-3 rounded-xl border border-[#C59D5F]/30">
                <p className="text-xs text-[#8B5E3C] dark:text-[#C59D5F] font-bold">This element will be placed on the top surface of the cake.</p>
            </div>

            <div>
                <label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-1">Edible Message Text</label>
                <textarea
                    rows="3"
                    value={config.messageConfig.text}
                    onChange={(e) => updateMessageConfig('text', e.target.value)}
                    maxLength={40}
                    className="w-full p-3 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-xl outline-none text-sm dark:text-[#F3EFE0]"
                    placeholder="e.g. Happy 18th Birthday, John!"
                />
                <p className="text-[10px] text-[#B0A69D] dark:text-[#E6DCCF] text-right">{config.messageConfig.text.length}/40 characters</p>
            </div>
            
            {/* ✅ FIXED: Font Selector Input added for 3D/AR display */}
            <div>
                <label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-1">Font Style</label>
                <div className="relative">
                    <select
                        value={config.messageConfig.font}
                        onChange={(e) => updateMessageConfig('font', e.target.value)}
                        // Use the selected font family for a small preview in the dropdown
                        style={{ fontFamily: config.messageConfig.font, textTransform: config.messageConfig.font === 'cursive' ? 'lowercase' : 'uppercase' }}
                        className="w-full px-5 py-4 border border-[#E6DCCF] dark:border-[#4A403A] rounded-xl outline-none bg-white dark:bg-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] font-medium appearance-none cursor-pointer shadow-sm text-sm"
                    >
                        {FONT_OPTIONS.map((f) => (
                            <option key={f.value} value={f.value} className="text-sm" style={{ fontFamily: f.value }}>
                                {f.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#C59D5F]">▼</div>
                </div>
            </div>
            {/* COLOR INPUT */}
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-1">Message Color</label>
                    <div className="relative flex items-center">
                        <input
                            type="color"
                            value={config.messageConfig.color}
                            onChange={(e) => updateMessageConfig('color', e.target.value)}
                            className="w-10 h-10 rounded-lg overflow-hidden cursor-pointer p-0 border-none"
                        />
                        <input
                            type="text"
                            value={config.messageConfig.color}
                            onChange={(e) => updateMessageConfig('color', e.target.value)}
                            className="flex-1 ml-2 p-2 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-lg text-sm outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDecorTab = () => {
        const generalToppings = toppings.filter(t => t.type !== 'Layer' && t.type !== 'Frosting' && t.metadata?.tab !== 'icing');

        const countableToppings = generalToppings.filter(t => t.metadata?.isCountable);
        const toggleToppings = generalToppings.filter(t => !t.metadata?.isCountable);

        return (
            <div className={`animate-fade-in space-y-6 ${limits.lockToppings ? 'opacity-50 pointer-events-none' : ''}`}>

                {countableToppings.length > 0 && (
                    <div>
                        <label className="block text-xs font-bold text-[#8B5E3C] uppercase tracking-wider mb-3">Countable Decorations</label>
                        <div className="space-y-3">
                            {countableToppings.map(topping => (
                                <ToppingCounter
                                    key={topping._id}
                                    name={topping.name}
                                    icon={topping.metadata?.icon || topping.name.charAt(0)}
                                    value={config.toppings[topping.name] || 0}
                                    onChange={(v) => updateToppingQuantity(topping.name, v)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {toggleToppings.length > 0 && (
                    <div>
                        <label className="block text-xs font-bold text-[#8B5E3C] uppercase tracking-wider mb-3">Toggle Add-ons</label>
                        <div className="grid grid-cols-2 gap-3">
                            {toggleToppings.map(topping => (
                                <ToppingToggle
                                    key={topping._id}
                                    name={topping.name}
                                    value={config.toppings[topping.name] || false}
                                    onClick={() => toggleTopping(topping.name)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };


    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-1 p-1 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-xl mb-2 border border-[#E6DCCF] dark:border-[#4A403A] overflow-x-auto no-scrollbar">
                {/* Iterate through tab names and correctly render the component from the map */}
                {['shape', 'layers', 'icing', 'texture', 'message', 'decor'].map((tab) => {
                    const TabIconComponent = TabComponentMap[tab];

                    return (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            // FIX: Ensures names are visible on all screen sizes
                            className={`flex-none min-w-[50px] sm:flex-1 py-1 px-1.5 rounded-lg text-xs font-bold uppercase tracking-wide flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 transition-all 
                    ${activeTab === tab ? 'bg-white dark:bg-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] shadow-sm border border-[#E6DCCF] dark:border-[#4A403A]' : 'text-[#B0A69D] dark:text-[#E6DCCF] hover:text-[#8B5E3C] dark:hover:text-[#F3EFE0]'}`}>
                            {/* Render the component by calling it as a JSX tag */}
                            {TabIconComponent && <TabIconComponent />}
                            <span className="text-[10px] sm:text-xs">{tab}</span>
                        </button>
                    );
                })}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 lg:pb-4">
                {activeTab === 'shape' && renderShapeTab()}
                {activeTab === 'layers' && renderLayersTab()}
                {activeTab === 'icing' && renderIcingTab()}
                {activeTab === 'texture' && renderTextureTab()}
                {activeTab === 'message' && renderMessageTab()}
                {activeTab === 'decor' && renderDecorTab()}
            </div>
        </div>
    );
};

// FIX: Helper component to display countable topping controls (Removed icon span)
const ToppingCounter = ({ name, icon, value, onChange }) => (
    <div className="flex items-center justify-between bg-white dark:bg-[#2C2622] p-3 rounded-xl border border-[#E6DCCF] dark:border-[#4A403A] shadow-sm">
        <span className="capitalize font-bold text-[#4A403A] dark:text-[#F3EFE0] text-sm flex items-center gap-2">
            {/* Removed icon/letter span to comply with request */}
            {name}
        </span>
        <div className="flex items-center bg-[#F9F7F2] dark:bg-[#1a1614] rounded-lg border border-[#E6DCCF] dark:border-[#4A403A] overflow-hidden">
            <button onClick={() => onChange(-1)} disabled={!value || value <= 0} className="w-8 h-8 flex items-center justify-center text-[#8B5E3C] dark:text-[#C59D5F] hover:bg-[#E6DCCF] dark:hover:bg-[#4A403A] disabled:opacity-30 transition font-bold">-</button>
            <span className="w-8 text-center font-bold text-[#4A403A] dark:text-[#F3EFE0] text-sm">{value || 0}</span>
            <button onClick={() => onChange(1)} className="w-8 h-8 flex items-center justify-center text-[#8B5E3C] dark:text-[#C59D5F] hover:bg-[#E6DCCF] dark:hover:bg-[#4A403A] transition font-bold">+</button>
        </div>
    </div>
);
const ToppingToggle = ({ name, value, onClick }) => (
    // Applied dark mode styling fixes
    <button onClick={onClick} className={`px-4 py-3 rounded-xl font-bold text-xs transition-all capitalize border flex items-center justify-between shadow-sm ${value ? 'bg-[#4A403A] dark:bg-[#C59D5F] text-white border-[#4A403A] dark:border-[#C59D5F]' : 'bg-white dark:bg-[#2C2622] text-[#8B5E3C] dark:text-[#F3EFE0] border-[#E6DCCF] dark:border-[#4A403A] hover:bg-[#F9F7F2] dark:hover:bg-[#4A403A]'}`}>{name} {value && <span className="text-[#C59D5F] dark:text-[#4A403A] font-bold">✓</span>}</button>
);

export default CakeCustomizer;