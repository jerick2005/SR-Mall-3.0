'use client';

import React, { useState, useEffect } from 'react';

// Default SR-MANAGE Ad when nothing is live
const DEFAULT_AD = {
  id: 'default',
  title: 'Luxe Summer Sale',
  description: 'Experience up to 70% off on all premium luxury brands this weekend only. Join us for a unique shopping gala.',
  imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000',
  ctaText: 'View Directory',
};

export const AdBanner = ({ ads, tenantPromos }: { ads?: any[]; tenantPromos?: any[] }) => {
  const [localAds, setLocalAds] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    console.log('=== AD BANNER: useEffect triggered ===');
    console.log('=== AD BANNER: ads ===', ads);
    console.log('=== AD BANNER: tenantPromos ===', tenantPromos);
    
    if (ads && ads.length > 0 && tenantPromos && tenantPromos.length > 0) {
      // Combine both mall ads and tenant promos
      const combined = [...ads, ...tenantPromos];
      console.log('=== AD BANNER: Combining ads ===', combined);
      setLocalAds(combined);
    } else if (ads && ads.length > 0) {
      console.log('=== AD BANNER: Using mall ads only ===', ads);
      setLocalAds(ads);
    } else if (tenantPromos && tenantPromos.length > 0) {
      console.log('=== AD BANNER: Using tenant promos only ===', tenantPromos);
      setLocalAds(tenantPromos);
    } else {
      console.log('=== AD BANNER: Fetching active ads ===');
      fetchActiveAds();
    }
  }, [ads, tenantPromos]); // Remove localAds from dependencies

  // Separate effect for interval
  useEffect(() => {
    if (localAds.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % localAds.length);
    }, 8000); // 8 seconds per ad slide
    return () => clearInterval(interval);
  }, [localAds.length]); // Only depend on length, not the whole array

  const fetchActiveAds = async () => {
    console.log('=== AD BANNER: FETCHING ADS ===');
    try {
      const { getAllMallAds, getApprovedTenantPromos } = await import('@/app/actions/ads');
      const { getSiteConfig } = await import('@/app/actions/site-config');
      
      const config = await getSiteConfig();
      const dynamicDefaultAd = {
        id: 'default',
        title: config?.defaultAdTitle || 'Elevate Your Lifestyle.',
        description: config?.defaultAdDesc || 'Discover premium shopping and dining experiences at SR Mall.',
        imageUrl: config?.defaultAdImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000',
        ctaText: config?.defaultAdCta || 'View Directory',
      };

      const mallAdsData = await getAllMallAds();
      const tenantPromosData = await getApprovedTenantPromos();
      console.log('=== AD BANNER: MALL ADS DATA ===', mallAdsData);
      console.log('=== AD BANNER: TENANT PROMOS DATA ===', tenantPromosData);
      
      const allAds = [...mallAdsData, ...tenantPromosData];
      
      if (allAds && allAds.length > 0) {
        console.log('=== AD BANNER: SETTING LOCAL ADS ===', allAds);
        setLocalAds(allAds);
      } else {
        console.log('=== AD BANNER: USING DEFAULT AD ===');
        setLocalAds([dynamicDefaultAd]);
      }
    } catch (error) {
      console.error('=== AD BANNER: ERROR ===', error);
      if (localAds.length === 0) setLocalAds([DEFAULT_AD]); // hard fallback
    }
  };

  const activeAd = (ads || localAds)[currentIndex] || DEFAULT_AD;

  const handleAdClick = async (adId: string) => {
    if (adId === 'default') return;

    // Navigate to directory or shop profile
    document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden group">
      {/* High-impact Image/Video with Dark Overlay */}
      {localAds.map((ad, index) => (
        <div
          key={ad.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {(() => {
            console.log('=== AD BANNER: Rendering ad ===', {
              id: ad.id,
              title: ad.title,
              hasPromoVideo: !!ad.promoVideo,
              hasImageUrl: !!ad.imageUrl,
              imageUrl: ad.imageUrl,
              promoVideo: ad.promoVideo,
              mediaType: ad.mediaType
            });
            
            const isVideo = ad.promoVideo || ad.imageUrl?.includes('.mp4') || ad.imageUrl?.includes('.webm') || ad.imageUrl?.includes('.mov');
            console.log('=== AD BANNER: Is video? ===', isVideo);
            
            return isVideo ? (
              <video
                src={ad.promoVideo || ad.imageUrl}
                className="w-full h-full object-cover transition-transform duration-[20s] scale-105 group-hover:scale-110"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={ad.promoImage || ad.imageUrl}
                alt={ad.title}
                className="w-full h-full object-cover transition-transform duration-[20s] scale-105 group-hover:scale-110"
              />
            );
          })()}
          <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 dark:from-black/60 dark:via-black/30 to-transparent flex items-center">
            <div className="max-w-7xl mx-auto px-10 w-full">
              <div className="max-w-xl animate-fade-in-up">
                <span className="inline-block px-4 py-1.5 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-6 rounded-full shadow-lg shadow-primary/30">
                  {ad.id === 'default' ? 'Featured Content' : 'Sponsored Content'}
                </span>
                <h2 className="text-5xl md:text-7xl font-bold text-charcoal dark:text-white mb-6 leading-tight tracking-tight">
                  {ad.title}
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed font-medium line-clamp-3">
                  {ad.description || 'Visit us and experience the future of digital shopping today.'}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => handleAdClick(ad.id)}
                    className="px-10 py-5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition-all active:scale-95 shadow-xl"
                  >
                    {ad.id === 'default' ? DEFAULT_AD.ctaText : ad.tenant ? 'View Tenant Page' : 'Learn More'}
                  </button>
                  <button className="px-8 py-5 border border-slate-200 dark:border-white/20 text-charcoal dark:text-white text-sm font-bold rounded-full hover:bg-slate-50 dark:hover:bg-white/10 transition-all backdrop-blur-sm">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      {localAds.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md px-3 py-2 rounded-full border border-slate-200 dark:border-white/10">
          {localAds.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentIndex ? 'bg-primary w-4' : 'bg-slate-400 dark:bg-white/50 hover:bg-primary dark:hover:bg-white'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
