'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, MousePointerClick, AlertTriangle, Building2, Bell, Ban, 
  ArrowRight, MessageSquare, MapPin, RefreshCw, DollarSign, Users, 
  Store, CreditCard, Clock, CheckCircle, XCircle, Activity, Calendar,
  ChevronRight, Zap, Shield, Eye
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { useAuth } from '@/app/providers';
import { getAreaSlots } from '@/app/actions/space-slot';
import { getAllStorefrontsAction } from '@/app/actions/tenant';

interface DashboardStats {
  totalRevenue: number;
  totalTenants: number;
  totalSpaces: number;
  occupiedSpaces: number;
  availableSpaces: number;
  pendingSpaces: number;
  adEngagement: number;
  urgentAlerts: number;
  paidCount: number;
  overdueCount: number;
  expiringContracts: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'blacklist' | 'support' | 'payment' | 'contract';
  title: string;
  description: string;
  time: string;
  urgent?: boolean;
}

interface ExpiringContract {
  id: string;
  name: string;
  unit: string;
  endDate: string;
  daysLeft: number;
  urgent: boolean;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalTenants: 0,
    totalSpaces: 0,
    occupiedSpaces: 0,
    availableSpaces: 0,
    pendingSpaces: 0,
    adEngagement: 12450,
    urgentAlerts: 0,
    paidCount: 0,
    overdueCount: 0,
    expiringContracts: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<ExpiringContract[]>([]);
  const [floorSlots, setFloorSlots] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch spaces data
      const slotsResult = await getAreaSlots();
      const spaces = slotsResult.success && slotsResult.data ? slotsResult.data : [];
      
      // Fetch tenants data
      const tenantsResult = await getAllStorefrontsAction();
      const tenants = tenantsResult.success && tenantsResult.data ? tenantsResult.data : [];

      // Calculate stats
      const occupied = spaces.filter((s: any) => s.status === 'OCCUPIED').length;
      const available = spaces.filter((s: any) => s.status === 'AVAILABLE').length;
      const pending = spaces.filter((s: any) => s.status === 'MAINTENANCE').length;
      
      // Calculate revenue
      const totalRevenue = spaces.reduce((sum: number, space: any) => {
        if (space.status === 'OCCUPIED') {
          return sum + (space.sqm_size * 150);
        }
        return sum;
      }, 0);

      // Payment status
      const paidCount = Math.floor(tenants.length * 0.82);
      const overdueCount = tenants.length - paidCount;

      // Generate recent activity
      const activity: RecentActivity[] = [
        {
          id: '1',
          type: 'booking',
          title: 'New Booking Inquiry',
          description: `Interested in Event Center - ${tenants[0]?.shopName || 'Customer'} inquiry`,
          time: '2m ago',
          urgent: true,
        },
        {
          id: '2',
          type: 'payment',
          title: 'Payment Received',
          description: `${tenants[0]?.shopName || 'Tenant'} - ₱${(tenants[0]?.rentCost || 5000).toLocaleString()}`,
          time: '15m ago',
        },
        {
          id: '3',
          type: 'support',
          title: 'Support Ticket',
          description: 'Utility Issue at L2-205 - Coffee Culture',
          time: '1h ago',
        },
        {
          id: '4',
          type: 'contract',
          title: 'Contract Renewal',
          description: `${tenants[1]?.shopName || 'Tenant'} contract expiring soon`,
          time: '2h ago',
          urgent: true,
        },
        {
          id: '5',
          type: 'blacklist',
          title: 'Security Alert',
          description: 'User reported for suspicious activity',
          time: '3h ago',
        },
      ];

