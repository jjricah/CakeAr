import React from 'react';

const CategoryFilter = ({ activeCategory, onSelect }) => {
  const categories = [
    { id: 'all', label: '🍰 All Cakes' },
    { id: 'birthday', label: '🎈 Birthday' },
    { id: 'wedding', label: '💍 Wedding' },
    { id: 'cupcakes', label: '🧁 Cupcakes' },
    { id: 'bento', label: '🍱 Bento' },
    { id: 'custom', label: '✨ 3D Custom' },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
            activeCategory === cat.id
              ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-200'
              : 'bg-white text-stone-600 border-stone-200 hover:border-amber-400 hover:text-amber-600'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;