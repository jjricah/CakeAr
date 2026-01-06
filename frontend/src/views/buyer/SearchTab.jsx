import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import * as Icons from '../../components/Icons';

const SearchTab = ({ navigate, initialType = 'cakes' }) => {
    const [query, setQuery] = useState('');
    const [activeType, setActiveType] = useState(initialType); // 'cakes' or 'shops'
    const [products, setProducts] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Fetch all data initially (Client-side filtering for prototype)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [prodRes, sellerRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/shop/all-sellers')
                ]);
                setProducts(prodRes.data);
                setSellers(sellerRes.data);
            } catch (err) {
                console.error("Search data fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter logic
    const filteredProducts = products.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        p.category?.toLowerCase().includes(query.toLowerCase())
    );

    const filteredSellers = sellers.filter(s => 
        s.shopName.toLowerCase().includes(query.toLowerCase()) ||
        s.specialties?.some(spec => spec.toLowerCase().includes(query.toLowerCase()))
    );

    const handleSearchChange = (e) => {
        setQuery(e.target.value);
        if (e.target.value.length > 0) setHasSearched(true);
    };

    return (
        <div className="pb-4">
            {/* Search Header */}
            <div className="sticky top-0 z-20 bg-[#F9F7F2] dark:bg-[#1E1A17] pt-2 pb-4 px-4 md:px-0">
                <div className="max-w-3xl mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={handleSearchChange}
                            placeholder={activeType === 'cakes' ? "Search for cakes, flavors..." : "Search for bakers, shops..."}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-[#2C2622] border border-[#E6DCCF] dark:border-[#4A403A] shadow-sm text-[#4A403A] dark:text-[#F3EFE0] outline-none focus:ring-2 focus:ring-[#C59D5F]/50 transition-all"
                            autoFocus
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0A69D]">
                            <Icons.Search className="w-6 h-6" />
                        </div>
                        {query && (
                            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B0A69D] hover:text-[#C59D5F]">
                                <Icons.XCircleIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Type Toggles */}
                    <div className="flex gap-2 mt-4">
                        <button 
                            onClick={() => setActiveType('cakes')}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                activeType === 'cakes' 
                                ? 'bg-[#C59D5F] text-white shadow-md' 
                                : 'bg-white dark:bg-[#2C2622] text-[#B0A69D] border border-[#E6DCCF] dark:border-[#4A403A]'
                            }`}
                        >
                            <Icons.CakeSolid className="w-4 h-4" /> Cakes
                        </button>
                        <button 
                            onClick={() => setActiveType('shops')}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                activeType === 'shops' 
                                ? 'bg-[#C59D5F] text-white shadow-md' 
                                : 'bg-white dark:bg-[#2C2622] text-[#B0A69D] border border-[#E6DCCF] dark:border-[#4A403A]'
                            }`}
                        >
                            <Icons.Store className="w-4 h-4" /> Bakers
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Area */}
            <div className="px-4 md:px-0 max-w-3xl mx-auto mt-2">
                {loading ? (
                    <div className="text-center py-20 text-[#B0A69D]">Loading...</div>
                ) : (
                    <>
                        {/* CAKES RESULTS */}
                        {activeType === 'cakes' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-20 opacity-50">
                                        <p className="text-lg font-bold">No cakes found.</p>
                                        <p className="text-sm">Try a different keyword.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SHOPS RESULTS */}
                        {activeType === 'shops' && (
                            <div className="space-y-3">
                                {filteredSellers.length > 0 ? (
                                    filteredSellers.map(seller => (
                                        <div 
                                            key={seller._id} 
                                            onClick={() => navigate(`/shop/${seller.user?._id || seller.user}`)} // Handle populated vs unpopulated user ID
                                            className="bg-white dark:bg-[#2C2622] p-4 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#4A403A] flex items-center gap-4 cursor-pointer hover:shadow-md transition"
                                        >
                                            <div className="w-14 h-14 rounded-full bg-[#F3EFE0] dark:bg-[#4A403A] border border-[#E6DCCF] dark:border-[#5C5047] flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {seller.shopLogo ? (
                                                    <img src={seller.shopLogo} alt={seller.shopName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xl font-bold text-[#C59D5F]">{seller.shopName?.[0]}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-[#4A403A] dark:text-[#F3EFE0] truncate">{seller.shopName}</h3>
                                                <p className="text-xs text-[#B0A69D] truncate">{seller.specialties?.join(', ') || 'Custom Cakes'}</p>
                                                <div className="flex items-center gap-1 mt-1 text-xs font-bold text-[#C59D5F]">
                                                    <Icons.Star className="w-3 h-3" /> {seller.rating?.toFixed(1) || '5.0'}
                                                </div>
                                            </div>
                                            <Icons.ChevronRight className="text-[#B0A69D]" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 opacity-50">
                                        <p className="text-lg font-bold">No bakers found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchTab;