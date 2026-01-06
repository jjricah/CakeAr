// frontend/src/components/product/ProductCard.jsx

import React from 'react';
// ✅ CRITICAL FIX 1: Import useNavigate internally (Fixes navigate is not a function)
import { useNavigate } from 'react-router-dom'; 
// ✅ CRITICAL FIX 2: Use wildcard import for Icons
import * as Icons from '../Icons'; 

// CRITICAL FIX 3: Remove 'navigate' from props, get it internally
const ProductCard = ({ product }) => {
  
  // Initialize navigate internally
  const navigate = useNavigate(); 
  
  // Use a sensible fallback for baker name if not present
  const bakerName = product.baker?.shopName || "Unknown Baker";

  return (
    <div 
        key={product._id} 
        // This click handler now uses the local navigate function
        onClick={() => navigate(`/product/${product._id}`)} 
        // Applying the detailed HomeTab styling for a standardized, rich look
        className="bg-white dark:bg-[#4A403A] rounded-2xl overflow-hidden shadow-sm border border-[#E6DCCF] dark:border-[#2C2622] group cursor-pointer hover:shadow-md transition duration-300"
    >
      {/* Image / Icon Area */}
      <div className="h-36 md:h-48 w-full flex items-center justify-center bg-[#F9F7F2] dark:bg-[#2C2622] relative overflow-hidden">
        {product.image && product.image.startsWith('http') ? (
            <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" 
            />
        ) : (
            <div className="text-[#C59D5F] opacity-50 transform group-hover:scale-110 transition duration-500">
                {/* FIX: Use the icon from the wildcard import */}
                <Icons.CakeSolid />
            </div>
        )}
      </div>
      
      {/* Details Area */}
      <div className="p-3">
        <h3 className="font-bold text-sm truncate text-[#4A403A] dark:text-[#F3EFE0]">{product.title}</h3>
        <div className="flex items-center justify-between text-[10px] text-[#B0A69D] dark:text-[#E6DCCF] mb-2">
            <p className="truncate">{bakerName}</p>
            {product.baker?.rating > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Icons.Star />
                    <span className="font-bold">{product.baker.rating.toFixed(1)}</span>
                </div>
            )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#C59D5F] font-bold text-sm">₱{product.basePrice?.toLocaleString()}</span>
          {/* Link Icon / Arrow (Using the original arrow character) */}
          <div className="h-7 w-7 flex items-center justify-center bg-[#F3EFE0] dark:bg-[#8B5E3C] hover:bg-[#C59D5F] hover:text-white rounded-full text-[#8B5E3C] dark:text-[#F3EFE0] transition">
            <span className="text-lg leading-none">→</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;