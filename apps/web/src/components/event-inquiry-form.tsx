'use client';

import React, { useState } from 'react';
import { CalendarDays, Clock, CheckCircle, Ticket, AlertCircle } from 'lucide-react';
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
    <div className={clsx('w-full', 'max-w-6xl', 'mx-auto', 'relative')}>
      {/* Decorative Blur Elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className={clsx('relative', 'z-10', 'bg-white/80', 'dark:bg-zinc-900/90', 'backdrop-blur-xl', 'rounded-[3rem]', 'shadow-2xl', 'overflow-hidden', 'border', 'border-white/20', 'dark:border-white/5')}>
        <div className={clsx('flex', 'flex-col', 'lg:flex-row')}>
          {/* Left Side: Brand & Value Prop */}
          <div className={clsx('lg:w-5/12', 'bg-primary', 'p-10', 'sm:p-14', 'text-white', 'flex', 'flex-col', 'justify-between', 'relative', 'overflow-hidden')}>
            {/* Visual Accents */}
            <div className={clsx('absolute', 'top-0', 'right-0', 'w-64', 'h-64', 'bg-white/10', 'rounded-full', '-translate-y-1/2', 'translate-x-1/2', 'blur-3xl')}></div>
            <div className={clsx('absolute', 'bottom-0', 'left-0', 'w-32', 'h-32', 'bg-black/20', 'rounded-full', 'translate-y-1/2', '-translate-x-1/2', 'blur-2xl')}></div>
            
            <div className="space-y-8 relative z-10">
              <div className={clsx('w-16', 'h-16', 'bg-white/20', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'backdrop-blur-md', 'shadow-xl', 'border', 'border-white/30')}>
                <Ticket size={32} className="text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2 block">Event Services</span>
                <h3 className={clsx('text-3xl', 'sm:text-4xl', 'md:text-5xl', 'font-black', 'tracking-tighter', 'leading-[0.95]')}>
                  Host Your <br />Next Big Event.
                </h3>
              </div>
              <p className={clsx('text-base', 'text-white/80', 'leading-relaxed', 'font-medium', 'max-w-sm')}>
                From high-stakes esports tournaments to community active gatherings, our premium spaces are engineered for extraordinary experiences.
              </p>
            </div>
            
            <div className={clsx('mt-16', 'space-y-6', 'relative', 'z-10')}>
              {[
                { icon: CheckCircle, text: 'Dedicated Power Corridors' },
                { icon: CheckCircle, text: 'Ultra-High Speed Low-Latency Internet' },
                { icon: CheckCircle, text: 'Full Scale Event Marketing & Logistics' },
                { icon: CheckCircle, text: 'Premium In-Mall Ad Placement' }
              ].map((item, i) => (
                <div key={i} className={clsx('flex', 'items-center', 'gap-4', 'group')}>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                    <item.icon size={16} className="text-white" />
                  </div>
                  <span className={clsx('text-sm', 'font-bold', 'tracking-tight')}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={clsx('lg:w-7/12', 'p-10', 'sm:p-14', 'bg-transparent')}>
            <div className="mb-10">
              <h4 className={clsx('text-2xl', 'sm:text-3xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tight')}>Inquiry Details</h4>
              <p className="text-sm text-slate-500 font-medium mt-1">Our venue management will contact you within 24 hours.</p>
            </div>
            
            {submitMessage && (
               <div className={clsx('mb-8', 'p-5', 'rounded-2xl', 'flex', 'items-start', 'gap-4', 'animate-fade-in', submitMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 shadow-md shadow-green-500/10' : 'bg-red-50 text-red-700 border border-red-200 shadow-md shadow-red-500/10')}>
                 <div className={clsx('w-10', 'h-10', 'rounded-full', 'flex', 'items-center', 'justify-center', 'shrink-0', submitMessage.type === 'success' ? 'bg-green-100' : 'bg-red-100')}>
                    <AlertCircle size={20} />
                 </div>
                 <div className="space-y-1">
                   <p className={clsx('text-sm', 'font-black', 'uppercase', 'tracking-widest')}>{submitMessage.type === 'success' ? 'Request Sent' : 'Inquiry Failed'}</p>
                   <p className={clsx('text-xs', 'font-medium', 'leading-snug')}>{submitMessage.message}</p>
                 </div>
               </div>
            )}

            {!isAuthenticated ? (
              <div className={clsx('text-center', 'py-20', 'bg-slate-50', 'dark:bg-zinc-800/50', 'rounded-[2rem]', 'border-2', 'border-dashed', 'border-slate-200', 'dark:border-white/10', 'flex', 'flex-col', 'items-center', 'justify-center', 'px-6')}>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Ticket size={32} className="text-primary" />
                </div>
                <h5 className={clsx('text-xl', 'font-black', 'text-charcoal', 'dark:text-white', 'mb-2')}>Member Verification Required</h5>
                <p className={clsx('text-sm', 'text-slate-500', 'max-w-md', 'mb-8', 'font-medium')}>
                  To provide the highest level of service, event inquiries are gated. Please sign in to your SR MALL account to proceed.
                </p>
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  Secure Member Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className={clsx('text-[10px]', 'font-black', 'text-slate-500', 'uppercase', 'tracking-[0.2em]', 'ml-1')}>Choose Event Category</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {eventTypes.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEventType(type)}
                        className={clsx(
                          'px-4', 'py-3.5', 'rounded-2xl', 'text-xs', 'font-black', 'uppercase', 'tracking-wider', 'text-left', 'transition-all', 'border-2',
                          eventType === type 
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                            : 'bg-slate-50 dark:bg-black border-transparent text-slate-500 hover:border-slate-200 dark:hover:border-zinc-800'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={clsx('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-8')}>
                  <div className="space-y-3">
                    <label className={clsx('text-[10px]', 'font-black', 'text-slate-500', 'uppercase', 'tracking-[0.2em]', 'ml-1', 'flex', 'items-center', 'gap-2')}>
                      <CalendarDays size={14} className="text-primary" /> Preferred Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className={clsx('w-full', 'px-6', 'py-4', 'bg-slate-50', 'dark:bg-black', 'border-0', 'focus:ring-2', 'focus:ring-primary', 'rounded-2xl', 'text-sm', 'font-bold', 'text-black', 'dark:text-white', 'transition-all', 'shadow-inner')}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className={clsx('text-[10px]', 'font-black', 'text-slate-500', 'uppercase', 'tracking-[0.2em]', 'ml-1', 'flex', 'items-center', 'gap-2')}>
                      <Clock size={14} className="text-primary" /> Start Time
                    </label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className={clsx('w-full', 'px-6', 'py-4', 'bg-slate-50', 'dark:bg-black', 'border-0', 'focus:ring-2', 'focus:ring-primary', 'rounded-2xl', 'text-sm', 'font-bold', 'text-black', 'dark:text-white', 'transition-all', 'shadow-inner')}
                      required
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={clsx('w-full', 'py-5', 'bg-black', 'dark:bg-white', 'text-white', 'dark:text-black', 'font-black', 'text-xs', 'rounded-2xl', 'uppercase', 'tracking-[0.3em]', 'hover:bg-primary', 'dark:hover:bg-primary', 'dark:hover:text-white', 'transition-all', 'shadow-2xl', 'shadow-primary/20', 'active:scale-95', 'disabled:opacity-50')}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Processing Request...</span>
                      </div>
                    ) : 'Register Event Interest'}
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
