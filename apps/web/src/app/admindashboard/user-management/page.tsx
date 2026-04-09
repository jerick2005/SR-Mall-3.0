'use client';

import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Loader2, Mail, ShieldAlert, Store, Check, Trash2, Ban } from 'lucide-react';

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<'users' | 'feedback'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setDeletingId(id);
    const { deleteUserAction } = await import('@/app/actions/auth');
    const res = await deleteUserAction(id);
    if (res.success) {
      setUsers(users.filter(u => u.id !== id));
    } else {
      alert(res.error || 'Failed to delete user');
    }
    setDeletingId(null);
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    setUpdatingId(id);
    const { updateUserRoleAction } = await import('@/app/actions/auth');
    const res = await updateUserRoleAction(id, newRole);
    if (res.success) {
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    } else {
      alert(res.error || 'Failed to update user role');
    }
    setUpdatingId(null);
  };

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

  useEffect(() => {
    if (activeTab === 'feedback' && reviews.length === 0) {
      async function loadReviews() {
        setReviewsLoading(true);
        const { getAllReviewsAction } = await import('@/app/actions/review');
        const res = await getAllReviewsAction();
        if (res.success && res.data) {
          setReviews(res.data);
        }
        setReviewsLoading(false);
      }
      loadReviews();
    }
  }, [activeTab]);

  const handleApproveReview = async (id: string) => {
    setApprovingId(id);
    const { approveReviewAction } = await import('@/app/actions/review');
    const res = await approveReviewAction(id);
    if (res.success) {
      setReviews(reviews.map(r => r.id === id ? { ...r, isApproved: true } : r));
    } else {
      alert(res.error || 'Failed to approve review');
    }
    setApprovingId(null);
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setDeletingReviewId(id);
    const { deleteReviewAction } = await import('@/app/actions/review');
    const res = await deleteReviewAction(id);
    if (res.success) {
      setReviews(reviews.filter(r => r.id !== id));
    } else {
      alert(res.error || 'Failed to delete review');
    }
    setDeletingReviewId(null);
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-fade-in-up min-h-[calc(100vh-80px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-charcoal dark:text-white tracking-tight">User Management Center</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Review and manage all registered accounts and moderate user feedback.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/10 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Users size={16} /> Directory
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-all ${
            activeTab === 'feedback'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <ShieldCheck size={16} /> Moderation & Blacklist
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm animate-fade-in">
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
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {updatingId === item.id ? (
                              <Loader2 size={16} className="animate-spin text-primary mr-2" />
                            ) : (
                              <select 
                                value={item.role}
                                onChange={(e) => handleRoleChange(item.id, e.target.value)}
                                className="bg-slate-100 dark:bg-zinc-800 text-charcoal dark:text-white px-2 py-1.5 rounded-lg text-xs font-bold outline-none border border-transparent focus:border-primary transition-all"
                              >
                                <option value="CUSTOMER">Customer</option>
                                <option value="TENANT">Tenant</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                            )}

                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="inline-flex items-center justify-center w-8 h-8 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors active:scale-95 disabled:opacity-50"
                              title="Delete User"
                            >
                              {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
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
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-4 animate-fade-in">
          {reviewsLoading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white/50 dark:bg-zinc-900/50 rounded-[2rem] border border-slate-100 dark:border-white/5">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-white/5">
              <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={28} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-charcoal dark:text-white mb-2">No Reviews Found</h3>
              <p className="text-sm text-slate-500 font-medium">There is currently no user feedback in the database.</p>
            </div>
          ) : (
            reviews.map((item: any) => (
              <div
                key={item.id}
                className={`p-6 rounded-[2rem] border transition-all ${
                  item.isApproved
                    ? 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-white/5 shadow-sm'
                    : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="font-bold text-charcoal dark:text-white">{item.user?.name || 'Unknown User'}</span>
                      <span className="text-xs font-medium text-slate-500">({item.user?.email})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.rating >= 4 ? 'bg-green-500/10 text-green-600' : 
                          item.rating === 3 ? 'bg-amber-500/10 text-amber-600' :
                          'bg-red-500/10 text-red-600'
                        }`}
                      >
                        {item.rating} Stars
                      </span>
                      {!item.isApproved && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-amber-600 tracking-wider">
                          <ShieldAlert size={12} /> Pending Moderation
                        </span>
                      )}
                      {item.isApproved && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary tracking-wider">
                          <Check size={12} /> Approved
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-medium ml-auto">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 italic">
                      {item.comment ? `"${item.comment}"` : <span className="text-slate-400">No written comment provided.</span>}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!item.isApproved && (
                      <button 
                        onClick={() => handleApproveReview(item.id)}
                        disabled={approvingId === item.id}
                        className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {approvingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} 
                        Approve
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteReview(item.id)}
                      disabled={deletingReviewId === item.id}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {deletingReviewId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
