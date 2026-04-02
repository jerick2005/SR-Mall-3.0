'use client';

import React, { useState, useEffect } from 'react';
import { Presentation, UploadCloud, Calendar, Clock, CheckCircle, ShieldAlert, MousePointerClick, Loader2, Tag, Trash2 } from 'lucide-react';
import { useAuth } from '@/app/providers';
import { createTenantPromo, getPromosByTenant, deleteTenantPromo, getTenantByUserId } from '@/app/actions/ads';
import { getCloudStorageProvider } from '@/lib/cloud-storage';
import clsx from 'clsx';

export default function AdPromoManager() {
  const { user } = useAuth();
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fashion');
  
  // Set default dates: today to 30 days from now
  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(futureDate);
  
  const [promoImage, setPromoImage] = useState('');
  const [promoVideo, setPromoVideo] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (user?.id) fetchPromos();
  }, [user?.id]);

  const fetchPromos = async () => {
    if (!user?.id) return;
    try {
      const tenant = await getTenantByUserId(user.id);
      if (!tenant) {
        console.error('No tenant found for user:', user.id);
        return;
      }
      const data = await getPromosByTenant(tenant.id);
      setPromos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const storageProvider = getCloudStorageProvider();
      const result = await storageProvider.uploadFile(file, 'tenant-promos');
      
      const fileType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
      setMediaType(fileType);
      
      if (fileType === 'VIDEO') {
        setPromoVideo(result.url);
        setPromoImage('');
      } else {
        setPromoImage(result.url);
        setPromoVideo('');
      }
      
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !title || !startDate || !endDate || (!promoImage && !promoVideo)) return;
    
    setIsSubmitting(true);
    try {
      const tenant = await getTenantByUserId(user.id);
      if (!tenant) {
        console.error('No tenant found for user:', user.id);
        alert('No tenant profile found. Please contact admin.');
        return;
      }
      
      await createTenantPromo({
        tenantId: tenant.id,
        title,
        description,
        category,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        promoImage: mediaType === 'IMAGE' ? promoImage : undefined,
        promoVideo: mediaType === 'VIDEO' ? promoVideo : undefined,
        mediaType
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Fashion');
      setStartDate(today); // Use today instead of empty string
      setEndDate(futureDate); // Use futureDate instead of empty string
      setPromoImage('');
      setPromoVideo('');
      setMediaType('IMAGE');
      
      // Refresh promos list
      fetchPromos();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={clsx('min-h-screen', 'bg-slate-50', 'dark:bg-black', 'pb-20', 'lg:pb-0')}>
      <div className={clsx('max-w-[1400px]', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-10', 'py-4', 'sm:py-6', 'lg:py-10', 'space-y-4', 'sm:space-y-6', 'lg:space-y-8')}>
        {/* Header Section */}
        <div className={clsx('flex', 'flex-col', 'sm:flex-row', 'sm:items-end', 'justify-between', 'gap-3')}>  
          <div>
            <p className={clsx('text-[10px]', 'sm:text-xs', 'font-bold', 'text-primary', 'uppercase', 'tracking-widest', 'mb-1')}>Marketing</p>
            <h1 className={clsx('text-xl', 'sm:text-2xl', 'lg:text-3xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tight')}>Ad & Promo Manager</h1>
            <p className={clsx('text-xs', 'sm:text-sm', 'text-slate-500', 'font-medium', 'mt-1')}>Submit visual banners for your storefront</p>
          </div>
        </div>

        <div className={clsx('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-4', 'sm:gap-6', 'lg:gap-8')}>
        
        {/* Ad Submission Form */}
        <form onSubmit={handleSubmit} className={clsx('bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-100', 'dark:border-white/5', 'rounded-[2.5rem]', 'shadow-sm', 'p-8', 'h-fit', 'space-y-6')}>
          <div className={clsx('flex', 'items-center', 'gap-2', 'mb-2')}>
            <div className={clsx('p-2', 'bg-primary/10', 'rounded-lg')}>
               <UploadCloud size={20} className="text-primary" />
            </div>
            <h2 className={clsx('font-bold', 'text-charcoal', 'dark:text-white')}>New Promo Request</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'block', 'mb-1.5', 'px-1')}>Promo Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="e.g. 50% Off Flash Sale" className={clsx('w-full', 'px-5', 'py-4', 'bg-slate-50', 'dark:bg-zinc-800/50', 'border', 'border-slate-200', 'dark:border-white/5', 'rounded-2xl', 'focus:border-primary', 'focus:outline-none', 'transition-all', 'text-sm', 'font-medium')} />
            </div>

            <div>
              <label className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'block', 'mb-1.5', 'px-1')}>Category Targeting</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className={clsx('w-full', 'px-5', 'py-4', 'bg-slate-50', 'dark:bg-zinc-800/50', 'border', 'border-slate-200', 'dark:border-white/5', 'rounded-2xl', 'focus:border-primary', 'focus:outline-none', 'transition-all', 'text-sm', 'font-medium', 'appearance-none')}
              >
                <option>Fashion</option>
                <option>Electronics</option>
                <option>Food & Dining</option>
                <option>Health & Beauty</option>
                <option>Others</option>
              </select>
            </div>

            <div className={clsx('grid', 'grid-cols-2', 'gap-4')}>
               <div>
                  <label className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'block', 'mb-1.5', 'px-1', 'flex', 'items-center', 'gap-1.5')}><Calendar size={12}/> Start Date</label>
                  <input required value={startDate} onChange={e => setStartDate(e.target.value)} type="date" className={clsx('w-full', 'px-5', 'py-4', 'bg-slate-50', 'dark:bg-zinc-800/50', 'border', 'border-slate-200', 'dark:border-white/5', 'rounded-2xl', 'focus:border-primary', 'focus:outline-none', 'transition-all', 'text-sm', 'font-medium')} />
               </div>
               <div>
                  <label className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'block', 'mb-1.5', 'px-1', 'flex', 'items-center', 'gap-1.5')}><Calendar size={12}/> End Date</label>
                  <input required value={endDate} onChange={e => setEndDate(e.target.value)} type="date" className={clsx('w-full', 'px-5', 'py-4', 'bg-slate-50', 'dark:bg-zinc-800/50', 'border', 'border-slate-200', 'dark:border-white/5', 'rounded-2xl', 'focus:border-primary', 'focus:outline-none', 'transition-all', 'text-sm', 'font-medium')} />
               </div>
            </div>

            <div className={clsx('relative', 'border-2', 'border-dashed', 'border-slate-200', 'dark:border-white/10', 'bg-slate-50', 'dark:bg-zinc-800/20', 'rounded-2xl', 'flex', 'flex-col', 'items-center', 'justify-center', 'p-8', 'text-center', 'min-h-[160px]', 'group', 'cursor-pointer', 'hover:border-primary', 'transition-all', 'overflow-hidden')}>
               <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className={clsx('absolute', 'inset-0', 'opacity-0', 'cursor-pointer', 'z-10')} />
               {promoImage || promoVideo ? (
                 mediaType === 'VIDEO' ? (
                   <video 
                     src={promoVideo} 
                     className={clsx('absolute', 'inset-0', 'w-full', 'h-full', 'object-cover')} 
                     autoPlay 
                     muted 
                     loop 
                   />
                 ) : (
                   <img src={promoImage} alt="Preview" className={clsx('absolute', 'inset-0', 'w-full', 'h-full', 'object-cover')} />
                 )
               ) : (
                 <>
                   <UploadCloud size={24} className={clsx('text-slate-400', 'group-hover:text-primary', 'mb-3', 'transition-colors')} />
                   <h4 className={clsx('text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'mb-1')}>Click to Upload Banner</h4>
                   <p className={clsx('text-[9px]', 'font-black', 'text-slate-400', 'uppercase', 'tracking-widest')}>Recommended: 1200x800 px (Image/Video)</p>
                 </>
               )}
            </div>

            <button disabled={isSubmitting || (!promoImage && !promoVideo)} type="submit" className={clsx('w-full', 'py-4', 'bg-primary', 'text-white', 'rounded-2xl', 'font-black', 'text-[10px]', 'uppercase', 'tracking-widest', 'transition-all', 'hover:scale-[1.02]', 'active:scale-95', 'disabled:opacity-50', 'shadow-xl', 'shadow-primary/20')}>
              {isSubmitting ? <Loader2 size={16} className={clsx('animate-spin', 'mx-auto')} /> : 'Request Promotion'}
            </button>
          </div>
        </form>

        {/* Live Ad Status */}
        <div className={clsx('lg:col-span-2', 'space-y-6')}>
           <div className={clsx('flex', 'items-center', 'justify-between', 'border-b', 'border-slate-200', 'dark:border-white/10', 'pb-4', 'px-2')}>
              <h2 className={clsx('font-bold', 'text-charcoal', 'dark:text-white', 'tracking-tight', 'flex', 'items-center', 'gap-2')}><Clock size={16} className="text-primary"/> Promotion History & Status</h2>
           </div>

           <div className={clsx('grid', 'gap-4')}>
             {loading ? (
               <div className={clsx('p-8', 'text-center', 'text-slate-400', 'uppercase', 'tracking-widest', 'text-xs', 'font-bold', 'animate-pulse')}>Loading Your Campaigns...</div>
             ) : promos.length === 0 ? (
               <div className={clsx('p-16', 'text-center', 'bg-slate-50', 'dark:bg-zinc-900/40', 'rounded-[2.5rem]', 'border', 'border-dashed', 'border-slate-200', 'dark:border-white/10')}>
                 <Presentation className={clsx('mx-auto', 'text-slate-300', 'mb-4')} size={48} />
                 <h4 className={clsx('text-slate-500', 'font-bold', 'mb-1')}>No Active Promotions</h4>
                 <p className={clsx('text-xs', 'text-slate-400')}>Your submitted ads will appear here once you request them.</p>
               </div>
             ) : (
               promos.map((promo) => (
                  <div key={promo.id} className={clsx('bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-100', 'dark:border-white/5', 'rounded-3xl', 'p-5', 'flex', 'items-center', 'gap-6', 'shadow-sm', 'group', 'hover:border-primary/30', 'transition-all')}>
                    <div className={clsx('w-40', 'h-24', 'rounded-2xl', 'bg-slate-100', 'dark:bg-zinc-800', 'flex', 'items-center', 'justify-center', 'overflow-hidden', 'shrink-0', 'border', 'border-slate-100', 'dark:border-white/5')}>
                       <img src={promo.promoImage} alt={promo.title} className={clsx('w-full', 'h-full', 'object-cover', 'group-hover:scale-110', 'transition-all', 'duration-500')} />
                    </div>
                    
                    <div className={clsx('flex-1', 'space-y-1')}>
                       <div className={clsx('flex', 'items-start', 'justify-between')}>
                          <h4 className={clsx('font-bold', 'text-charcoal', 'dark:text-white', 'text-lg')}>{promo.title}</h4>
                          <span className={clsx('text-[10px]', 'font-black', 'text-slate-400', 'bg-slate-50', 'dark:bg-zinc-800', 'px-2', 'py-1', 'rounded-md', 'uppercase', 'tracking-tight')}>
                            {promo.category}
                          </span>
                       </div>
                       
                       <p className={clsx('text-[10px]', 'text-slate-500', 'font-medium')}>
                         Schedule: {new Date(promo.startDate).toLocaleDateString()} — {new Date(promo.endDate).toLocaleDateString()}
                       </p>

                       <div className={clsx('flex', 'items-center', 'gap-4', 'mt-3')}>
                          {promo.status === 'APPROVED' && (
                             <span className={clsx('flex', 'items-center', 'gap-1.5', 'px-3', 'py-1.5', 'rounded-xl', 'bg-green-50', 'dark:bg-green-900/20', 'text-green-600', 'border', 'border-green-100', 'dark:border-green-800/40', 'text-[9px]', 'font-black', 'uppercase', 'tracking-widest')}><CheckCircle size={12}/> Live in Public-View</span>
                          )}
                          {promo.status === 'PENDING' && (
                             <span className={clsx('flex', 'items-center', 'gap-1.5', 'px-3', 'py-1.5', 'rounded-xl', 'bg-amber-50', 'dark:bg-amber-900/20', 'text-amber-600', 'border', 'border-amber-100', 'dark:border-amber-900/40', 'text-[9px]', 'font-black', 'uppercase', 'tracking-widest', 'animate-pulse')}><Clock size={12}/> Review in Progress</span>
                          )}
                          {promo.status === 'REJECTED' && (
                             <span className={clsx('flex', 'items-center', 'gap-1.5', 'px-3', 'py-1.5', 'rounded-xl', 'bg-red-50', 'dark:bg-red-900/20', 'text-primary', 'border', 'border-red-100', 'dark:border-red-800/40', 'text-[9px]', 'font-black', 'uppercase', 'tracking-widest')}><ShieldAlert size={12}/> Rejected</span>
                          )}

                          <div className="flex-1" />
                          <button 
                            onClick={async () => {
                              const { deletePromo } = await import('@/app/actions/ads');
                              await deletePromo(promo.id);
                              fetchPromos();
                            }}
                            className={clsx('p-2', 'text-slate-400', 'hover:text-primary', 'transition-colors', 'hover:bg-red-50', 'dark:hover:bg-red-900/20', 'rounded-lg')}
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                  </div>
               ))
             )}
           </div>
        </div>

      </div>
    </div>
    </div>
  );
}
