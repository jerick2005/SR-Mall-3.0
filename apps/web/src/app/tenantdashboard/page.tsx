'use client';

import React from 'react';
import { Users, MousePointerClick, Star, AlertCircle, TrendingUp, Store, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import clsx from 'clsx';

export default function TenantDashboard() {
  const { user } = useAuth();

  const kpiData = [
    {
      label: 'Profile Views',
      value: '8,421',
      trend: '+14%',
      icon: Users,
      color: 'blue',
      bg: 'bg-blue-500/10',
      text: 'text-blue-500'
    },
    {
      label: 'Ad Clicks',
      value: '1,240',
      trend: '+5%',
      icon: MousePointerClick,
      color: 'purple',
      bg: 'bg-purple-500/10',
      text: 'text-purple-500'
    },
    {
      label: 'Rating',
      value: '4.8',
      sub: '124 reviews',
      trend: 'Stable',
      icon: Star,
      color: 'amber',
      bg: 'bg-amber-500/10',
      text: 'text-amber-500'
    }
  ];

  const reviews = [
    { author: 'Premium Member', text: 'Stunning storefront presentation!', rating: 5, time: '1h' },
    { author: 'Verified Shopper', text: 'Supportive staff and easy navigation.', rating: 5, time: '12h' },
    { author: 'Mall Visitor', text: 'Clean and modern. Love it!', rating: 4, time: '2d' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pb-20 lg:pb-0">
      {/* Mobile-First Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-4 sm:space-y-6 lg:space-y-8">
        
        {/* Professional Header Section */}
        <section className="space-y-3 sm:space-y-4">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest mb-1">Tenant Dashboard</p>
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-black text-charcoal dark:text-white tracking-tight">
                Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || 'Store'}</span>
              </h1>
            </div>
            {/* Mobile Action Button */}
            <Link href="/tenantdashboard/digital-storefront">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 lg:hidden cursor-pointer">
                <Store size={20} />
              </div>
            </Link>
          </div>

          {/* Quick Actions Bar - Mobile Optimized */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-charcoal dark:text-white">Live</span>
            </div>
            <Link href="/tenantdashboard/lease-payments">
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
                <AlertCircle size={14} />
                <span className="text-xs font-bold">Pay Due</span>
              </div>
            </Link>
            <Link href="/tenantdashboard/customer-messenger">
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer">
                <span className="text-xs font-bold">1 New Message</span>
              </div>
            </Link>
          </div>
        </section>

        {/* KPI Cards - Horizontal Scroll on Mobile, Grid on Desktop */}
        <section>
          <div className="flex lg:grid lg:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory">
            {kpiData.map((kpi, idx) => (
              <div
                key={idx}
                className="snap-start shrink-0 w-[140px] sm:w-[160px] lg:w-auto bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 p-4 sm:p-5 lg:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={clsx('p-2 rounded-xl', kpi.bg, kpi.text)}>
                    <kpi.icon size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <span className={clsx(
                    'text-[10px] font-bold px-2 py-1 rounded-full',
                    kpi.trend.includes('+') ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-slate-100 text-slate-500 dark:bg-white/5'
                  )}>
                    {kpi.trend}
                  </span>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-charcoal dark:text-white">{kpi.value}</p>
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5">{kpi.label}</p>
                  {kpi.sub && <p className="text-[10px] text-slate-400">{kpi.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Storefront Preview Card */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Store size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base sm:text-lg text-charcoal dark:text-white">Your Storefront</h2>
                  <p className="text-[10px] sm:text-xs text-slate-500">Live on SR Mall Directory</p>
                </div>
              </div>
              <Link href="/tenantdashboard/digital-storefront">
                <span className="text-xs font-bold text-primary hover:underline cursor-pointer hidden sm:inline">Edit Store</span>
              </Link>
            </div>

            {/* Store Preview */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Store Icon */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <div className="relative w-full h-full bg-slate-100 dark:bg-zinc-800 rounded-2xl border-2 border-white dark:border-zinc-700 shadow-xl flex items-center justify-center">
                  <Store size={32} className="sm:w-10 sm:h-10 text-slate-400" />
                </div>
              </div>

              {/* Store Info */}
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-charcoal dark:text-white">{user?.name || 'Your Premium Store'}</h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-2 text-xs text-slate-500">
                  <span>Level 1, Unit 105</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-primary font-medium">Retail & Lifestyle</span>
                </div>
                {/* Mobile Edit Button */}
                <Link href="/tenantdashboard/digital-storefront">
                  <span className="text-xs font-bold text-primary cursor-pointer sm:hidden mt-3 inline-block">Edit Storefront →</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 border-t border-slate-100 dark:border-white/5">
            <div className="p-3 sm:p-4 text-center border-r border-slate-100 dark:border-white/5">
              <p className="text-sm sm:text-base font-bold text-charcoal dark:text-white">8.4K</p>
              <p className="text-[10px] text-slate-500">Views</p>
            </div>
            <div className="p-3 sm:p-4 text-center border-r border-slate-100 dark:border-white/5">
              <p className="text-sm sm:text-base font-bold text-charcoal dark:text-white">4.8</p>
              <p className="text-[10px] text-slate-500">Rating</p>
            </div>
            <div className="p-3 sm:p-4 text-center">
              <p className="text-sm sm:text-base font-bold text-charcoal dark:text-white">124</p>
              <p className="text-[10px] text-slate-500">Reviews</p>
            </div>
          </div>
        </section>

        {/* Recent Reviews Section */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-white/5 p-4 sm:p-6 shadow-sm">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                <Star size={16} />
              </div>
              <h2 className="font-bold text-base sm:text-lg text-charcoal dark:text-white">Recent Reviews</h2>
            </div>
            <Link href="/tenantdashboard/feedback-reviews">
              <span className="text-xs font-bold text-slate-400 hover:text-primary transition-colors">View All</span>
            </Link>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {reviews.map((review, i) => (
              <div
                key={i}
                className="p-3 sm:p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {review.author[0]}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-charcoal dark:text-white">{review.author}</p>
                      <p className="text-[10px] text-slate-500">{review.time} ago</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {Array.from({ length: 5 }).map((_, rIdx) => (
                      <Star
                        key={rIdx}
                        size={10}
                        className={clsx(
                          rIdx < review.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200 dark:text-zinc-700'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  "{review.text}"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Navigation Grid - Mobile Only */}
        <section className="lg:hidden">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/tenantdashboard/ad-promo-manager">
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-white/10 text-center">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mx-auto mb-2">
                  <TrendingUp size={20} />
                </div>
                <p className="text-xs font-bold text-charcoal dark:text-white">Promotions</p>
              </div>
            </Link>
            <Link href="/tenantdashboard/lease-payments">
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-white/10 text-center">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 mx-auto mb-2">
                  <ArrowRight size={20} />
                </div>
                <p className="text-xs font-bold text-charcoal dark:text-white">Payments</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
