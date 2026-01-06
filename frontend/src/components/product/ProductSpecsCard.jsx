// frontend/src/components/product/ProductSpecsCard.jsx
import React from 'react';
import * as Icons from '../Icons';

const ProductSpecsCard = ({ product }) => {
  // ✅ Use real product specs with fallbacks for older data
  const specs = product.specs || {};
  const leadTime = specs.leadTime || '3-5 business days';

  return (
    <>
      <div className="bg-white dark:bg-[#2C2622] p-4 rounded-xl border border-[#E6DCCF] dark:border-[#4A403A] shadow-sm mb-4">
          <h3 className="font-bold text-[#C59D5F] text-xs uppercase tracking-wide mb-3">Product Specifications</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-[#4A403A] dark:text-[#F3EFE0]">
                  <span className="block text-[#B0A69D] mb-1">Size / Servings:</span>
                  <span className="font-bold">{specs.size || 'N/A'} ({specs.servings || 'N/A'})</span>
              </div>
              <div className="text-[#4A403A] dark:text-[#F3EFE0]">
                  <span className="block text-[#B0A69D] mb-1">Main Flavor:</span>
                  <span className="font-bold">{specs.mainFlavor || 'Classic'}</span>
              </div>
              <div className="text-[#4A403A] dark:text-[#F3EFE0]">
                  <span className="block text-[#B0A69D] mb-1">Category:</span>
                  <span className="font-bold">{product.category || 'Custom'}</span>
              </div>
              <div className="text-[#4A403A] dark:text-[#F3EFE0]">
                  <span className="block text-[#B0A69D] mb-1">Shelf Life:</span>
                  <span className="font-bold">{specs.shelfLife || 'N/A'}</span>
              </div>
          </div>
      </div>
      
      {/* LEAD TIME / DELIVERY NOTICE */}
      <div className="flex items-center gap-3 bg-[#FFF8F0] dark:bg-[#4A403A]/50 p-3 rounded-xl border border-dashed border-[#C59D5F]/50 mt-4">
          <div className="text-xl text-[#8B5E3C]">⏳</div>
          <p className="text-sm">
              <span className="font-bold text-[#8B5E3C] dark:text-[#C59D5F]">Lead Time: </span>
              Production requires **{leadTime}** after order confirmation.
          </p>
      </div>
    </>
  );
};

export default ProductSpecsCard;