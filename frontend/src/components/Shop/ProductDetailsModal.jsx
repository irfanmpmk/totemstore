import React from 'react';
import { X, ShoppingBag } from 'lucide-react';
import MediaCarousel from './MediaCarousel';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';

export default function ProductDetailsModal({ product, onClose }) {
  if (!product) return null;
  const dispatch = useDispatch();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      {/* Backdrop Glass Overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Sheet Container */}
      <div className="relative bg-white w-full sm:max-w-3xl rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col sm:flex-row z-10 animate-slideUp">
        
        {/* Mobile Close Handle bar icon */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-md text-neutral-700 hover:text-black p-2 rounded-full border border-neutral-100"
        >
          <X size={18} />
        </button>

        {/* Left Side: Media Asset Hub */}
        <div className="w-full sm:w-1/2 p-4 sm:p-6 bg-neutral-50 flex items-center">
          <MediaCarousel mediaUrls={product.media_urls} />
        </div>

        {/* Right Side: Commercial Narrative */}
        <div className="w-full sm:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold font-sans">Premium Collectible</span>
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight mt-0.5">{product.title}</h2>
              <p className="text-lg font-mono font-bold text-black mt-1">₹{product.price}</p>
            </div>

            <hr className="border-neutral-100" />

            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1">Overview</h4>
              <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line font-sans">
                {product.description}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-100 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Availability status</span>
              <span className={product.stock_quantity > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} units)` : "Out of Stock"}
              </span>
            </div>

            <button
              onClick={() => {
                dispatch(addToCart(product));
                onClose();
              }}
              disabled={product.stock_quantity === 0}
              className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2 disabled:bg-neutral-100 disabled:text-neutral-400"
            >
              <ShoppingBag size={14} />
              Add Product To Bag
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}