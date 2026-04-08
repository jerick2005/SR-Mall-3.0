'use client';

import React, { useEffect, useState } from 'react';
import { getInquiriesAction, updateInquiryStatusAction } from '@/app/actions/inquiry';
import { Loader2, Calendar as CalendarIcon, CheckCircle, XCircle, Clock, MapPin, ChevronLeft, ChevronRight, X } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/app/providers';

// Custom calendar helper routines
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AdminInquiriesPage() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Modal State
  const [modalInquiry, setModalInquiry] = useState<any | null>(null);
  const [modalAction, setModalAction] = useState<'ACCEPTED' | 'REJECTED' | null>(null);
  const [feedback, setFeedback] = useState('');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [calendarModalEvents, setCalendarModalEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    const result = await getInquiriesAction();
    if (result.success && result.data) {
      setInquiries(result.data);
    }
    setLoading(false);
  };

  const handleActionClick = (inquiry: any, action: 'ACCEPTED' | 'REJECTED') => {
    setModalInquiry(inquiry);
    setModalAction(action);
    setFeedback('');
  };

  const submitAction = async () => {
    if (!modalInquiry || !modalAction) return;
    if (modalAction === 'REJECTED' && !feedback.trim()) {
      alert("Feedback is required when rejecting an inquiry.");
      return;
    }

    setIsProcessing(modalInquiry.id);
    const result = await updateInquiryStatusAction(modalInquiry.id, modalAction, feedback);
    if (result.success) {
      fetchInquiries();
    } else {
      alert("Failed to update inquiry.");
    }
    
    setModalInquiry(null);
    setModalAction(null);
    setFeedback('');
    setIsProcessing(null);
  };

  const pendingInquiries = inquiries.filter(i => i.status === 'PENDING');
  const acceptedInquiries = inquiries.filter(i => i.status === 'ACCEPTED');

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    return acceptedInquiries.filter(inq => {
      const inqDate = new Date(inq.eventDate);
      return inqDate.getDate() === day && inqDate.getMonth() === month && inqDate.getFullYear() === year;
    });
  };

  const handleDayClick = (day: number) => {
    const events = getEventsForDay(day);
    if (events.length > 0) {
      setSelectedCalendarDate(new Date(year, month, day));
      setCalendarModalEvents(events);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
        <p className="mt-4 text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Inquiries...</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-12">
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
         <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
           <CalendarIcon size={24} />
         </div>
         <div>
           <h1 className="text-3xl font-black text-charcoal dark:text-white tracking-tight">Event Inquiries & Calendar</h1>
           <p className="text-sm font-medium text-slate-500">Manage incoming event requests and view your scheduled timeline.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Side: Pending Inquiries List */}
        <div>
          <h2 className="text-xl font-bold mb-6 text-charcoal dark:text-white flex items-center gap-2">
            <Clock size={20} className="text-orange-500" /> Pending Requests ({pendingInquiries.length})
          </h2>
          <div className="space-y-4">
            {pendingInquiries.length === 0 ? (
              <div className="p-10 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl text-center bg-slate-50 dark:bg-zinc-900/50">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No pending inquiries</p>
              </div>
            ) : (
              pendingInquiries.map((inq) => (
                <div key={inq.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none dark:border border-white/5 space-y-4 transition-all hover:shadow-xl">
                   <div className="flex justify-between items-start">
                     <div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md mb-2 inline-block">
                         {inq.eventType}
                       </span>
                       <h3 className="text-base font-bold text-charcoal dark:text-white">{inq.user?.name || inq.user?.email}</h3>
                       <p className="text-xs text-slate-500">{inq.user?.email}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-bold text-charcoal dark:text-white">{new Date(inq.eventDate).toLocaleDateString()}</p>
                       <p className="text-xs font-bold text-slate-400">{inq.eventTime}</p>
                     </div>
                   </div>

                   <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                     <button
                       onClick={() => handleActionClick(inq, 'ACCEPTED')}
                       disabled={isProcessing === inq.id}
                       className="flex-1 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white dark:bg-green-900/20 dark:text-green-400 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                     >
                       <CheckCircle size={16} /> Accept
                     </button>
                     <button
                       onClick={() => handleActionClick(inq, 'REJECTED')}
                       disabled={isProcessing === inq.id}
                       className="flex-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-900/20 dark:text-red-400 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                     >
                       <XCircle size={16} /> Reject
                     </button>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Event Calendar */}
        <div>
          <h2 className="text-xl font-bold mb-6 text-charcoal dark:text-white flex items-center gap-2">
            <CalendarIcon size={20} className="text-primary" /> Approved Events Calendar
          </h2>
          
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl dark:border border-white/5">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-8">
               <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors active:scale-95">
                 <ChevronLeft size={20} />
               </button>
               <h3 className="text-lg sm:text-xl font-black tracking-tight text-charcoal dark:text-white/90">
                 {MONTHS[month]} {year}
               </h3>
               <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors active:scale-95">
                 <ChevronRight size={20} />
               </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="text-center text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 py-2">
                  {day}
                </div>
              ))}
              
              {blanks.map(blank => (
                <div key={`blank-${blank}`} className="aspect-square bg-slate-50/50 dark:bg-zinc-800/20 rounded-xl sm:rounded-2xl border border-transparent" />
              ))}

              {days.map(day => {
                const events = getEventsForDay(day);
                const hasEvents = events.length > 0;
                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={clsx(
                      'aspect-square rounded-xl sm:rounded-2xl border transition-all relative group flex flex-col items-center justify-center p-1',
                      hasEvents ? 'cursor-pointer border-primary/30 bg-primary/5 hover:bg-primary hover:border-primary text-charcoal shadow-sm' : 'border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400',
                      isToday && !hasEvents && 'bg-slate-100 dark:bg-zinc-800 font-bold border-slate-300 dark:border-white/20'
                    )}
                  >
                    <span className={clsx(
                      'text-sm font-bold transition-colors',
                      hasEvents && 'group-hover:text-white text-primary'
                    )}>
                      {day}
                    </span>
                    {hasEvents && (
                       <div className="mt-1 flex gap-0.5 justify-center flex-wrap max-w-full overflow-hidden px-1">
                         {events.slice(0, 3).map((_, i) => (
                           <div key={i} className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary group-hover:bg-white transition-colors" />
                         ))}
                         {events.length > 3 && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/50 group-hover:bg-white/50" />}
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {modalInquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative border border-white/10 animate-fade-in-up">
            <button
               onClick={() => setModalInquiry(null)}
               className="absolute top-6 right-6 text-slate-400 hover:text-charcoal dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex items-center gap-3 mb-6">
               <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', modalAction === 'ACCEPTED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')}>
                 {modalAction === 'ACCEPTED' ? <CheckCircle size={24} /> : <XCircle size={24} />}
               </div>
               <div>
                 <h2 className="text-xl font-black text-charcoal dark:text-white">{modalAction === 'ACCEPTED' ? 'Accept Inquiry' : 'Reject Inquiry'}</h2>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{modalInquiry.eventType}</p>
               </div>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                You are about to {modalAction === 'ACCEPTED' ? <span className="text-green-600 font-bold">approve</span> : <span className="text-red-500 font-bold">reject</span>} the event from <span className="font-bold text-charcoal dark:text-white">{modalInquiry.user?.name}</span> scheduled for <span className="font-bold text-charcoal dark:text-white">{new Date(modalInquiry.eventDate).toLocaleDateString()}</span> at {modalInquiry.eventTime}.
              </p>
              
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                   Feedback Message to User {modalAction === 'REJECTED' && <span className="text-red-500">*</span>}
                 </label>
                 <textarea
                   value={feedback}
                   onChange={e => setFeedback(e.target.value)}
                   placeholder={modalAction === 'REJECTED' ? "Please explain why this is rejected..." : "Optional: Include instructions or next steps..."}
                   className="w-full bg-zinc-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-medium text-charcoal dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-none"
                 />
              </div>
            </div>

            <button
              onClick={submitAction}
              disabled={isProcessing !== null || (modalAction === 'REJECTED' && !feedback.trim())}
              className={clsx(
                "w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2",
                modalAction === 'ACCEPTED' ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
              )}
            >
              {isProcessing ? <Loader2 className="animate-spin" size={18} /> : (modalAction === 'ACCEPTED' ? 'Confirm Accept' : 'Confirm Reject')}
            </button>
          </div>
        </div>
      )}

      {/* Calendar Day Events Modal */}
      {selectedCalendarDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
           <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative border border-white/10 animate-fade-in">
             <button
                 onClick={() => setSelectedCalendarDate(null)}
                 className="absolute top-6 right-6 text-slate-400 hover:text-charcoal dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="mb-6">
                <h3 className="text-xl font-black text-charcoal dark:text-white text-center">
                  {selectedCalendarDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-[10px] text-center font-bold tracking-[0.2em] uppercase text-primary mt-1">Scheduled Events</p>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {calendarModalEvents.map(ev => (
                  <div key={ev.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-black border border-slate-100 dark:border-white/5 space-y-2">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-primary rounded px-2 py-0.5">{ev.eventTime}</span>
                     <h4 className="text-sm font-bold text-charcoal dark:text-white">{ev.eventType}</h4>
                     <p className="text-xs text-slate-500 font-medium">Host: {ev.user?.name || ev.user?.email}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
