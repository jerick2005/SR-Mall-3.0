'use client';

import { useState } from 'react';
import { AreaSlot } from '@srmall/database';
import { X, ChevronLeft, ChevronRight, Square, Ruler, CreditCard, Send, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SpaceDetailModalProps {
  slot: AreaSlot;
  onClose: () => void;
  onInquire?: (unitId: string) => void;
}

export default function SpaceDetailModal({ slot, onClose, onInquire }: SpaceDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  // Images are now a native array in PostgreSQL
  const images: string[] = Array.isArray(slot.space_images) ? slot.space_images : [];

  const handleInquiry = () => {
    if (onInquire) {
      onInquire(slot.unit_id);
    } else {
      // Fallback or default behavior
      router.push(`/messenger?recipient=admin&subject=Inquiry_for_${slot.unit_id}&unitId=${slot.id}`);
      onClose();
    }
  };

  const nextImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Image Carousel Section */}
          <div className="relative w-full md:w-3/5 h-[300px] md:h-[500px] bg-black">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={`${slot.unit_id} - View ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-500"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-2 text-white bg-black/60 hover:bg-primary rounded-full transition-all border border-white/20 shadow-xl backdrop-blur-md"
                    >
                      <ChevronLeft size={20} />
                      <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest mr-1">Prev</span>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-2 text-white bg-black/60 hover:bg-primary rounded-full transition-all border border-white/20 shadow-xl backdrop-blur-md"
                    >
                      <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest ml-1">Next</span>
                      <ChevronRight size={20} />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-3 py-2 rounded-full backdrop-blur-md border border-white/10">
                      {images.map((_item: string, i: number) => (
                        <div
                          key={i}
                          className={`h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-[#BE1E2D] w-6' : 'bg-white/40 w-2 hover:bg-white/70 cursor-pointer'
                            }`}
                          onClick={() => setCurrentImageIndex(i)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/30 gap-3">
                <Square size={48} strokeWidth={1} />
                <p>No preview images available</p>
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
              <div className={`w-2 h-2 rounded-full animate-pulse ${slot.status === 'AVAILABLE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                slot.status === 'OCCUPIED' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
              <span className="text-xs font-semibold text-white tracking-wider uppercase">
                {slot.status}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 p-8 flex flex-col justify-between overflow-y-auto max-h-[500px] md:max-h-full">
            <div>
              <div className="flex items-center gap-2 text-[#BE1E2D] mb-1">
                <MapPin size={16} />
                <span className="text-sm font-medium uppercase tracking-[0.2em]">Premium Location</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">Unit {slot.unit_id}</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-white/50 mb-1">
                      <Ruler size={16} />
                      <span className="text-xs uppercase font-bold tracking-widest">Total Area</span>
                    </div>
                    <p className="text-xl font-semibold text-white">{slot.sqm_size} sqm</p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-white/50 mb-1">
                      <CreditCard size={16} />
                      <span className="text-xs uppercase font-bold tracking-widest">Base Rent</span>
                    </div>
                    <p className="text-xl font-semibold text-white">₱{slot.base_rent.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-bold text-white/50 uppercase tracking-widest">Features & Utilities</h4>
                  <ul className="grid grid-cols-1 gap-3 text-sm text-white/70">
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#BE1E2D]" />
                      High visibility storefront potential
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#BE1E2D]" />
                      Independent utility metering
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#BE1E2D]" />
                      Proximity to digital concierge kiosks
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-10">
              {slot.status === 'AVAILABLE' ? (
                <button
                  onClick={handleInquiry}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#BE1E2D] hover:bg-[#a31926] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-[#BE1E2D]/20 transform hover:-translate-y-1"
                >
                  <Send size={18} />
                  Inquire Now
                </button>
              ) : (
                <div className="w-full px-8 py-4 bg-white/5 text-white/40 font-bold rounded-xl text-center border border-white/10 cursor-not-allowed">
                  Waitlist Only
                </div>
              )}
              <p className="text-[10px] text-white/30 text-center mt-3 uppercase tracking-widest">
                Terms and conditions apply for lease applications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
