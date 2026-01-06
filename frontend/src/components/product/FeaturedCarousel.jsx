import React from 'react';
import FeaturedProductCard from './FeaturedProductCard';

const FeaturedCarousel = ({ title, products }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#4A403A] dark:text-[#F3EFE0] px-2">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar -mx-6 px-6">
        {products.map(product => (
          <FeaturedProductCard key={product._id} product={product} />
        ))}
        {/* Optional: Add a "View All" card at the end */}
        <div className="w-48 flex-shrink-0 snap-start flex items-center justify-center">
            <button className="text-center text-[#C59D5F] font-bold text-sm hover:underline">
                View All →
            </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCarousel;