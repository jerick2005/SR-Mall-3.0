'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, User, Menu, LogOut, ChevronDown, X } from 'lucide-react';
import { useAuth } from '@/app/providers';
import { LoginModal } from './login-modal';
import NotificationDropdown from './notification-dropdown';
import { PublicThemeToggle } from './theme-toggle';
import clsx from 'clsx';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                    className={clsx('flex', 'items-center', 'gap-3', 'px-4', 'py-2', 'bg-zinc-800', 'rounded-full', 'border', 'border-white/5', 'transition-all', 'hover:shadow-lg')}
                  >
                    <div className={clsx('w-8', 'h-8', 'rounded-full', 'bg-primary', 'text-white', 'flex', 'items-center', 'justify-center', 'font-bold', 'text-sm')}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className={clsx('flex', 'flex-col', 'items-start', 'leading-none')}>
                      <span className={clsx('text-xs', 'font-bold', 'text-white')}>{user?.name}</span>
                      <span className={clsx('text-[10px]', 'text-slate-400', 'font-medium', 'tracking-tight', 'uppercase')}>
                        {user?.role?.toLowerCase() || 'Mall Visitor'}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className={clsx('absolute', 'top-full', 'right-0', 'mt-4', 'w-56', 'bg-zinc-900', 'rounded-2xl', 'shadow-2xl', 'border', 'border-white/5', 'py-3', 'animate-fade-in-up')}>
                      <div className={clsx('px-5', 'py-2', 'border-b', 'border-white/5', 'mb-2')}>
                        <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>Account Overview</p>
                      </div>
                      <button className={clsx('w-full', 'flex', 'items-center', 'gap-3', 'px-5', 'py-3', 'text-sm', 'font-medium', 'hover:bg-white/5', 'transition-colors')}>
                        <User size={16} /> My Profile
                      </button>
                      <button
                        onClick={() => logout()}
                        className={clsx('w-full', 'flex', 'items-center', 'gap-3', 'px-5', 'py-3', 'text-sm', 'font-bold', 'text-primary', 'hover:bg-primary/5', 'transition-colors', 'mt-2')}
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
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
        <div className="fixed inset-0 top-20 z-40 bg-white dark:bg-zinc-900 md:hidden animate-fade-in">
          <div className="flex flex-col p-6 gap-4">
            {/* @ts-ignore */}
            <Link 
              href="#directory"
              className="text-lg font-medium text-slate-700 dark:text-slate-200 py-3 border-b border-slate-100 dark:border-white/5"
            >
              <div onClick={() => setIsMobileMenuOpen(false)}>Mall Directory</div>
            </Link>
            {/* @ts-ignore */}
            <Link 
              href="#availability"
              className="text-lg font-medium text-slate-700 dark:text-slate-200 py-3 border-b border-slate-100 dark:border-white/5"
            >
              <div onClick={() => setIsMobileMenuOpen(false)}>Available Spaces</div>
            </Link>
            {/* @ts-ignore */}
            <Link 
              href="#events"
              className="text-lg font-medium text-slate-700 dark:text-slate-200 py-3 border-b border-slate-100 dark:border-white/5"
            >
              <div onClick={() => setIsMobileMenuOpen(false)}>What's On</div>
            </Link>
            {/* @ts-ignore */}
            <Link 
              href="#location"
              className="text-lg font-medium text-slate-700 dark:text-slate-200 py-3 border-b border-slate-100 dark:border-white/5"
            >
              <div onClick={() => setIsMobileMenuOpen(false)}>Location</div>
            </Link>
            {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'TENANT') && (
              // @ts-ignore
              <Link
                href={user.role === 'ADMIN' ? '/admindashboard' : '/tenantdashboard'}
                className="text-lg font-medium text-primary py-3 border-b border-slate-100 dark:border-white/5"
              >
                <div onClick={() => setIsMobileMenuOpen(false)}>Go to Dashboard</div>
              </Link>
            )}
          </div>
        </div>
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
};
