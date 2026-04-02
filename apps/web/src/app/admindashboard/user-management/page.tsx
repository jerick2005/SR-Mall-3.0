'use client';

import React from 'react';
import { UserX, ShieldCheck } from 'lucide-react';

const blacklist = [
  { id: 'USR-881', user: 'Spammer99', reason: 'Feedback Spamming', date: '2023-11-15' },
  { id: 'USR-902', user: 'Ghost Booker', reason: 'Fake Booking / Excessive No-Shows', date: '2023-11-18' },
  { id: 'USR-411', user: 'TrollAccount', reason: 'Harrasment in Live Chat', date: '2023-11-19' },
];

export default function UserManagement() {
  return (
    <div className="p-10 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-charcoal dark:text-white tracking-tight">Blacklist Management Center</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Review and manage restricted users across SR-MANAGE.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-red-50/50 dark:bg-red-950/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <UserX size={24} />
          </div>
          <div>
            <h3 className="font-bold text-primary tracking-tight text-lg">Restricted Users List</h3>
            <p className="text-xs text-red-900/60 dark:text-red-200/60 font-bold uppercase tracking-widest mt-1">These users are blocked from key interactions.</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">User Details</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Reason for Restriction</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date Issued</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {blacklist.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-charcoal dark:text-white">{item.user}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{item.id}</p>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-charcoal dark:text-white">
                    {item.reason}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 font-medium">{item.date}</td>
                  <td className="px-6 py-5 text-right">
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95">
                      <ShieldCheck size={16} /> Lift Ban
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
