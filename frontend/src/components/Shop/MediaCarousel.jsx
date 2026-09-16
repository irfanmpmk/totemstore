import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export default function MediaCarousel({ mediaUrls = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback if no media assets exist
  if (mediaUrls.length === 0) {
    return (
      <div className="w-full aspect-square bg-neutral-100 flex items-center justify-center rounded-xl text-neutral-400 text-xs">
        No media assets provided
      </div>
    );
  }

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === mediaUrls.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? mediaUrls.length - 1 : prev - 1));
  };

  const isVideo = (url) => url?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="relative w-full aspect-square bg-neutral-50 rounded-xl overflow-hidden group border border-neutral-100">
      {/* Active Media Renderer */}
      <div className="w-full h-full flex items-center justify-center">
        {isVideo(mediaUrls[currentIndex]) ? (
          <video
            src={mediaUrls[currentIndex]}
            muted
            loop
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={mediaUrls[currentIndex]}
            alt="Product view"
            className="w-full h-full object-cover transition-all duration-500 ease-out"
          />
        )}
      </div>

      {/* Navigation Chevrons (Only show if multiple items exist) */}
      {mediaUrls.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm text-neutral-800 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm text-neutral-800 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={16} />
          </button>

          {/* Bottom Dot Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-y-1/2 flex gap-1.5">
            {mediaUrls.map((url, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === idx ? 'w-4 bg-black' : 'w-1.5 bg-neutral-300'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}