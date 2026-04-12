'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, Loader2, Mail, ShieldAlert, Store, 
  Check, Trash2, Ban, CheckCircle2, Search, Filter, 
  Activity, ArrowRight, UserPlus, Shield, MessageSquare,
  Sparkles, RefreshCcw, MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<'users' | 'feedback'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { getAllUsersAction } = await import('@/app/actions/auth');
      const result = await getAllUsersAction();
      if (result.success && result.data) {
        setUsers(result.data);
      }
    } catch (err) {
      toast.error("Institutional directory sync failed.");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const { getAllReviewsAction } = await import('@/app/actions/review');
      const res = await getAllReviewsAction();
      if (res.success && res.data) {
        setReviews(res.data);
      }
    } catch (err) {
      toast.error("Sentiment ledger sync failed.");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'feedback') {
      loadReviews();
    }
  }, [activeTab]);

  const handleToggleBlacklist = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Authorization Override: Are you sure you want to ${currentStatus ? 'Restore' : 'Revoke'} access for this entity?`)) return;
    setIsProcessing(id);
    const { toggleUserBlacklistAction } = await import('@/app/actions/auth');
    const res = await toggleUserBlacklistAction(id, !currentStatus);
    if (res.success) {
      toast.success(`Entity ${!currentStatus ? 'Restricted' : 'Restored'} Successfully`);
      setUsers(users.map(u => u.id === id ? { ...u, isBlacklisted: !currentStatus } : u));
    } else {
      toast.error("Administrative Override Failed");
    }
    setIsProcessing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Critical Purge: This will permanently delete this identity and all associated manifests. Proceed?')) return;
    setIsProcessing(id);
    const { deleteUserAction } = await import('@/app/actions/auth');
    const res = await deleteUserAction(id);
    if (res.success) {
      toast.warning("Identity Purged from Database");
      setUsers(users.filter(u => u.id !== id));
    } else {
      toast.error("Purge Protocol Failure");
    }
    setIsProcessing(null);
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    setIsProcessing(id);
    const { updateUserRoleAction } = await import('@/app/actions/auth');
    const res = await updateUserRoleAction(id, newRole);
    if (res.success) {
      toast.success(`Privilege Matrix Updated to: ${newRole}`);
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    } else {
      toast.error("Privilege Update Denied");
    }
    setIsProcessing(null);
  };

  const handleApproveReview = async (id: string) => {
    setIsProcessing(id);
    const { approveReviewAction } = await import('@/app/actions/review');
    const res = await approveReviewAction(id);
    if (res.success) {
      toast.success("Sentiment Approved for Public Manifest");
      setReviews(reviews.map(r => r.id === id ? { ...r, isApproved: true } : r));
    } else {
      toast.error("Moderation Sync Failure");
    }
    setIsProcessing(null);
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Moderation Filter: Purge this feedback from ledger?')) return;
    setIsProcessing(id);
    const { deleteReviewAction } = await import('@/app/actions/review');
    const res = await deleteReviewAction(id);
    if (res.success) {
      toast.warning("Sentiment Purged");
      setReviews(reviews.filter(r => r.id !== id));
    } else {
      toast.error("Purge Protocol Failure");
    }
    setIsProcessing(null);
  };

  const blacklistedUsers = users.filter(u => u.isBlacklisted);

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-fade-in-up space-y-10 min-h-screen max-w-[1700px] mx-auto">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-slate-200 dark:border-white/10">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
              <Shield size={12} /> Institutional Integrity Console
           </div>
           <h1 className="text-5xl font-black text-charcoal dark:text-white tracking-tighter italic uppercase leading-none">
              Governance <span className="text-primary">Console.</span>
           </h1>
           <p className="text-slate-500 font-medium max-w-2xl text-lg">
              Manage the master user matrix, privilege escalation, and coordinate sentiment moderation for the ecosystem.
           </p>
        </div>

        <div className="flex items-center gap-4">
           <button onClick={loadUsers} className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm active:scale-95">
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      {/* Navigation Matrix */}
      <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-white/5 p-2 rounded-[2rem] w-fit border border-slate-200 dark:border-white/5">
         <button
           onClick={() => setActiveTab('users')}
           className={clsx(
             'flex items-center gap-3 px-8 py-4 rounded-2xl transition-all relative whitespace-nowrap active:scale-95',
             activeTab === 'users' 
               ? 'bg-white dark:bg-zinc-800 text-charcoal dark:text-white shadow-xl' 
               : 'text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'
           )}
         >
           <Users size={18} />
           <span className="text-[11px] font-black uppercase tracking-widest">Identity Matrix</span>
           {users.length > 0 && <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-bold">{users.length}</span>}
         </button>
         <button
           onClick={() => setActiveTab('feedback')}
           className={clsx(
             'flex items-center gap-3 px-8 py-4 rounded-2xl transition-all relative whitespace-nowrap active:scale-95',
             activeTab === 'feedback' 
               ? 'bg-white dark:bg-zinc-800 text-charcoal dark:text-white shadow-xl' 
               : 'text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'
           )}
         >
           <MessageSquare size={18} />
           <span className="text-[11px] font-black uppercase tracking-widest">Sentiment Ledger</span>
           {reviews.filter(r => !r.isApproved).length > 0 && <span className="ml-2 px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-full text-[9px] font-bold">{reviews.filter(r => !r.isApproved).length}</span>}
         </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-8 animate-fade-in">
           <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-[3rem] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary shadow-inner">
                       <ShieldCheck size={28} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-charcoal dark:text-white uppercase tracking-tighter italic">Global Directory</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Institutional Integrity: 100% Operational</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <div className="relative group/search">
                       <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-primary transition-colors" />
                       <input type="text" placeholder="FILTER IDENTITY..." className="pl-12 pr-6 py-4 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest w-full md:w-64 focus:ring-4 focus:ring-primary/10 transition-all outline-none" />
                    </div>
                 </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                {loading ? (
                  <div className="py-40 flex flex-col items-center justify-center gap-4">
                     <Loader2 className="w-10 h-10 text-primary animate-spin" />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Matrix...</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Identity</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Privilege Level</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Security Status</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Administrative Protocol</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                       {users.map((item) => (
                         <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group/row">
                            <td className="px-8 py-8">
                               <div className="flex items-center gap-5">
                                  <div className={clsx(
                                    'w-14 h-14 rounded-[1.5rem] font-black text-lg flex items-center justify-center border transition-all shadow-sm',
                                    item.isBlacklisted ? 'bg-red-500 text-white border-red-400' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 border-transparent'
                                  )}>
                                     {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <div>
                                     <p className={clsx('text-base font-black uppercase tracking-tight italic', item.isBlacklisted ? 'text-red-500 line-through opacity-60' : 'text-charcoal dark:text-white')}>{item.name || 'ANONYMOUS'}</p>
                                     <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider">{item.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-8">
                               <div className="flex items-center gap-3">
                                  <div className="p-2 bg-primary/10 text-primary rounded-xl"><Shield size={16} /></div>
                                  <select 
                                    value={item.role}
                                    onChange={(e) => handleRoleChange(item.id, e.target.value)}
                                    disabled={isProcessing === item.id}
                                    className="bg-transparent text-[11px] font-black uppercase tracking-widest text-charcoal dark:text-white hover:text-primary transition-colors cursor-pointer outline-none border-none p-0 focus:ring-0"
                                  >
                                     <option value="CUSTOMER">Customer Segment</option>
                                     <option value="TENANT">Merchant Partner</option>
                                     <option value="ADMIN">System Admin</option>
                                  </select>
                                  {isProcessing === item.id && <Loader2 size={14} className="animate-spin text-primary" />}
                               </div>
                            </td>
                            <td className="px-8 py-8">
                               {item.isBlacklisted ? (
                                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-red-500/20">
                                     <Ban size={10} /> Blacklisted
                                  </span>
                               ) : (
                                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                     <Activity size={10} className="animate-pulse" /> Active Uplink
                                  </span>
                               )}
                            </td>
                            <td className="px-8 py-8 text-right">
                               <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all duration-300">
                                  <button
                                    onClick={() => handleToggleBlacklist(item.id, item.isBlacklisted)}
                                    disabled={isProcessing === item.id}
                                    className={clsx(
                                      'px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50',
                                      item.isBlacklisted ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'
                                    )}
                                  >
                                     {item.isBlacklisted ? 'Restore Access' : 'Revoke Authorization'}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={isProcessing === item.id}
                                    className="p-3.5 bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                                  >
                                     <Trash2 size={18} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                )}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-fade-in">
           {/* Left: Moderation Feed */}
           <div className="xl:col-span-8 space-y-8">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black text-charcoal dark:text-white uppercase item-center italic tracking-tighter">Sentiment <span className="text-primary">Moderation.</span></h2>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reviews.filter(r => !r.isApproved).length} Pending Review</span>
              </div>
              
              <div className="space-y-6">
                {reviewsLoading ? (
                  <div className="p-40 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></div>
                ) : reviews.length === 0 ? (
                  <div className="p-40 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem] bg-white/50 dark:bg-zinc-900/50">
                     <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Sentiment Ledger is Clear</p>
                  </div>
                ) : (
                  reviews.map((item: any) => (
                    <div key={item.id} className={clsx(
                      'p-10 rounded-[3rem] border transition-all group/review relative overflow-hidden',
                      item.isApproved ? 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-white/5' : 'bg-amber-500/5 border-amber-500/20'
                    )}>
                       <div className="flex flex-col md:flex-row items-start justify-between gap-10 relative z-10">
                          <div className="flex-1 space-y-6">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-primary">
                                   {item.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                   <div className="flex items-center gap-3">
                                      <h4 className="text-sm font-black text-charcoal dark:text-white uppercase">{item.user?.name || 'Authorized Shopper'}</h4>
                                      <div className="flex items-center gap-1">
                                         {[...Array(5)].map((_, i) => (
                                           <Sparkles key={i} size={10} className={clsx(i < (item.rating || 5) ? 'text-amber-500' : 'text-slate-200')} />
                                         ))}
                                      </div>
                                   </div>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date().toLocaleDateString()}</p>
                                </div>
                             </div>
                             
                             <div className="p-6 bg-slate-50/50 dark:bg-black/40 rounded-[2rem] border border-slate-100/50 dark:border-white/5 relative">
                                <MessageSquare size={40} className="absolute -top-5 -right-5 text-primary opacity-5" />
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed">"{item.comment}"</p>
                             </div>

                             <div className="flex items-center gap-4 pt-2">
                                {!item.isApproved && (
                                   <button 
                                     onClick={() => handleApproveReview(item.id)}
                                     className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                                   >
                                      Authorize Feed
                                   </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteReview(item.id)}
                                  className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                >
                                   Purge Sentiment
                                </button>
                                {item.isApproved && (
                                   <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                      <CheckCircle2 size={14} /> System Verified
                                   </div>
                                )}
                             </div>
                          </div>

                          <div className="shrink-0 text-right opacity-40 group-hover/review:opacity-100 transition-opacity">
                             <div className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-2xl flex flex-col items-center">
                                <span className="text-2xl font-black text-charcoal dark:text-white">{item.rating || 5}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Stars</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))
                )}
              </div>
           </div>

           {/* Right: Restricted Entities Terminal */}
           <div className="xl:col-span-4 space-y-8">
              <h2 className="text-2xl font-black text-charcoal dark:text-white uppercase italic tracking-tighter">Blacklist <span className="text-red-500">Terminal.</span></h2>
              <div className="bg-charcoal dark:bg-zinc-900 rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldAlert size={120} />
                 </div>
                 
                 <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="space-y-1">
                       <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Restricted Node Matrix</h3>
                       <p className="text-[10px] font-black text-red-500 uppercase tracking-widest underline decoration-red-500/30 decoration-4">Authorization Denied</p>
                    </div>
                    <div className="bg-red-500 text-white px-4 py-1 rounded-xl text-xs font-black shadow-lg shadow-red-500/20">{blacklistedUsers.length}</div>
                 </div>

                 <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 relative z-10">
                    {blacklistedUsers.length === 0 ? (
                       <div className="py-20 text-center space-y-4">
                          <ShieldCheck size={48} className="text-emerald-500 mx-auto opacity-20" />
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest animate-pulse">Ecosystem Security Integrity: High</p>
                       </div>
                    ) : (
                       blacklistedUsers.map(u => (
                         <div key={u.id} className="flex items-center justify-between p-5 bg-white/5 rounded-[1.5rem] border border-white/5 group/bitem hover:bg-white/10 hover:border-red-500/30 transition-all">
                            <div className="truncate flex-1">
                               <p className="text-sm font-black text-white truncate uppercase tracking-tight">{u.name || 'ANONYMOUS'}</p>
                               <p className="text-[10px] text-zinc-500 font-bold truncate tracking-widest mt-0.5">{u.email}</p>
                            </div>
                            <button 
                              onClick={() => handleToggleBlacklist(u.id, true)}
                              className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center opacity-0 group-hover/bitem:opacity-100 hover:scale-110 active:scale-95 transition-all"
                              title="Restore Identity"
                            >
                               <Check size={18} />
                            </button>
                         </div>
                       ))
                    )}
                 </div>

                 <div className="mt-10 pt-8 border-t border-white/5 space-y-4 relative z-10">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase leading-relaxed tracking-wider italic">Administrative Warning: Blacklisted entities are automatically blocked from terminal authentication and manifesting. All active session keys for these identifiers have been liquidated.</p>
                 </div>
              </div>
              
              {/* Quick Actions Card */}
              <div className="bg-primary rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">
                    <RefreshCcw size={40} />
                 </div>
                 <h4 className="text-lg font-black uppercase italic tracking-tighter mb-2">Global Refresh</h4>
                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-6 underline decoration-white/20">Re-synchronize entire identity matrix.</p>
                 <button onClick={loadUsers} className="w-full py-4 bg-white text-primary rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-black/10 active:scale-95 transition-all">Execute Sync</button>
              </div>
           </div>
        </div>
      )}

      {/* Persistence Custom Styling */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary-rgb), 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--primary-rgb), 0.3);
        }
      `}</style>
    </div>
  );
}
