'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, Ban } from 'lucide-react';

const mockReservations = [
  { id: 'RES-001', user: 'Alice Chen', space: 'Event Hall B', date: '2023-11-20', status: 'Pending', history: 'Clean', offenses: 0 },
  { id: 'RES-002', user: 'Mike Johnson', space: 'Promo Booth C', date: '2023-11-22', status: 'Confirmed', history: 'Warning', offenses: 2 },
  { id: 'RES-003', user: 'Ghost Booker', space: 'Main Atrium', date: '2023-11-25', status: 'Pending', history: 'High Risk', offenses: 5 },
];

export default function ReservationQueue() {
  return (
    <div className="p-10 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-charcoal dark:text-white tracking-tight">Reservation Queue</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Booking protection & user behavior oversight.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Reservation ID</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">User / History</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Space Requested</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {mockReservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-5 text-sm font-bold text-charcoal dark:text-white">{res.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-charcoal dark:text-white">{res.user}</span>
                      {res.offenses > 0 && res.offenses < 4 && (
                         <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                           <AlertTriangle size={12} /> {res.offenses} No-Shows
                         </span>
                      )}
                      {res.offenses >= 4 && (
                         <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                           <ShieldAlert size={12} /> {res.offenses} Offenses
                         </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 font-medium">{res.space} • {res.date}</td>
                  <td className="px-6 py-5 text-right">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-900/50 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95">
                      <Ban size={14} /> Restrict Booking
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
