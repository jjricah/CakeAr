// frontend/src/pages/ProductDetails.jsx
import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import SubHeader from '../components/SubHeader'; 
import api from '../services/api';
import * as Icons from '../components/Icons';
import { nanoid } from 'nanoid';
import ProductSpecsCard from '../components/product/ProductSpecsCard';
import ProductActionFlow from '../components/product/ProductActionFlow';
import ReviewCard from '../components/review/ReviewCard'; 

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useContext(CartContext); 

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [flyStyle, setFlyStyle] = useState(null);
  const cartIconRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (error) { 
        console.error("Failed to fetch product:", error); 
        setProduct(null);
      }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  const handleCustomize3D = () => {
    navigate('/cake-builder', { 
        state: { 
            basePrice: product.basePrice, 
            productId: product._id, 
            productName: product.title, 
            bakerId: product.baker?._id, 
            mode: 'customize_existing' 
        } 
    });
  };

  const createItem = () => {
      return {
        id: nanoid(),
        type: 'standard', 
        title: product.title, 
        image: product.image,
        // Use real data for the cart item
        selectedOptions: { size: product.specs?.size, flavor: product.specs?.mainFlavor },
        quantity: 1,
        price: product.basePrice,
        _id: product._id
      };
  }

  const handleAddToCart = (e) => {
    if (adding) return;
    setAdding(true);

    const buttonRect = e.currentTarget.getBoundingClientRect();
    const destinationRect = { top: window.innerHeight - 60, left: window.innerWidth - 60 }; 
    const cartRect = cartIconRef.current ? cartIconRef.current.getBoundingClientRect() : destinationRect;

    setFlyStyle({
      top: buttonRect.top - 20, 
      left: buttonRect.left + (buttonRect.width / 2) - 32,
      width: 64, 
      height: 64, 
      opacity: 1, 
      transform: 'scale(1)', 
      borderRadius: '100%', 
      transition: 'none'
    });

    const itemToAdd = createItem();

    setTimeout(() => {
      setFlyStyle({
        top: cartRect.top + 5, 
        left: cartRect.left + 5,
        width: 24, 
        height: 24, 
        opacity: 0.8, 
        transform: 'scale(0.5)', 
        borderRadius: '100%',
        transition: 'all 0.7s cubic-bezier(0.5, -0.1, 0.1, 1.0)'
      });
    }, 50);

    setTimeout(() => {
      addToCart(itemToAdd);
      setFlyStyle(null);
      setAdding(false);
    }, 700);
  };
  
  const handleBuyNow = () => {
    if (adding) return;
    setAdding(true);
    
    const itemToBuy = createItem();
    
    addToCart(itemToBuy);

    const itemsToBuy = [itemToBuy];
    sessionStorage.setItem('checkoutItems', JSON.stringify(itemsToBuy)); 
    
    setTimeout(() => {
        navigate('/checkout', { state: { itemsToBuy } });
        setAdding(false);
    }, 300);
  };
  
  // 🔄 Use actual data from the API response, falling back to mocks
  const currentRating = product?.baker?.rating || 5.0;
  const currentNumReviews = product?.baker?.numReviews || 0;
  const reviewsList = product?.reviews || [];


  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#4A403A] dark:text-[#F3EFE0]">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-[#4A403A] dark:text-[#F3EFE0]">Product Not Found</div>;

  return (
    <div className="min-h-screen font-sans pb-24 md:pb-28 transition-colors duration-300 bg-[#F9F7F2] dark:bg-[#1E1A17]">

      {/* Animation Element (Unchanged) */}
      {flyStyle && (
        <div className="fixed z-[9999] overflow-hidden shadow-2xl pointer-events-none border-4 border-[#C59D5F] bg-white" style={flyStyle}>
          {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#C59D5F] flex items-center justify-center text-white"><Icons.CakeIcon /></div>}
        </div>
      )}

      {/* NAVBAR (Unchanged) */}
      <nav className="sticky top-0 z-30 px-4 py-3 bg-[#F3EFE0]/95 dark:bg-[#2C2622]/95 backdrop-blur-md shadow-sm border-b border-[#E6DCCF] dark:border-[#4A403A]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#4A403A] border border-[#E6DCCF] dark:border-[#2C2622] rounded-full text-[#4A403A] dark:text-[#F3EFE0] shadow-sm active:scale-95 transition">
              <Icons.Back />
            </button>
            <h1 className="text-lg font-bold text-[#4A403A] dark:text-[#F3EFE0] block truncate max-w-[200px]">{product.title}</h1>
          </div>
          <button ref={cartIconRef} onClick={() => navigate('/cart')} className={`relative p-2 rounded-full hover:bg-white/50 dark:hover:bg-white/5 text-[#4A403A] dark:text-[#F3EFE0] transition ${adding ? 'scale-110' : ''}`}>
            <Icons.Cart />
            {cartItems.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cartItems.length}</span>}
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-0 md:px-6 py-0 md:py-6 grid lg:grid-cols-2 gap-0 md:gap-8">

        {/* IMAGE HERO / 3D PREVIEW (Unchanged) */}
        <div className="h-[40vh] lg:h-[600px] w-full bg-white dark:bg-[#4A403A] md:rounded-[2.5rem] flex items-center justify-center relative shadow-none md:shadow-lg border-b md:border border-[#E6DCCF] dark:border-[#2C2622] overflow-hidden group">
          {product.image && product.image.startsWith('http') ? <img src={product.image} alt={product.title} className="w-full h-full object-cover" /> : <div className="text-[#C59D5F] opacity-50 transform scale-[2]"><Icons.CakeIcon /></div>}

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center bg-black/0 hover:bg-black/10 transition-all cursor-pointer" onClick={handleCustomize3D}>
            <button className="bg-white/90 dark:bg-[#2C2622]/90 backdrop-blur-md text-[#4A403A] dark:text-[#F3EFE0] px-5 py-2.5 rounded-full font-bold shadow-xl transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 text-sm">
              <Icons.Edit3D /> Customize in 3D
            </button>
          </div>
        </div>

        {/* DETAILS SECTION (Left Column) */}
        <div className="flex flex-col gap-6 p-5 md:p-0">
          
          {/* Block 1: Product Header and Description */}
          <div> 
            {/* Title & Price */}
            <div className="mb-4">
                <h2 className="text-3xl font-extrabold text-[#4A403A] dark:text-[#F3EFE0] mb-2">{product.title}</h2>
                <span className="text-2xl font-extrabold text-[#C59D5F]">₱{product.basePrice.toLocaleString()}</span>
                <p className="text-xs text-[#B0A69D] mt-1">Starting price for standard size/flavor.</p>
                
                {/* RATING & REVIEWS */}
                <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 text-sm font-bold text-[#4A403A] dark:text-[#F3EFE0]">
                        <Icons.Star /> {currentRating.toFixed(1)}
                    </div>
                    <span className="text-xs text-[#B0A69D]">({currentNumReviews} reviews)</span>
                    <span className="text-xs text-[#B0A69D]">|</span>
                    <span className="text-xs text-green-600 font-bold">In Stock</span>
                </div>
            </div>
            
            {/* Seller Card */}
           <div className="bg-white dark:bg-[#2C2622] border border-[#E6DCCF] dark:border-[#4A403A] rounded-xl p-3 flex items-center justify-between gap-3 mb-4 shadow-sm" 
                // 🔄 FIX: Use product.baker._id to navigate to the ShopProfile
                // (ShopProfile expects the User ID, which is stored in product.baker._id)
                onClick={() => navigate(`/shop/${product.baker?._id}`)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-[#F3EFE0] dark:bg-[#4A403A] border border-[#E6DCCF] dark:border-[#4A403A] flex items-center justify-center text-[#8B5E3C] dark:text-[#C59D5F] font-bold shadow-sm">
                  {product.baker?.shopName?.[0] || "S"}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-[#4A403A] dark:text-[#F3EFE0] text-sm truncate">{product.baker?.shopName || "Unknown Seller"}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-[#B0A69D]">
                    <span className="flex items-center text-amber-500 gap-0.5"><Icons.Star /> {currentRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-[#F9F7F2] dark:bg-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] text-xs font-bold border border-[#E6DCCF] dark:border-[#4A403A]">Visit Shop</button>
            </div>

            {/* USE MODULAR PRODUCT SPECS CARD */}
            <ProductSpecsCard product={product} />
            {/* END MODULAR PRODUCT SPECS */}

            <p className="text-[#4A403A] dark:text-[#E6DCCF] leading-relaxed text-sm opacity-90">{product.description}</p>
          </div>
          
          {/* USE MODULAR ACTION FLOW */}
          <ProductActionFlow handleCustomize3D={handleCustomize3D} />
          {/* END MODULAR ACTION FLOW */}
        </div>
        
        {/* NEW REVIEWS SECTION (Right Column, but below details on small screens) */}
        <div className="p-5 md:p-0">
            <h3 className="text-xl font-bold mb-4">Customer Reviews ({currentNumReviews})</h3>
            <div className="bg-white dark:bg-[#2C2622] p-5 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#4A403A] space-y-4">
                {reviewsList.length > 0 ? (
                    reviewsList.map(review => (
                        // Use the imported ReviewCard component
                        <ReviewCard key={review._id} review={review} />
                    ))
                ) : (
                    <div className="text-center py-8 text-[#B0A69D] dark:text-[#E6DCCF]">
                        <p>No reviews yet for this cake. Be the first!</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR (Dual Buttons retained for dual-path purchasing) */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#2C2622] border-t border-[#E6DCCF] dark:border-[#4A403A] p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40 pb-safe">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#B0A69D] dark:text-[#E6DCCF] font-bold uppercase">Price</span>
            <span className="text-xl font-extrabold text-[#C59D5F]">₱{product.basePrice.toLocaleString()}</span>
          </div>
          <div className="flex gap-3 w-3/5">
            <button onClick={handleAddToCart} disabled={adding}
                className={`w-1/4 max-w-[60px] bg-[#F3EFE0] dark:bg-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] py-3.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center active:scale-95 border border-[#E6DCCF] dark:border-[#4A403A] ${adding ? 'opacity-80' : ''}`}
            >
                <Icons.Cart />
            </button>
             <button onClick={handleBuyNow} disabled={adding}
                className={`flex-1 bg-[#8B5E3C] text-white py-3.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center active:scale-95 ${adding ? 'opacity-80' : ''}`}
            >
                {adding ? 'Adding...' : `Buy Now`}
            </button>
          </div>
        </div>
      </div>
    </div> // The corrected closing tag for the main container
  );
};
export default ProductDetails;