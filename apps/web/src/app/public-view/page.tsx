'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ShopCard } from '@/components/shop-card';
import { AdBanner } from '@/components/ad-banner';
import { FeedbackSection } from '@/components/feedback-section';
import { ChatBox } from '@/components/chat-box';
import { EventInquiryForm } from '@/components/event-inquiry-form';
import { Search, MapPin, Navigation, ArrowRight, MessageCircle, X, Loader2, RefreshCw, Tag, ShoppingBag, Sparkles, Zap, Shirt, Coffee } from 'lucide-react';
import Link from 'next/link';
import { LoginModal } from '@/components/login-modal';
import { useAuth } from '@/app/providers';
import { DigitalStorefront } from '@/types/storefront';
import { getAllStorefrontsAction } from '@/app/actions/tenant';
import { getAreaSlots } from '@/app/actions/space-slot';

import { AreaSlot } from '@srmall/database';
import { getAllMallAds, getApprovedTenantPromos } from '@/app/actions/ads';
import { getPublicViewConfigAction, getPublicViewCarouselAction } from '@/app/actions/cms';
import SpaceDetailModal from '@/components/space-detail-modal';
import clsx from 'clsx';

export default function PublicDigitalConcierge() {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleSlotsCount, setVisibleSlotsCount] = useState(4);
  const [isLoadingMoreSlots, setIsLoadingMoreSlots] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [shops, setShops] = useState<DigitalStorefront[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [slots, setSlots] = useState<AreaSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<AreaSlot | null>(null);
  
  // Dynamic Chat Intros
  const [chatRecipient, setChatRecipient] = useState<'shop' | 'admin' | null>(null);
  const [chatInitialShopName, setChatInitialShopName] = useState<string | null>(null);
  const [chatInquirySlotId, setChatInquirySlotId] = useState<string | null>(null);
  
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [tenantPromos, setTenantPromos] = useState<any[]>([]);
  const [carouselItems, setCarouselItems] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [allFeaturedProducts, setAllFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchConfig();
    fetchShops();
    fetchSlots();
    fetchAds();
    fetchCarousel();

    // Refetch when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchConfig();
        fetchCarousel();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await getPublicViewConfigAction();
      setConfig(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAds = async () => {
    try {
      console.log('🔍 Public view: Fetching ads...');
      const adsData = await getAllMallAds();
      const tenantPromosData = await getApprovedTenantPromos();

      console.log('📊 Public view: Ads fetched:', adsData.length, 'items');
      console.log('📊 Public view: Tenant promos fetched:', tenantPromosData.length, 'items');
      console.log('📊 Public view: Ads data:', adsData);
      console.log('📊 Public view: Tenant promos data:', tenantPromosData);

      setAds(adsData);
      setTenantPromos(tenantPromosData);

      console.log('📊 Public view: Setting ads state:', adsData);
      console.log('📊 Public view: Setting tenantPromos state:', tenantPromosData);
    } catch (error) {
      console.error('❌ Public view: Error fetching ads:', error);
    }
  };

  const fetchCarousel = async () => {
    try {
      const data = await getPublicViewCarouselAction();
      setCarouselItems(data);
    } catch (error) {
      console.error('❌ Public view: Error fetching carousel:', error);
    }
  };

  // Force refresh function to manually trigger data fetch
  const refreshAds = () => {
    console.log('🔄 Public view: Manual refresh triggered');
    fetchAds();
  };

  const fetchShops = async () => {
    setLoadingShops(true);
    const res = await getAllStorefrontsAction();
    if (res.success && res.data) {
      setShops(res.data);
      
      // Aggregate some featured products for the landing page
      const featured = res.data.flatMap((shop: any) => 
        (shop.products || []).map((p: any) => ({
          ...p,
          shopName: shop.shop_name,
          shopId: shop.id
        }))
      );
      setAllFeaturedProducts(featured.sort(() => 0.5 - Math.random()).slice(0, 8));
    }
    setLoadingShops(false);
  };

  const fetchSlots = async () => {
    setLoadingSlots(true);
    const res = await getAreaSlots();
    if (res.success && res.data) {
      setSlots(res.data);
    }
    setLoadingSlots(false);
  };

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.unit_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All Categories" ||
      shop.description?.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const filteredSlots = slots.filter(slot => {
    // If user types "event", "space", or "slot", show all available slots
    const isGenericSpaceSearch = ["event", "space", "slot", "available"].some(term =>
      searchQuery.toLowerCase().includes(term)
    );

    const matchesSearch = slot.unit_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      isGenericSpaceSearch;

    return matchesSearch && slot.status === 'AVAILABLE';
  });

  const handleSearchClick = () => {
    const isSpaceSearch = ["event", "space", "slot", "available"].some(term =>
      searchQuery.toLowerCase().includes(term)
    );

    if (isSpaceSearch && filteredSlots.length > 0) {
      document.getElementById('availability')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 3);
      setIsLoadingMore(false);
    }, 800);
  };

  const handleLoadMoreSlots = () => {
    setIsLoadingMoreSlots(true);
    setTimeout(() => {
      setVisibleSlotsCount(prev => prev + 4);
      setIsLoadingMoreSlots(false);
    }, 800);
  };

  const visibleShopsArray = filteredShops.slice(0, visibleCount);
  const hasMore = visibleCount < filteredShops.length;

  const visibleSlotsArray = filteredSlots.slice(0, visibleSlotsCount);
  const hasMoreSlots = visibleSlotsCount < filteredSlots.length;


  return (
    <div className={clsx('min-h-screen', 'bg-slate-100', 'dark:bg-black', 'font-sans', 'selection:bg-primary', 'selection:text-white', 'overflow-x-hidden')}>
      <Navbar />

      {/* High Impact Hero Carousel */}
      <section className={clsx('w-full', 'relative', 'bg-black', 'pt-20')}>
        <AdBanner ads={ads} tenantPromos={tenantPromos} />

      </section>

      {/* Hero Content Section */}
      {config?.isMaintenance ? (
        <section className={clsx('min-h-screen', 'bg-slate-50', 'dark:bg-charcoal', 'flex', 'flex-col', 'items-center', 'justify-center', 'p-4', 'sm:p-8', 'lg:p-20', 'text-center', 'animate-fade-in')}>
          <div className={clsx('w-24', 'h-24', 'bg-primary/20', 'text-primary', 'border', 'border-primary/40', 'rounded-[2.5rem]', 'flex', 'items-center', 'justify-center', 'mb-10', 'shadow-2xl')}>
            <Loader2 size={48} className="animate-spin" />
          </div>
          <h1 className={clsx('text-5xl', 'font-black', 'text-charcoal', 'dark:text-white', 'mb-4', 'uppercase', 'tracking-tighter')}>System Maintenance</h1>
          <p className={clsx('text-slate-500', 'dark:text-slate-400', 'font-bold', 'max-w-lg', 'uppercase', 'tracking-widest', 'text-sm', 'leading-loose')}>
            We are currently upgrading the SR-MANAGE platform to serve you better. We'll be back shortly.
          </p>
        </section>
      ) : (
        <section className={clsx('relative', 'pt-16', 'sm:pt-20', 'lg:pt-24', 'pb-20', 'sm:pb-28', 'lg:pb-32', 'overflow-hidden', 'flex', 'items-center', 'justify-center', 'min-h-[500px]', 'sm:min-h-[600px]')}>
          <div className={clsx('absolute', 'inset-0', 'bg-slate-50', 'dark:bg-black')}>
            <div
              className={clsx('absolute', 'inset-0', 'bg-cover', 'bg-center', 'opacity-30', 'dark:opacity-60', 'transition-opacity', 'duration-1000')}
              style={{
                backgroundImage: `url(${config?.heroBgUrl || 'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&q=80&w=2000'})`,
                opacity: 1 - (config?.heroOverlayDark || 40) / 100
              }}
            />
            <div className={clsx('absolute', 'inset-0', 'bg-linear-to-b', 'from-white', 'via-white/20', 'to-white', 'dark:from-black/80', 'dark:to-black/80')}></div>
          </div>

          <div className={clsx('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'relative', 'z-10', 'flex', 'flex-col', 'items-center', 'text-center')}>
            <div className={clsx('max-w-4xl', 'space-y-6', 'sm:space-y-8', 'lg:space-y-10')}>
              <div className={clsx('space-y-3', 'sm:space-y-4')}>
                <span className={clsx('inline-block', 'px-3', 'sm:px-4', 'py-1', 'sm:py-1.5', 'bg-primary/10', 'text-primary', 'text-[10px]', 'sm:text-[11px]', 'font-bold', 'uppercase', 'tracking-[0.15em]', 'sm:tracking-[0.2em]', 'rounded-full', 'border', 'border-primary/20', 'animate-fade-in', 'shadow-sm', 'backdrop-blur-md')}>
                  {config?.heroBadge || "Professional Mall Management System"}
                </span>
                <h1 className={clsx('text-4xl', 'sm:text-5xl', 'md:text-6xl', 'lg:text-8xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tight', 'leading-[1.05]', 'sm:leading-[1.1]', 'animate-fade-in-up', 'drop-shadow-sm')}>
                  {config?.heroTitle || "Experience the Future of Shopping."}
                </h1>
                <p className={clsx('text-xs', 'sm:text-lg', 'md:text-xl', 'text-slate-600', 'dark:text-slate-300', 'font-medium', 'max-w-xl', 'sm:max-w-2xl', 'mx-auto', 'leading-relaxed', 'animate-fade-in-up', 'delay-100', 'drop-shadow-none', 'px-4', 'sm:px-0')}>
                  {config?.heroSubtitle || "Discover world-class retail, dining, and workspace solutions at SR Mall — your digital concierge for everything mall-related."}
                </p>
              </div>

              <div className={clsx('relative', 'max-w-xl', 'sm:max-w-2xl', 'mx-auto', 'group', 'animate-fade-in-up', 'delay-200', 'px-2', 'sm:px-0')}>
                <div className={clsx('absolute', '-inset-1', 'bg-linear-to-r', 'from-primary', 'to-blue-600', 'rounded-3xl', 'blur', 'opacity-25', 'group-hover:opacity-40', 'transition', 'duration-1000', 'group-hover:duration-200')}></div>
                <div className={clsx('relative', 'flex', 'flex-col', 'sm:flex-row', 'items-center', 'bg-slate-100/95', 'dark:bg-zinc-900/95', 'backdrop-blur-xl', 'rounded-2xl', 'shadow-2xl', 'p-2', 'border', 'border-white/20')}>
                  <Search size={22} className={clsx('ml-5', 'text-slate-400')} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find a shop, service, or event space..."
                    className={clsx('w-full', 'px-5', 'py-4', 'bg-transparent', 'text-charcoal', 'dark:text-white', 'focus:outline-none', 'text-sm', 'font-medium', 'placeholder:text-slate-400')}
                  />
                  <button
                    onClick={handleSearchClick}
                    className={clsx('px-6', 'sm:px-10', 'py-3', 'sm:py-4', 'bg-primary', 'text-white', 'font-bold', 'rounded-xl', 'hover:bg-primary-hover', 'transition-all', 'active:scale-95', 'shadow-xl', 'shadow-primary/30', 'mt-2', 'sm:mt-0', 'w-full', 'sm:w-auto')}
                  >
                    {config?.primaryBtnText || "Explore Now"}
                  </button>
                </div>
              </div>

              <div className={clsx('flex', 'flex-row', 'items-center', 'justify-center', 'gap-4', 'sm:gap-6', 'lg:gap-12', 'pt-4', 'sm:pt-6')}>
                <div className={clsx('text-center', 'space-y-1')}>
                  <div className={clsx('text-xl sm:text-2xl', 'font-black', 'text-charcoal', 'dark:text-white', 'italic')}>250+</div>
                  <div className={clsx('text-[9px] sm:text-[10px]', 'font-bold', 'uppercase', 'tracking-widest', 'text-slate-500', 'dark:text-slate-400')}>Total Shops</div>
                </div>
                <div className={clsx('hidden sm:block w-px h-10 bg-slate-200', 'dark:bg-white/10')}></div>
                <div className={clsx('text-center', 'space-y-1', 'text-primary')}>
                  <div className={clsx('text-xl sm:text-2xl', 'font-black', 'italic')}>Open</div>
                  <div className={clsx('text-[9px] sm:text-[10px]', 'font-bold', 'uppercase', 'tracking-widest', 'opacity-60')}>Status</div>
                </div>
                <div className={clsx('hidden sm:block w-px h-10 bg-slate-200', 'dark:bg-white/10')}></div>
                <div className={clsx('text-center', 'space-y-1')}>
                  <div className={clsx('text-xl sm:text-2xl', 'font-black', 'text-charcoal', 'dark:text-white', 'italic')}>1.2M</div>
                  <div className={clsx('text-[9px] sm:text-[10px]', 'font-bold', 'uppercase', 'tracking-widest', 'text-slate-500', 'dark:text-slate-400')}>Monthly Visitors</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Showcase */}
      {allFeaturedProducts.length > 0 && (
        <section className={clsx('py-12 sm:py-20 lg:py-24', 'bg-white', 'dark:bg-zinc-900', 'border-y', 'border-slate-100', 'dark:border-white/5')}>
          <div className={clsx('max-w-7xl', 'mx-auto', 'px-4')}>
            <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-12 sm:mb-16">
              <div className="space-y-4">
                <span className={clsx('text-[10px]', 'font-black', 'text-primary', 'uppercase', 'tracking-[0.4em]', 'bg-primary/5', 'px-6', 'py-2', 'rounded-full', 'border', 'border-primary/10')}>Top Picks</span>
                <h2 className={clsx('text-4xl', 'sm:text-6xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tighter', 'leading-none')}>Featured <span className="text-slate-300 dark:text-zinc-800">Products.</span></h2>
              </div>
              <p className={clsx('max-w-sm', 'text-sm', 'text-slate-500', 'font-medium', 'leading-relaxed')}>Handpicked collections from our premier tenants, refreshed daily for your convenience.</p>
            </div>

            <div className={clsx('grid', 'grid-cols-2', 'md:grid-cols-4', 'gap-4', 'sm:gap-8')}>
              {allFeaturedProducts.map((product, idx) => (
                <div 
                  key={product.id} 
                  onClick={() => setSelectedProduct({ ...product, price: product.price })}
                  className={clsx('group', 'relative', 'bg-white', 'dark:bg-zinc-900', 'rounded-[2.5rem]', 'p-4', 'border-2', 'border-slate-100', 'dark:border-white/5', 'hover:border-primary/20', 'hover:shadow-[0_20px_60px_-15px_rgba(190,30,45,0.15)]', 'transition-all', 'duration-500', 'cursor-pointer', 'flex', 'flex-col')}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Premium Tag Badge */}
                  <div className="absolute -top-1 -right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-primary text-white text-[8px] font-black px-3 py-1 rounded-full shadow-lg rotate-3">MEMBER SPECIAL</div>
                  </div>

                  <div className={clsx('aspect-square', 'rounded-[2rem]', 'overflow-hidden', 'bg-slate-50', 'dark:bg-black', 'relative', 'mb-5', 'border', 'border-slate-100', 'dark:border-white/5')}>
                    {product.image_url ? (
                      <img src={product.image_url} className={clsx('w-full', 'h-full', 'object-cover', 'transition-transform', 'duration-700', 'group-hover:scale-110')} alt={product.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-zinc-800"><ShoppingBag size={48} /></div>
                    )}
                    
                    <div className={clsx('absolute', 'bottom-3', 'left-3', 'px-3', 'py-1', 'bg-white/90', 'dark:bg-zinc-900/90', 'backdrop-blur-md', 'rounded-full', 'text-[8px]', 'font-black', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-[0.2em]', 'shadow-sm', 'border', 'border-slate-100', 'dark:border-white/5')}>
                      {product.shopName}
                    </div>
                  </div>
                  
                  <div className="px-2 space-y-1">
                    <h4 className={clsx('text-[13px]', 'font-black', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-tighter', 'line-clamp-1', 'group-hover:text-primary', 'transition-colors')}>{product.name}</h4>
                    <div className="flex items-center justify-between">
                      <p className={clsx('text-base', 'font-black', 'text-primary')}>{product.price}</p>
                      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-black flex items-center justify-center text-slate-300 dark:text-zinc-700 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                         <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className={clsx('fixed', 'inset-0', 'z-50', 'flex', 'items-end', 'sm:items-center', 'justify-center', 'bg-black/90', 'backdrop-blur-xl', 'p-0', 'sm:p-4', 'animate-fade-in')}>
           <div className={clsx('w-full', 'sm:max-w-4xl', 'bg-white', 'dark:bg-zinc-900', 'rounded-t-[2rem]', 'sm:rounded-[3rem]', 'overflow-y-auto', 'max-h-[95svh]', 'sm:max-h-[90vh]', 'grid', 'grid-cols-1', 'md:grid-cols-2', 'relative', 'shadow-2xl', 'border', 'border-white/10')}>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-5 right-5 sm:top-8 sm:right-8 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full flex items-center justify-center text-charcoal dark:text-white transition-all shadow-lg active:scale-95"
              >
                <X size={20} />
              </button>

              <div className={clsx('aspect-square', 'md:aspect-auto', 'bg-slate-100', 'dark:bg-zinc-800', 'max-h-[45svh]', 'md:max-h-none')}>
                 {selectedProduct.image_url ? (
                   <img src={selectedProduct.image_url} className="w-full h-full object-cover" alt={selectedProduct.name} />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag size={80} /></div>
                 )}
              </div>

              <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center space-y-5 sm:space-y-8">
                 <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{selectedProduct.shopName}</span>
                    <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-charcoal dark:text-white uppercase tracking-tighter leading-none">{selectedProduct.name}</h3>
                    <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-2">{selectedProduct.price}</p>
                 </div>

                 <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
                   "{selectedProduct.description || 'No detailed description provided for this premium item.'}"
                 </p>

                 <div className="pt-3 sm:pt-6 space-y-3 sm:space-y-4">
                    <Link 
                      href={`/shop/${selectedProduct.shopId}`}
                      className="w-full py-4 sm:py-5 bg-charcoal dark:bg-zinc-800 text-white rounded-2xl flex items-center justify-center gap-4 font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                    >
                      Visit Official Store
                    </Link>
                    <button 
                      onClick={() => {
                        setChatInitialShopName(selectedProduct.shopName);
                        setChatRecipient('shop');
                        setIsChatOpen(true);
                        setSelectedProduct(null);
                      }}
                      className="w-full py-4 sm:py-5 bg-primary text-white rounded-2xl flex items-center justify-center gap-4 font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                       Inquire for Availability
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
      <section className={clsx('py-12', 'sm:py-16', 'lg:py-24', 'bg-slate-200', 'dark:bg-zinc-950', 'relative', 'overflow-hidden', 'border-y', 'border-slate-300', 'dark:border-white/5')}>
        <div className={clsx('absolute', 'inset-0', 'bg-primary/5', 'dark:bg-[#BE1E2D]/5')}></div>
        <div className={clsx('max-w-7xl', 'mx-auto', 'px-4', 'relative', 'z-10', 'flex', 'flex-col', 'md:flex-row', 'items-center', 'gap-8', 'sm:gap-12', 'lg:gap-16')}>

          <div className={clsx('w-full', 'md:w-1/2', 'space-y-6')}>
            <span className={clsx('text-xs', 'uppercase', 'tracking-[0.2em]', 'text-primary', 'dark:text-[#BE1E2D]', 'font-black', 'bg-primary/10', 'dark:bg-[#BE1E2D]/10', 'px-4', 'py-1.5', 'rounded-full', 'inline-block', 'border', 'border-primary/20', 'dark:border-[#BE1E2D]/20', 'shadow-sm')}>
              Featured Campaign
            </span>
            <h2 className={clsx('text-2xl sm:text-3xl md:text-4xl lg:text-5xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tight', 'leading-tight', 'drop-shadow-lg')}>
              Elevate Your <span className={clsx('text-transparent', 'bg-clip-text', 'bg-linear-to-r', 'from-primary', 'dark:from-[#BE1E2D]', 'to-orange-500')}>Lifestyle.</span>
            </h2>
            <p className={clsx('text-slate-600', 'dark:text-slate-400', 'font-medium', 'text-base', 'sm:text-lg', 'leading-relaxed', 'max-w-lg')}>
              Watch our latest visual showcase highlighting the premier shopping and dining experiences waiting for you at SR Mall. Immerse yourself in the extraordinary.
            </p>
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className={clsx('px-6', 'sm:px-8', 'py-3', 'sm:py-4', 'bg-primary', 'dark:bg-[#BE1E2D]', 'text-white', 'font-bold', 'rounded-xl', 'hover:bg-primary/90', 'dark:hover:bg-[#9E1B26]', 'transition-all', 'shadow-xl', 'shadow-primary/30', 'dark:shadow-[#BE1E2D]/30', 'active:scale-95', 'group', 'flex', 'items-center', 'gap-3', 'text-sm', 'sm:text-base')}>
              Watch Full Campaign
              <ArrowRight size={18} className={clsx('group-hover:translate-x-1', 'transition-transform')} />
            </button>
          </div>

          <div className={clsx('w-full', 'md:w-1/2', 'relative', 'group')}>
            <div className={clsx('absolute', '-inset-4', 'bg-linear-to-r', 'from-primary', 'dark:from-[#BE1E2D]', 'to-blue-600', 'rounded-[3rem]', 'blur-xl', 'opacity-20', 'group-hover:opacity-40', 'transition', 'duration-1000')}></div>
            <div className={clsx('relative', 'aspect-video', 'bg-black', 'rounded-4xl', 'overflow-hidden', 'border', 'border-slate-200', 'dark:border-white/10', 'shadow-2xl')}>
              <video
                src="/vid/Download.mp4"
                className={clsx('w-full', 'h-full', 'object-cover', 'opacity-80', 'group-hover:opacity-100', 'transition-opacity', 'duration-700')}
                autoPlay
                loop
                muted
                playsInline
              />
              <div className={clsx('absolute', 'inset-0', 'bg-linear-to-t', 'from-black/90', 'via-black/20', 'to-transparent', 'flex', 'items-end', 'p-4', 'sm:p-8')}>
                <div className={clsx('flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4')}>
                  <div className={clsx('w-10 h-10 sm:w-12 sm:h-12 bg-primary dark:bg-[#BE1E2D] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 animate-pulse cursor-pointer hover:scale-110 transition-transform flex-shrink-0')}>
                    <svg className={clsx('w-4 h-4 sm:w-5 sm:h-5 translate-x-0.5')} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <div>
                    <h4 className={clsx('text-sm sm:text-base text-white font-bold tracking-wide')}>SR Mall Cinematic Experience</h4>
                    <p className={clsx('text-slate-300 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold')}>Now Playing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Shop Directory Section */}
      <section id="directory" className={clsx('py-16 sm:py-20 lg:py-24 bg-slate-100 dark:bg-zinc-950')}>
        <div className={clsx('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8')}>
          {/* Section Header */}
          <div className={clsx('relative', 'mb-16', 'sm:mb-20')}>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="max-w-2xl">
                <span className={clsx('inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary bg-primary/10 px-6 py-2 rounded-full mb-6 border border-primary/20')}>
                  Premium Collection
                </span>
                <h2 className={clsx('text-4xl', 'sm:text-6xl', 'lg:text-7xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tighter', 'leading-[0.95]', 'lg:leading-[0.9]', 'mb-6', 'sm:mb-8')}>
                  Mall <br />
                  <span className="text-slate-300 dark:text-zinc-800">Directory.</span>
                </h2>
                <p className={clsx('text-sm', 'sm:text-lg', 'text-slate-500', 'dark:text-slate-400', 'font-medium', 'leading-relaxed', 'max-w-xl')}>
                  Navigate through our curated ecosystem of high-end retail, digital-first storefronts, and world-class dining destinations.
                </p>
              </div>

              {/* In-Section Search Input */}
              <div className="w-full lg:w-96">
                <div className="relative group">
                  <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search stores, brands, or unit IDs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-bold text-charcoal dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Icon-based Category Switcher */}
          <div className={clsx('flex', 'items-center', 'gap-3', 'sm:gap-4', 'mb-10', 'sm:mb-16', 'pb-4', 'overflow-x-auto', 'no-scrollbar', 'touch-pan-x', 'relative')}>
            {/* Scroll Indication for Mobile */}
            <div className="lg:hidden absolute right-0 top-0 bottom-4 w-8 bg-linear-to-l from-slate-100 dark:from-zinc-950 to-transparent pointer-events-none z-20"></div>
            {[
              { id: 'All Categories', label: 'Everything', icon: <ShoppingBag size={16} /> },
              { id: 'Food', label: 'Gastronomy', icon: <Coffee size={16} /> },
              { id: 'Tech', label: 'Innovation', icon: <Zap size={16} /> },
              { id: 'Fashion', label: 'Couture', icon: <Shirt size={16} /> },
              { id: 'Dining', label: 'Experience', icon: <Sparkles size={16} /> },
              { id: 'Electronics', label: 'Digital', icon: <Tag size={16} /> }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={clsx(
                  'flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-2',
                  selectedCategory === cat.id
                    ? 'bg-primary text-white border-primary shadow-[0_10px_30px_-5px_rgba(190,30,45,0.4)] scale-105 z-10'
                    : 'bg-white dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 border-slate-50 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'
                )}
              >
                <span className={selectedCategory === cat.id ? 'text-white' : 'text-slate-300'}>
                  {cat.icon}
                </span>
                {cat.label}
              </button>
            ))}
          </div>

          <div className={clsx('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10')}>
            {loadingShops ? (
              <div className={clsx('col-span-full', 'py-20', 'text-center', 'space-y-4')}>
                <Loader2 size={40} className={clsx('animate-spin', 'text-primary', 'mx-auto')} />
                <p className={clsx('text-sm', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>Loading Premium Collection...</p>
              </div>
            ) : visibleShopsArray.length > 0 ? (
              visibleShopsArray.map((shop, index) => (
                <div key={shop.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <ShopCard
                    shop={shop}
                    onMessage={(name) => {
                      setChatInitialShopName(name);
                      setChatRecipient('shop');
                      setIsChatOpen(true);
                    }}
                  />
                </div>
              ))
            ) : (
              <div className={clsx('col-span-full', 'py-20', 'text-center', 'bg-zinc-50', 'dark:bg-zinc-900', 'rounded-[3rem]', 'border', 'border-dashed', 'border-slate-200', 'dark:border-white/10')}>
                <p className={clsx('text-slate-500', 'font-bold', 'uppercase', 'tracking-widest', 'text-sm')}>No storefronts matching your search found.</p>
              </div>
            )}
          </div>

          {hasMore && (
            <div className={clsx('mt-12 sm:mt-16 text-center')}>
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className={clsx('inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-zinc-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl text-primary font-bold uppercase text-xs tracking-wider sm:tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-zinc-800 hover:border-primary transition-all active:scale-95 disabled:opacity-70 shadow-sm')}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 size={16} className={clsx('animate-spin', 'sm:w-[18px]', 'sm:h-[18px]')} />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More <ArrowRight size={16} className={clsx('group-hover:translate-x-1', 'transition-transform', 'sm:w-[18px]', 'sm:h-[18px]')} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Available Spaces Section */}
      <section id="availability" className={clsx('py-12', 'sm:py-20', 'lg:py-24', 'bg-gradient-to-b', 'from-slate-200', 'to-slate-100', 'dark:from-zinc-950', 'dark:to-zinc-900')}>
        <div className={clsx('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8')}>
          {/* Section Header */}
          <div className={clsx('text-center', 'mb-8', 'sm:mb-14')}>
            <span className={clsx('inline-flex', 'items-center', 'gap-2', 'text-[10px]', 'uppercase', 'tracking-[0.2em]', 'text-primary', 'font-black', 'bg-primary/10', 'px-4', 'py-1.5', 'rounded-full', 'mb-4')}>
              Leasing Opportunities
            </span>
            <h2 className={clsx('text-3xl', 'sm:text-4xl', 'lg:text-5xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tight', 'mb-4')}>
              Available Spaces
            </h2>
            <p className={clsx('text-xs', 'sm:text-base', 'text-slate-500', 'font-medium', 'max-w-xl', 'mx-auto', 'mb-6', 'sm:mb-8', 'leading-relaxed')}>
              Join our premium retail ecosystem. Explore available slots and start your journey at SR Mall.
            </p>
            <button
              className={clsx('inline-flex', 'items-center', 'gap-2', 'px-5', 'sm:px-8', 'py-3', 'sm:py-4', 'bg-primary', 'text-white', 'rounded-full', 'text-[10px]', 'sm:text-sm', 'font-bold', 'uppercase', 'tracking-wider', 'hover:bg-primary-hover', 'transition-all', 'active:scale-95', 'shadow-xl', 'shadow-primary/30', 'w-full', 'sm:w-auto', 'justify-center')}
              onClick={() => {
                setChatInitialShopName("Leasing Inquiry");
                setChatRecipient('admin');
                setChatInquirySlotId(null);
                setIsChatOpen(true);
              }}
            >
              <MessageCircle size={16} />
              Talk to Leasing Agent
            </button>
          </div>

          <div className={clsx('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4', 'gap-4', 'sm:gap-6')}>
            {loadingSlots ? (
              <div className={clsx('col-span-full', 'py-20', 'text-center')}>
                <Loader2 size={40} className={clsx('animate-spin', 'text-primary', 'mx-auto')} />
                <p className={clsx('mt-4', 'text-[10px]', 'font-black', 'uppercase', 'tracking-widest', 'text-slate-400')}>Syncing Physical Inventory...</p>
              </div>
            ) : visibleSlotsArray.length > 0 ? (
              visibleSlotsArray.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={clsx('group', 'relative', 'bg-white', 'dark:bg-zinc-950', 'rounded-[2rem]', 'sm:rounded-[3rem]', 'border-2', 'border-slate-200/60', 'dark:border-white/5', 'overflow-hidden', 'hover:border-primary/40', 'transition-all', 'duration-500', 'cursor-pointer', 'shadow-lg', 'hover:shadow-[0_40px_80px_-15px_rgba(190,30,45,0.25)]')}
                >
                  <div className={clsx('aspect-[4/3]', 'sm:aspect-4/5', 'relative', 'overflow-hidden', 'bg-charcoal')}>
                    {slot.space_images[0] ? (
                      <img
                        src={slot.space_images[0]}
                        className={clsx('w-full', 'h-full', 'object-cover', 'opacity-90', 'group-hover:opacity-100', 'group-hover:scale-105', 'transition-all', 'duration-1000')}
                      />
                    ) : (
                      <div className={clsx('w-full', 'h-full', 'flex', 'items-center', 'justify-center', 'text-white/10')}>
                        <MapPin size={48} strokeWidth={1} />
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className={clsx('absolute', 'inset-0', 'bg-linear-to-t', 'from-black/90', 'via-black/20', 'to-transparent', 'opacity-80')} />

                    <div className={clsx('absolute', 'bottom-8', 'left-8', 'right-8')}>
                      <div className={clsx('flex', 'items-center', 'gap-2', 'mb-2')}>
                        <div className={clsx('w-2', 'h-2', 'rounded-full', 'bg-emerald-500', 'shadow-[0_0_12px_rgba(16,185,129,0.8)]', 'animate-pulse')} />
                        <span className={clsx('text-[10px]', 'font-black', 'uppercase', 'tracking-[0.3em]', 'text-emerald-400')}>Prime Unit</span>
                      </div>
                      <h4 className={clsx('text-3xl', 'font-black', 'text-white', 'tracking-tighter', 'uppercase')}>Unit {slot.unit_id}</h4>
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Ready for Occupancy</p>
                    </div>
                  </div>

                  <div className={clsx('p-8', 'flex', 'items-center', 'justify-between', 'bg-white', 'dark:bg-zinc-950')}>
                    <div className="space-y-1">
                      <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'dark:text-zinc-600', 'uppercase', 'tracking-[0.2em]')}>Total Floor Area</p>
                      <p className={clsx('text-2xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tight')}>{slot.sqm_size} <span className="text-sm font-bold text-slate-300">SQM</span></p>
                    </div>
                    <div className={clsx('w-14', 'h-14', 'rounded-2xl', 'bg-slate-50', 'dark:bg-zinc-900', 'border', 'border-slate-100', 'dark:border-white/5', 'flex', 'items-center', 'justify-center', 'text-slate-400', 'group-hover:bg-primary', 'group-hover:text-white', 'group-hover:border-primary', 'group-hover:rotate-12', 'transition-all', 'duration-500', 'shadow-inner')}>
                      <ArrowRight size={24} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={clsx('col-span-full', 'py-20', 'text-center', 'bg-slate-100', 'dark:bg-zinc-900', 'border', 'border-dashed', 'border-slate-300', 'dark:border-white/10', 'rounded-[3rem]')}>
                <p className={clsx('text-sm', 'font-bold', 'text-slate-500', 'uppercase', 'tracking-widest')}>No spaces currently available for lease.</p>
              </div>
            )}
          </div>

          {hasMoreSlots && (
            <div className={clsx('mt-10 sm:mt-12 text-center')}>
              <button
                onClick={handleLoadMoreSlots}
                disabled={isLoadingMoreSlots}
                className={clsx('inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-zinc-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl text-primary font-bold uppercase text-xs tracking-wider sm:tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-zinc-800 hover:border-primary transition-all active:scale-95 disabled:opacity-70 shadow-sm')}
              >
                {isLoadingMoreSlots ? (
                  <>
                    <Loader2 size={16} className={clsx('animate-spin', 'sm:w-[18px]', 'sm:h-[18px]')} />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Spaces <ArrowRight size={16} className={clsx('group-hover:translate-x-1', 'transition-transform', 'sm:w-[18px]', 'sm:h-[18px]')} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Space Detail Modal */}
      {selectedSlot && (
        <SpaceDetailModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onLoginRequired={() => setIsLoginModalOpen(true)}
          onInquire={(unitId) => {
            setChatInitialShopName(`Leasing Inquiry for Unit ${unitId}`);
            setChatRecipient('admin');
            setChatInquirySlotId(unitId);
            setIsChatOpen(true);
            setSelectedSlot(null);
          }}
        />
      )}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      {/* High-Impact Event Inquiry Section */}
      <section id="event-inquiry" className={clsx('py-16 sm:py-24 lg:py-40 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden')}>
        {/* Background Visual Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary rounded-full blur-[200px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className={clsx('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10')}>
           <div className="text-center mb-16 sm:mb-24">
             <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6 border border-primary/20">
               Venue Booking
             </span>
             <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-black dark:text-white tracking-tighter leading-none mb-6">
               Plan Your Next <br />Masterpiece.
             </h2>
             <p className="max-w-2xl mx-auto text-sm sm:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
               Whether it's a corporate exhibit or a regional esports final, our digital-ready spaces provide the ultimate canvas for your event.
             </p>
           </div>
           
           <EventInquiryForm isAuthenticated={isAuthenticated} user={user} />
        </div>
      </section>

      {/* Gated Feedback & Communication */}
      <FeedbackSection isAuthenticated={isAuthenticated} />

      {/* Location Section */}
      <section id="location" className={clsx('py-16', 'sm:py-24', 'lg:py-32', 'bg-slate-100', 'dark:bg-black')}>
        <div className={clsx('max-w-7xl', 'mx-auto', 'px-4', 'grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-12', 'sm:gap-16', 'lg:gap-24', 'items-center')}>
          <div className={clsx('space-y-10', 'order-2', 'lg:order-1')}>
            <div className="space-y-4">
              <span className={clsx('text-xs', 'uppercase', 'tracking-[0.2em]', 'text-primary', 'font-bold', 'bg-primary/10', 'px-4', 'py-1.5', 'rounded-full', 'inline-block')}>
                Visit Us
              </span>
              <h2 className={clsx('text-3xl', 'sm:text-4xl', 'lg:text-5xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tight', 'leading-tight')}>
                Prime Location. <br />
                <span className="text-slate-400">Endless Access.</span>
              </h2>
            </div>

            <div className="space-y-8">
              <div className={clsx('group flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-slate-100 dark:border-white/5 transition-all hover:shadow-xl')}>
                <div className={clsx('w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-black flex items-center justify-center text-primary shadow-sm border border-slate-200 dark:border-white/5 flex-shrink-0')}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className={clsx('text-base sm:text-lg font-bold text-charcoal dark:text-white mb-1 sm:mb-2')}>Physical Address</h4>
                  <p className={clsx('text-xs sm:text-sm text-slate-500 font-medium leading-relaxed')}>
                    Crossing Villanueva, Misamis Oriental, <br />
                    9002, Philippines
                  </p>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/place/Sophie+Red+Mall/@8.6403138,124.761748,17z/data=!4m6!3m5!1s0x32ffe583faa1a8b5:0x4465b912f19f4403!8m2!3d8.6401918!4d124.7642264!16s%2Fg%2F11r9ngrmtw?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className={clsx('group flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-primary text-white transition-all hover:shadow-2xl hover:shadow-primary/30 cursor-pointer')}
              >
                <div className={clsx('w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md flex-shrink-0')}>
                  <Navigation size={24} />
                </div>
                <div>
                  <h4 className={clsx('text-base sm:text-lg font-bold mb-1 sm:mb-2')}>Get Directions</h4>
                  <p className={clsx('text-xs sm:text-sm text-white/70 font-medium leading-relaxed')}>
                    Open in Google Maps for the fastest route <br />
                    from your current location.
                  </p>
                </div>
              </a>
            </div>
          </div>

          <div className={clsx('relative', 'order-1', 'lg:order-2')}>
            <div className={clsx('aspect-square', 'bg-slate-100', 'dark:bg-zinc-900', 'rounded-[3rem]', 'overflow-hidden', 'group', 'shadow-2xl', 'border-8', 'border-zinc-100', 'dark:border-zinc-900/50')}>
              <iframe
                src="https://maps.google.com/maps?q=Sophie%20Red%20Mall%20Villanueva&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className={clsx('grayscale', 'group-hover:grayscale-0', 'transition-all', 'duration-700', 'contrast-125')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button for Chat - Available for all, but gated inside */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-10 sm:right-10 w-14 h-14 sm:w-20 sm:h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all z-50 group ${isChatOpen ? 'rotate-90' : ''}`}
      >
        {isChatOpen ? <X size={32} /> : <MessageCircle size={32} />}
        {!isChatOpen && (
          <span className={clsx('absolute', '-top-2', '-right-2', 'bg-blue-500', 'text-white', 'text-[10px]', 'font-bold', 'px-2', 'py-1', 'rounded-full', 'border-2', 'border-white', 'dark:border-black')}>
            LIVE
          </span>
        )}
      </button>

      <ChatBox
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        isAuthenticated={isAuthenticated}
        initialShopName={chatInitialShopName}
        initialRecipient={chatRecipient}
        inquirySlotId={chatInquirySlotId}
      />

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className={clsx('fixed', 'inset-0', 'z-50', 'flex', 'items-center', 'justify-center', 'bg-black/95', 'backdrop-blur-md', 'p-4')}>
          <button
            onClick={() => setIsVideoModalOpen(false)}
            className={clsx('absolute', 'top-6', 'right-6', 'z-50', 'p-3', 'bg-white/10', 'hover:bg-white/20', 'text-white', 'rounded-full', 'transition-all')}
          >
            <X size={24} />
          </button>
          <div className={clsx('w-full', 'max-w-5xl', 'aspect-video', 'bg-black', 'rounded-2xl', 'overflow-hidden', 'shadow-2xl', 'border', 'border-white/10', 'relative')}>
            <video
              src={config?.featuredVideoUrl || '/vid/Download.mp4'}
              className={clsx('w-full', 'h-full', 'object-contain')}
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
