import React from 'react';
import { Laptop, Shirt, Sparkles, Sofa, Package } from 'lucide-react';

const CATEGORIES = [
  { id: 'All', name: 'All Drops', icon: Package },
  { id: 'Electronics', name: 'Electronics', icon: Laptop },
  { id: 'Fashion', name: 'Fashion', icon: Shirt },
  { id: 'Beauty', name: 'Beauty', icon: Sparkles },
  { id: 'Furniture', name: 'Furniture', icon: Sofa },
];

export default function CategoryBar({ selectedCategory, onSelectCategory }) {
  return (
    <div className="bg-white border-b border-neutral-100 py-4 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 flex justify-start sm:justify-center gap-8 min-w-max">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex flex-col items-center gap-1.5 group cursor-pointer transition-all ${
                isActive ? 'text-black font-bold scale-105' : 'text-neutral-400 hover:text-neutral-800'
              }`}
            >
              <div className={`p-2.5 rounded-full border transition-all ${
                isActive ? 'bg-black border-black text-white shadow-sm' : 'bg-neutral-50 border-neutral-100 group-hover:bg-neutral-100'
              }`}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span className="text-[11px] uppercase tracking-wider font-semibold">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}