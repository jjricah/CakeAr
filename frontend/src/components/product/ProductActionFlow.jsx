// frontend/src/components/product/ProductActionFlow.jsx
import React from 'react';
import * as Icons from '../Icons';

const ProductActionFlow = ({ handleCustomize3D }) => {
  return (
    <div className="space-y-4 pt-4 border-t border-[#E6DCCF] dark:border-[#4A403A]">
      <h3 className="font-bold text-[#C59D5F] text-xs uppercase tracking-wide">Customize & Order Flow</h3>
      
      {/* Call to Action for Customization (Path 1: Custom) */}
      <button onClick={handleCustomize3D} className="w-full bg-[#F3EFE0] dark:bg-[#2C2622] text-[#4A403A] dark:text-[#F3EFE0] px-6 py-3.5 rounded-xl font-bold border border-[#E6DCCF] dark:border-[#4A403A] shadow-sm hover:bg-[#E6DCCF] transition flex items-center justify-center gap-2">
          <Icons.Edit3D /> Full 3D Customization & Quote
      </button>

      {/* Guidance Text for the dual buttons in the footer */}
      <p className="text-center text-xs text-[#B0A69D] dark:text-[#E6DCCF] pt-2">
          Use the buttons below to quickly buy the **Standard** cake (Qty 1).
      </p>
    </div>
  );
};

export default ProductActionFlow;