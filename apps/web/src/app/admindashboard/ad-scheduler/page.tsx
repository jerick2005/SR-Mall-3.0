'use client';

import React, { useEffect, useState } from 'react';
import { Presentation, CheckCircle, ShieldAlert, Clock, MousePointerClick, Filter, Calendar, Plus, Tag, ExternalLink, Trash2, Upload, Cloud } from 'lucide-react';
import { createMallAd, getActiveMallAds, getPendingPromos, updatePromoStatus, deletePromo, updateMallAd, deleteMallAd, getAllMallAds } from '@/app/actions/ads';
import { useAuth } from '@/app/providers';
import clsx from 'clsx';

export default function AdScheduler() {
  const { user } = useAuth();
  const [mallAds, setMallAds] = useState<any[]>([]);
  const [pendingPromos, setPendingPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for Mall Ad
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '/public-view',
    priority: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW',
    startDate: '',
    endDate: '',
    isCloudStored: false,
    storageKey: ''
  });
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Admin: User authenticated?', !!user);
    console.log('🔍 Admin: User role:', user?.role);
    console.log('🔍 Admin: User email:', user?.email);
      // Use debug function to get all ads without date filtering
      const globalAds = await getAllMallAds();
      const approvals = await getPendingPromos();
      
      console.log('📊 Mall Ads fetched:', globalAds.length, 'items');
      console.log('📊 Pending Promos fetched:', approvals.length, 'items');
      console.log('📊 Mall Ads data:', globalAds);
      
      setMallAds(globalAds);
      setPendingPromos(approvals);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'ads');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setFormData({
        ...formData,
        imageUrl: result.url,
        isCloudStored: true,
        storageKey: result.key
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateMallAd = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== PUBLISH BUTTON CLICKED ===');
    console.log('Form data being submitted:', formData);
    
    if (!user) {
      console.error('No user found');
      alert('Please log in to create ads');
      return;
    }
    
    // Validate required fields
    if (!formData.title) {
      console.error('Missing title');
      alert('Please enter a campaign title');
      return;
    }
    
    if (!formData.imageUrl) {
      console.error('Missing image URL');
      alert('Please provide an image URL or upload an image');
      return;
    }
    
    if (!formData.startDate) {
      console.error('Missing start date');
      alert('Please select a start date');
      return;
    }
    
    if (!formData.endDate) {
      console.error('Missing end date');
      alert('Please select an end date');
      return;
    }

    console.log('All validations passed. Creating ad with data:', {
      title: formData.title,
      imageUrl: formData.imageUrl,
      linkUrl: formData.linkUrl,
      priority: formData.priority,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      adminId: user.id
    });

    setPublishing(true);

    try {
      const res = await createMallAd({
        title: formData.title,
        description: '', // Add empty description for now
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
        priority: formData.priority,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        adminId: user.id
      });

      console.log('Create response:', res);

      if (res.success) {
        console.log('Ad created successfully');
        alert('Ad published successfully!');
        setIsModalOpen(false);
        fetchData();
        
        // Reset form
        setFormData({
          title: '',
          imageUrl: '',
          linkUrl: '/public-view',
          priority: 'MEDIUM',
          startDate: '',
          endDate: '',
          isCloudStored: false,
          storageKey: ''
        });
      } else {
        console.error('Failed to create ad:', res.error);
        alert('Failed to create ad: ' + (res.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating ad:', error);
      alert('Error creating ad: ' + (error as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  const handlePromoStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await updatePromoStatus(id, status);
    if (res.success) fetchData();
  };

  const handleEditAd = (ad: any) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      priority: ad.priority,
      startDate: new Date(ad.startDate).toISOString().split('T')[0],
      endDate: new Date(ad.endDate).toISOString().split('T')[0],
      isCloudStored: ad.isCloudStored || false,
      storageKey: ad.storageKey || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingAd) return;

    setPublishing(true);

    try {
      const res = await updateMallAd(editingAd.id, {
        title: formData.title,
        description: '',
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
        priority: formData.priority,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      });

      if (res.success) {
        alert('Ad updated successfully!');
        setIsEditModalOpen(false);
        setEditingAd(null);
        fetchData();
      } else {
        alert('Failed to update ad: ' + (res.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error updating ad: ' + (error as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await deleteMallAd(adId);
      if (res.success) {
        alert('Ad deleted successfully!');
        fetchData();
      } else {
        alert('Failed to delete ad: ' + (res.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error deleting ad: ' + (error as Error).message);
    }
  };

  return (
    <div className={clsx('p-8', 'lg:p-10', 'animate-fade-in-up', 'max-w-[1400px]', 'mx-auto', 'space-y-12')}>
      {/* ─── HEADER ─── */}
      <div className={clsx('flex', 'flex-col', 'md:flex-row', 'md:items-end', 'justify-between', 'gap-4')}>
        <div>
          <h1 className={clsx('text-3xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tight')}>Advertisement Module</h1>
          <p className={clsx('text-sm', 'text-slate-500', 'font-medium', 'mt-1')}>Manage global hero banners and approve tenant shop promotions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className={clsx('flex', 'items-center', 'gap-2', 'px-6', 'py-3', 'bg-primary', 'text-white', 'font-bold', 'text-xs', 'uppercase', 'tracking-widest', 'rounded-2xl', 'hover:bg-primary-hover', 'shadow-xl', 'shadow-primary/20', 'transition-all', 'active:scale-95')}
        >
          <Plus size={16}/> Create Mall-Wide Ad
        </button>
      </div>

      <div className={clsx('grid', 'grid-cols-1', 'lg:grid-cols-12', 'gap-10')}>
        {/* ─── LEFT: MALL-WIDE HERO ADS (ADMIN TIER) ─── */}
        <div className={clsx('lg:col-span-12', 'space-y-6')}>
          <div className={clsx('flex', 'items-center', 'gap-2', 'px-1')}>
             <Presentation size={18} className="text-primary" />
             <h3 className={clsx('font-black', 'text-slate-400', 'uppercase', 'tracking-widest', 'text-xs')}>Global Hero Carousel (Mall-Wide)</h3>
          </div>
          
          <div className={clsx('grid', 'grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-3', 'gap-6')}>
            {console.log('🎨 Rendering mall ads:', mallAds.length, 'items')}
            {mallAds.map((ad) => {
              console.log('🎨 Rendering ad:', ad.title, ad.id);
              return (
              <div key={ad.id} className={clsx('bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-100', 'dark:border-white/5', 'rounded-4xl', 'overflow-hidden', 'shadow-sm', 'group', 'hover:border-primary/50', 'transition-all')}>
                 <div className={clsx('aspect-19/6', 'w-full', 'bg-slate-100', 'dark:bg-zinc-800', 'overflow-hidden', 'relative')}>
                    <img src={ad.imageUrl} alt={ad.title} className={clsx('w-full', 'h-full', 'object-cover', 'group-hover:scale-110', 'transition-transform', 'duration-700')} />
                    <div className={clsx('absolute', 'top-4', 'left-4', 'px-3', 'py-1', 'bg-black/60', 'backdrop-blur-md', 'rounded-full', 'text-[9px]', 'font-black', 'text-white', 'uppercase', 'tracking-tighter')}>
                       Priority: {ad.priority}
                    </div>
                    <div className={clsx('flex', 'gap-2', 'absolute', 'top-4', 'right-4')}>
                      <button
                        onClick={() => handleEditAd(ad)}
                        className={clsx('p-2', 'bg-blue-500', 'text-white', 'rounded-lg', 'hover:bg-blue-600', 'transition-colors')}
                        title="Edit Ad"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className={clsx('p-2', 'bg-red-500', 'text-white', 'rounded-lg', 'hover:bg-red-600', 'transition-colors')}
                        title="Delete Ad"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                 </div>
                 <div className="p-6">
                    <h4 className={clsx('font-bold', 'text-charcoal', 'dark:text-white', 'text-lg', 'mb-1')}>{ad.title}</h4>
                    <p className={clsx('text-xs', 'text-slate-500', 'font-medium', 'mb-4')}>{ad.description || 'Global announcement for all mall visitors.'}</p>
                    <div className={clsx('flex', 'items-center', 'justify-between')}>
                       <span className={clsx('text-[10px]', 'font-bold', 'text-primary', 'bg-primary/5', 'px-2', 'py-1', 'rounded-md', 'uppercase', 'tracking-widest')}>LIVE IN HERO</span>
                       <div className={clsx('text-[9px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'flex', 'items-center', 'gap-1')}>
                          <Clock size={12}/> Expires: {new Date(ad.endDate).toLocaleDateString()}
                       </div>
                    </div>
                 </div>
              </div>
              );
            })}
            {mallAds.length === 0 && !loading && (
              <div className={clsx('col-span-full', 'py-12', 'border-2', 'border-dashed', 'border-slate-200', 'dark:border-white/5', 'rounded-4xl', 'text-center')}>
                 <p className={clsx('text-slate-400', 'font-bold', 'uppercase', 'tracking-widest', 'text-[10px]')}>No Mall-Wide Ads Active</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── CENTRE: PENDING TENANT PROMOS ─── */}
        <div className={clsx('lg:col-span-12', 'space-y-6')}>
           <div className={clsx('flex', 'items-center', 'gap-2', 'px-1')}>
             <Filter size={18} className="text-amber-500" />
             <h3 className={clsx('font-black', 'text-slate-400', 'uppercase', 'tracking-widest', 'text-xs')}>Tenant Promo Approval Pipeline</h3>
          </div>

          <div className={clsx('grid', 'gap-4')}>
            {pendingPromos.map((promo) => (
              <div key={promo.id} className={clsx('bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-100', 'dark:border-white/5', 'rounded-3xl', 'p-6', 'flex', 'flex-col', 'md:flex-row', 'items-center', 'justify-between', 'gap-6', 'shadow-sm', 'group')}>
                <div className={clsx('flex', 'items-center', 'gap-6', 'flex-1', 'w-full', 'overflow-hidden')}>
                  <div className={clsx('w-48', 'h-28', 'rounded-[1.5rem]', 'bg-slate-100', 'dark:bg-zinc-800', 'overflow-hidden', 'shrink-0', 'border', 'border-slate-100', 'dark:border-white/5')}>
                    {promo.promoVideo ? (
                      <video 
                        src={promo.promoVideo} 
                        className={clsx('w-full', 'h-full', 'object-cover', 'group-hover:scale-110', 'transition-transform', 'duration-500')} 
                        autoPlay 
                        muted 
                        loop 
                      />
                    ) : (
                      <img src={promo.promoImage} alt={promo.title} className={clsx('w-full', 'h-full', 'object-cover', 'group-hover:scale-110', 'transition-transform', 'duration-500')} />
                    )}
                  </div>
                  
                  <div className={clsx('flex-1', 'space-y-3')}>
                    <div>
                      <h4 className={clsx('font-bold', 'text-charcoal', 'dark:text-white', 'text-xl', 'pr-4')}>{promo.title}</h4>
                      <p className={clsx('text-xs', 'font-bold', 'text-primary', 'uppercase', 'tracking-widest', 'mt-1', 'flex', 'items-center', 'gap-1.5', 'line-clamp-1')}>
                        From: {promo.tenant?.name || 'Authorized Tenant'} • <Tag size={12}/> Category: {promo.category}
                      </p>
                    </div>

                    <div className={clsx('flex', 'flex-wrap', 'items-center', 'gap-4')}>
                      <div className={clsx('px-3', 'py-1.5', 'bg-slate-50', 'dark:bg-zinc-800', 'rounded-lg', 'text-[10px]', 'font-bold', 'text-slate-500', 'uppercase', 'tracking-widest', 'flex', 'items-center', 'gap-1.5')}>
                        <Calendar size={12}/> Start: {new Date(promo.startDate).toLocaleDateString()} — {new Date(promo.endDate).toLocaleDateString()}
                      </div>
                      <span className={clsx('flex', 'items-center', 'gap-1.5', 'px-3', 'py-1.5', 'rounded-lg', 'bg-amber-50', 'dark:bg-amber-900/30', 'text-amber-600', 'border', 'border-amber-200', 'dark:border-amber-900/50', 'text-[10px]', 'font-bold', 'uppercase', 'tracking-widest', 'animate-pulse')}>
                        <Clock size={12}/> Awaiting Review
                      </span>
                    </div>
                  </div>
                </div>

                <div className={clsx('flex', 'items-center', 'gap-3', 'shrink-0')}>
                  <button onClick={() => handlePromoStatus(promo.id, 'REJECTED')} className={clsx('px-8', 'py-3', 'bg-zinc-100', 'dark:bg-zinc-800', 'text-charcoal', 'dark:text-white', 'rounded-xl', 'font-bold', 'text-[10px]', 'uppercase', 'tracking-widest', 'transition-all', 'hover:bg-red-500', 'hover:text-white')}>
                    Reject
                  </button>
                  <button onClick={() => handlePromoStatus(promo.id, 'APPROVED')} className={clsx('px-8', 'py-3', 'bg-primary', 'text-white', 'rounded-xl', 'font-bold', 'text-[10px]', 'uppercase', 'tracking-widest', 'transition-all', 'hover:scale-105', 'shadow-lg', 'shadow-primary/30')}>
                    Approve
                  </button>
                </div>
              </div>
            ))}
            {pendingPromos.length === 0 && !loading && (
              <div className={clsx('bg-green-50/50', 'dark:bg-green-950/10', 'border', 'border-green-100', 'dark:border-green-900/30', 'p-10', 'rounded-4xl', 'text-center')}>
                 <CheckCircle className={clsx('mx-auto', 'text-green-500', 'mb-2')} size={32} />
                 <h4 className={clsx('font-bold', 'text-charcoal', 'dark:text-white')}>All caught up!</h4>
                 <p className={clsx('text-xs', 'text-slate-500', 'font-medium')}>No pending promotion requests from tenants.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── CREATE MODAL ─── */}
      {isModalOpen && (
        <div className={clsx('fixed', 'inset-0', 'z-100', 'flex', 'items-center', 'justify-center', 'p-6', 'overflow-hidden')}>
          <div className={clsx('absolute', 'inset-0', 'bg-black/60', 'backdrop-blur-md')} onClick={() => setIsModalOpen(false)} />
          <div className={clsx('relative', 'w-full', 'max-w-xl', 'bg-zinc-900', 'rounded-[2.5rem]', 'shadow-2xl', 'border', 'border-white/5', 'p-10', 'animate-fade-in-up')}>
            <h2 className={clsx('text-2xl', 'font-black', 'text-white', 'mb-6', 'uppercase', 'tracking-tight')}>Create Global Mall Ad</h2>
            <form onSubmit={handleCreateMallAd} className="space-y-6">
              <div className="space-y-4">
                 <div className="space-y-2">
                   <label className={clsx('text-[10px]', 'font-black', 'text-slate-500', 'uppercase', 'tracking-widest', 'px-1')}>Campaign Title</label>
                   <input 
                     required 
                     value={formData.title}
                     onChange={e => setFormData({ ...formData, title: e.target.value })}
                     className={clsx('w-full', 'px-4', 'py-4', 'bg-zinc-800', 'rounded-2xl', 'border-2', 'border-transparent', 'focus:border-primary', 'outline-none', 'transition-all', 'text-sm', 'font-medium', 'text-white')} 
                     placeholder="e.g. Grand Holiday Sale 2026"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className={clsx('text-[10px]', 'font-black', 'text-slate-500', 'uppercase', 'tracking-widest', 'px-1', 'flex', 'items-center', 'gap-2')}>
                     {formData.isCloudStored ? (
                       <>
                         <Cloud className="text-green-500" size={16} />
                         Cloud Storage
                       </>
                     ) : (
                       'Banner Image URL'
                     )}
                   </label>
                   <div className={clsx('flex', 'gap-2')}>
                     <input 
                       required
                       value={formData.imageUrl}
                       onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                       className={clsx('flex-1', 'px-4', 'py-4', 'bg-zinc-800', 'rounded-2xl', 'border-2', 'border-transparent', 'focus:border-primary', 'outline-none', 'transition-all', 'text-sm', 'font-medium', 'text-white')} 
                       placeholder={formData.isCloudStored ? "Cloud stored image" : "https://..."}
                       disabled={formData.isCloudStored}
                     />
                     {!formData.isCloudStored && (
                       <label className={clsx('flex', 'items-center', 'gap-2', 'px-4', 'py-4', 'bg-primary/10', 'text-primary', 'rounded-2xl', 'border-2', 'border-primary/20', 'cursor-pointer', 'hover:bg-primary/20', 'transition-all')}>
                         {uploading ? (
                           <>
                             <div className={clsx('w-4', 'h-4', 'border-2', 'border-primary', 'border-t-transparent', 'rounded-full', 'animate-spin')}></div>
                             <span className={clsx('text-sm', 'font-medium')}>Uploading...</span>
                           </>
                         ) : (
                           <>
                             <Upload size={16} />
                             <span className={clsx('text-sm', 'font-medium')}>Upload to Cloud</span>
                           </>
                         )}
                         <input 
                           type="file" 
                           accept="image/*,video/*"
                           onChange={handleFileUpload}
                           className="hidden"
                           disabled={uploading}
                         />
                       </label>
                     )}
                   </div>
                 </div>
                 <div className={clsx('grid', 'grid-cols-2', 'gap-4')}>
                    <div className="space-y-2">
                       <label className={clsx('text-[10px]', 'font-black', 'text-slate-500', 'uppercase', 'tracking-widest', 'px-1')}>Start Date</label>
                       <input 
                         required
                         type="date"
                         value={formData.startDate}
                         onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                         className={clsx('w-full', 'px-4', 'py-4', 'bg-zinc-800', 'rounded-2xl', 'border-2', 'border-transparent', 'focus:border-primary', 'outline-none', 'transition-all', 'text-sm', 'font-medium', 'text-white')} 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className={clsx('text-[10px]', 'font-black', 'text-slate-500', 'uppercase', 'tracking-widest', 'px-1')}>End Date</label>
                       <input 
                         required
                         type="date"
                         value={formData.endDate}
                         onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                         className={clsx('w-full', 'px-4', 'py-4', 'bg-zinc-800', 'rounded-2xl', 'border-2', 'border-transparent', 'focus:border-primary', 'outline-none', 'transition-all', 'text-sm', 'font-medium', 'text-white')} 
                       />
                    </div>
                 </div>
              </div>
              <div className={clsx('flex', 'items-center', 'gap-4', 'pt-4')}>
                 <button type="button" onClick={() => setIsModalOpen(false)} className={clsx('flex-1', 'py-4', 'text-xs', 'font-bold', 'text-slate-500', 'uppercase', 'tracking-widest', 'hover:text-white')}>Cancel</button>
                 <button type="submit" disabled={publishing} className={clsx('flex-2', 'py-4', 'bg-primary', 'text-white', 'font-bold', 'rounded-2xl', 'text-xs', 'uppercase', 'tracking-widest', 'shadow-xl', 'shadow-primary/20', 'hover:bg-primary-hover', 'disabled:opacity-50', 'disabled:cursor-not-allowed', 'transition-all')}>
                   {publishing ? 'Publishing...' : 'Publish Ad'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <div className={clsx('fixed', 'inset-0', 'z-100', 'flex', 'items-center', 'justify-center', 'p-6', 'overflow-hidden')}>
          <div className={clsx('absolute', 'inset-0', 'bg-black/60', 'backdrop-blur-md')} onClick={() => setIsEditModalOpen(false)} />
          <div className={clsx('relative', 'w-full', 'max-w-xl', 'bg-zinc-900', 'rounded-[2.5rem]', 'shadow-2xl', 'border', 'border-white/5', 'p-10', 'animate-fade-in-up')}>
            <h2 className={clsx('text-2xl', 'font-black', 'text-white', 'mb-6', 'uppercase', 'tracking-tight')}>Edit Global Ad</h2>
            <form onSubmit={handleUpdateAd} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className={clsx('text-[10px]', 'font-black', 'text-slate-500', 'uppercase', 'tracking-widest', 'px-1')}>Campaign Title</label>
                  <input 
                    required 
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className={clsx('w-full', 'px-4', 'py-4', 'bg-zinc-800', 'rounded-2xl', 'border-2', 'border-transparent', 'focus:border-primary', 'outline-none', 'transition-all', 'text-sm', 'font-medium', 'text-white')} 
                    placeholder="e.g. Grand Holiday Sale 2026"
                  />
                </div>
                <div>
                  <label className={clsx('text-[10px]', 'font-black', 'text-slate-500', 'uppercase', 'tracking-widest', 'px-1')}>Banner Image URL</label>
                  <input 
                    required
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className={clsx('w-full', 'px-4', 'py-4', 'bg-zinc-800', 'rounded-2xl', 'border-2', 'border-transparent', 'focus:border-primary', 'outline-none', 'transition-all', 'text-sm', 'font-medium', 'text-white')} 
                    placeholder="https://..."
                  />
                </div>
                <div className={clsx('grid', 'grid-cols-2', 'gap-4')}>
                  <div>
                    <label className={clsx('text-[10px]', 'font-black', 'text-slate-500', 'uppercase', 'tracking-widest', 'px-1')}>Start Date</label>
                    <input 
                      required
                      type="date"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      className={clsx('w-full', 'px-4', 'py-4', 'bg-zinc-800', 'rounded-2xl', 'border-2', 'border-transparent', 'focus:border-primary', 'outline-none', 'transition-all', 'text-sm', 'font-medium', 'text-white')} 
                    />
                  </div>
                  <div>
                    <label className={clsx('text-[10px]', 'font-black', 'text-slate-500', 'uppercase', 'tracking-widest', 'px-1')}>End Date</label>
                    <input 
                      required
                      type="date"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      className={clsx('w-full', 'px-4', 'py-4', 'bg-zinc-800', 'rounded-2xl', 'border-2', 'border-transparent', 'focus:border-primary', 'outline-none', 'transition-all', 'text-sm', 'font-medium', 'text-white')} 
                    />
                  </div>
                </div>
              </div>
              <div className={clsx('flex', 'items-center', 'gap-4', 'pt-4')}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className={clsx('flex-1', 'py-4', 'text-xs', 'font-bold', 'text-slate-500', 'uppercase', 'tracking-widest', 'hover:text-white')}>Cancel</button>
                <button type="submit" disabled={publishing} className={clsx('flex-2', 'py-4', 'bg-primary', 'text-white', 'font-bold', 'rounded-2xl', 'text-xs', 'uppercase', 'tracking-widest', 'shadow-xl', 'shadow-primary/20', 'hover:bg-primary-hover', 'disabled:opacity-50', 'disabled:cursor-not-allowed', 'transition-all')}>
                  {publishing ? 'Updating...' : 'Update Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
