'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getPublicViewConfigAction,
  updatePublicViewConfigAction,
  getAllCarouselItemsAction,
  createCarouselItemAction,
  updateCarouselItemAction,
  deleteCarouselItemAction,
  toggleCarouselItemAction,
} from '@/app/actions/cms';
import { Plus, Trash2, Edit, Eye, EyeOff, Image as ImageIcon, Loader2, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

interface CarouselItem {
  id: string;
  adminId: string | null;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  priority: number;
  startDate: Date | null;
  endDate: Date | null;
}

interface PublicViewConfig {
  logoUrl: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBgUrl: string;
  heroBadge: string;
  heroOverlayDark: number;
  aboutTitle: string;
  aboutDescription: string;
  aboutImageUrl: string;
  videoTitle: string;
  videoDescription: string;
  featuredVideoUrl: string;
  contactTitle: string;
  contactDescription: string;
}

export default function PublicViewCMSPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  
  const [config, setConfig] = useState<PublicViewConfig>({
    logoUrl: '',
    companyName: 'SR MALL',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    heroTitle: '',
    heroSubtitle: '',
    heroBgUrl: '',
    heroBadge: '',
    heroOverlayDark: 50,
    aboutTitle: '',
    aboutDescription: '',
    aboutImageUrl: '',
    videoTitle: '',
    videoDescription: '',
    featuredVideoUrl: '',
    contactTitle: '',
    contactDescription: '',
  });

  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const [editingCarouselItem, setEditingCarouselItem] = useState<CarouselItem | null>(null);
  const [carouselForm, setCarouselForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    priority: 0,
    isActive: true,
    storageKey: '',
  });

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configData, carouselData] = await Promise.all([
          getPublicViewConfigAction(),
          getAllCarouselItemsAction(),
        ]);

        if (configData) {
          setConfig(prev => ({
            ...prev,
            logoUrl: configData.logoUrl || '',
            companyName: configData.companyName || 'SR MALL',
            contactEmail: configData.contactEmail || '',
            contactPhone: configData.contactPhone || '',
            contactAddress: configData.contactAddress || '',
            heroTitle: configData.heroTitle || '',
            heroSubtitle: configData.heroSubtitle || '',
            heroBgUrl: configData.heroBgUrl || '',
            heroBadge: configData.heroBadge || '',
            heroOverlayDark: configData.heroOverlayDark || 50,
            aboutTitle: configData.aboutTitle || '',
            aboutDescription: configData.aboutDescription || '',
            aboutImageUrl: configData.aboutImageUrl || '',
            videoTitle: configData.videoTitle || '',
            videoDescription: configData.videoDescription || '',
            featuredVideoUrl: configData.featuredVideoUrl || '',
            contactTitle: configData.contactTitle || '',
            contactDescription: configData.contactDescription || '',
          }));
        }

        setCarouselItems(carouselData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleConfigChange = (field: keyof PublicViewConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (field: keyof PublicViewConfig, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const { getCloudStorageProvider } = await import('@/lib/cloud-storage');
      const storageProvider = getCloudStorageProvider();
      const result = await storageProvider.uploadFile(file, 'web-cms');
      
      handleConfigChange(field, result.url);
      showToast('Media uploaded and synchronized', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload media asset', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCarouselUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const { getCloudStorageProvider } = await import('@/lib/cloud-storage');
      const storageProvider = getCloudStorageProvider();
      const result = await storageProvider.uploadFile(file, 'carousel');
      
      setCarouselForm(prev => ({ ...prev, imageUrl: result.url, storageKey: result.key }));
      showToast('Carousel asset ready', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload carousel media', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      await updatePublicViewConfigAction(config);
      showToast('Configuration saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving config:', error);
      showToast('Failed to save configuration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openCarouselModal = (item: CarouselItem | null = null) => {
    setEditingCarouselItem(item);
    setCarouselForm({
      title: item?.title || '',
      description: item?.description || '',
      imageUrl: item?.imageUrl || '',
      linkUrl: item?.linkUrl || '',
      priority: item?.priority || 0,
      isActive: item?.isActive ?? true,
      storageKey: item?.storageKey || '',
    });
    setIsCarouselModalOpen(true);
  };

  const closeCarouselModal = () => {
    setIsCarouselModalOpen(false);
    setEditingCarouselItem(null);
  };

  const handleCreateCarouselItem = async () => {
    setIsLoading(true);
    try {
      const newItem = await createCarouselItemAction(carouselForm);
      setCarouselItems(prev => [...prev, newItem]);
      closeCarouselModal();
      showToast('Carousel item created!', 'success');
    } catch (error) {
      console.error('Error creating carousel item:', error);
      showToast('Failed to create carousel item', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCarouselItem = async () => {
    if (!editingCarouselItem) return;
    
    setIsLoading(true);
    try {
      const updatedItem = await updateCarouselItemAction(editingCarouselItem.id, carouselForm);
      setCarouselItems(prev => prev.map(item => 
        item.id === editingCarouselItem.id ? updatedItem : item
      ));
      closeCarouselModal();
      showToast('Carousel item updated!', 'success');
    } catch (error) {
      console.error('Error updating carousel item:', error);
      showToast('Failed to update carousel item', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCarouselItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this carousel item?')) return;
    
    setIsLoading(true);
    try {
      await deleteCarouselItemAction(id);
      setCarouselItems(prev => prev.filter(item => item.id !== id));
      showToast('Carousel item deleted!', 'success');
    } catch (error) {
      console.error('Error deleting carousel item:', error);
      showToast('Failed to delete carousel item', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCarouselItem = async (id: string) => {
    setIsLoading(true);
    try {
      const updatedItem = await toggleCarouselItemAction(id);
      setCarouselItems(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ));
      showToast(updatedItem.isActive ? 'Item is now visible' : 'Item is now hidden', 'success');
    } catch (error) {
      console.error('Error toggling carousel item:', error);
      showToast('Failed to toggle item', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !config.companyName) {
    return (
      <div className={clsx('flex', 'items-center', 'justify-center', 'min-h-screen')}>
        <Loader2 className={clsx('w-8', 'h-8', 'animate-spin', 'text-primary')} />
      </div>
    );
  }

  return (
    <div className={clsx('p-4', 'sm:p-8', 'lg:p-12', 'space-y-12', 'animate-fade-in-up', 'w-full', 'overflow-x-hidden')}>
      {/* Background Micro-Decoration */}
      <div className={clsx('fixed', 'inset-0', 'pointer-events-none', 'opacity-20', 'dark:opacity-40', 'overflow-hidden', '-z-10')}>
        <div className={clsx('absolute', 'top-[-10%]', 'left-[-10%]', 'w-[40%]', 'h-[40%]', 'bg-primary/20', 'blur-[120px]', 'rounded-full')} />
        <div className={clsx('absolute', 'bottom-[-10%]', 'right-[-10%]', 'w-[30%]', 'h-[30%]', 'bg-blue-500/10', 'blur-[100px]', 'rounded-full')} />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={clsx(
          'fixed top-24 right-8 z-[300] flex items-center gap-3 px-5 py-4 font-bold text-sm rounded-2xl shadow-2xl animate-fade-in-up',
          toast.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-red-500 text-white shadow-red-500/30'
        )}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {toast.msg}
          <button onClick={() => setToast(null)} className={clsx('ml-2', 'opacity-70', 'hover:opacity-100')}>✕</button>
        </div>
      )}

      {/* Premium Header */}
      <div className={clsx('flex', 'flex-col', 'lg:flex-row', 'lg:items-center', 'justify-between', 'gap-6')}>      <div className="space-y-1">
          <div className={clsx('flex', 'items-center', 'gap-3', 'text-primary', 'mb-2')}>
            <div className={clsx('w-1.5', 'h-6', 'bg-primary', 'rounded-full')} />
            <span className={clsx('text-[10px]', 'font-black', 'uppercase', 'tracking-[0.4em]')}>Content Management v3.0</span>
          </div>
          <h1 className={clsx('text-4xl', 'md:text-5xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tight', 'leading-none', 'italic')}>
            Public View <span className="text-primary">CMS</span>
          </h1>
          <p className={clsx('text-slate-500', 'font-medium', 'text-lg')}>
            Manage your public website content and appearance
          </p>
        </div>
        
        {/* Preview Button */}
        <a
          href="/public-view"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx('flex', 'items-center', 'gap-2', 'px-5', 'py-3', 'bg-slate-100', 'dark:bg-white/5', 'hover:bg-slate-200', 'dark:hover:bg-white/10', 'text-slate-700', 'dark:text-slate-300', 'font-bold', 'rounded-2xl', 'transition-all', 'border', 'border-slate-200', 'dark:border-white/10')}
        >
          <ExternalLink size={18} />
          Preview Public View
        </a>
      </div>

      {/* Modern Tabs */}
      <div className={clsx('flex', 'space-x-1', 'p-1.5', 'rounded-2xl', 'w-fit', 'bg-slate-100', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/5')}>
        {['general', 'hero', 'content', 'carousel'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'flex-1 py-2 px-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all',
              activeTab === tab
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-charcoal dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className={clsx('bg-white/40 dark:bg-white/5 border border-white/20 rounded-[2rem] shadow-lg p-8 backdrop-blur-xl')}>
          <div className={clsx('flex', 'items-center', 'gap-3', 'mb-8')}>
            <div className={clsx('w-12', 'h-12', 'bg-primary/10', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'text-primary', 'text-2xl')}>
              ⚙️
            </div>
            <div>
              <h2 className={clsx('text-2xl', 'font-bold', 'text-charcoal', 'dark:text-white')}>General Settings</h2>
              <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>Company Information & Branding</p>
            </div>
          </div>

          <div className={clsx('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-8')}>
            <div className="space-y-2">
              <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Logo</label>
              <div className={clsx('flex', 'items-center', 'gap-4', 'p-4', 'bg-slate-50', 'dark:bg-zinc-900/50', 'rounded-2xl', 'border', 'border-slate-200', 'dark:border-white/5')}>
                {config.logoUrl && (
                  <img src={config.logoUrl} alt="Logo Preview" className={clsx('w-20', 'h-20', 'object-contain', 'rounded-xl', 'bg-white', 'dark:bg-zinc-800', 'p-2')} />
                )}
                <div className={clsx('flex-1', 'space-y-3')}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('logoUrl', e)}
                    className={clsx('block', 'w-full', 'text-sm', 'text-slate-500', 'dark:text-slate-400', 'file:mr-4', 'file:py-3', 'file:px-4', 'file:rounded-xl', 'file:border-0', 'file:text-sm', 'file:font-bold', 'file:bg-slate-100', 'dark:file:bg-zinc-800', 'file:text-charcoal', 'dark:file:text-white', 'hover:file:bg-slate-200', 'dark:hover:file:bg-zinc-700', 'transition-colors')}
                  />
                  <input
                    type="text"
                    placeholder="Or enter image URL"
                    value={config.logoUrl || ''}
                    onChange={(e) => handleConfigChange('logoUrl', e.target.value)}
                    className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Company Name</label>
              <input
                type="text"
                value={config.companyName}
                onChange={(e) => handleConfigChange('companyName', e.target.value)}
                className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
              />
            </div>

            <div className="space-y-2">
              <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Contact Email</label>
              <input
                type="email"
                value={config.contactEmail}
                onChange={(e) => handleConfigChange('contactEmail', e.target.value)}
                className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
              />
            </div>

            <div className="space-y-2">
              <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Contact Phone</label>
              <input
                type="text"
                value={config.contactPhone}
                onChange={(e) => handleConfigChange('contactPhone', e.target.value)}
                className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
              />
            </div>

            <div className={clsx('space-y-2', 'lg:col-span-2')}>
              <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Contact Address</label>
              <textarea
                value={config.contactAddress}
                onChange={(e) => handleConfigChange('contactAddress', e.target.value)}
                className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50', 'resize-none')}
                rows={3}
              />
            </div>

            <div className={clsx('lg:col-span-2', 'pt-4')}>
              <button 
                onClick={handleSaveConfig}
                disabled={isLoading}
                className={clsx('px-8', 'py-4', 'bg-primary', 'text-white', 'font-bold', 'rounded-xl', 'hover:bg-primary/90', 'disabled:opacity-50', 'shadow-lg', 'shadow-primary/30', 'transition-all', 'active:scale-95')}
              >
                {isLoading ? (
                  <>
                    <Loader2 className={clsx('w-5', 'h-5', 'animate-spin', 'mr-2')} />
                    Saving...
                  </>
                ) : (
                  'Save General Settings'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Tab */}
      {activeTab === 'hero' && (
        <div className={clsx('bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'rounded-[2rem]', 'shadow-lg', 'p-8', 'backdrop-blur-xl')}>
          <div className={clsx('flex', 'items-center', 'gap-3', 'mb-8')}>
            <div className={clsx('w-12', 'h-12', 'bg-primary/10', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'text-primary', 'text-2xl')}>
              🖼️
            </div>
            <div>
              <h2 className={clsx('text-2xl', 'font-bold', 'text-charcoal', 'dark:text-white')}>Hero Section</h2>
              <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>Main Banner Configuration</p>
            </div>
          </div>

          <div className={clsx('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-8')}>
            <div className="space-y-2">
              <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Hero Badge</label>
              <input
                type="text"
                value={config.heroBadge}
                onChange={(e) => handleConfigChange('heroBadge', e.target.value)}
                className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
              />
            </div>

            <div className="space-y-2">
              <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Hero Title</label>
              <input
                type="text"
                value={config.heroTitle}
                onChange={(e) => handleConfigChange('heroTitle', e.target.value)}
                className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
              />
            </div>

            <div className={clsx('space-y-2', 'lg:col-span-2')}>
              <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Hero Subtitle</label>
              <textarea
                value={config.heroSubtitle}
                onChange={(e) => handleConfigChange('heroSubtitle', e.target.value)}
                className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50', 'resize-none')}
                rows={3}
              />
            </div>

            <div className={clsx('space-y-2', 'lg:col-span-2')}>
              <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Hero Background Image</label>
              <div className={clsx('p-4', 'bg-slate-50', 'dark:bg-zinc-900/50', 'rounded-2xl', 'border', 'border-slate-200', 'dark:border-white/5')}>
                {config.heroBgUrl && (
                  <img src={config.heroBgUrl} alt="Hero Preview" className={clsx('w-full', 'h-32', 'object-cover', 'rounded-xl', 'mb-4')} />
                )}
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('heroBgUrl', e)}
                    className={clsx('block', 'w-full', 'text-sm', 'text-slate-500', 'dark:text-slate-400', 'file:mr-4', 'file:py-3', 'file:px-4', 'file:rounded-xl', 'file:border-0', 'file:text-sm', 'file:font-bold', 'file:bg-slate-100', 'dark:file:bg-zinc-800', 'file:text-charcoal', 'dark:file:text-white', 'hover:file:bg-slate-200', 'dark:hover:file:bg-zinc-700', 'transition-colors')}
                  />
                  <input
                    type="text"
                    placeholder="Or enter image URL"
                    value={config.heroBgUrl || ''}
                    onChange={(e) => handleConfigChange('heroBgUrl', e.target.value)}
                    className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
                  />
                </div>
              </div>
            </div>

            <div className={clsx('space-y-3', 'lg:col-span-2')}>
              <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>
                Hero Overlay Darkness ({config.heroOverlayDark}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={config.heroOverlayDark}
                onChange={(e) => handleConfigChange('heroOverlayDark', parseInt(e.target.value))}
                className={clsx('w-full', 'h-2', 'bg-slate-200', 'dark:bg-zinc-800', 'rounded-lg', 'appearance-none', 'cursor-pointer', 'accent-primary')}
              />
              <div className={clsx('flex', 'justify-between', 'text-xs', 'font-bold', 'text-slate-400', 'uppercase')}>
                <span>Light</span>
                <span>Dark</span>
              </div>
            </div>

            <div className={clsx('lg:col-span-2', 'pt-4')}>
              <button 
                onClick={handleSaveConfig}
                disabled={isLoading}
                className={clsx('px-8', 'py-4', 'bg-primary', 'text-white', 'font-bold', 'rounded-xl', 'hover:bg-primary/90', 'disabled:opacity-50', 'shadow-lg', 'shadow-primary/30', 'transition-all', 'active:scale-95')}
              >
                {isLoading ? (
                  <>
                    <Loader2 className={clsx('w-5', 'h-5', 'animate-spin', 'mr-2')} />
                    Saving...
                  </>
                ) : (
                  'Save Hero Settings'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-8">
          {/* About Section */}
          <div className={clsx('bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'rounded-[2rem]', 'shadow-lg', 'p-8', 'backdrop-blur-xl')}>
            <div className={clsx('flex', 'items-center', 'gap-3', 'mb-6')}>
              <div className={clsx('w-12', 'h-12', 'bg-primary/10', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'text-primary', 'text-2xl')}>
                ℹ️
              </div>
              <div>
                <h2 className={clsx('text-2xl', 'font-bold', 'text-charcoal', 'dark:text-white')}>About Section</h2>
                <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>Company Overview</p>
              </div>
            </div>

            <div className={clsx('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-8')}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>About Title</label>
                  <input
                    type="text"
                    value={config.aboutTitle}
                    onChange={(e) => handleConfigChange('aboutTitle', e.target.value)}
                    className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
                  />
                </div>
                <div className="space-y-2">
                  <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>About Description</label>
                  <textarea
                    value={config.aboutDescription}
                    onChange={(e) => handleConfigChange('aboutDescription', e.target.value)}
                    className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50', 'resize-none')}
                    rows={4}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>About Image</label>
                <div className={clsx('p-4', 'bg-slate-50', 'dark:bg-zinc-900/50', 'rounded-2xl', 'border', 'border-slate-200', 'dark:border-white/5')}>
                  {config.aboutImageUrl && (
                    <img src={config.aboutImageUrl} alt="About Preview" className={clsx('w-full', 'h-40', 'object-cover', 'rounded-xl', 'mb-4')} />
                  )}
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('aboutImageUrl', e)}
                      className={clsx('block', 'w-full', 'text-sm', 'text-slate-500', 'dark:text-slate-400', 'file:mr-4', 'file:py-3', 'file:px-4', 'file:rounded-xl', 'file:border-0', 'file:text-sm', 'file:font-bold', 'file:bg-slate-100', 'dark:file:bg-zinc-800', 'file:text-charcoal', 'dark:file:text-white', 'hover:file:bg-slate-200', 'dark:hover:file:bg-zinc-700', 'transition-colors')}
                    />
                    <input
                      type="text"
                      placeholder="Or enter image URL"
                      value={config.aboutImageUrl || ''}
                      onChange={(e) => handleConfigChange('aboutImageUrl', e.target.value)}
                      className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className={clsx('bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'rounded-[2rem]', 'shadow-lg', 'p-8', 'backdrop-blur-xl')}>
            <div className={clsx('flex', 'items-center', 'gap-3', 'mb-6')}>
              <div className={clsx('w-12', 'h-12', 'bg-primary/10', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'text-primary', 'text-2xl')}>
                🎬
              </div>
              <div>
                <h2 className={clsx('text-2xl', 'font-bold', 'text-charcoal', 'dark:text-white')}>Featured Video Section</h2>
                <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>Campaign Showcase</p>
              </div>
            </div>

            <div className={clsx('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-8')}>
              <div className="space-y-2">
                <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Video Title</label>
                <input
                  type="text"
                  value={config.videoTitle}
                  onChange={(e) => handleConfigChange('videoTitle', e.target.value)}
                  className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
                />
              </div>
              <div className="space-y-2">
                <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Video URL</label>
                <input
                  type="text"
                  value={config.featuredVideoUrl}
                  onChange={(e) => handleConfigChange('featuredVideoUrl', e.target.value)}
                  className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
                />
              </div>
              <div className="space-y-2">
                <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Video Description</label>
                <input
                  type="text"
                  value={config.videoDescription}
                  onChange={(e) => handleConfigChange('videoDescription', e.target.value)}
                  className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
                />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className={clsx('bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'rounded-[2rem]', 'shadow-lg', 'p-8', 'backdrop-blur-xl')}>
            <div className={clsx('flex', 'items-center', 'gap-3', 'mb-6')}>
              <div className={clsx('w-12', 'h-12', 'bg-primary/10', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'text-primary', 'text-2xl')}>
                📞
              </div>
              <div>
                <h2 className={clsx('text-2xl', 'font-bold', 'text-charcoal', 'dark:text-white')}>Contact Section</h2>
                <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>Footer Information</p>
              </div>
            </div>

            <div className={clsx('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-8')}>
              <div className="space-y-2">
                <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Contact Title</label>
                <input
                  type="text"
                  value={config.contactTitle}
                  onChange={(e) => handleConfigChange('contactTitle', e.target.value)}
                  className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
                />
              </div>
              <div className="space-y-2">
                <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Contact Description</label>
                <input
                  type="text"
                  value={config.contactDescription}
                  onChange={(e) => handleConfigChange('contactDescription', e.target.value)}
                  className={clsx('w-full', 'px-4', 'py-3', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
                />
              </div>
            </div>
          </div>

          <div className={clsx('flex', 'justify-end')}>
            <button 
              onClick={handleSaveConfig}
              disabled={isLoading}
              className={clsx('px-8', 'py-4', 'bg-primary', 'text-white', 'font-bold', 'rounded-xl', 'hover:bg-primary/90', 'disabled:opacity-50', 'shadow-lg', 'shadow-primary/30', 'transition-all', 'active:scale-95')}
            >
              {isLoading ? (
                <>
                  <Loader2 className={clsx('w-5', 'h-5', 'animate-spin', 'mr-2')} />
                  Saving...
                </>
              ) : (
                'Save Content Settings'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Carousel Tab */}
      {activeTab === 'carousel' && (
        <div className="space-y-6">
          <div className={clsx('bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'rounded-[2rem]', 'shadow-lg', 'p-6', 'backdrop-blur-xl')}>
            <div className={clsx('flex', 'items-center', 'justify-between')}>
              <div className={clsx('flex', 'items-center', 'gap-3')}>
                <div className={clsx('w-12', 'h-12', 'bg-primary/10', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'text-primary', 'text-2xl')}>
                  🎠
                </div>
                <div>
                  <h2 className={clsx('text-2xl', 'font-bold', 'text-charcoal', 'dark:text-white')}>Carousel Items</h2>
                  <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>Homepage Advertisements</p>
                </div>
              </div>
              <button 
                onClick={() => openCarouselModal()}
                className={clsx('flex', 'items-center', 'px-6', 'py-3', 'bg-primary', 'text-white', 'font-bold', 'rounded-xl', 'hover:bg-primary/90', 'shadow-lg', 'shadow-primary/30', 'transition-all', 'active:scale-95')}
              >
                <Plus className={clsx('w-5', 'h-5', 'mr-2')} />
                Add Item
              </button>
            </div>
          </div>

          {carouselItems.length === 0 ? (
            <div className={clsx('bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'rounded-[2rem]', 'shadow-lg', 'p-12', 'text-center', 'backdrop-blur-xl')}>
              <div className={clsx('w-20', 'h-20', 'bg-slate-100', 'dark:bg-zinc-900', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'mx-auto', 'mb-6')}>
                <ImageIcon className={clsx('w-10', 'h-10', 'text-slate-400')} />
              </div>
              <h3 className={clsx('text-xl', 'font-bold', 'text-charcoal', 'dark:text-white', 'mb-2')}>No carousel items yet</h3>
              <p className={clsx('text-slate-500', 'mb-6')}>Add your first carousel item to display on the homepage</p>
              <button 
                onClick={() => openCarouselModal()}
                className={clsx('px-6', 'py-3', 'bg-primary', 'text-white', 'font-bold', 'rounded-xl', 'hover:bg-primary/90', 'shadow-lg', 'shadow-primary/30', 'transition-all')}
              >
                <Plus className={clsx('w-5', 'h-5', 'inline', 'mr-2')} />
                Add First Item
              </button>
            </div>
          ) : (
            <div className={clsx('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6')}>
              {carouselItems.map((item) => (
                <div key={item.id} className={clsx('group', 'bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'rounded-[2rem]', 'shadow-lg', 'overflow-hidden', 'hover:shadow-xl', 'transition-all', 'backdrop-blur-xl')}>
                  <div className={clsx('aspect-video', 'relative', 'overflow-hidden')}>
                    <img src={item.imageUrl} alt={item.title} className={clsx('w-full', 'h-full', 'object-cover', 'group-hover:scale-105', 'transition-transform', 'duration-500')} />
                    {!item.isActive && (
                      <div className={clsx('absolute', 'inset-0', 'bg-black/60', 'flex', 'items-center', 'justify-center', 'backdrop-blur-sm')}>
                        <div className={clsx('flex', 'flex-col', 'items-center', 'text-white')}>
                          <EyeOff className={clsx('w-10', 'h-10', 'mb-2')} />
                          <span className={clsx('text-xs', 'font-bold', 'uppercase', 'tracking-widest')}>Hidden</span>
                        </div>
                      </div>
                    )}
                    <div className={clsx('absolute', 'top-4', 'right-4')}>
                      <span className={clsx(
                        'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                        item.isActive ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
                      )}>
                        {item.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className={clsx('font-bold', 'text-charcoal', 'dark:text-white', 'text-lg', 'mb-2')}>{item.title}</h3>
                    <p className={clsx('text-sm', 'text-slate-500', 'dark:text-slate-400', 'mb-4', 'line-clamp-2')}>{item.description}</p>
                    <div className={clsx('flex', 'items-center', 'justify-between', 'pt-4', 'border-t', 'border-slate-200', 'dark:border-white/10')}>
                      <div className={clsx('flex', 'items-center', 'gap-2')}>
                        <button
                          onClick={() => handleToggleCarouselItem(item.id)}
                          className={clsx(
                            'p-2 rounded-xl transition-all',
                            item.isActive 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50' 
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700'
                          )}
                        >
                          {item.isActive ? <Eye className={clsx('w-5', 'h-5')} /> : <EyeOff className={clsx('w-5', 'h-5')} />}
                        </button>
                        <button
                          onClick={() => openCarouselModal(item)}
                          className={clsx('p-2', 'rounded-xl', 'bg-blue-100', 'dark:bg-blue-900/30', 'text-blue-600', 'hover:bg-blue-200', 'dark:hover:bg-blue-900/50', 'transition-all')}
                        >
                          <Edit className={clsx('w-5', 'h-5')} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteCarouselItem(item.id)}
                        className={clsx('p-2', 'rounded-xl', 'bg-red-100', 'dark:bg-red-900/30', 'text-red-600', 'hover:bg-red-200', 'dark:hover:bg-red-900/50', 'transition-all')}
                      >
                        <Trash2 className={clsx('w-5', 'h-5')} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Carousel Modal */}
      {isCarouselModalOpen && (
        <div className={clsx('fixed', 'inset-0', 'bg-black/50', 'backdrop-blur-sm', 'flex', 'items-center', 'justify-center', 'z-50', 'p-4')}>
          <div className={clsx('bg-white', 'dark:bg-zinc-900', 'border', 'border-white/20', 'w-full', 'max-w-lg', 'max-h-[90vh]', 'overflow-y-auto', 'rounded-[2rem]', 'shadow-2xl')}>
            <div className={clsx('p-6', 'border-b', 'border-slate-200', 'dark:border-white/10', 'flex', 'items-center', 'justify-between')}>
              <h3 className={clsx('text-xl', 'font-bold', 'text-charcoal', 'dark:text-white')}>
                {editingCarouselItem ? 'Edit Carousel Item' : 'Add Carousel Item'}
              </h3>
              <button 
                onClick={() => setIsCarouselModalOpen(false)}
                className={clsx('w-10', 'h-10', 'rounded-xl', 'bg-slate-100', 'dark:bg-zinc-800', 'text-slate-500', 'hover:text-charcoal', 'dark:hover:text-white', 'flex', 'items-center', 'justify-center', 'transition-all')}
              >
                ✕
              </button>
            </div>
            <div className={clsx('p-6', 'space-y-6')}>
              <div className="space-y-2">
                <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Title</label>
                <input
                  type="text"
                  value={carouselForm.title}
                  onChange={(e) => setCarouselForm(prev => ({ ...prev, title: e.target.value }))}
                  className={clsx('w-full', 'px-4', 'py-3', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
                  placeholder="Enter carousel title"
                />
              </div>

              <div className="space-y-2">
                <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Description</label>
                <textarea
                  value={carouselForm.description}
                  onChange={(e) => setCarouselForm(prev => ({ ...prev, description: e.target.value }))}
                  className={clsx('w-full', 'px-4', 'py-3', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50', 'resize-none')}
                  placeholder="Enter carousel description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Image Asset</label>
                <div className={clsx('flex', 'gap-3')}>
                  <input
                    type="text"
                    value={carouselForm.imageUrl}
                    onChange={(e) => setCarouselForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className={clsx('flex-1', 'px-4', 'py-3', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
                    placeholder="https://..."
                  />
                  <label className={clsx('p-3', 'bg-primary/10', 'text-primary', 'rounded-xl', 'border', 'border-primary/20', 'cursor-pointer', 'hover:bg-primary/20', 'transition-all', 'flex', 'items-center', 'justify-center')}>
                    <ImageIcon size={20} />
                    <input type="file" accept="image/*" onChange={handleCarouselUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Link URL (Optional)</label>
                <input
                  type="text"
                  value={carouselForm.linkUrl}
                  onChange={(e) => setCarouselForm(prev => ({ ...prev, linkUrl: e.target.value }))}
                  className={clsx('w-full', 'px-4', 'py-3', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
                  placeholder="/public-view or external URL"
                />
              </div>

              <div className="space-y-2">
                <label className={clsx('block', 'text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'uppercase', 'tracking-wider')}>Priority</label>
                <input
                  type="number"
                  value={carouselForm.priority}
                  onChange={(e) => setCarouselForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                  className={clsx('w-full', 'px-4', 'py-3', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'text-charcoal', 'dark:text-white', 'placeholder-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50')}
                  placeholder="Higher number = higher priority"
                />
              </div>

              <div className={clsx('flex', 'items-center', 'gap-3', 'p-4', 'bg-slate-50', 'dark:bg-zinc-800/50', 'rounded-xl')}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={carouselForm.isActive}
                  onChange={(e) => setCarouselForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className={clsx('w-5', 'h-5', 'text-primary', 'bg-white', 'dark:bg-zinc-800', 'border-slate-300', 'dark:border-white/10', 'rounded', 'focus:ring-primary')}
                />
                <label htmlFor="isActive" className={clsx('text-sm', 'font-bold', 'text-charcoal', 'dark:text-white')}>Active (visible on homepage)</label>
              </div>

              <div className={clsx('flex', 'gap-3', 'pt-4')}>
                <button 
                  onClick={() => setIsCarouselModalOpen(false)}
                  className={clsx('flex-1', 'px-6', 'py-4', 'border-2', 'border-slate-200', 'dark:border-white/10', 'text-charcoal', 'dark:text-white', 'font-bold', 'rounded-xl', 'hover:bg-slate-50', 'dark:hover:bg-white/5', 'transition-all')}
                >
                  Cancel
                </button>
                <button 
                  onClick={editingCarouselItem ? handleUpdateCarouselItem : handleCreateCarouselItem}
                  disabled={isLoading}
                  className={clsx('flex-1', 'px-6', 'py-4', 'bg-primary', 'text-white', 'font-bold', 'rounded-xl', 'hover:bg-primary/90', 'disabled:opacity-50', 'shadow-lg', 'shadow-primary/30', 'transition-all')}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className={clsx('w-5', 'h-5', 'animate-spin', 'mr-2')} />
                      Saving...
                    </>
                  ) : (
                    editingCarouselItem ? 'Update Item' : 'Create Item'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
