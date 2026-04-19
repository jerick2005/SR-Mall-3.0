"use client";

import React, { useState, useEffect } from "react";

// Default SR-MANAGE Ad when nothing is live
const DEFAULT_AD = {
  id: "default",
  title: "Luxe Summer Sale",
  description:
    "Experience up to 70% off on all premium luxury brands this weekend only. Join us for a unique shopping gala.",
  imageUrl:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000",
  ctaText: "View Directory",
};

export const AdBanner = ({
  ads,
  tenantPromos,
  extraItems,
}: {
  ads?: any[];
  tenantPromos?: any[];
  extraItems?: any[];
}) => {
  const [localAds, setLocalAds] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Combine Mall Ads, Tenant Promos, and Extra Carousel Items
    const mallAds = ads || [];
    const promos = tenantPromos || [];
    const extras = extraItems || [];

    let combined = [...mallAds, ...promos, ...extras];

    // Sort by priority if available
    combined = combined.sort((a, b) => {
      const priorityA =
        typeof a.priority === "string"
          ? a.priority === "HIGH"
            ? 3
            : a.priority === "MEDIUM"
              ? 2
              : 1
          : a.priority || 0;
      const priorityB =
        typeof b.priority === "string"
          ? b.priority === "HIGH"
            ? 3
            : b.priority === "MEDIUM"
              ? 2
              : 1
          : b.priority || 0;
      return priorityB - priorityA;
    });

    if (combined.length > 0) {
      setLocalAds(combined);
    } else {
      fetchActiveAds();
    }
  }, [ads, tenantPromos, extraItems]);

  // Separate effect for interval
  useEffect(() => {
    if (localAds.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % localAds.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [localAds.length]);

  const fetchActiveAds = async () => {
    try {
      const { getAllMallAds, getApprovedTenantPromos } =
        await import("@/app/actions/ads");
      const { getPublicViewCarouselAction } = await import("@/app/actions/cms");

      const [mallAdsData, tenantPromosData, carouselData] = await Promise.all([
        getAllMallAds(),
        getApprovedTenantPromos(),
        getPublicViewCarouselAction(),
      ]);

      const allAds = [...mallAdsData, ...tenantPromosData, ...carouselData];

      if (allAds && allAds.length > 0) {
        setLocalAds(allAds);
      } else {
        setLocalAds([DEFAULT_AD]);
      }
    } catch (error) {
      console.error("AdBanner fetch error:", error);
      if (localAds.length === 0) setLocalAds([DEFAULT_AD]);
    }
  };

  const activeAd = localAds[currentIndex] || DEFAULT_AD;

  const handleAdClick = (ad: any) => {
    if (ad.id === "default") return;
    if (ad.linkUrl) {
      window.location.href = ad.linkUrl;
      return;
    }
    document
      .getElementById("directory")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full h-[280px] sm:h-[380px] md:h-[500px] overflow-hidden group">
      {localAds.map((ad, index) => (
        <div
          key={ad.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          {(() => {
            // Enhanced media detection
            const url = ad.promoVideo || ad.imageUrl;
            const isVideo =
              ad.promoVideo ||
              ad.mediaType === "VIDEO" ||
              url?.match(/\.(mp4|webm|mov|ogg)$/i) ||
              url?.includes("/video/upload/");

            return isVideo ? (
              <video
                src={url}
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
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center">
            <div className="max-w-7xl mx-auto px-5 sm:px-10 w-full">
              <div className="max-w-xs sm:max-w-xl animate-fade-in-up">
                <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-primary text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-3 sm:mb-6 rounded-full shadow-lg shadow-primary/30">
                  {ad.tenantId ? "Tenant Spotlight" : "Experience SR Mall"}
                </span>
                <h2 className="text-2xl sm:text-5xl md:text-7xl font-bold text-white mb-2 sm:mb-6 leading-tight tracking-tight line-clamp-2 sm:line-clamp-none">
                  {ad.title}
                </h2>
                <p className="text-xs sm:text-lg text-white/80 mb-4 sm:mb-10 leading-relaxed font-medium line-clamp-2 sm:line-clamp-3">
                  {ad.description ||
                    "Visit us and experience the future of digital shopping today."}
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <button
                    onClick={() => handleAdClick(ad)}
                    className="px-5 sm:px-10 py-3 sm:py-5 bg-primary text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-primary transition-all active:scale-95 shadow-xl shadow-primary/20"
                  >
                    {ad.linkUrl ? "Explore Now" : "View Directory"}
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
              className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentIndex ? "bg-primary w-4" : "bg-slate-400 dark:bg-white/50 hover:bg-primary dark:hover:bg-white"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
