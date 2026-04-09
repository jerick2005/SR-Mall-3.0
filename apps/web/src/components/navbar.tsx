'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, User, Menu, LogOut, ChevronDown, X, Heart, ShoppingBag, Store } from 'lucide-react';
import { getAllStorefrontsAction } from '@/app/actions/tenant';
import { DigitalStorefront } from '@/types/storefront';
import { useAuth } from '@/app/providers';
import { LoginModal } from './login-modal';
import { MerchantApplicationModal } from './merchant-application-modal';
import NotificationDropdown from './notification-dropdown';
import { PublicThemeToggle } from './theme-toggle';
import clsx from 'clsx';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [allShops, setAllShops] = useState<DigitalStorefront[]>([]);

  const loadFavorites = () => {
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem('sr_mall_favorites') || '[]');
      setFavoriteIds(saved);
    }
  };

  useEffect(() => {
    loadFavorites();
    
    const fetchShops = async () => {
      const res = await getAllStorefrontsAction();
      if (res.success && res.data) setAllShops(res.data);
    };
    fetchShops();

    window.addEventListener('favorites-updated', loadFavorites);
    return () => window.removeEventListener('favorites-updated', loadFavorites);
  }, []);

  const favoriteShops = allShops.filter(s => favoriteIds.includes(s.id));

  return (
    <>
      <nav className={clsx('fixed', 'top-0', 'left-0', 'right-0', 'z-50', 'glass', 'bg-white/70', 'dark:bg-black/70', 'border-b', 'border-slate-100', 'dark:border-white/5')}>
        <div className={clsx('max-w-7xl', 'mx-auto', 'px-4', 'h-20', 'flex', 'items-center', 'justify-between')}>
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 sm:w-11 sm:h-11 bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg border-2 border-primary/20 group-hover:border-primary/50 transition-all duration-500">
              <img 
                src="/images/srmall-logo/sr_logo2.jpg" 
                alt="Sophie Red Mall Logo" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-black tracking-tighter text-charcoal dark:text-white leading-none">
                SR MALL
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-primary tracking-[0.2em] sm:tracking-[0.3em] uppercase leading-none mt-0.5">
                Management
              </span>
            </div>
          </Link>
          {/* Center: Nav links - hidden on mobile */}
          <div className={clsx('hidden', 'md:flex', 'items-center', 'gap-4', 'lg:gap-8')}>
            <Link href="#directory" className={clsx('text-sm', 'font-medium', 'text-slate-500', 'dark:text-slate-300', 'hover:text-primary', 'transition-colors')}>
              Mall Directory
            </Link>
            <Link href="#availability" className={clsx('text-sm', 'font-medium', 'text-slate-500', 'dark:text-slate-300', 'hover:text-primary', 'transition-colors')}>
              Available Spaces
            </Link>
            <Link href="#events" className={clsx('text-sm', 'font-medium', 'text-slate-500', 'dark:text-slate-300', 'hover:text-primary', 'transition-colors')}>
              What's On
            </Link>
            <Link href="#location" className={clsx('text-sm', 'font-medium', 'text-slate-500', 'dark:text-slate-300', 'hover:text-primary', 'transition-colors')}>
              Location
            </Link>
          </div>

          {/* Right: Status Pill & Auth */}
          <div className={clsx('flex items-center gap-2 sm:gap-4')}>
            <div className={clsx('hidden', 'lg:flex', 'items-center', 'gap-2', 'px-3', 'py-1.5', 'rounded-full', 'bg-red-950/30', 'border', 'border-red-900/30')}>
              <span className={clsx('flex', 'h-2', 'w-2', 'relative')}>
                <span className={clsx('animate-ping', 'absolute', 'inline-flex', 'h-full', 'w-full', 'rounded-full', 'bg-primary', 'opacity-75')}></span>
                <span className={clsx('relative', 'inline-flex', 'rounded-full', 'h-2', 'w-2', 'bg-primary')}></span>
              </span>
              <span className={clsx('text-[10px]', 'font-bold', 'uppercase', 'tracking-wider', 'text-primary')}>
                Mall is Open: 10:00 AM - 9:00 PM
              </span>
            </div>

            {isAuthenticated ? (
              <div className={clsx('flex', 'items-center', 'gap-4', 'relative')}>
                <PublicThemeToggle />
                {(user?.role === 'ADMIN' || user?.role === 'TENANT') && (
                  <Link
                    href={user.role === 'ADMIN' ? '/admindashboard' : '/tenantdashboard'}
                    className={clsx('hidden', 'md:flex', 'items-center', 'gap-2', 'px-5', 'py-2', 'bg-white', 'text-black', 'font-bold', 'text-xs', 'uppercase', 'tracking-widest', 'rounded-full', 'hover:bg-slate-200', 'transition-colors', 'shadow-lg')}
                  >
                    Go to Dashboard
                  </Link>
                )}
                
                {/* Notification Dropdown */}
                <NotificationDropdown />
                
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={clsx('flex', 'items-center', 'gap-3', 'px-4', 'py-2', 'bg-slate-100', 'dark:bg-zinc-800', 'rounded-full', 'border', 'border-slate-200', 'dark:border-white/5', 'transition-all', 'hover:shadow-lg')}
                  >
                    <div className={clsx('w-8', 'h-8', 'rounded-full', 'bg-primary', 'text-white', 'flex', 'items-center', 'justify-center', 'font-bold', 'text-sm')}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className={clsx('flex', 'flex-col', 'items-start', 'leading-none')}>
                      <span className={clsx('text-xs', 'font-bold', 'text-charcoal', 'dark:text-white')}>{user?.name}</span>
                      <span className={clsx('text-[10px]', 'text-slate-500', 'dark:text-slate-400', 'font-medium', 'tracking-tight', 'uppercase')}>
                        {user?.role?.toLowerCase() || 'Mall Visitor'}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className={clsx('absolute', 'top-full', 'right-0', 'mt-4', 'w-[calc(100vw-2rem)]', 'sm:w-72', 'bg-white', 'dark:bg-zinc-900', 'rounded-3xl', 'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]', 'border', 'border-slate-200', 'dark:border-white/5', 'animate-fade-in-up', 'overflow-hidden', 'z-[60]', 'max-w-xs')}>
                      <div className={clsx('px-6', 'py-4', 'border-b', 'border-slate-100', 'dark:border-white/5', 'bg-slate-50/50', 'dark:bg-white/5')}>
                        <p className={clsx('text-[10px]', 'font-black', 'text-slate-400', 'uppercase', 'tracking-[0.2em]')}>Account Overview</p>
                      </div>
                      
                      <div className="py-2">
                        <button className={clsx('w-full', 'flex', 'items-center', 'gap-3', 'px-6', 'py-3', 'text-xs', 'font-bold', 'text-charcoal', 'dark:text-white', 'hover:bg-slate-50', 'dark:hover:bg-white/5', 'transition-colors')}>
                          <User size={16} className="text-primary" /> My Profile
                        </button>
                        {(user?.role === 'CUSTOMER' || user?.role === 'USER') && (
                          <button 
                            onClick={() => {
                              setIsMerchantModalOpen(true);
                              setIsProfileOpen(false);
                            }}
                            className={clsx('w-full', 'flex', 'items-center', 'gap-3', 'px-6', 'py-3', 'text-xs', 'font-black', 'text-primary', 'hover:bg-primary/5', 'transition-colors', 'uppercase', 'tracking-widest')}
                          >
                            <Store size={16} /> Become a Partner
                          </button>
                        )}
                      </div>

                      {/* Favorites List */}
                      <div className={clsx('px-6', 'py-3', 'border-t', 'border-slate-100', 'dark:border-white/5')}>
                         <div className="flex items-center justify-between mb-3">
                            <p className={clsx('text-[10px]', 'font-black', 'text-slate-400', 'uppercase', 'tracking-[0.2em]', 'flex', 'items-center', 'gap-2')}>
                               <Heart size={12} className="text-primary fill-primary" /> Favorites
                            </p>
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{favoriteShops.length}</span>
                         </div>
                         
                         <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                            {favoriteShops.length > 0 ? (
                               favoriteShops.map(shop => (
                                  <Link 
                                    key={shop.id}
                                    href={`/shop/${shop.id}`}
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group/fav"
                                  >
                                     <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 overflow-hidden border border-slate-200 dark:border-white/5">
                                        {shop.logo_url ? (
                                           <img src={shop.logo_url} className="w-full h-full object-cover" />
                                        ) : (
                                           <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag size={14} /></div>
                                        )}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-charcoal dark:text-white truncate group-hover/fav:text-primary transition-colors">{shop.shop_name}</p>
                                        <p className="text-[9px] text-slate-400 font-medium">{shop.unit_id}</p>
                                     </div>
                                  </Link>
                               ))
                            ) : (
                               <div className="text-center py-6 px-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No Favorites Yet</p>
                               </div>
                            )}
                         </div>
                      </div>

                      <div className="p-2 border-t border-slate-100 dark:border-white/5">
                        <button
                          onClick={() => logout()}
                          className={clsx('w-full', 'flex', 'items-center', 'gap-3', 'px-4', 'py-3', 'text-xs', 'font-black', 'text-primary', 'hover:bg-primary/5', 'rounded-xl', 'transition-colors', 'uppercase', 'tracking-widest')}
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="scale-75 sm:scale-100 origin-right">
                  <PublicThemeToggle />
                </div>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-8 py-1.5 sm:py-2.5 rounded-full bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary-hover transition-all duration-300 shadow-xl shadow-primary/20 active:scale-95 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Sign In</span>
              <span className="sm:hidden">Sign</span>
            </button>
              </div>
            )}

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-charcoal dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-40 bg-white dark:bg-zinc-900 md:hidden overflow-y-auto animate-fade-in">
          <div className="flex flex-col px-4 py-4">
            {[
              { href: '#directory', label: 'Mall Directory' },
              { href: '#availability', label: 'Available Spaces' },
              { href: '#event-inquiry', label: 'Book an Event' },
              { href: '#location', label: 'Location' },
              { href: '#feedback', label: 'Reviews' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 text-base font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors"
              >
                {link.label}
                <ChevronDown size={16} className="-rotate-90 text-slate-300" />
              </Link>
            ))}

            {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'TENANT') && (
              <Link
                href={user?.role === 'ADMIN' ? '/admindashboard' : '/tenantdashboard'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 text-base font-bold text-primary"
              >
                Go to Dashboard
                <ChevronDown size={16} className="-rotate-90 text-primary/40" />
              </Link>
            )}

            {isAuthenticated && (user?.role === 'CUSTOMER' || user?.role === 'USER') && (
              <button
                onClick={() => { setIsMerchantModalOpen(true); setIsMobileMenuOpen(false); }}
                className="flex items-center justify-between w-full py-4 border-b border-slate-100 dark:border-white/5 text-base font-bold text-primary text-left"
              >
                Become a Partner
                <Store size={16} className="text-primary/60" />
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="flex items-center justify-between w-full py-4 text-base font-bold text-red-500 mt-2"
              >
                Sign Out
                <LogOut size={16} className="text-red-400" />
              </button>
            )}

            {!isAuthenticated && (
              <button
                onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }}
                className="mt-4 w-full py-4 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-2xl active:scale-95 shadow-xl shadow-primary/30 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <MerchantApplicationModal 
        isOpen={isMerchantModalOpen} 
        onClose={() => setIsMerchantModalOpen(false)} 
      />
    </>
  );
};
