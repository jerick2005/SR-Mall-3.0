'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, Ban, CheckCircle2, XCircle, Store, Loader2 } from 'lucide-react';
import { getAreaSlots, approveReservationAction, upsertAreaSlot } from '@/app/actions/space-slot';
import { toast } from 'sonner';

export default function ReservationQueue() {
  const [reservedSlots, setReservedSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReservedSlots = async () => {
    setIsLoading(true);
    const res = await getAreaSlots();
    if (res.success && res.data) {
      setReservedSlots(res.data.filter((s: any) => s.status === 'RESERVED'));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadReservedSlots();
  }, []);

  const handleApprove = async (unitId: string) => {
    if (confirm(`Approve reservation for Unit ${unitId}?`)) {
      const res = await approveReservationAction(unitId);
      if (res.success) {
        toast.success("Reservation Approved", { description: `Unit ${unitId} is now officially OCCUPIED.` });
        loadReservedSlots();
      }
    }
  };

  const handleReject = async (slot: any) => {
    if (confirm(`Reject reservation for Unit ${slot.unit_id}? Space will be returned to AVAILABLE.`)) {
      const res = await upsertAreaSlot({
        ...slot,
        status: 'AVAILABLE'
      });
      if (res.success) {
        toast.warning("Reservation Rejected", { description: `Unit ${slot.unit_id} is now back to AVAILABLE.` });
        loadReservedSlots();
      }
    }
  };

  return (
    <div className="p-10 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-charcoal dark:text-white tracking-tight italic uppercase">
            Reservation <span className="text-primary">Queue</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Live oversight of pending space holds and booking protection.</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 bg-primary/5 border border-primary/10 rounded-2xl">
           <p className="text-[10px] font-black uppercase tracking-widest text-primary">Pending Reviews</p>
           <span className="text-2xl font-black text-primary">{reservedSlots.length}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target Unit</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Specifications</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Risk Profile</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {isLoading ? (
                 <tr>
                    <td colSpan={4} className="py-20 text-center">
                       <Loader2 className="animate-spin mx-auto text-primary" size={40} />
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">Synchronizing Queue...</p>
                    </td>
                 </tr>
              ) : reservedSlots.length > 0 ? (
                reservedSlots.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                             <Store size={22} />
                          </div>
                          <div>
                            <p className="text-lg font-black text-charcoal dark:text-white leading-none">{res.unit_id}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Status: RESERVED</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-charcoal dark:text-white">{res.sqm_size} SQM</span>
                        <span className="text-xs text-slate-500 font-medium">₱{res.base_rent.toLocaleString()} / mo</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Low Risk
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button 
                          onClick={() => handleApprove(res.unit_id)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white hover:bg-primary-hover rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/30 active:scale-95"
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleReject(res)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={4} className="py-20 text-center">
                      <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-300 mb-4">
                         <ShieldAlert size={32} />
                      </div>
                      <p className="text-lg font-black text-charcoal dark:text-white">Queue Clear</p>
                      <p className="text-sm text-slate-500 font-medium">No pending reservations require oversight at this time.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
