'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Store, Camera, Save, Phone, MapPin, CheckCircle, UploadCloud, Trash2, Loader2, ShoppingBag } from 'lucide-react';
import { DigitalStorefront, StoreProduct } from '@/types/storefront';
import { updateStorefrontAction, getStorefrontAction } from '@/app/actions/tenant';
import { useAuth } from '@/app/providers';
import { ShopCard } from '@/components/shop-card';

// Premium Placeholders for Broken/Blob URLs
const PLACEHOLDERS = [
  '/images/logo/gudget.jpg',
  '/images/logo/gudget2.jpg',
  '/images/logo/gudget3.webp',
  '/images/logo/logoshop.jpg',
];

const getSafeUrl = (url: string | null | undefined, index: number) => {
  if (!url || url.startsWith('blob:') || url.includes('placeholder')) {
    if (index === 0) return '/images/logo/logoshop.jpg'; // Default Logo
    return PLACEHOLDERS[(index - 1) % PLACEHOLDERS.length];
  }
  return url;
};

// Helper function to return gallery_urls (now native array)
const getGalleryUrls = (galleryUrls: string[] | null | undefined): string[] => {
  return Array.isArray(galleryUrls) ? galleryUrls : [];
};

export default function DigitalStorefrontPage() {
  const { user, isAuthenticated, login } = useAuth();
  
  const [profile, setProfile] = useState<Partial<DigitalStorefront>>({
    shop_name: 'Your Shop Name',
    unit_id: 'L1-101',
    is_open: true,
    description: '',
    logo_url: null,
    gallery_urls: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'gallery' | 'catalog'>('identity');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Auto-login placeholder for development if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      login('00000000-0000-0000-0000-000000000001', 'Demo Tenant', 'tenant@mock.com');
    }
  }, [isAuthenticated, login]);

  // Load profile when user is available
  useEffect(() => {
    async function loadData() {
      if (user?.id) {
        const res = await getStorefrontAction(user.id);
        if (res.success && res.data) {
          setProfile(res.data);
        }
        setLoading(false);
      }
    }
    if (isAuthenticated) loadData();
  }, [user?.id, isAuthenticated]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    const res = await updateStorefrontAction(user.id, profile);
    if (res.success && res.data) {
      setProfile(res.data);
      alert('Digital Storefront Sync Complete! Your changes are now live on the Public-View.');
    } else {
      alert('Sync Failed: ' + (res.error || 'Unknown error'));
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'gallery_urls') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const convertToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    };

    const base64Results = await Promise.all(Array.from(files).map(convertToBase64));

    if (field === 'logo_url') {
      updateField('logo_url', base64Results[0]);
    } else {
      setProfile((prev: Partial<DigitalStorefront>) => ({
        ...prev,
        gallery_urls: [...(prev.gallery_urls || []), ...base64Results]
      }));
    }
  };

  const updateField = (field: keyof DigitalStorefront, value: any) => {
    setProfile((prev: Partial<DigitalStorefront>) => ({ ...prev, [field]: value }));
  };

  const addProduct = () => {
    const newProduct: StoreProduct = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      price: '',
      image_url: ''
    };
    updateField('products', [...(profile.products || []), newProduct]);
  };

  const updateProduct = (index: number, field: keyof StoreProduct, value: string) => {
    const updatedProducts = [...(profile.products || [])];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    updateField('products', updatedProducts);
  };

  const removeProduct = (index: number) => {
    const updatedProducts = [...(profile.products || [])];
    updatedProducts.splice(index, 1);
    updateField('products', updatedProducts);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const convertToBase64 = (f: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    };

    try {
      const base64Url = await convertToBase64(file);
      updateProduct(index, 'image_url', base64Url);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center px-4">Waking up Sync Engines...</p>
      </div>
    );
  }

  // Create mock shop for card preview (with defaults)
  const galleryUrls = getGalleryUrls(profile.gallery_urls);
  const previewShop: DigitalStorefront = {
    id: 'preview',
    shop_name: profile.shop_name || 'Your Shop Name',
    unit_id: profile.unit_id || 'L1-XXX',
    is_open: profile.is_open ?? true,
    description: profile.description || 'Your Brand Bio goes here — the public will see this when looking for details.',
    logo_url: getSafeUrl(profile.logo_url, 0),
    gallery_urls: galleryUrls.length 
      ? galleryUrls.map((u, i) => getSafeUrl(u, i + 1)) 
      : PLACEHOLDERS,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pb-20 lg:pb-0">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-14 py-4 sm:py-6 lg:py-10 space-y-6 sm:space-y-8 lg:space-y-12">
      {/* Hidden Inputs */}
      <input type="file" hidden ref={logoInputRef} accept="image/*" onChange={(e) => handleImageUpload(e, 'logo_url')} />
      <input type="file" hidden multiple ref={galleryInputRef} accept="image/*" onChange={(e) => handleImageUpload(e, 'gallery_urls')} />

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 border-b border-slate-100 dark:border-white/5 pb-6 sm:pb-10">
        <div className="space-y-2">
          <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest">Store Management</p>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-charcoal dark:text-white tracking-tight">Digital Storefront</h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl">Curate your brand identity for the public directory.</p>
        </div>
        
        {/* Save & Status */}
        <div className="flex items-center gap-3">
             {/* Status Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 dark:bg-zinc-800/50 p-2 sm:p-3 pr-4 sm:pr-8 rounded-full shadow-sm">
                <button 
                    onClick={() => updateField('is_open', !profile.is_open)}
                    className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-all relative flex items-center shrink-0 ${profile.is_open ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`}
                >
                    <span className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full absolute transition-transform shadow-md flex items-center justify-center ${profile.is_open ? 'translate-x-6 sm:translate-x-7 text-emerald-500' : 'translate-x-1 text-slate-400'}`}>
                        {profile.is_open ? <CheckCircle size={12} /> : null}
                    </span>
                </button>
                <div className="flex flex-col">
                    <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${profile.is_open ? 'text-emerald-600' : 'text-primary'}`}>
                        {profile.is_open ? 'Active' : 'Closed'}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">Public Status</span>
                </div>
            </div>

            <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-4 px-12 py-5 bg-primary text-white hover:scale-105 active:scale-95 disabled:grayscale disabled:scale-100 rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-primary/30"
            >
                {saving ? (
                    <><Loader2 size={24} className="animate-spin" /> Syncing...</>
                ) : (
                    <><Save size={24} /> Sync to Public</>
                )}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
        
        {/* Left Side: Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-10">
          
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto gap-2 p-2 bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5 rounded-3xl hide-scrollbar shadow-inner mt-2">
            {[
              { id: 'identity', label: 'Brand Identity', icon: Store },
              { id: 'gallery', label: 'Visual Experience', icon: Camera },
              { id: 'catalog', label: 'Products Catalog', icon: ShoppingBag }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'identity' | 'gallery' | 'catalog')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-4 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white dark:bg-zinc-800 text-primary shadow-md ring-1 ring-slate-200 dark:ring-white/10' 
                    : 'text-slate-500 hover:text-charcoal dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Identity Card */}
          {activeTab === 'identity' && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl lg:rounded-[3rem] shadow-sm p-6 lg:p-12 overflow-hidden relative animate-fade-in-up">
            <div className="absolute top-0 right-0 w-20 h-20 lg:w-32 lg:h-32 bg-primary/5 rounded-full -mr-10 -mt-10 lg:-mr-16 lg:-mt-16 blur-2xl"></div>
            
            <h2 className="font-black text-charcoal dark:text-white flex items-center gap-2 lg:gap-3 mb-6 lg:mb-10 text-lg lg:text-xl tracking-tight uppercase">
                <Store size={20} className="text-primary lg:w-6 lg:h-6" /> 
                Brand Identity
            </h2>
            
            <div className="flex flex-col xl:flex-row gap-6 lg:gap-12 mb-8 lg:mb-12">
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="relative group shrink-0 mx-auto xl:mx-0"
              >
                <div className={`w-32 h-32 lg:w-44 lg:h-44 rounded-2xl lg:rounded-[3rem] bg-slate-50 dark:bg-zinc-800/30 border-2 border-dashed border-slate-200 dark:border-zinc-700 flex flex-col items-center justify-center text-slate-400 group-hover:bg-white dark:group-hover:bg-zinc-800 transition-all cursor-pointer overflow-hidden group-hover:border-primary shadow-inner ${profile.logo_url ? 'border-solid' : ''}`}>
                  {profile.logo_url ? (
                    <img src={getSafeUrl(profile.logo_url, 0)} className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" alt="Logo" />
                  ) : (
                    <div className="text-center p-4 lg:p-6">
                      <Camera size={28} className="mx-auto mb-2 lg:mb-3 group-hover:text-primary transition-colors lg:w-9 lg:h-9" />
                      <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest leading-loose">High Res<br/>Logo</span>
                    </div>
                  )}
                </div>
                {profile.logo_url && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/20 pointer-events-none rounded-2xl lg:rounded-[3rem]">
                        <UploadCloud className="text-white" size={24} />
                    </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4 lg:space-y-6">
                <div className="group/field relative">
                  <label className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 group-focus-within/field:text-primary transition-colors">Business Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your official shop name"
                    value={profile.shop_name || ''} 
                    onChange={(e) => updateField('shop_name', e.target.value)}
                    className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-white/5 rounded-xl lg:rounded-2xl focus:border-primary focus:ring-4 lg:focus:ring-8 focus:ring-primary/5 focus:outline-none transition-all text-sm lg:text-base font-bold text-charcoal dark:text-white shadow-sm" 
                  />
                </div>
                <div className="group/field relative">
                  <label className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 group-focus-within/field:text-primary transition-colors">About Us / Description</label>
                  <textarea 
                    rows={4} 
                    placeholder="Describe your flagship store and experience to customers..."
                    value={profile.description || ''} 
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-white/5 rounded-xl lg:rounded-2xl focus:border-primary focus:ring-4 lg:focus:ring-8 focus:ring-primary/5 focus:outline-none transition-all text-sm lg:text-base font-semibold text-charcoal dark:text-white resize-none shadow-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-10 border-t border-slate-100 dark:border-white/5 pt-6 lg:pt-10">
                <div className="relative group">
                  <label className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1"><MapPin size={12}/> Unit / Physical Linkage</label>
                  <input 
                    type="text" 
                    placeholder="e.g. L1-105"
                    value={profile.unit_id || ''} 
                    onChange={(e) => updateField('unit_id', e.target.value)}
                    className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-white/5 rounded-xl lg:rounded-2xl focus:border-primary focus:outline-none transition-all text-sm lg:text-base font-black text-charcoal dark:text-white uppercase tracking-widest" 
                  />
                   <span className="absolute right-3 lg:right-4 top-[2.5rem] lg:top-[3.25rem] text-[8px] lg:text-[9px] font-black text-primary px-2 py-1 bg-primary/10 rounded-md">SYNCED</span>
                </div>
                <div>
                  <label className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1"><Phone size={12}/> Public Support Link</label>
                  <input type="text" placeholder="+63 9XX XXX XXXX" className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-white/5 rounded-xl lg:rounded-2xl focus:border-primary focus:outline-none transition-all text-sm lg:text-base font-bold text-charcoal dark:text-white" />
                </div>
            </div>
          </div>
          )}

          {/* Gallery Card */}
          {activeTab === 'gallery' && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl lg:rounded-[3rem] shadow-sm p-6 lg:p-12 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6 lg:mb-10">
                <h2 className="font-black text-charcoal dark:text-white flex items-center gap-2 lg:gap-3 text-lg lg:text-xl tracking-tight uppercase">
                    <UploadCloud size={20} className="text-primary lg:w-6 lg:h-6" /> Visual Experience
                </h2>
                <div className="px-3 py-1.5 lg:px-5 lg:py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-widest hidden sm:block">Optimized</div>
              </div>
              
              <div 
                onClick={() => galleryInputRef.current?.click()}
                className="group relative bg-slate-50 dark:bg-zinc-800/30 border-2 lg:border-[3px] border-dashed border-slate-100 dark:border-white/5 rounded-2xl lg:rounded-[3rem] flex flex-col items-center justify-center p-8 lg:p-14 text-center hover:bg-white dark:hover:bg-zinc-800 hover:border-primary transition-all cursor-pointer shadow-inner"
              >
                 <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-xl lg:rounded-[2rem] bg-white dark:bg-zinc-900 shadow-xl flex items-center justify-center text-primary mb-4 lg:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                   <Camera size={28} className="lg:w-[38px] lg:h-[38px]" />
                 </div>
                 <h4 className="text-base lg:text-xl font-black text-charcoal dark:text-white mb-1 lg:mb-2">Upload Photos</h4>
                 <p className="text-[10px] lg:text-[11px] font-bold text-slate-500 uppercase tracking-widest max-w-[280px] leading-relaxed">Visuals increase engagement by 60%</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-6 mt-6 lg:mt-10">
                {(profile.gallery_urls || []).map((url: string, i: number) => (
                  <div key={i} className="group/item relative aspect-square bg-slate-100 dark:bg-zinc-800 rounded-2xl lg:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                    <img src={getSafeUrl(url, i + 1)} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-125" alt="Gallery" />
                    <button 
                      onClick={() => {
                        const newGallery = (profile.gallery_urls || []).filter((_: string, index: number) => index !== i);
                        updateField('gallery_urls', newGallery);
                      }}
                      className="absolute top-2 right-2 lg:top-3 lg:right-3 w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center bg-red-500 text-white rounded-xl lg:rounded-2xl scale-0 group-hover/item:scale-100 transition-transform shadow-2xl hover:bg-red-600 active:scale-90"
                    >
                      <Trash2 size={14} className="lg:w-4 lg:h-4" />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                ))}
                
                {/* Skeleton placeholders for empty slots */}
                {Array.from({ length: Math.max(0, 3 - (profile.gallery_urls?.length || 0)) }).map((_, i) => (
                  <div key={`skel-${i}`} className="aspect-square bg-slate-50 dark:bg-zinc-800/10 rounded-2xl lg:rounded-3xl border border-dashed border-slate-200 dark:border-white/5"></div>
                ))}
              </div>
          </div>
          )}

          {/* Product Catalog Card */}
          {activeTab === 'catalog' && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl lg:rounded-[3rem] shadow-sm p-6 lg:p-12 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 lg:mb-10 gap-4">
                <h2 className="font-black text-charcoal dark:text-white flex items-center gap-2 lg:gap-3 text-lg lg:text-xl tracking-tight uppercase">
                    <Store size={20} className="text-primary lg:w-6 lg:h-6" /> Products Catalog
                </h2>
                <button 
                  onClick={addProduct}
                  className="px-6 py-3 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                  + Add Product
                </button>
              </div>

              <div className="space-y-6 flex flex-col">
                {profile.products?.map((product, index) => (
                  <div key={product.id} className="p-6 border border-slate-100 dark:border-white/5 rounded-3xl flex flex-col sm:flex-row gap-8 bg-slate-50 dark:bg-zinc-800/20 relative group">
                    <button onClick={() => removeProduct(index)} className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-95 z-10">
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="shrink-0 space-y-3">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block text-center">Product Shot</label>
                       <label className="w-36 h-36 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-dashed border-slate-200 dark:border-zinc-700 flex items-center justify-center cursor-pointer overflow-hidden group/img relative hover:border-primary transition-all shadow-sm">
                          <input type="file" hidden accept="image/*" onChange={(e) => handleProductImageUpload(e, index)} />
                          {product.image_url ? (
                            <img src={getSafeUrl(product.image_url, index + 2)} className="w-full h-full object-cover group-hover/img:opacity-50 transition-opacity" alt="Product" />
                          ) : (
                            <Camera size={28} className="text-slate-300 group-hover/img:text-primary transition-colors" />
                          )}
                          {product.image_url && <UploadCloud className="absolute text-white opacity-0 group-hover/img:opacity-100 transition-opacity" size={28}/>}
                       </label>
                    </div>

                    <div className="flex-1 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="group/field">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 group-focus-within/field:text-primary transition-colors">Product Name</label>
                          <input type="text" value={product.name} onChange={(e) => updateProduct(index, 'name', e.target.value)} placeholder="e.g. Leather Jacket" className="w-full px-5 py-3.5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none text-sm font-bold shadow-sm transition-all" />
                        </div>
                        <div className="group/field">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 group-focus-within/field:text-primary transition-colors">Price tag</label>
                          <input type="text" value={product.price} onChange={(e) => updateProduct(index, 'price', e.target.value)} placeholder="e.g. $199.99" className="w-full px-5 py-3.5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none text-sm font-black text-primary shadow-sm transition-all" />
                        </div>
                      </div>
                      <div className="group/field">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 group-focus-within/field:text-primary transition-colors">Description</label>
                        <textarea value={product.description} onChange={(e) => updateProduct(index, 'description', e.target.value)} rows={2} placeholder="Brief product description..." className="w-full px-5 py-3.5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none text-sm font-medium resize-none shadow-sm transition-all text-slate-600 dark:text-slate-300"></textarea>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!profile.products || profile.products.length === 0) && (
                   <div className="text-center py-16 border-[3px] border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] bg-slate-50 dark:bg-zinc-800/20">
                      <Store size={48} className="mx-auto mb-6 text-slate-300 dark:text-zinc-700" />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">No products showcased yet</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">Add your top selling items to showcase them directly on your digital storefront to all mall visitors.</p>
                   </div>
                )}
              </div>
          </div>
          )}
        </div>

        {/* Right Side: Live Feedback Preview (4 cols) */}
        <div className="lg:col-span-4 relative">
            <div className="sticky top-10 space-y-8">
                <div className="flex items-center gap-3 px-6 py-4 bg-charcoal text-white rounded-t-[2.5rem] shadow-2xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-fade"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Live Public Preview</span>
                </div>
                
                <div className="bg-slate-50 dark:bg-zinc-800/30 rounded-[3rem] p-10 border border-slate-100 dark:border-white/5 relative group/preview transition-all duration-700 hover:shadow-2xl overflow-hidden">
                    <div className="absolute top-10 -right-12 rotate-45 bg-primary text-white text-[10px] font-black px-12 py-2 shadow-xl z-10 uppercase tracking-widest">Draft</div>
                    
                    {/* Shadow underneath */}
                    <div className="absolute -bottom-10 left-10 right-10 h-10 bg-primary/20 blur-3xl opacity-0 group-hover/preview:opacity-100 transition-opacity"></div>
                    
                    <div className="scale-95 group-hover/preview:scale-100 transition-transform duration-700">
                        <ShopCard shop={previewShop} />
                    </div>
                    
                    <div className="mt-12 space-y-6 px-4">
                        <div className="flex items-center gap-4">
                             <div className="w-1.5 h-1.5 rounded-full bg-primary mb-auto mt-2"></div>
                             <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-wide italic">
                                "The Public Concierge will immediately serve this configuration to all mall visitors."
                             </p>
                        </div>
                        
                        {/* Comparison badge */}
                        <div className="p-5 bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Theme</span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Premium Crimson</span>
                        </div>
                    </div>
                </div>

                {/* Integration Status */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-8 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Loader2 size={24} className="animate-spin-slow" />
                    </div>
                    <div>
                        <h4 className="text-emerald-600 font-bold text-sm tracking-tight mb-0.5 uppercase">PostgreSQL Active Engine</h4>
                        <p className="text-[10px] text-emerald-600/60 font-medium uppercase tracking-widest">Premium Persistence Layer</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
    </div>
  );
}