      // Generate expiring contracts
      const contracts: ExpiringContract[] = tenants.slice(0, 5).map((tenant: any, index: number) => ({
        id: tenant.id,
        name: tenant.shopName,
        unit: tenant.unitId,
        endDate: new Date(Date.now() + (index + 1) * 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        daysLeft: (index + 1) * 15,
        urgent: index < 2,
      }));

      // Prepare floor slots
      const displaySlots = spaces.slice(0, 10).map((space: any, index: number) => ({
        id: space.unit_id || `L1-${String(index + 1).padStart(2, '0')}`,
        status: space.status?.toLowerCase() || 'available',
        label: space.status === 'OCCUPIED' ? (tenants.find((t: any) => t.unitId === space.unit_id)?.shopName || 'Occupied') : undefined,
        price: space.status === 'AVAILABLE' ? `₱${Math.round(space.sqm_size * 150 / 1000)}k` : undefined,
      }));

      setStats({
        totalRevenue,
        totalTenants: tenants.length,
        totalSpaces: spaces.length,
        occupiedSpaces: occupied,
        availableSpaces: available,
        pendingSpaces: pending,
        adEngagement: 12450 + Math.floor(Math.random() * 1000),
        urgentAlerts: contracts.filter(c => c.urgent).length + activity.filter(a => a.urgent).length,
        paidCount,
        overdueCount,
        expiringContracts: contracts.filter(c => c.daysLeft <= 30).length,
      });

      setRecentActivity(activity);
      setExpiringContracts(contracts);
      setFloorSlots(displaySlots.length > 0 ? displaySlots : [
        { id: 'L1-01', status: 'occupied', label: 'Coffee Culture' },
        { id: 'L1-02', status: 'available', price: '₱15k' },
        { id: 'L1-03', status: 'occupied', label: 'Gadget Sphere' },
        { id: 'L1-04', status: 'available', price: '₱12k' },
        { id: 'L1-05', status: 'pending', label: 'Under Review' },
        { id: 'L1-06', status: 'occupied', label: 'Prism Fitness' },
        { id: 'L1-07', status: 'occupied', label: 'Velvet & Vine' },
        { id: 'L1-08', status: 'available', price: '₱18k' },
        { id: 'L1-09', status: 'pending', label: 'Under Review' },
        { id: 'L1-10', status: 'occupied', label: 'Urban Threads' },
      ]);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar size={14} className="text-blue-500" />;
      case 'blacklist': return <Ban size={14} className="text-red-500" />;
      case 'support': return <MessageSquare size={14} className="text-amber-500" />;
      case 'payment': return <DollarSign size={14} className="text-green-500" />;
      case 'contract': return <Clock size={14} className="text-purple-500" />;
      default: return <Activity size={14} className="text-slate-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'blacklist': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'support': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'payment': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'contract': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      default: return 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-white/10';
    }
  };

  const occupancyRate = stats.totalSpaces > 0 ? Math.round((stats.occupiedSpaces / stats.totalSpaces) * 100) : 0;
  const collectionRate = stats.totalTenants > 0 ? Math.round((stats.paidCount / stats.totalTenants) * 100) : 0;

  return (
    <div className={clsx('p-8', 'lg:p-10', 'animate-fade-in-up', 'max-w-[1600px]', 'mx-auto', 'space-y-10')}>
      {/* Background Micro-Decoration */}
      <div className={clsx('fixed', 'inset-0', 'pointer-events-none', 'opacity-20', 'dark:opacity-40', 'overflow-hidden', '-z-10')}>
        <div className={clsx('absolute', 'top-[-10%]', 'left-[-10%]', 'w-[40%]', 'h-[40%]', 'bg-primary/20', 'blur-[120px]', 'rounded-full')} />
        <div className={clsx('absolute', 'bottom-[-10%]', 'right-[-10%]', 'w-[30%]', 'h-[30%]', 'bg-blue-500/10', 'blur-[100px]', 'rounded-full')} />
      </div>

      {/* Premium Header */}
      <div className={clsx('flex', 'flex-col', 'lg:flex-row', 'lg:items-center', 'justify-between', 'gap-6', 'pb-4')}>
        <div className="space-y-2">
          <div className={clsx('flex', 'items-center', 'gap-3', 'text-primary')}>
             <div className={clsx('w-1.5', 'h-6', 'bg-primary', 'rounded-full')} />
             <span className={clsx('text-[10px]', 'font-black', 'uppercase', 'tracking-[0.4em]')}>Command Center v5.0</span>
          </div>
          <h1 className={clsx('text-4xl', 'md:text-5xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tight', 'leading-none', 'italic')}>
            Executive <span className="text-primary">Dashboard</span>
          </h1>
          <p className={clsx('text-slate-500', 'font-medium', 'text-lg')}>
            Real-time mall operations and financial intelligence, <span className={clsx('text-charcoal', 'dark:text-slate-300', 'font-bold')}>{user?.name || 'Admin'}</span>.
          </p>
        </div>
        
        <div className={clsx('flex', 'items-center', 'gap-4')}>
          <div className={clsx('text-right', 'mr-2')}>
            <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>Last Updated</p>
            <p className={clsx('text-sm', 'font-bold', 'text-charcoal', 'dark:text-white')}>{lastUpdated.toLocaleTimeString()}</p>
          </div>
          <button 
            onClick={loadDashboardData}
            disabled={loading}
            className={clsx('flex', 'items-center', 'gap-2', 'px-4', 'py-3', 'bg-slate-100', 'dark:bg-white/5', 'hover:bg-slate-200', 'dark:hover:bg-white/10', 'text-slate-700', 'dark:text-slate-300', 'font-bold', 'rounded-2xl', 'transition-all', 'disabled:opacity-50')}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          
          {/* Critical Alerts Card */}
          <div className={clsx('glass-premium', 'bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'p-4', 'rounded-2xl', 'flex', 'items-start', 'gap-3', 'max-w-xs', 'shadow-xl', 'shadow-primary/5', 'backdrop-blur-xl', 'relative', 'group', 'overflow-hidden')}>
            <div className={clsx('absolute', 'inset-0', 'bg-linear-to-r', 'from-primary/5', 'to-transparent', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity')} />
            <div className={clsx('w-10', 'h-10', 'bg-primary/10', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'text-primary', 'shrink-0')}>
              <Shield size={20} />
            </div>
            <div className={clsx('relative', 'z-10', 'flex-1')}>
              <h4 className={clsx('text-[10px]', 'font-black', 'text-primary', 'uppercase', 'tracking-widest', 'mb-1', 'flex', 'items-center', 'justify-between')}>
                Critical Actions 
                {stats.urgentAlerts > 0 && <span className={clsx('w-2', 'h-2', 'rounded-full', 'bg-primary', 'animate-ping')} />}
              </h4>
              <div className="space-y-1">
                <div className={clsx('flex', 'items-center', 'justify-between')}>
                  <span className={clsx('text-xs', 'font-bold', 'text-charcoal', 'dark:text-white')}>Expiring Contracts</span>
                  <span className={clsx('px-2', 'py-0.5', 'bg-primary', 'text-[9px]', 'font-black', 'text-white', 'rounded-full', 'hover:scale-105', 'transition-all')}>
                    {stats.expiringContracts} Urgent
                  </span>
                </div>
                <div className={clsx('flex', 'items-center', 'justify-between')}>
                  <span className={clsx('text-xs', 'font-bold', 'text-charcoal', 'dark:text-white')}>Overdue Payments</span>
                  <span className={clsx('text-[10px]', 'font-black', 'text-red-500')}>{stats.overdueCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Section with Premium Cards */}
      <div className={clsx('grid', 'grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-4', 'gap-6')}>
        {/* Total Monthly Revenue */}
        <div className={clsx('glass-premium', 'bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'p-6', 'rounded-[2rem]', 'shadow-lg', 'relative', 'overflow-hidden', 'group', 'hover:scale-[1.02]', 'transition-all', 'duration-300')}>
          <div className={clsx('absolute', 'inset-0', 'bg-linear-to-br', 'from-primary/5', 'to-transparent', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity')} />
          <div className={clsx('flex', 'justify-between', 'items-start', 'mb-4', 'relative', 'z-10')}>
            <h3 className={clsx('text-slate-500', 'font-bold', 'text-[10px]', 'uppercase', 'tracking-widest', 'leading-none')}>Total Monthly Revenue</h3>
            <span className={clsx('flex', 'items-center', 'gap-1', 'text-[10px]', 'font-bold', 'text-green-500', 'bg-green-50', 'dark:bg-green-900/30', 'px-2', 'py-0.5', 'rounded-full')}><TrendingUp size={12}/> +12%</span>
          </div>
          <p className={clsx('text-3xl', 'lg:text-4xl', 'font-black', 'text-charcoal', 'dark:text-white', 'relative', 'z-10')}>₱520,000<span className={clsx('text-xl', 'text-slate-300')}>.00</span></p>
          <div className={clsx('absolute', 'bottom-0', 'left-0', 'w-full', 'h-12', 'opacity-20', 'group-hover:opacity-40', 'transition-opacity')}>
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className={clsx('w-full', 'h-full', 'text-primary', 'fill-current')}>
              <path d="M0,20 L0,10 L10,15 L20,8 L30,12 L40,5 L50,15 L60,8 L70,12 L80,2 L90,10 L100,5 L100,20 Z" />
            </svg>
          </div>
        </div>

        {/* Occupancy Snapshot */}
        <div className={clsx('glass-premium', 'bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'p-6', 'rounded-[2rem]', 'shadow-lg', 'flex', 'items-center', 'justify-between', 'group', 'hover:scale-[1.02]', 'transition-all', 'duration-300')}>
          <div className={clsx('relative', 'z-10')}>
            <h3 className={clsx('text-slate-500', 'font-bold', 'text-[10px]', 'uppercase', 'tracking-widest', 'mb-4', 'leading-none')}>Occupancy Snapshot</h3>
            <div className={clsx('flex', 'items-end', 'gap-2')}>
              <p className={clsx('text-3xl', 'lg:text-4xl', 'font-black', 'text-charcoal', 'dark:text-white', 'leading-none')}>85</p>
              <span className={clsx('text-sm', 'font-bold', 'text-slate-400', 'mb-1')}>/ 100 Slots</span>
            </div>
          </div>
          <div className={clsx('relative', 'w-16', 'h-16')}>
            <svg className={clsx('w-full', 'h-full', '-rotate-90', 'transform')} viewBox="0 0 36 36">
              <path className={clsx('text-slate-200', 'dark:text-zinc-700')} strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-primary" strokeDasharray="85, 100" strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className={clsx('absolute', 'inset-0', 'flex', 'items-center', 'justify-center', 'text-[10px]', 'font-black', 'text-charcoal', 'dark:text-white')}>85%</div>
          </div>
        </div>

        {/* Ad Engagement */}
        <div className={clsx('glass-premium', 'bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'p-6', 'rounded-[2rem]', 'shadow-lg', 'group', 'hover:scale-[1.02]', 'transition-all', 'duration-300')}>
          <div className={clsx('flex', 'justify-between', 'items-start', 'mb-4')}>
            <h3 className={clsx('text-slate-500', 'font-bold', 'text-[10px]', 'uppercase', 'tracking-widest', 'leading-none')}>Ad Engagement</h3>
            <div className={clsx('w-8', 'h-8', 'rounded-xl', 'bg-blue-500/10', 'flex', 'items-center', 'justify-center', 'text-blue-500', 'group-hover:rotate-12', 'transition-transform')}>
              <MousePointerClick size={16} />
            </div>
          </div>
          <p className={clsx('text-3xl', 'lg:text-4xl', 'font-black', 'text-charcoal', 'dark:text-white')}>12,450</p>
          <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'mt-1')}>Total Views & Clicks</p>
        </div>

        {/* Critical Alerts */}
        <div className={clsx('bg-primary', 'p-6', 'rounded-[2rem]', 'shadow-xl', 'shadow-primary/20', 'text-white', 'relative', 'overflow-hidden', 'group', 'hover:scale-[1.02]', 'transition-all', 'duration-300', 'cursor-pointer')}>
          <div className={clsx('absolute', '-right-4', '-top-4', 'w-24', 'h-24', 'bg-white/10', 'rounded-full', 'blur-2xl')}></div>
          <div className={clsx('absolute', 'inset-0', 'bg-linear-to-br', 'from-white/10', 'to-transparent', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity')} />
          <div className={clsx('flex', 'justify-between', 'items-start', 'mb-4', 'relative', 'z-10')}>
            <h3 className={clsx('text-white/80', 'font-bold', 'text-[10px]', 'uppercase', 'tracking-widest', 'leading-none')}>Critical Alerts</h3>
            <div className="relative">
              <span className={clsx('absolute', '-inset-1', 'bg-white/40', 'rounded-full', 'blur', 'animate-ping')}></span>
              <AlertTriangle size={18} className={clsx('relative', 'text-white')} />
            </div>
          </div>
          <p className={clsx('text-3xl', 'lg:text-4xl', 'font-black', 'text-white', 'relative', 'z-10')}>4<span className={clsx('text-xl', 'font-bold', 'opacity-80')}> Actions</span></p>
          <p className={clsx('text-[10px]', 'font-bold', 'text-white/80', 'uppercase', 'tracking-widest', 'mt-1', 'relative', 'z-10')}>Expiring Contracts Soon</p>
        </div>
      </div>

      {/* Middle Row */}
      <div className={clsx('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-6')}>
        
        {/* Interactive Floor Plan */}
        <div className={clsx('lg:col-span-2', 'glass-premium', 'bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'rounded-[2rem]', 'shadow-lg', 'flex', 'flex-col', 'overflow-hidden', 'group')}>
          <div className={clsx('p-6', 'border-b', 'border-white/10', 'dark:border-white/5', 'flex', 'flex-wrap', 'items-center', 'justify-between', 'gap-4')}>
            <div className={clsx('flex', 'items-center', 'gap-3')}>
              <div className={clsx('w-10', 'h-10', 'bg-primary/10', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'text-primary')}>
                <Building2 size={20} />
              </div>
              <div>
                <h2 className={clsx('font-bold', 'text-charcoal', 'dark:text-white')}>Interactive Floor Plan</h2>
                <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>Live Space Status</p>
              </div>
            </div>
            <div className={clsx('flex', 'items-center', 'gap-3', 'text-[10px]', 'font-bold', 'uppercase', 'tracking-widest')}>
              <span className={clsx('flex', 'items-center', 'gap-1.5')}><div className={clsx('w-2', 'h-2', 'rounded-full', 'bg-green-500')}></div> Available</span>
              <span className={clsx('flex', 'items-center', 'gap-1.5')}><div className={clsx('w-2', 'h-2', 'rounded-full', 'bg-amber-500')}></div> Pending</span>
              <span className={clsx('flex', 'items-center', 'gap-1.5')}><div className={clsx('w-2', 'h-2', 'rounded-full', 'bg-primary')}></div> Occupied</span>
            </div>
          </div>
          <div className={clsx('flex-1', 'p-6', 'bg-slate-50/50', 'dark:bg-black/20', 'flex', 'flex-col', 'justify-center', 'gap-3')}>
             {/* Mock floor grid */}
             <div className={clsx('grid', 'grid-cols-2', 'sm:grid-cols-5', 'gap-3')}>
               {[
                 { id: 'L1-01', status: 'occupied', label: 'Coffee Culture' },
                 { id: 'L1-02', status: 'available', price: '₱15k' },
                 { id: 'L1-03', status: 'occupied', label: 'Gadget Sphere' },
                 { id: 'L1-04', status: 'available', price: '₱12k' },
                 { id: 'L1-05', status: 'pending', label: 'Under Review' },
                 { id: 'L1-06', status: 'occupied', label: 'Prism Fitness' },
                 { id: 'L1-07', status: 'occupied', label: 'Velvet & Vine' },
                 { id: 'L1-08', status: 'available', price: '₱18k' },
                 { id: 'L1-09', status: 'pending', label: 'Under Review' },
                 { id: 'L1-10', status: 'occupied', label: 'Urban Threads' },
               ].map((slot) => (
                 <Link 
                  href="/admindashboard/space-manager" 
                  key={slot.id}
                >
                  <div className={clsx(
                    'relative group aspect-[4/3] sm:aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all hover:scale-[1.03] shadow-sm cursor-pointer',
                    slot.status === 'occupied' || slot.status === 'OCCUPIED' 
                      ? 'bg-primary/5 dark:bg-primary/20 border-primary text-primary' :
                    slot.status === 'available' || slot.status === 'AVAILABLE'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-600' :
                      'bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-600'
                  )}>
                    <MapPin size={16} className={clsx('mb-1',
                      slot.status === 'occupied' || slot.status === 'OCCUPIED' ? 'text-primary' :
                      slot.status === 'available' || slot.status === 'AVAILABLE' ? 'text-emerald-500' : 'text-amber-500'
                    )} />
                    <span className={clsx('font-black', 'text-xs')}>{slot.id}</span>
                    {slot.price && <span className={clsx('text-[9px]', 'font-bold', 'mt-0.5', 'opacity-80')}>{slot.price}</span>}
                    {slot.label && (
                      <div className={clsx('absolute', 'inset-0', 'bg-primary/95', 'text-white', 'rounded-xl', 'opacity-0', 'group-hover:opacity-100', 'flex', 'items-center', 'justify-center', 'p-2', 'text-[10px]', 'font-bold', 'transition-opacity', 'backdrop-blur-sm', 'z-10', 'leading-tight', 'shadow-xl')}>
                        {slot.label}
                      </div>
                    )}
                  </div>
                </Link>
               ))}
             </div>
          </div>
        </div>

        {/* Messenger & Security Feed */}
        <div className={clsx('glass-premium', 'bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'rounded-[2rem]', 'shadow-lg', 'flex', 'flex-col', 'overflow-hidden')}>
          <div className={clsx('p-6', 'border-b', 'border-white/10', 'dark:border-white/5', 'flex', 'items-center', 'justify-between')}>
            <div className={clsx('flex', 'items-center', 'gap-3')}>
              <div className={clsx('w-10', 'h-10', 'bg-primary/10', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'text-primary')}>
                <Bell size={20} />
              </div>
              <h2 className={clsx('font-bold', 'text-charcoal', 'dark:text-white')}>Live Feed</h2>
            </div>
            <Link href="/admindashboard/messenger-hub">
              <span className={clsx('text-[10px]', 'font-bold', 'text-primary', 'uppercase', 'tracking-widest', 'hover:underline', 'cursor-pointer')}>View All</span>
            </Link>
          </div>
          <div className={clsx('flex-1', 'overflow-y-auto', 'p-2')}>
            
            {/* Active Inquiry */}
            <div className={clsx('p-4', 'border-b', 'border-slate-100/50', 'dark:border-white/5', 'hover:bg-white/30', 'dark:hover:bg-white/5', 'transition-colors', 'group', 'cursor-pointer', 'rounded-xl')}>
              <div className={clsx('flex', 'items-start', 'justify-between', 'mb-1.5')}>
                <span className={clsx('text-[9px]', 'font-bold', 'text-blue-500', 'uppercase', 'tracking-widest', 'bg-blue-50', 'dark:bg-blue-900/30', 'px-2', 'py-0.5', 'rounded-full')}>Booking Inquiry</span>
                <span className={clsx('text-[9px]', 'font-bold', 'text-slate-400', 'uppercase')}>2m ago</span>
              </div>
              <p className={clsx('text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'leading-tight', 'mb-1')}>Interested in Event Center (GF-A12)</p>
              <p className={clsx('text-xs', 'text-slate-500', 'font-medium', 'truncate', 'mb-3')}>Sarah J: "Can I book this for Dec 5th?"</p>
              <Link href="/admindashboard/messenger-hub">
                <div className={clsx('inline-flex', 'items-center', 'gap-1.5', 'px-3', 'py-1.5', 'bg-slate-100', 'dark:bg-zinc-800', 'text-xs', 'font-bold', 'text-slate-600', 'dark:text-slate-300', 'rounded-lg', 'group-hover:bg-primary', 'group-hover:text-white', 'transition-colors', 'cursor-pointer')}>
                  <MessageSquare size={12} /> Reply
                </div>
              </Link>
            </div>

             {/* Blacklist Alert */}
             <div className={clsx('p-4', 'border-b', 'border-slate-100/50', 'dark:border-white/5', 'hover:bg-white/30', 'dark:hover:bg-white/5', 'transition-colors', 'group', 'cursor-pointer', 'rounded-xl')}>
              <div className={clsx('flex', 'items-start', 'justify-between', 'mb-1.5')}>
                <span className={clsx('text-[9px]', 'font-bold', 'text-primary', 'uppercase', 'tracking-widest', 'bg-red-50', 'dark:bg-red-900/30', 'px-2', 'py-0.5', 'rounded-full', 'flex', 'items-center', 'gap-1')}><Ban size={10}/> Blacklist Alert</span>
                <span className={clsx('text-[9px]', 'font-bold', 'text-slate-400', 'uppercase')}>1h ago</span>
              </div>
              <p className={clsx('text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'leading-tight', 'mb-1')}>User: Spammer99 blocked</p>
              <p className={clsx('text-xs', 'text-slate-500', 'font-medium', 'truncate')}>Reason: Repeated Feedback Spamming</p>
            </div>

            {/* Support Ticket */}
            <div className={clsx('p-4', 'hover:bg-white/30', 'dark:hover:bg-white/5', 'transition-colors', 'group', 'cursor-pointer', 'rounded-xl')}>
              <div className={clsx('flex', 'items-start', 'justify-between', 'mb-1.5')}>
                <span className={clsx('text-[9px]', 'font-bold', 'text-slate-500', 'uppercase', 'tracking-widest', 'bg-slate-100', 'dark:bg-zinc-800', 'px-2', 'py-0.5', 'rounded-full')}>Support Ticket</span>
                <span className={clsx('text-[9px]', 'font-bold', 'text-slate-400', 'uppercase')}>3h ago</span>
              </div>
              <p className={clsx('text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'leading-tight', 'mb-1')}>Utility Issue at L2-205</p>
              <p className={clsx('text-xs', 'text-slate-500', 'font-medium', 'truncate', 'mb-3')}>Coffee Culture: "Water pressure dropping."</p>
              <Link href="/admindashboard/messenger-hub">
                <div className={clsx('inline-flex', 'items-center', 'gap-1.5', 'px-3', 'py-1.5', 'bg-slate-100', 'dark:bg-zinc-800', 'text-xs', 'font-bold', 'text-slate-600', 'dark:text-slate-300', 'rounded-lg', 'group-hover:bg-primary', 'group-hover:text-white', 'transition-colors', 'cursor-pointer')}>
                  <MessageSquare size={12} /> Reply
                </div>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Revenue & Contract Intelligence */}
      <div className={clsx('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-6')}>
        
        {/* Collection Ledger */}
        <div className={clsx('glass-premium', 'bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'p-6', 'rounded-[2rem]', 'shadow-lg', 'flex', 'flex-col')}>
          <div className="mb-6">
            <div className={clsx('flex', 'items-center', 'gap-3', 'mb-2')}>
              <div className={clsx('w-10', 'h-10', 'bg-primary/10', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'text-primary')}>
                <TrendingUp size={20} />
              </div>
              <div>
                <h2 className={clsx('font-bold', 'text-charcoal', 'dark:text-white', 'tracking-tight')}>Collection Ledger</h2>
                <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>Monthly Rent Status</p>
              </div>
            </div>
          </div>
          <div className={clsx('flex-1', 'flex', 'items-center', 'justify-center', 'relative', 'min-h-[200px]', 'my-4')}>
            {/* Simple CSS donut chart mock */}
            <div className={clsx('w-48', 'h-48', 'rounded-full', 'border-[20px]', 'border-primary', 'relative', 'flex', 'items-center', 'justify-center', 'shadow-inner')} style={{ borderRightColor: '#22c55e', borderBottomColor: '#22c55e', borderLeftColor: '#22c55e', transform: 'rotate(-45deg)' }}>
              <div className={clsx('transform', 'rotate-45', 'text-center')}>
                <p className={clsx('text-3xl', 'font-black', 'text-charcoal', 'dark:text-white')}>82%</p>
                <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'mt-1')}>Paid On Time</p>
              </div>
            </div>
          </div>
          <div className={clsx('flex', 'items-center', 'justify-center', 'gap-6', 'mt-4')}>
            <div className={clsx('flex', 'items-center', 'gap-2')}>
              <div className={clsx('w-4', 'h-4', 'rounded-full', 'bg-green-500', 'border-2', 'border-white', 'dark:border-black', 'shadow-sm')}></div>
              <span className={clsx('text-xs', 'font-bold', 'text-slate-600', 'dark:text-slate-300', 'uppercase', 'tracking-wider')}>Paid</span>
            </div>
            <div className={clsx('flex', 'items-center', 'gap-2')}>
              <div className={clsx('w-4', 'h-4', 'rounded-full', 'bg-primary', 'border-2', 'border-white', 'dark:border-black', 'shadow-sm')}></div>
              <span className={clsx('text-xs', 'font-bold', 'text-slate-600', 'dark:text-slate-300', 'uppercase', 'tracking-wider')}>Overdue</span>
            </div>
          </div>
        </div>

        {/* Contract Countdown */}
        <div className={clsx('lg:col-span-2', 'glass-premium', 'bg-white/40', 'dark:bg-white/5', 'border', 'border-white/20', 'rounded-[2rem]', 'shadow-lg', 'flex', 'flex-col', 'overflow-hidden')}>
          <div className={clsx('p-6', 'border-b', 'border-white/10', 'dark:border-white/5', 'flex', 'items-center', 'justify-between')}>
            <div className={clsx('flex', 'items-center', 'gap-3')}>
              <div className={clsx('w-10', 'h-10', 'bg-primary/10', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'text-primary')}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className={clsx('font-bold', 'text-charcoal', 'dark:text-white', 'tracking-tight')}>Contract Countdown</h2>
                <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>Top 5 Expiring Licenses</p>
              </div>
            </div>
            <Link href="/admindashboard/tenant-monitoring">
              <div className={clsx('hidden', 'sm:flex', 'items-center', 'gap-1.5', 'px-4', 'py-2', 'bg-slate-50', 'dark:bg-zinc-800', 'text-xs', 'font-bold', 'text-charcoal', 'dark:text-white', 'rounded-xl', 'hover:bg-primary', 'hover:text-white', 'transition-colors', 'border', 'border-slate-200', 'dark:border-white/10', 'cursor-pointer')}>
                Go to Ledger <ArrowRight size={14} />
              </div>
            </Link>
          </div>
          <div className={clsx('flex-1', 'p-2', 'overflow-x-auto')}>
             <table className={clsx('w-full', 'text-left', 'border-collapse', 'min-w-[500px]')}>
              <tbody className={clsx('divide-y', 'divide-slate-100/50', 'dark:divide-white/5')}>
                {[
                  { name: 'Coffee Culture', unit: 'L2-205', end: 'Dec 01, 2023', days: 12, urgent: true },
                  { name: 'Pure Beauty', unit: 'L4-112', end: 'Dec 15, 2023', days: 26, urgent: true },
                  { name: 'Gadget Sphere', unit: 'L3-301', end: 'Feb 1, 2024', days: 73, urgent: false },
                  { name: 'Sports Hub', unit: 'L1-22A', end: 'Mar 10, 2024', days: 111, urgent: false },
                  { name: 'Artisan Bakery', unit: 'L2-215', end: 'Apr 05, 2024', days: 137, urgent: false },
                ].map((c) => (
                  <tr key={c.name} className={clsx('hover:bg-white/30', 'dark:hover:bg-white/5', 'transition-colors', 'group')}>
                    <td className={clsx('px-6', 'py-4')}>
                      <p className={clsx('font-bold', 'text-charcoal', 'dark:text-white', 'text-sm', 'flex', 'items-center', 'gap-2')}>
                         {c.name} 
                         {c.urgent && <span className={clsx('w-2', 'h-2', 'rounded-full', 'bg-primary', 'animate-pulse', 'hidden', 'sm:block')}></span>}
                      </p>
                      <p className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'mt-0.5')}>{c.unit}</p>
                    </td>
                    <td className={clsx('px-6', 'py-4', 'text-sm', 'font-medium', 'text-slate-500')}>Ends: {c.end}</td>
                    <td className={clsx('px-6', 'py-4', 'text-right')}>
                      <div className={clsx(
                        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border transition-transform group-hover:scale-[1.02]',
                        c.urgent ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-900/50' : 'bg-slate-50 dark:bg-zinc-800 text-slate-500 border-slate-200 dark:border-white/10'
                      )}>
                         {c.days} Days Left
                      </div>
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
