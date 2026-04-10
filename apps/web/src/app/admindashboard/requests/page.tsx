'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, User, Store, CheckCircle2, XCircle, Loader2, 
  Mail, ExternalLink, MapPin, Calendar as CalendarIcon, 
  Clock, ChevronLeft, ChevronRight, X, MessageSquare 
} from 'lucide-react';
import { getPendingTenantsAction, approveTenantAction, rejectTenantAction } from '@/app/actions/tenant';
import { getAreaSlots } from '@/app/actions/space-slot';
import { getInquiriesAction, updateInquiryStatusAction } from '@/app/actions/inquiry';
import { toast } from 'sonner';
import clsx from 'clsx';
import { useAuth } from '@/app/providers';

// Calendar Helpers
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function UnifiedRequestsPage() {
  const [activeTab, setActiveTab] = useState<'merchant' | 'event'>('merchant');
  const [isLoading, setIsLoading] = useState(true);

  // Merchant Requests State
  const [merchantRequests, setMerchantRequests] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isApprovingMerchant, setIsApprovingMerchant] = useState<string | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});

  // Event Inquiries State
  const [eventInquiries, setEventInquiries] = useState<any[]>([]);
  const [isProcessingEvent, setIsProcessingEvent] = useState<string | null>(null);
  const [modalInquiry, setModalInquiry] = useState<any | null>(null);
  const [modalAction, setModalAction] = useState<'ACCEPTED' | 'REJECTED' | null>(null);
  const [feedback, setFeedback] = useState('');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [calendarModalEvents, setCalendarModalEvents] = useState<any[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tenants, slots, inquiries] = await Promise.all([
        getPendingTenantsAction(),
        getAreaSlots(),
        getInquiriesAction()
      ]);

      if (tenants.success) setMerchantRequests(tenants.data || []);
      if (slots.success) setAvailableSlots(slots.data?.filter((s: any) => s.status === 'AVAILABLE') || []);
      if (inquiries.success) setEventInquiries(inquiries.data || []);
    } catch (err) {
      toast.error("Failed to synchronize request data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Merchant Handlers ---
  const handleApproveMerchant = async (tenantId: string) => {
    const unitId = selectedUnits[tenantId];
    if (!unitId && !confirm("No Unit Assigned: This merchant will be approved without a physical unit assigned. Proceed?")) return;

    try {
      setIsApprovingMerchant(tenantId);
      const res = await approveTenantAction(tenantId, unitId);
      if (res.success) {
        toast.success("Merchant Approved");
        loadData();
      } else {
        toast.error("Approval Failed", { description: res.error });
      }
    } finally {
      setIsApprovingMerchant(null);
    }
  };

  const handleRejectMerchant = async (tenantId: string) => {
    if (confirm("Reject this merchant application?")) {
      const res = await rejectTenantAction(tenantId);
      if (res.success) {
        toast.warning("Merchant Application Rejected");
        loadData();
      }
    }
  };

  // --- Event Handlers ---
  const handleEventActionClick = (inquiry: any, action: 'ACCEPTED' | 'REJECTED') => {
    setModalInquiry(inquiry);
    setModalAction(action);
    setFeedback('');
  };

  const submitEventAction = async () => {
    if (!modalInquiry || !modalAction) return;
    if (modalAction === 'REJECTED' && !feedback.trim()) {
      toast.error("Feedback required for rejection.");
      return;
    }

    setIsProcessingEvent(modalInquiry.id);
    const result = await updateInquiryStatusAction(modalInquiry.id, modalAction, feedback);
    if (result.success) {
      toast.success(`Event Inquiry ${modalAction === 'ACCEPTED' ? 'Accepted' : 'Rejected'}`);
      loadData();
      setModalInquiry(null);
    } else {
      toast.error("Update failed.");
    }
    setIsProcessingEvent(null);
  };

  // --- Calendar Logic ---
  const pendingEvents = eventInquiries.filter(i => i.status === 'PENDING');
  const acceptedEvents = eventInquiries.filter(i => i.status === 'ACCEPTED');
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    return acceptedEvents.filter(inq => {
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

  return (
    <div className="p-4 sm:p-8 lg:p-8 space-y-8 animate-fade-in-up w-full overflow-x-hidden max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Administration</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-charcoal dark:text-white tracking-tight leading-none italic uppercase">
            Inquiries <span className="text-primary">&amp; Requests</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed">
            Central management for new merchant boarding and elite event scheduling.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-white/5">
          <button
            onClick={() => setActiveTab('merchant')}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all relative',
              activeTab === 'merchant'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-slate-400 hover:text-charcoal dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
            )}
          >
            <Store size={15} /> Partner Boarding
            {merchantRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-[9px] font-black">{merchantRequests.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('event')}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all relative',
              activeTab === 'event'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-slate-400 hover:text-charcoal dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
            )}
          >
            <CalendarIcon size={15} /> Event Inquiries
            {pendingEvents.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-[9px] font-black">{pendingEvents.length}</span>
            )}
          </button>
        </div>

        {activeTab === 'merchant' ? (
          <div className="p-6 animate-fade-in space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Applicant Identity</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Venture Concept</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Deployment Unit</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Operational Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-primary" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">Reviewing Applications...</p>
                      </td>
                    </tr>
                  ) : merchantRequests.length > 0 ? (
                    merchantRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                              <User size={22} />
                            </div>
                            <div>
                              <p className="text-base font-black text-charcoal dark:text-white leading-none">{req.user?.name}</p>
                              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">{req.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8 max-w-xs">
                           <div className="space-y-1">
                              <p className="text-sm font-black text-charcoal dark:text-white uppercase tracking-wider">{req.shopName}</p>
                              <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed italic">"{req.description}"</p>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           <div className="relative flex items-center gap-2 group/select">
                              <MapPin size={18} className="text-slate-400" />
                              <select 
                                 className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 text-xs font-bold text-charcoal dark:text-white focus:outline-none focus:border-primary transition-all pr-10 appearance-none cursor-pointer"
                                 value={selectedUnits[req.id] || ''}
                                 onChange={(e) => setSelectedUnits({ ...selectedUnits, [req.id]: e.target.value })}
                              >
                                 <option value="">Select Available Unit</option>
                                 {availableSlots.map(slot => (
                                    <option key={slot.id} value={slot.unit_id}>{slot.unit_id} ({slot.sqm_size}m²)</option>
                                 ))}
                              </select>
                           </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button 
                              onClick={() => handleApproveMerchant(req.id)}
                              disabled={isApprovingMerchant === req.id}
                              className="px-6 py-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectMerchant(req.id)}
                              className="px-6 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <Store size={32} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-lg font-black text-charcoal dark:text-white">All Requests Purged</p>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">No merchant applications pending review.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Pending Inquiries */}
          <div className="space-y-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <Clock size={16} className="text-orange-500" /> Pending Event Files
            </h2>
            <div className="space-y-4">
              {pendingEvents.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] text-center bg-slate-50/50 dark:bg-zinc-900/50">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Zero pending inquiries</p>
                </div>
              ) : (
                pendingEvents.map((inq) => (
                  <div key={inq.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 group hover:border-orange-500/30 transition-all shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded mb-2 inline-block">
                           {inq.eventType}
                         </span>
                         <h3 className="text-base font-black text-charcoal dark:text-white leading-tight">{inq.user?.name || inq.user?.email}</h3>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{inq.user?.email}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[10px] font-black text-charcoal dark:text-white uppercase tracking-widest">{new Date(inq.eventDate).toLocaleDateString()}</p>
                         <p className="text-[10px] font-bold text-slate-400 mt-0.5">{inq.eventTime}</p>
                       </div>
                     </div>
                     <div className="flex gap-2">
                       <button onClick={() => handleEventActionClick(inq, 'ACCEPTED')} className="flex-1 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-all">Accept</button>
                       <button onClick={() => handleEventActionClick(inq, 'REJECTED')} className="flex-1 py-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all">Reject</button>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Calendar Mini-View */}
          <div className="space-y-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <CalendarIcon size={16} className="text-primary" /> Master Schedule
            </h2>
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-white/5 shadow-xl">
               <div className="flex items-center justify-between mb-8">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-all"><ChevronLeft size={20} /></button>
                  <h3 className="text-lg font-black tracking-tight text-charcoal dark:text-white/90">{MONTHS[month]} {year}</h3>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-all"><ChevronRight size={20} /></button>
               </div>
               <div className="grid grid-cols-7 gap-1">
                 {DAYS_OF_WEEK.map(d => <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase mb-2">{d}</div>)}
                 {blanks.map(b => <div key={`b-${b}`} className="aspect-square bg-slate-50 dark:bg-white/5 rounded-lg opacity-20" />)}
                 {days.map(d => {
                    const evs = getEventsForDay(d);
                    const isToday = new Date().getDate() === d && new Date().getMonth() === month;
                    return (
                      <div 
                        key={d} 
                        onClick={() => handleDayClick(d)}
                        className={clsx(
                          'aspect-square rounded-xl flex items-center justify-center relative cursor-pointer group transition-all',
                          evs.length > 0 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-slate-50 dark:hover:bg-white/5',
                          isToday && evs.length === 0 && 'border-2 border-primary'
                        )}
                      >
                         <span className={clsx('text-xs font-black', evs.length > 0 ? 'text-white' : 'text-slate-600 dark:text-slate-400')}>{d}</span>
                         {evs.length > 1 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full border border-primary shrink-0" />
                         )}
                      </div>
                    );
                 })}
               </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Shared Modals */}
      {modalInquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative border border-white/10 animate-fade-in-up">
            <button onClick={() => setModalInquiry(null)} className="absolute top-6 right-6 text-slate-400 hover:text-charcoal transition-colors"><X size={24} /></button>
            <div className="flex items-center gap-3 mb-6">
               <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', modalAction === 'ACCEPTED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')}>
                 {modalAction === 'ACCEPTED' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
               </div>
               <div><h2 className="text-xl font-black text-charcoal dark:text-white uppercase tracking-tighter italic">{modalAction === 'ACCEPTED' ? 'Approve Event' : 'Reject Event'}</h2></div>
            </div>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder={modalAction === 'REJECTED' ? "Required feedback..." : "Optional instructions..."}
              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-medium focus:border-primary transition-all min-h-[120px]"
            />
            <button
              onClick={submitEventAction}
              disabled={isProcessingEvent !== null || (modalAction === 'REJECTED' && !feedback.trim())}
              className={clsx(
                "w-full py-5 mt-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-xl active:scale-95 disabled:opacity-50",
                modalAction === 'ACCEPTED' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'
              )}
            >
              {isProcessingEvent ? 'Syncing...' : 'Confirm Strategy'}
            </button>
          </div>
        </div>
      )}

      {selectedCalendarDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedCalendarDate(null)}>
           <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 relative" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-black text-charcoal dark:text-white uppercase tracking-tighter text-center mb-6">Schedule Detail</h3>
              <div className="space-y-3">
                {calendarModalEvents.map(ev => (
                  <div key={ev.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-black border border-slate-100 dark:border-white/5">
                     <p className="text-[10px] font-black text-primary uppercase mb-1">{ev.eventTime}</p>
                     <h4 className="text-sm font-black text-charcoal dark:text-white uppercase">{ev.eventType}</h4>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
