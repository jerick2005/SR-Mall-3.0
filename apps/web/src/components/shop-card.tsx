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

  return (
    <Link
      href={id === 'preview' ? '#' : `/shop/${id}`}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 dark:border-white/5 cursor-pointer block ${!is_open ? 'opacity-80' : ''
        }`}
    >
      {/* Image Container with Hover Zoom & Grayscale Logic */}
      <div className={`relative h-56 overflow-hidden transition-all duration-500 ${!is_open ? 'grayscale' : ''}`}>
        <Image
          src={getSafeUrl(logo_url, 0) || '/placeholder-shop.jpg'}
          alt={shop_name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Status Badge */}
        <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-all duration-300 ${is_open
          ? 'bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/20'
          : 'bg-zinc-700/90 text-zinc-100'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${is_open ? 'bg-white animate-pulse' : 'bg-zinc-400'}`}></span>
          {is_open ? 'Open Now' : 'Closed'}
        </div>

        {/* Favorite Icon */}
        <button
          onClick={(e) => {
            e.preventDefault(); // Prevent navigation when favoriting
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-300 ${isFavorited
            ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/40'
            : 'bg-white/80 backdrop-blur-sm text-charcoal hover:bg-white hover:scale-105'
            }`}
        >
          <Heart size={16} fill={isFavorited ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Info Section */}
      <div className="p-6">
        <div className="flex flex-col gap-1.5 mb-5">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-charcoal dark:text-white group-hover:text-primary transition-colors leading-tight">
              {shop_name}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-md">
              <MapPin size={10} strokeWidth={3} />
              {unit_id}
            </div>
          </div>
          <p className="text-sm text-slate-500 line-clamp-2 mt-1">
            {shop.description || 'Welcome to our premium storefront at SR Mall.'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-slate-50 dark:border-white/5 gap-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onMessage) onMessage(shop_name);
            }}
            className="flex-1 py-3 bg-slate-50 dark:bg-zinc-800 hover:bg-primary hover:text-white text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all border border-slate-100 dark:border-white/5 flex items-center justify-center gap-2 group/btn"
          >
            <MessageCircle size={14} className="text-primary group-hover/btn:text-white" />
            Message
          </button>
          <div className="flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-2 transition-all whitespace-nowrap">
            Visit <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
};
