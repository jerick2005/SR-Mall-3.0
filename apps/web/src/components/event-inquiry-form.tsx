'use client';

import React, { useState } from 'react';
import { CalendarDays, Clock, CheckCircle, Ticket, AlertCircle, ShoppingBag, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { submitInquiryAction } from '@/app/actions/inquiry';
import { LoginModal } from './login-modal';

export const EventInquiryForm = ({ isAuthenticated, user }: { isAuthenticated: boolean; user?: any }) => {
  const [eventType, setEventType] = useState('Esports & Gaming Events');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const eventTypes = [
    'Esports & Gaming Events',
    'Mini Sports Competitions',
    'Fitness & Active Events',
    'Trade Shows & Exhibitions',
    'Community Gatherings'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      setSubmitMessage({ type: 'error', message: 'You must be logged in to submit an inquiry.' });
      return;
    }
    
    if (!eventDate || !eventTime) {
      setSubmitMessage({ type: 'error', message: 'Please select both date and time.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    const result = await submitInquiryAction({
      userId: user.id,
      eventType: eventType,
      eventDate: new Date(eventDate),
      eventTime: eventTime
    });

    if (result.success) {
      setSubmitMessage({ type: 'success', message: 'Inquiry submitted! Please check your messages for updates.' });
      setEventDate('');
      setEventTime('');
      setEventType(eventTypes[0]);
    } else {
      setSubmitMessage({ type: 'error', message: result.error || 'Failed to submit inquiry.' });
    }

    setIsSubmitting(false);
  };

  return (
    <div className={clsx('w-full', 'max-w-6xl', 'mx-auto', 'relative', 'px-2 sm:px-4')}>
      {/* Decorative Blur Elements */}
      <div className="absolute -top-10 sm:-top-20 -left-10 sm:-left-20 w-48 sm:w-64 h-48 sm:h-64 bg-primary/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-10 sm:-bottom-20 -right-10 sm:-right-20 w-48 sm:w-64 h-48 sm:h-64 bg-blue-500/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none"></div>

      <div className={clsx('relative', 'z-10', 'bg-white', 'dark:bg-zinc-950', 'rounded-[2rem] sm:rounded-[3rem]', 'shadow-2xl', 'overflow-hidden', 'border', 'border-slate-100', 'dark:border-white/5')}>
        <div className={clsx('flex', 'flex-col', 'lg:flex-row')}>
          {/* Left Side: Brand & Value Prop */}
          <div className={clsx('lg:w-5/12', 'bg-primary', 'p-6 sm:p-10 lg:p-12', 'text-white', 'flex', 'flex-col', 'justify-between', 'relative', 'overflow-hidden')}>
            {/* Visual Accents */}
            <div className={clsx('absolute', 'top-0', 'right-0', 'w-64', 'h-64', 'bg-white/10', 'rounded-full', '-translate-y-1/2', 'translate-x-1/2', 'blur-3xl')}></div>
            <div className={clsx('absolute', 'bottom-0', 'left-0', 'w-32', 'h-32', 'bg-black/20', 'rounded-full', 'translate-y-1/2', '-translate-x-1/2', 'blur-2xl')}></div>
            
            <div className="space-y-4 sm:space-y-6 relative z-10">
              <div className={clsx('w-12 h-12 sm:w-14 sm:h-14', 'bg-white/20', 'rounded-xl sm:rounded-2xl', 'flex', 'items-center', 'justify-center', 'backdrop-blur-md', 'border', 'border-white/30')}>
                <Ticket size={24} className="text-white sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1 block">Venue Hire</span>
                <h3 className={clsx('text-2xl sm:text-3xl lg:text-4xl', 'font-black', 'tracking-tighter', 'leading-none')}>
                   Premium Events.
                </h3>
              </div>
              <p className={clsx('text-xs sm:text-sm', 'text-white/80', 'leading-relaxed', 'font-medium', 'max-w-xs')}>
                 Our architectural foundation for legendary moments.
              </p>
            </div>
            
            <div className={clsx('mt-8 lg:mt-12', 'space-y-3 sm:space-y-4', 'relative', 'z-10')}>
              {[
                { icon: CheckCircle, text: 'Elite Connectivity' },
                { icon: CheckCircle, text: 'Custom Staging' },
                { icon: CheckCircle, text: 'In-Mall Promo' }
              ].map((item, i) => (
                <div key={i} className={clsx('flex', 'items-center', 'gap-3', 'group')}>
                   <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/5 text-[10px]">
                    <item.icon size={10} className="text-white" />
                  </div>
                  <span className={clsx('text-[10px] sm:text-xs', 'font-bold')}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Form Content */}
          <div className={clsx('lg:w-7/12', 'p-6 sm:p-10 lg:p-12', 'bg-slate-50/50', 'dark:bg-black/40')}>
            <div className="mb-6 sm:mb-8">
               <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                  <h4 className={clsx('text-xl sm:text-2xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tight')}>Reservation</h4>
               </div>
               <p className="text-[10px] sm:text-xs text-slate-500 font-medium ml-3.5">Response within 12 hours.</p>
            </div>
            
            {submitMessage && (
               <div className={clsx('mb-8', 'p-5', 'rounded-2xl', 'flex', 'items-start', 'gap-4', 'animate-fade-in', submitMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200 shadow-md')}>
                 <div className={clsx('w-10', 'h-10', 'rounded-full', 'flex', 'items-center', 'justify-center', 'shrink-0', submitMessage.type === 'success' ? 'bg-green-100' : 'bg-red-100')}>
                    <AlertCircle size={20} />
                 </div>
                 <div className="space-y-1">
                   <p className={clsx('text-sm', 'font-black', 'uppercase', 'tracking-widest')}>{submitMessage.type === 'success' ? 'Protocol Success' : 'Request Terminated'}</p>
                   <p className={clsx('text-xs', 'font-medium', 'leading-snug')}>{submitMessage.message}</p>
                 </div>
               </div>
            )}

            {!isAuthenticated ? (
              <div className={clsx('text-center', 'py-16 sm:py-24', 'bg-white', 'dark:bg-zinc-900', 'rounded-[2rem]', 'border-2', 'border-dashed', 'border-slate-200', 'dark:border-white/5', 'flex', 'flex-col', 'items-center', 'justify-center', 'px-6', 'shadow-inner')}>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-primary/5">
                  <Ticket size={32} className="text-primary" />
                </div>
                <h5 className={clsx('text-xl', 'font-black', 'text-charcoal', 'dark:text-white', 'mb-2')}>Member Access Only</h5>
                <p className={clsx('text-sm', 'text-slate-500', 'max-w-xs', 'mb-10', 'font-medium', 'leading-relaxed')}>
                  Event inquiries require verified membership. Please authenticate your account to initiate the reservation protocol.
                </p>
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-10 py-5 bg-charcoal dark:bg-white text-white dark:text-black font-black rounded-2xl shadow-2xl hover:bg-primary transition-all text-xs uppercase tracking-[0.2em] active:scale-95"
                >
                  Authorize Identity
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="space-y-3">
                  <label className={clsx('text-[10px]', 'font-black', 'text-slate-400', 'uppercase', 'tracking-[0.15em]', 'ml-1', 'flex', 'items-center', 'gap-2')}>
                    <ShoppingBag size={12} className="text-primary" /> Venue Theme
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {eventTypes.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEventType(type)}
                        className={clsx(
                          'px-3', 'py-3', 'rounded-xl', 'text-[10px]', 'font-bold', 'uppercase', 'tracking-wider', 'text-left', 'transition-all', 'border-2',
                          eventType === type 
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-102 z-10' 
                            : 'bg-white dark:bg-black border-slate-100 dark:border-white/5 text-slate-400 hover:border-primary/20'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={clsx('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-4 sm:gap-6')}>
                  <div className="space-y-2">
                    <label className={clsx('text-[10px]', 'font-black', 'text-slate-400', 'uppercase', 'tracking-[0.15em]', 'ml-1', 'flex', 'items-center', 'gap-2')}>
                      <CalendarDays size={14} className="text-primary" /> Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-black', 'border-2', 'border-slate-100', 'dark:border-white/5', 'focus:border-primary', 'rounded-xl', 'text-sm', 'font-bold', 'text-black', 'dark:text-white', 'transition-all', 'outline-none')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={clsx('text-[10px]', 'font-black', 'text-slate-400', 'uppercase', 'tracking-[0.15em]', 'ml-1', 'flex', 'items-center', 'gap-2')}>
                      <Clock size={14} className="text-primary" /> Time
                    </label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-black', 'border-2', 'border-slate-100', 'dark:border-white/5', 'focus:border-primary', 'rounded-xl', 'text-sm', 'font-bold', 'text-black', 'dark:text-white', 'transition-all', 'outline-none')}
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={clsx('w-full', 'py-4', 'bg-primary', 'text-white', 'font-black', 'text-xs', 'rounded-2xl', 'uppercase', 'tracking-[0.2em]', 'hover:bg-primary-hover', 'transition-all', 'shadow-xl', 'shadow-primary/30', 'active:scale-95', 'disabled:opacity-50', 'flex', 'items-center', 'justify-center', 'gap-2')}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Processing Protocol...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Confirm Event Interest
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
};
