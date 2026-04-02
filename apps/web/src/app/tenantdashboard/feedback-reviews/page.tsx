'use client';

import React from 'react';
import { Star, MessageSquare, Filter, ChevronDown, CheckCircle } from 'lucide-react';

const mockReviews = [
  { id: 1, user: 'Angela M.', rating: 5, date: '2 days ago', text: 'Amazing selection of clothes! The staff was incredibly helpful with finding my size.', status: 'Published' },
  { id: 2, user: 'Mark T.', rating: 4, date: '1 week ago', text: 'Great premium items, but the checkout line was a bit slow during the weekend rush.', status: 'Published' },
  { id: 3, user: 'Sarah J.', rating: 5, date: '2 weeks ago', text: 'Absolutely love the new summer collection. Will definitely come back!', status: 'Published' },
];

export default function FeedbackReviews() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pb-20 lg:pb-0">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest mb-1">Reputation</p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-charcoal dark:text-white tracking-tight">Feedback & Reviews</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Monitor public sentiment and manage your reputation.</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
           <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm">
             <Star size={14} className="text-amber-500 fill-amber-500 sm:w-4 sm:h-4" /> 4.8 / 5.0
           </div>
           <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:border-slate-300 transition-colors">
             <Filter size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Filter</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        
        {/* Rating Summary */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl sm:rounded-[2rem] shadow-sm p-4 sm:p-6 text-center">
             <h2 className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">Overall Score</h2>
             <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-charcoal dark:text-white mb-2">4.8</p>
             <div className="flex justify-center gap-1 text-amber-500 mb-2">
                <Star size={14} className="fill-amber-500 sm:w-[18px] sm:h-[18px]" />
                <Star size={14} className="fill-amber-500 sm:w-[18px] sm:h-[18px]" />
                <Star size={14} className="fill-amber-500 sm:w-[18px] sm:h-[18px]" />
                <Star size={14} className="fill-amber-500 sm:w-[18px] sm:h-[18px]" />
                <Star size={14} className="fill-slate-200 text-slate-200 sm:w-[18px] sm:h-[18px]" />
             </div>
             <p className="text-xs sm:text-sm font-medium text-slate-500">Based on 124 verified ratings</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl sm:rounded-[2rem] shadow-sm p-4 sm:p-6">
             <h2 className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 sm:mb-6">Rating Distribution</h2>
             <div className="space-y-2 sm:space-y-3">
               {[
                 { stars: 5, pct: 85 },
                 { stars: 4, pct: 10 },
                 { stars: 3, pct: 3 },
                 { stars: 2, pct: 2 },
                 { stars: 1, pct: 0 },
               ].map(row => (
                 <div key={row.stars} className="flex items-center gap-2 sm:gap-3">
                   <div className="w-6 sm:w-8 text-xs font-bold text-slate-500 flex items-center justify-end gap-1 opacity-80">{row.stars} <Star size={10} className="fill-slate-400 sm:w-3 sm:h-3"/></div>
                   <div className="flex-1 h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                     <div className="h-full bg-amber-500 rounded-full" style={{ width: `${row.pct}%` }}></div>
                   </div>
                   <div className="w-6 sm:w-8 text-[9px] sm:text-[10px] font-bold text-slate-400 text-right">{row.pct}%</div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Review Feed */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl sm:rounded-[2rem] shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="font-bold text-base sm:text-lg text-charcoal dark:text-white flex items-center gap-2"><MessageSquare size={16} className="text-slate-400 sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Verified Customer Reviews</span><span className="sm:hidden">Reviews</span></h2>
              <button className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-charcoal transition-colors">
                Newest <ChevronDown size={12} className="sm:w-[14px] sm:h-[14px]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
              {mockReviews.map((review) => (
                <div key={review.id} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                   <div className="flex items-start justify-between mb-3">
                     <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 font-bold text-sm sm:text-base">
                          {review.user.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-charcoal dark:text-white text-xs sm:text-sm">{review.user}</h4>
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.date}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 sm:gap-4">
                       <div className="flex gap-0.5 text-amber-500">
                         {Array.from({ length: 5 }).map((_, i) => (
                           <Star key={i} size={12} className={i < review.rating ? 'fill-amber-500 sm:w-[14px] sm:h-[14px]' : 'fill-slate-200 text-slate-200 sm:w-[14px] sm:h-[14px]'} />
                         ))}
                       </div>
                       <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
                         <CheckCircle size={10} className="sm:w-3 sm:h-3" /> <span className="hidden sm:inline">{review.status}</span>
                       </span>
                     </div>
                   </div>
                   <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed ml-10 sm:ml-14">&ldquo;{review.text}&rdquo;</p>
                </div>
              ))}
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-zinc-900 flex justify-center">
              <button className="px-4 sm:px-6 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">
                Load More
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
  );
}
