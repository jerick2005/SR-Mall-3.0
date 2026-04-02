'use client';

import React from 'react';
import { Download, Receipt, Calendar, Building2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const paymentHistory = [
  { month: 'November 2023', amount: '₱18,500.00', status: 'Pending', invoice: '#INV-1025' },
  { month: 'October 2023', amount: '₱18,500.00', status: 'Paid', invoice: '#INV-982' },
  { month: 'September 2023', amount: '₱18,500.00', status: 'Paid', invoice: '#INV-854' },
  { month: 'August 2023', amount: '₱18,500.00', status: 'Paid', invoice: '#INV-721' },
];

export default function LeasePayments() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pb-20 lg:pb-0">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest mb-1">Financial</p>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-charcoal dark:text-white tracking-tight">Lease & Payments</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Read-only financial ledger synced with Mall Administration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Current Monthly Rent */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-widest leading-none">Current Monthly Rent</h3>
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
              <Receipt size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-charcoal dark:text-white">₱18,500<span className="text-lg sm:text-xl text-slate-300">.00</span></p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1.5"><Clock size={12}/> Due on the 5th of every month</p>
          </div>
        </div>

        {/* Unit Details & Countdown */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm flex flex-col justify-between relative overflow-hidden group">
           <div className="flex justify-between items-start mb-4 sm:mb-6 relative z-10">
            <div>
              <h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-widest leading-none mb-1">Unit Assignment</h3>
              <p className="text-lg sm:text-2xl font-black text-charcoal dark:text-white flex items-center gap-2">L1-102 <span className="flex items-center gap-1 px-2 py-1 text-[9px] sm:text-[10px] bg-red-50 dark:bg-red-900/20 text-primary border border-primary rounded-full uppercase tracking-widest"><span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Occupied</span></p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-400 flex items-center justify-center">
              <Building2 size={18} className="sm:w-5 sm:h-5" />
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-2">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> Contract Duration</h4>
               <span className="text-sm font-black text-charcoal dark:text-white">14 Months Left</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
               <div className="h-full bg-green-500 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Payment Ledger Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl sm:rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base sm:text-lg text-charcoal dark:text-white flex items-center gap-2"><Receipt size={16} className="text-slate-400 sm:w-[18px] sm:h-[18px]" /> Payment Ledger</h2>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Official Payment History</p>
            </div>
          </div>
          
          <div className="overflow-x-auto p-2 sm:p-4">
             <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">Billing Month</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">Amount Due</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {paymentHistory.map((row) => (
                  <tr key={row.invoice} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <p className="font-bold text-charcoal dark:text-white text-xs sm:text-sm">{row.month}</p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{row.invoice}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm font-black text-charcoal dark:text-white">{row.amount}</td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                       {row.status === 'Paid' && (
                         <span className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-600 rounded-lg border border-green-200"><CheckCircle size={10} className="sm:w-3 sm:h-3"/> Paid</span>
                       )}
                       {row.status === 'Pending' && (
                         <span className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 rounded-lg border border-amber-200"><AlertTriangle size={10} className="sm:w-3 sm:h-3"/> Pending</span>
                       )}
                       {row.status === 'Overdue' && (
                         <span className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-red-50 text-primary rounded-lg border border-red-200"><AlertTriangle size={10} className="sm:w-3 sm:h-3"/> Overdue</span>
                       )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                      {row.status === 'Paid' ? (
                        <button className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors">
                          <Download size={12} className="sm:w-[14px] sm:h-[14px]" />
                        </button>
                      ) : (
                        <button className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-charcoal dark:bg-white text-white dark:text-black hover:scale-105 rounded-xl font-bold text-[9px] sm:text-[10px] uppercase tracking-widest transition-transform shadow-lg">
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

    </div>
    </div>
  );
}
