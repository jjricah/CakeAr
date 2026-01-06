import React from 'react';

const CakeProductCard = ({ title, baker, price, image, rating }) => {
  return (
    <div className="bg-white rounded-xl shadow-md shadow-stone-400/20 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border border-stone-100">
      {/* Image Area */}
      <div className="h-48 overflow-hidden relative bg-stone-100">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        {/* Quick Add Button */}
        <button className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-amber-500 hover:text-white transition text-amber-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-stone-800 line-clamp-1">{title}</h3>
            <p className="text-xs text-stone-500">by {baker}</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded">
            ★ {rating}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <span className="font-bold text-lg text-amber-700">₱{price}</span>
          <button className="text-xs font-semibold text-stone-500 hover:text-amber-600">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CakeProductCard;