'use client';

import React, { useState } from 'react';
import { Heart, MapPin, Tag, ChevronRight, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { DigitalStorefront } from '@/types/storefront';

interface ShopCardProps {
  shop: DigitalStorefront;
  onClick?: () => void;
  onMessage?: (shopName: string) => void;
}

// Premium Placeholders for Broken/Blob URLs
const PLACEHOLDERS = [
  '/images/logo/gudget.jpg',
  '/images/logo/gudget2.jpg',
  '/images/logo/gudget3.webp',
  '/images/logo/logoshop.jpg',
];

const getSafeUrl = (url: string | null | undefined, index: number) => {
  if (!url || url.startsWith('blob:') || url.includes('placeholder')) {
    if (index === 0) return '/images/logo/logoshop.jpg'; // Default Logo
    return PLACEHOLDERS[(index - 1) % PLACEHOLDERS.length];
  }
  return url;
};

export const ShopCard = ({ shop, onClick, onMessage }: ShopCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const { id, shop_name, unit_id, is_open, logo_url } = shop;

  // Sync favorites with localStorage
  React.useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('sr_mall_favorites') || '[]');
    setIsFavorited(favorites.includes(id));
  }, [id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favorites = JSON.parse(localStorage.getItem('sr_mall_favorites') || '[]');
    let newFavorites;
    
    if (favorites.includes(id)) {
      newFavorites = favorites.filter((favId: string) => favId !== id);
      setIsFavorited(false);
    } else {
      newFavorites = [...favorites, id];
      setIsFavorited(true);
    }
    
    localStorage.setItem('sr_mall_favorites', JSON.stringify(newFavorites));
    
    // Trigger a custom event so other components can react if needed
    window.dispatchEvent(new Event('favorites-updated'));
  };

  return (
    <Link
      href={id === 'preview' ? '#' : `/shop/${id}`}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden shadow-[0_4px_20px_-1px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-[0_20px_50px_-8px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_50px_-8px_rgba(0,0,0,0.5)] transition-all duration-700 border border-slate-100 dark:border-white/5 cursor-pointer block ${!is_open ? 'opacity-80' : ''
        }`}
    >
      {/* Image Container with Hover Zoom & Grayscale Logic */}
      <div className={`relative h-64 sm:h-72 overflow-hidden transition-all duration-700 ${!is_open ? 'grayscale' : ''}`}>
        <Image
          src={getSafeUrl(logo_url, 0) || '/placeholder-shop.jpg'}
          alt={shop_name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Dark Overlay on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-700 pointer-events-none" />

        {/* Status Badge */}
        <div className={`absolute top-5 left-5 flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl transition-all duration-500 border border-white/20 shadow-xl ${is_open
          ? 'bg-emerald-500/80 text-white'
          : 'bg-zinc-800/80 text-zinc-100'
          }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${is_open ? 'bg-white shadow-[0_0_8px_white] animate-pulse' : 'bg-zinc-400'}`}></div>
          {is_open ? 'Open Now' : 'Closed'}
        </div>

        {/* Favorite Icon */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border border-white/20 backdrop-blur-xl shadow-xl ${isFavorited
            ? 'bg-primary text-white scale-110 shadow-primary/40'
            : 'bg-white/30 text-white hover:bg-white hover:text-primary hover:scale-110'
            }`}
        >
          <Heart size={18} fill={isFavorited ? "currentColor" : "none"} />
        </button>

        {/* Floating Unit ID Tag */}
        <div className="absolute bottom-5 left-5 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
           <MapPin size={12} className="text-primary" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">{unit_id}</span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-8">
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex justify-between items-start">
             <div>
                <h3 className="text-2xl font-black text-charcoal dark:text-white tracking-tighter group-hover:text-primary transition-colors leading-none mb-2">
                  {shop_name}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   {shop.id === 'preview' ? 'Sample Store' : 'Official Retailer'}
                </div>
             </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2 mt-4">
            {shop.description || 'Discover a premium selection of high-quality products and bespoke services curated just for you at SR Mall.'}
          </p>
        </div>

        <div className="flex items-center gap-4 pt-6 mt-2 border-t border-slate-100 dark:border-white/5">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onMessage) onMessage(shop_name);
            }}
            className="flex-1 py-4 bg-slate-50 dark:bg-zinc-800/50 hover:bg-primary hover:text-white text-slate-900 dark:text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-slate-200 dark:border-white/5 flex items-center justify-center gap-3 shadow-sm hover:shadow-lg hover:shadow-primary/20 active:scale-95"
          >
            <MessageCircle size={16} className="" />
            Inquire
          </button>
          
          <div className="w-12 h-12 rounded-[1.25rem] bg-primary text-white flex items-center justify-center transition-all shadow-[0_10px_20px_-5px_rgba(190,30,45,0.3)] group-hover:shadow-[0_15px_30px_-5px_rgba(190,30,45,0.5)] active:scale-95 group-hover:scale-110">
             <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
};
