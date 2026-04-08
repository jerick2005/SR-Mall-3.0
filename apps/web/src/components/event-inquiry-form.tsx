'use client';

import React, { useState } from 'react';
import { CalendarDays, Clock, CheckCircle, Ticket, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { submitInquiryAction } from '@/app/actions/inquiry';

export const EventInquiryForm = ({ isAuthenticated, user }: { isAuthenticated: boolean; user?: any }) => {
  const [eventType, setEventType] = useState('Esports & Gaming Events');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
    <div className={clsx('w-full', 'max-w-4xl', 'mx-auto', 'bg-white', 'dark:bg-zinc-900', 'rounded-3xl', 'shadow-2xl', 'overflow-hidden', 'border', 'border-slate-100', 'dark:border-white/5')}>
      <div className={clsx('flex', 'flex-col', 'md:flex-row')}>
        {/* Left Side Info */}
        <div className={clsx('md:w-5/12', 'bg-primary', 'p-8', 'sm:p-10', 'text-white', 'flex', 'flex-col', 'justify-between', 'relative')}>
          <div className={clsx('absolute', 'top-0', 'right-0', 'w-32', 'h-32', 'bg-white/10', 'rounded-bl-[100px]', 'pointer-events-none')}></div>
          
          <div className="space-y-6 relative z-10">
            <div className={clsx('w-12', 'h-12', 'bg-white/20', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'backdrop-blur-md')}>
              <Ticket size={24} />
            </div>
            <h3 className={clsx('text-2xl', 'sm:text-3xl', 'font-black', 'tracking-tight', 'leading-tight')}>
              Host Your Event at SR Mall.
            </h3>
            <p className={clsx('text-sm', 'text-white/80', 'leading-relaxed', 'font-medium')}>
              From esports tournaments to community fitness gatherings, our mall spaces are perfectly equipped to bring your vision to life.
            </p>
          </div>
          
          <div className={clsx('mt-12', 'space-y-4', 'relative', 'z-10')}>
            <div className={clsx('flex', 'items-center', 'gap-3')}>
              <CheckCircle size={18} className="text-white/60" />
              <span className={clsx('text-sm', 'font-bold')}>Dedicated Power Corridors</span>
            </div>
            <div className={clsx('flex', 'items-center', 'gap-3')}>
              <CheckCircle size={18} className="text-white/60" />
              <span className={clsx('text-sm', 'font-bold')}>High-speed Internet Ready</span>
            </div>
            <div className={clsx('flex', 'items-center', 'gap-3')}>
              <CheckCircle size={18} className="text-white/60" />
              <span className={clsx('text-sm', 'font-bold')}>Event Marketing Support</span>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className={clsx('md:w-7/12', 'p-8', 'sm:p-10')}>
          <h4 className={clsx('text-xl', 'font-black', 'text-charcoal', 'dark:text-white', 'mb-6')}>Event Inquiry Form</h4>
          
          {submitMessage && (
             <div className={clsx('mb-6', 'p-4', 'rounded-xl', 'flex', 'items-start', 'gap-3', submitMessage.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400')}>
               <AlertCircle size={20} className="shrink-0 mt-0.5" />
               <p className={clsx('text-sm', 'font-bold', 'leading-snug')}>{submitMessage.message}</p>
             </div>
          )}

          {!isAuthenticated ? (
            <div className={clsx('text-center', 'py-12', 'bg-zinc-50', 'dark:bg-zinc-800/50', 'rounded-2xl', 'border-2', 'border-dashed', 'border-slate-200', 'dark:border-white/10')}>
              <h5 className={clsx('text-base', 'font-bold', 'text-charcoal', 'dark:text-white', 'mb-2')}>Login Required</h5>
              <p className={clsx('text-sm', 'text-slate-500', 'mb-0')}>Please login to submit an event inquiry so our admins can directly message you about your request.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className={clsx('text-xs', 'font-bold', 'text-slate-500', 'uppercase', 'tracking-widest')}>Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className={clsx('w-full', 'px-4', 'py-3', 'bg-zinc-50', 'dark:bg-black', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'focus:ring-2', 'focus:ring-primary/20', 'focus:border-primary', 'transition-all')}
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className={clsx('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-6')}>
                <div className="space-y-2">
                  <label className={clsx('text-xs', 'font-bold', 'text-slate-500', 'uppercase', 'tracking-widest', 'flex', 'items-center', 'gap-2')}>
                    <CalendarDays size={14} /> Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className={clsx('w-full', 'px-4', 'py-3', 'bg-zinc-50', 'dark:bg-black', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'focus:ring-2', 'focus:ring-primary/20', 'focus:border-primary', 'transition-all')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={clsx('text-xs', 'font-bold', 'text-slate-500', 'uppercase', 'tracking-widest', 'flex', 'items-center', 'gap-2')}>
                    <Clock size={14} /> Time
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className={clsx('w-full', 'px-4', 'py-3', 'bg-zinc-50', 'dark:bg-black', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'focus:ring-2', 'focus:ring-primary/20', 'focus:border-primary', 'transition-all')}
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={clsx('w-full', 'py-4', 'bg-charcoal', 'dark:bg-white', 'text-white', 'dark:text-black', 'font-bold', 'text-sm', 'rounded-xl', 'hover:bg-primary', 'dark:hover:bg-primary', 'dark:hover:text-white', 'transition-all', 'shadow-xl', 'shadow-black/10', 'active:scale-95', 'disabled:opacity-50')}
                >
                  {isSubmitting ? 'Submitting Inquiry...' : 'Submit Inquiry Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
