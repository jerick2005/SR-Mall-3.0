'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  MessageCircle, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Store
} from 'lucide-react';
import { DigitalStorefront } from '@/types/storefront';
import { getStorefrontByIdAction } from '@/app/actions/tenant';
import { useAuth } from '@/app/providers';
import { ChatBox } from '@/components/chat-box';
import { LoginModal } from '@/components/login-modal';
import clsx from 'clsx';

// Premium Placeholders for Broken/Blob URLs
const PLACEHOLDERS = [
  '/images/logo/gudget.jpg',
  '/images/logo/gudget2.jpg',
  '/images/logo/gudget3.webp',
  '/images/logo/logoshop.jpg',
];

const getSafeUrl = (url: string | null | undefined, index: number) => {
  if (!url || url.startsWith('blob:') || url.includes('placeholder')) {
    return PLACEHOLDERS[index % PLACEHOLDERS.length];
  }
  return url;
};

// Helper function to return gallery_urls (now native array)
const getGalleryUrls = (galleryUrls: string[] | null | undefined): string[] => {
  return Array.isArray(galleryUrls) ? galleryUrls : [];
};

export default function ShopProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [shop, setShop] = useState<DigitalStorefront | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    async function loadShop() {
      if (params?.id) {
        const res = await getStorefrontByIdAction(params.id as string);
        if (res.success && res.data) {
          setShop(res.data);
        } else {
          setError(res.error || 'Shop not found');
        }
        setLoading(false);
      }
    }
    loadShop();
  }, [params?.id]);

  if (loading) {
    return (
      <div className={clsx('min-h-screen', 'bg-white', 'dark:bg-zinc-950', 'flex', 'flex-col', 'items-center', 'justify-center', 'space-y-6')}>
        <Loader2 className={clsx('w-12', 'h-12', 'text-primary', 'animate-spin')} />
        <p className={clsx('text-[10px]', 'font-black', 'uppercase', 'tracking-[0.3em]', 'text-slate-400', 'animate-pulse')}>Consulting Mall Concierge...</p>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className={clsx('min-h-screen', 'bg-white', 'dark:bg-zinc-950', 'flex', 'flex-col', 'items-center', 'justify-center', 'p-8', 'text-center')}>
        <div className={clsx('w-20', 'h-20', 'bg-primary/10', 'rounded-full', 'flex', 'items-center', 'justify-center', 'text-primary', 'mb-6')}>
          <AlertTriangle size={40} />
        </div>
        <h2 className={clsx('text-3xl', 'font-black', 'text-charcoal', 'dark:text-white', 'mb-4', 'uppercase', 'text-center')}>Slot Vacant</h2>
        <p className={clsx('text-slate-500', 'font-medium', 'max-w-sm', 'mb-8')}>{error || 'This unit currently has no digital profile.'}</p>
        <button 
          onClick={() => router.back()}
          className={clsx('flex', 'items-center', 'gap-2', 'px-8', 'py-4', 'bg-primary', 'text-white', 'rounded-2xl', 'font-black', 'text-xs', 'uppercase', 'tracking-widest', 'shadow-xl', 'shadow-primary/20', 'hover:scale-105', 'transition-transform')}
        >
          <ArrowLeft size={16} /> Return to Directory
        </button>
      </div>
    );
  }

  const galleryUrls = getGalleryUrls(shop.gallery_urls);

  return (
    <div className={clsx('min-h-screen', 'bg-slate-50', 'dark:bg-zinc-950', 'pb-24', 'lg:pb-0')}>
      
      {/* Dynamic Navigation Bar (Sticky) */}
      <nav className={clsx('sticky', 'top-0', 'z-50', 'bg-white/80', 'dark:bg-zinc-950/80', 'backdrop-blur-xl', 'border-b', 'border-slate-100', 'dark:border-white/5', 'px-6', 'py-4', 'flex', 'items-center', 'justify-between')}>
        <button 
          onClick={() => router.back()}
          className={clsx('w-12', 'h-12', 'rounded-2xl', 'bg-slate-50', 'dark:bg-zinc-900', 'flex', 'items-center', 'justify-center', 'text-slate-500', 'hover:bg-primary', 'hover:text-white', 'transition-colors', 'group')}
        >
          <ArrowLeft size={20} className={clsx('group-hover:-translate-x-1', 'transition-transform')}/>
        </button>
        
        <div className={clsx('flex', 'flex-col', 'items-center')}>
          <h4 className={clsx('text-[9px]', 'font-black', 'text-slate-400', 'uppercase', 'tracking-widest', 'leading-none', 'mb-1', 'text-center')}>Now Visiting</h4>
          <span className={clsx('text-sm', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tight')}>{shop.shop_name}</span>
        </div>

        <button className={clsx('w-12', 'h-12', 'rounded-2xl', 'bg-slate-50', 'dark:bg-zinc-900', 'flex', 'items-center', 'justify-center', 'text-slate-500')}>
           <AlertTriangle size={20} />
        </button>
      </nav>

      <div className={clsx('max-w-[1200px]', 'mx-auto', 'px-6', 'lg:px-12', 'py-10', 'lg:py-16', 'grid', 'grid-cols-1', 'lg:grid-cols-12', 'gap-12')}>
        
        {/* Left Column: Media (7 cols) */}
        <div className={clsx('lg:col-span-12', 'xl:col-span-7', 'space-y-8', 'animate-fade-in-up')}>
          
          {/* Main Hero Slider */}
          <div className={clsx('relative', 'aspect-4/3', 'sm:aspect-video', 'rounded-3xl', 'overflow-hidden', 'bg-slate-100', 'dark:bg-zinc-900', 'shadow-2xl', 'group/slider')}>
            {(() => {
              const galleryUrls = getGalleryUrls(shop.gallery_urls);
              if (!galleryUrls || galleryUrls.length === 0) {
                return (
                  <div className={clsx('w-full', 'h-full', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-slate-300')}>
                    <Store size={80} />
                    <span className={clsx('text-[10px]', 'font-black', 'uppercase', 'tracking-widest', 'mt-4', 'text-center')}>No Media Provided</span>
                  </div>
                );
              }

              const currentUrl = getSafeUrl(galleryUrls[activeImageIndex], activeImageIndex);
              const isVideo = currentUrl?.match(/\.(mp4|webm|mov|ogg)$/i) || currentUrl?.includes('/video/upload/');

              return isVideo ? (
                <video 
                  src={currentUrl} 
                  className={clsx('w-full', 'h-full', 'object-cover')}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img 
                  src={currentUrl} 
                  className={clsx('w-full', 'h-full', 'object-cover', 'transition-transform', 'duration-700', 'hover:scale-110')} 
                  alt="Store Highlight" 
                />
              );
            })()}
            
            {/* Overlay Gradient */}
            <div className={clsx('absolute', 'inset-0', 'bg-gradient-to-t', 'from-black/20', 'to-transparent', 'pointer-events-none')}></div>

            {/* Carousel Controls */}
            {(() => {
              const galleryUrls = getGalleryUrls(shop.gallery_urls);
              return galleryUrls && galleryUrls.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIndex(prev => (prev === 0 ? galleryUrls.length - 1 : prev - 1))}
                  className={clsx('absolute', 'left-6', 'top-1/2', '-translate-y-1/2', 'w-14', 'h-14', 'bg-white/20', 'hover:bg-white/40', 'backdrop-blur-md', 'rounded-full', 'flex', 'items-center', 'justify-center', 'text-white', 'opacity-0', 'group-hover/slider:opacity-100', 'transition-all', 'active:scale-90')}
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  onClick={() => setActiveImageIndex(prev => (prev === galleryUrls.length - 1 ? 0 : prev + 1))}
                  className={clsx('absolute', 'right-6', 'top-1/2', '-translate-y-1/2', 'w-14', 'h-14', 'bg-white/20', 'hover:bg-white/40', 'backdrop-blur-md', 'rounded-full', 'flex', 'items-center', 'justify-center', 'text-white', 'opacity-0', 'group-hover/slider:opacity-100', 'transition-all', 'active:scale-90')}
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )})()} {/* Carousel Controls End */}
            
            {/* Status Floating Badge */}
            <div className={clsx('absolute', 'bottom-10', 'left-10')}>
               <div className={`px-6 py-2 rounded-full backdrop-blur-md border flex items-center gap-2 shadow-2xl ${shop.is_open ? 'bg-emerald-500/80 border-white/20 text-white' : 'bg-slate-800/80 border-white/10 text-slate-300'}`}>
                 <CheckCircle size={16} className={shop.is_open ? 'animate-pulse' : ''} />
                 <span className={clsx('text-xs', 'font-black', 'uppercase', 'tracking-[0.2em]')}>{shop.is_open ? 'Open Now' : 'Closed'}</span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className={clsx('flex', 'gap-4', 'overflow-x-auto', 'pb-4', 'pt-2', 'no-scrollbar')}>
            {galleryUrls.map((url, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImageIndex(i)}
                className={`w-28 h-28 shrink-0 rounded-3xl overflow-hidden border-4 transition-all ${activeImageIndex === i ? 'border-primary ring-8 ring-primary/10' : 'border-white dark:border-zinc-900 opacity-60'}`}
              >
                <img src={getSafeUrl(url, i)} className={clsx('w-full', 'h-full', 'object-cover')} alt="Thumb" />
              </button>
            ))}
          </div>
          </div>
        </div>

        {/* Right Column: Identity & Logic (5 cols) */}
        <div className={clsx('lg:col-span-12', 'xl:col-span-5', 'space-y-12', 'animate-fade-in-up')} style={{ animationDelay: '200ms' }}>
          
          {/* Profile Header */}
          <div className={clsx('flex', 'flex-col', 'sm:flex-row', 'items-center', 'sm:items-start', 'gap-8')}>
            <div className={clsx('w-40', 'h-40', 'rounded-[3rem]', 'bg-white', 'dark:bg-zinc-900', 'p-2', 'shadow-2xl', 'border', 'border-slate-100', 'dark:border-white/5', 'shrink-0', 'overflow-hidden', 'rotate-3')}>
               <img src={getSafeUrl(shop.logo_url || '', 0)} className={clsx('w-full', 'h-full', 'object-cover', 'rounded-[2.8rem]')} alt="Logo" />
            </div>
            
            <div className={clsx('text-center', 'sm:text-left', 'space-y-3')}>
               <div className={clsx('flex', 'items-center', 'justify-center', 'sm:justify-start', 'gap-2')}>
                  <span className={clsx('text-[10px]', 'font-black', 'text-primary', 'uppercase', 'tracking-[0.3em]', 'text-center')}>Official Tenant</span>
                  <div className={clsx('w-1.5', 'h-1.5', 'rounded-full', 'bg-slate-300')}></div>
                  <span className={clsx('text-[10px]', 'font-black', 'text-slate-400', 'uppercase', 'tracking-widest', 'text-center')}>{shop.unit_id}</span>
               </div>
               <h1 className={clsx('text-5xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tighter', 'uppercase', 'leading-none', 'text-center', 'sm:text-left')}>{shop.shop_name}</h1>
               
               {/* Location / Slot info wrapper */}
               <div className={clsx('flex', 'items-center', 'justify-center', 'sm:justify-start', 'gap-4', 'p-4', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-100', 'dark:border-white/10', 'rounded-2xl', 'shadow-sm')}>
                  <div className={clsx('w-10', 'h-10', 'bg-primary', 'text-white', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'shrink-0')}>
                    <MapPin size={20} />
                  </div>
                  <div className={clsx('flex', 'flex-col', 'text-left')}>
                    <span className={clsx('text-[9px]', 'font-black', 'text-slate-400', 'uppercase', 'tracking-widest', 'leading-none', 'mb-1')}>Physical Location</span>
                    <span className={clsx('text-xs', 'font-black', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-widest', 'leading-tight')}>{shop.unit_id} — Plaza Level 1</span>
                  </div>
               </div>
            </div>
          </div>

          {/* About Us Section */}
          <div className="space-y-6">
            <h3 className={clsx('text-[10px]', 'font-black', 'text-slate-400', 'uppercase', 'tracking-[0.3em]', 'flex', 'items-center', 'justify-center', 'sm:justify-start', 'gap-2')}>
               <div className={clsx('w-4 h-px bg-primary hidden sm:block')} />
               Our Story
            </h3>
            <p className={clsx('text-lg', 'text-slate-600', 'dark:text-slate-400', 'font-medium', 'leading-relaxed', 'italic', 'text-center', 'sm:text-left')}>
              "{shop.description || 'Step into our world-class retail experience where tradition meets innovation. Discover curated collections designed exclusively for SR Mall patrons.'}"
            </p>
          </div>

          {/* Engagement Card */}
          <div className={clsx('bg-charcoal', 'dark:bg-zinc-900', 'rounded-[3rem]', 'p-10', 'text-white', 'space-y-10', 'shadow-3xl', 'shadow-charcoal/20')}>
             <div className={clsx('space-y-2', 'text-center', 'sm:text-left')}>
                <h4 className={clsx('text-2xl', 'font-black', 'tracking-tight', 'uppercase')}>Let's Connect</h4>
                <p className={clsx('text-sm', 'text-slate-400', 'font-medium')}>Have questions? Chat with us instantly.</p>
             </div>

             <div className="space-y-4">
                <button 
                  onClick={() => {
                    if (isAuthenticated) setIsChatOpen(true);
                    else setIsLoginModalOpen(true);
                  }}
                  className={clsx('w-full', 'py-6', 'bg-primary', 'text-white', 'rounded-3xl', 'flex', 'items-center', 'justify-center', 'gap-4', 'font-black', 'text-sm', 'uppercase', 'tracking-widest', 'hover:scale-105', 'active:scale-95', 'transition-all', 'shadow-xl', 'shadow-primary/30')}
                >
                  <MessageCircle size={24} /> Message Shop Owner
                </button>
                
                <div className={clsx('grid', 'grid-cols-2', 'gap-4')}>
                  <div className={clsx('p-4', 'bg-white/5', 'rounded-2xl', 'border', 'border-white/5', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-center', 'group', 'hover:bg-white/10', 'transition-colors')}>
                     <span className={clsx('text-[8px]', 'font-bold', 'text-slate-500', 'uppercase', 'tracking-widest', 'mb-1')}>Response Time</span>
                     <span className={clsx('text-[10px]', 'font-black', 'uppercase', 'tracking-tight')}>~ 5 Mins</span>
                  </div>
                  <div className={clsx('p-4', 'bg-white/5', 'rounded-2xl', 'border', 'border-white/5', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-center', 'group', 'hover:bg-white/10', 'transition-colors')}>
                     <span className={clsx('text-[8px]', 'font-bold', 'text-slate-500', 'uppercase', 'tracking-widest', 'mb-1')}>Issue?</span>
                     <span className={clsx('text-[10px]', 'font-black', 'uppercase', 'tracking-tight')}>Report Slot</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Footer Hint */}
          <p className={clsx('text-center', 'text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>
            Handcrafted for the Digital Concierge Experience
          </p>

        </div>
      </div>

      {/* Featured Products Section */}
      {shop?.products && shop.products.length > 0 && (
        <div className={clsx('max-w-[1200px]', 'mx-auto', 'px-6', 'lg:px-12', 'pb-24', 'animate-fade-in-up')} style={{ animationDelay: '400ms' }}>
          <div className={clsx('flex', 'items-center', 'justify-between', 'mb-10')}>
            <h3 className={clsx('text-3xl', 'font-black', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-tighter')}>Featured Products</h3>
            <div className={clsx('h-px', 'bg-slate-200', 'dark:bg-white/10', 'flex-1', 'ml-8')}></div>
          </div>
          
          <div className={clsx('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-8')}>
            {shop.products.map((product) => (
              <div key={product.id} className={clsx('group', 'bg-white', 'dark:bg-zinc-900', 'rounded-[2.5rem]', 'overflow-hidden', 'border', 'border-slate-100', 'dark:border-white/5', 'shadow-sm', 'hover:shadow-2xl', 'transition-all', 'duration-500', 'flex', 'flex-col', 'hover:-translate-y-2')}>
                <div className={clsx('aspect-[4/3]', 'relative', 'overflow-hidden', 'bg-slate-50', 'dark:bg-zinc-800')}>
                  {product.image_url ? (
                     <img src={getSafeUrl(product.image_url, 0)} className={clsx('w-full', 'h-full', 'object-cover', 'transition-transform', 'duration-700', 'group-hover:scale-110')} alt={product.name} />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-zinc-700">
                        <Store size={48} />
                     </div>
                  )}
                  {product.price && (
                    <div className={clsx('absolute', 'bottom-4', 'right-4', 'bg-white/90', 'dark:bg-zinc-900/90', 'backdrop-blur-md', 'px-5', 'py-2.5', 'rounded-full', 'shadow-lg', 'border', 'border-white/20', 'group-hover:scale-105', 'transition-transform')}>
                      <span className={clsx('text-xs', 'font-black', 'text-emerald-600', 'dark:text-emerald-400', 'tracking-widest')}>{product.price}</span>
                    </div>
                  )}
                </div>
                <div className={clsx('p-8', 'flex-1', 'flex', 'flex-col', 'border-t', 'border-slate-100', 'dark:border-white/5')}>
                  <h4 className={clsx('text-lg', 'font-black', 'text-charcoal', 'dark:text-white', 'mb-3', 'uppercase', 'tracking-tight', 'line-clamp-1')}>{product.name || 'Untitled Product'}</h4>
                  <p className={clsx('text-xs', 'font-medium', 'text-slate-500', 'dark:text-slate-400', 'line-clamp-3', 'flex-1', 'leading-relaxed')}>{product.description || 'No description available for this product.'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {shop && (
        <ChatBox 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          isAuthenticated={isAuthenticated}
          initialShopName={shop.shop_name}
          initialRecipient="shop"
        />
      )}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

    </div>
  );
}
