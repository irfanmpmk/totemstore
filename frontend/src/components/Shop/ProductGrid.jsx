import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useGetProductsQuery } from "@/store/services/totemApi";
import { addToCart } from "@/store/slices/cartSlice";
import ProductDetailsModal from './ProductDetailsModal';

export default function ProductGrid({ selectedCategory = 'All', searchQuery = '' }) {
  const { data: response, isLoading, error } = useGetProductsQuery();
  const dispatch = useDispatch();
  const [selectedProduct, setSelectedProduct] = useState(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="text-xs uppercase tracking-widest text-neutral-400 animate-pulse">
          Loading Totemstore Catalog...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24 text-xs tracking-wider text-red-500 uppercase">
        Failed to sync catalog. Check your backend.
      </div>
    );
  }

  const rawProducts = response?.products || [];

  // Senior Filter Optimization: compute conditions efficiently
  const filteredProducts = rawProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-24 text-xs tracking-wider text-neutral-400 uppercase">
        No drops match your current filter parameters.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 md:gap-y-12">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            onClick={() => setSelectedProduct(product)} // Clicking anywhere on the tile opens the modal detail window!
            className="group flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Media Container (Handles both video or image posts natively) */}
              <div className="w-full aspect-square bg-neutral-100 rounded-lg overflow-hidden relative border border-neutral-200/50">
                {product.media_urls?.[0]?.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video 
                    src={product.media_urls[0]} 
                    muted 
                    loop 
                    autoPlay 
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={product.media_urls?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 ease-out"
                    loading="lazy"
                  />
                )}
                {product.stock_quantity === 0 && (
                  <span className="absolute top-2 left-2 bg-white text-[9px] font-bold tracking-wider px-2 py-1 uppercase rounded border border-neutral-100 text-neutral-500 shadow-sm">
                    Sold Out
                  </span>
                )}
              </div>

              {/* Information Row */}
              <div className="mt-4 flex justify-between items-start gap-2">
                <div>
                  <h3 className="text-sm font-medium text-neutral-800 tracking-tight">{product.title}</h3>
                  <p className="mt-0.5 text-xs text-neutral-500 line-clamp-1">{product.description}</p>
                </div>
                <p className="text-sm font-semibold text-neutral-900 font-mono">₹{product.price}</p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevents modal from popping open when clicking button directly!
                dispatch(addToCart(product));
              }}
              disabled={product.stock_quantity === 0}
              className="mt-4 w-full py-2.5 bg-neutral-100 text-neutral-800 border border-neutral-200 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all text-[11px] font-bold uppercase tracking-wider rounded-md disabled:bg-neutral-50 disabled:text-neutral-400 disabled:border-neutral-100 disabled:cursor-not-allowed"
            >
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Bag'}
            </button>
          </div>
        ))}
      </div>

      {/* Global Product Details Drawer Sheet Mounting Anchor */}
      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}