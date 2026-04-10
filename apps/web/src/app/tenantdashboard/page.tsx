'use client';

import React from 'react';
import {
  Users, MousePointerClick, Star, AlertCircle, TrendingUp,
  Store, ArrowRight, Receipt, MessageSquare, BarChart3,
  ChevronRight, Zap, Award, Clock, Activity
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import clsx from 'clsx';

export default function TenantDashboard() {
  const { user } = useAuth();

  const [liveReviews, setLiveReviews] = React.useState<any[]>([]);
  const [avgRating, setAvgRating] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      const { getApprovedReviewsAction } = await import('@/app/actions/review');
      const result = await getApprovedReviewsAction();
      if (result.success && result.data) {
        setLiveReviews(result.data);
        const total = result.data.reduce((acc: number, r: any) => acc + r.rating, 0);
        setAvgRating(result.data.length > 0 ? Number((total / result.data.length).toFixed(1)) : 0);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const kpiCards = [
    {
      label: 'Profile Views',
      value: '8,421',
      trend: '+14%',
      trendUp: true,
      icon: Users,
      accent: 'from-blue-500/20 to-blue-600/5',
      iconBg: 'bg-blue-500/10 text-blue-500',
      border: 'hover:border-blue-500/30',
    },
    {
      label: 'Ad Clicks',
      value: '1,240',
      trend: '+5%',
      trendUp: true,
      icon: MousePointerClick,
      accent: 'from-purple-500/20 to-purple-600/5',
      iconBg: 'bg-purple-500/10 text-purple-500',
      border: 'hover:border-purple-500/30',
    },
    {
      label: 'Avg. Rating',
      value: isLoading ? '—' : avgRating.toFixed(1),
      sub: isLoading ? 'Loading...' : `${liveReviews.length} verified reviews`,
      trend: 'Live',
      trendUp: true,
      icon: Star,
      accent: 'from-amber-500/20 to-amber-600/5',
      iconBg: 'bg-amber-500/10 text-amber-500',
      border: 'hover:border-amber-500/30',
    },
  ];

  const quickLinks = [
    { href: '/tenantdashboard/digital-storefront', label: 'Storefront', icon: Store, color: 'bg-primary/10 text-primary', desc: 'Edit your shop profile' },
    { href: '/tenantdashboard/ad-promo-manager', label: 'Ads & Promo', icon: TrendingUp, color: 'bg-purple-500/10 text-purple-500', desc: 'Manage promotions' },
    { href: '/tenantdashboard/customer-messenger', label: 'Messages', icon: MessageSquare, color: 'bg-blue-500/10 text-blue-500', desc: 'Customer inquiries' },
    { href: '/tenantdashboard/lease-payments', label: 'Payments', icon: Receipt, color: 'bg-emerald-500/10 text-emerald-500', desc: 'Billing & invoices' },
    { href: '/tenantdashboard/feedback-reviews', label: 'Reviews', icon: Star, color: 'bg-amber-500/10 text-amber-500', desc: 'Customer feedback' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pb-24 lg:pb-0">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.3em] mb-1">Business Console</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-charcoal dark:text-white tracking-tight leading-none">
              Welcome, <span className="text-primary">{user?.name?.split(' ')[0] || 'Merchant'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">Here's your store performance at a glance.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hidden sm:inline">Store Live</span>
          </div>
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {kpiCards.map((kpi, i) => (
            <div
              key={i}
              className={clsx(
                'relative overflow-hidden bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm transition-all duration-300 hover:shadow-lg',
                kpi.border
              )}
            >
              <div className={clsx('absolute inset-0 bg-gradient-to-br opacity-50 dark:opacity-30', kpi.accent)} />
              <div className="relative">
                <div className={clsx('w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4', kpi.iconBg)}>
                  <kpi.icon size={16} className="sm:w-5 sm:h-5" />
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-charcoal dark:text-white leading-none">{kpi.value}</p>
                {kpi.sub && <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-1">{kpi.sub}</p>}
                <p className="text-[9px] sm:text-xs text-slate-500 font-medium mt-1 sm:mt-2">{kpi.label}</p>
                <span className={clsx(
                  'absolute top-0 right-0 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full',
                  kpi.trendUp ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-50 text-red-500'
                )}>{kpi.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid: Storefront Card + Quick Nav ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Storefront Preview Card */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
            {/* Card Top Bar */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Store size={16} />
                </div>
                <div>
                  <h2 className="font-black text-sm text-charcoal dark:text-white">Your Storefront</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Live on SR Mall Directory</p>
                </div>
              </div>
              <Link href="/tenantdashboard/digital-storefront">
                <span className="flex items-center gap-1 text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                  Edit <ChevronRight size={12} />
                </span>
              </Link>
            </div>

            {/* Store Info */}
            <div className="p-5 sm:p-6 flex items-center gap-4 sm:gap-6">
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center border-2 border-white dark:border-zinc-700 shadow-lg">
                  <Store size={28} className="text-slate-300 sm:w-8 sm:h-8" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-lg sm:text-xl text-charcoal dark:text-white truncate">{user?.name || 'Your Store'}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Retail & Lifestyle · SR Mall</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < Math.round(avgRating) ? 'fill-amber-500 text-amber-500' : 'text-slate-200 dark:text-zinc-700 fill-current'} />
                    ))}
                    <span className="text-xs font-black text-charcoal dark:text-white ml-1">{isLoading ? '...' : avgRating}</span>
                  </div>
                  <span className="text-slate-300 dark:text-zinc-700">·</span>
                  <span className="text-xs text-slate-500">{liveReviews.length} reviews</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 border-t border-slate-100 dark:border-white/5">
              {[
                { label: 'Views', value: '8.4K', icon: Activity },
                { label: 'Rating', value: isLoading ? '...' : avgRating.toString(), icon: Award },
                { label: 'Reviews', value: liveReviews.length.toString(), icon: MessageSquare },
              ].map((s, i) => (
                <div key={i} className={clsx('p-4 text-center', i < 2 && 'border-r border-slate-100 dark:border-white/5')}>
                  <p className="text-base sm:text-lg font-black text-charcoal dark:text-white">{s.value}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5">
              <h2 className="font-black text-sm text-charcoal dark:text-white">Quick Access</h2>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Navigate to any module</p>
            </div>
            <div className="p-3 space-y-1">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group cursor-pointer">
                    <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', link.color)}>
                      <link.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-charcoal dark:text-white leading-none">{link.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{link.desc}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Reviews ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                <Star size={16} />
              </div>
              <div>
                <h2 className="font-black text-sm text-charcoal dark:text-white">Recent Reviews</h2>
                <p className="text-[10px] text-slate-400 font-medium">Latest verified customer feedback</p>
              </div>
            </div>
            <Link href="/tenantdashboard/feedback-reviews">
              <span className="text-[10px] font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">View All</span>
            </Link>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-white/5">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-medium mt-3">Loading reviews...</p>
              </div>
            ) : liveReviews.length > 0 ? (
              liveReviews.slice(0, 3).map((review, i) => (
                <div key={i} className="px-5 sm:px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
                      {review.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-black text-charcoal dark:text-white">{review.user?.name || 'Anonymous'}</p>
                        <div className="flex gap-0.5 shrink-0">
                          {Array.from({ length: 5 }).map((_, ri) => (
                            <Star key={ri} size={10} className={ri < review.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200 dark:text-zinc-700 fill-current'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">"{review.comment || 'No comment provided.'}"</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1.5">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Star size={24} className="text-slate-300" />
                </div>
                <p className="text-sm font-bold text-charcoal dark:text-white">No Reviews Yet</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Approved customer feedback will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile: Due Payments Alert ── */}
        <div className="lg:hidden">
          <Link href="/tenantdashboard/lease-payments">
            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl cursor-pointer hover:bg-primary/10 transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                <Receipt size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-charcoal dark:text-white">Lease Payments</p>
                <p className="text-xs text-slate-500 font-medium">View billing & submit deposit slips</p>
              </div>
              <ChevronRight size={16} className="text-primary" />
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
