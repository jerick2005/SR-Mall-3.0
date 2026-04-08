'use client';

import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Loader2, Mail, ShieldAlert, Store } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      const { getAllUsersAction } = await import('@/app/actions/auth');
      const result = await getAllUsersAction();
      if (result.success && result.data) {
        setUsers(result.data);
      }
      setLoading(false);
    }
    loadUsers();
  }, []);

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-fade-in-up min-h-[calc(100vh-80px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-charcoal dark:text-white tracking-tight">User Management Center</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Review and manage all registered accounts across SR-MANAGE.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-bold text-charcoal dark:text-white tracking-tight text-lg">Global Directory</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Total Active Accounts: {loading ? '...' : users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
               <Loader2 className="w-8 h-8 text-primary animate-spin" />
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Accounts...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Details</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">System Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Registered On</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-black text-slate-500 text-sm">
                           {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-charcoal dark:text-white">{item.name || 'Unknown User'}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">ID: {item.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <Mail size={14} className="text-slate-400" /> {item.email}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        item.role === 'ADMIN' ? 'bg-primary/10 text-primary' :
                        item.role === 'TENANT' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {item.role === 'ADMIN' ? <ShieldAlert size={12} /> : item.role === 'TENANT' ? <Store size={12} /> : <Users size={12} />}
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                      {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 px-4 py-2 bg-charcoal dark:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                
                {users.length === 0 && (
                   <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-bold text-sm">No users found.</td>
                   </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
