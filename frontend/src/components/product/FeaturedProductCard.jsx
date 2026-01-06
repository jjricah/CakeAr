import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from '../Icons';

const FeaturedProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="w-48 flex-shrink-0 snap-start bg-white dark:bg-[#2C2622] rounded-2xl overflow-hidden shadow-md border border-[#E6DCCF] dark:border-[#4A403A] group cursor-pointer hover:shadow-lg transition duration-300"
    >
      <div className="h-32 w-full flex items-center justify-center bg-[#F9F7F2] dark:bg-[#1E1A17] relative overflow-hidden">
        {product.image && product.image.startsWith('http') ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
          />
        ) : (
          <div className="text-[#C59D5F] opacity-50 transform group-hover:scale-110 transition duration-500">
            <Icons.CakeSolid />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-xs truncate text-[#4A403A] dark:text-[#F3EFE0]">{product.title}</h3>
        <div className="flex items-center justify-between text-[10px] text-[#B0A69D] dark:text-[#E6DCCF] mb-1">
            <p className="truncate">{product.baker?.shopName || 'Unknown Baker'}</p>
            {product.baker?.rating > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                    <Icons.Star />
                    <span className="font-bold">{product.baker.rating.toFixed(1)}</span>
                </div>
            )}
        </div>
        <span className="text-[#C59D5F] font-bold text-sm">₱{product.basePrice?.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default FeaturedProductCard;