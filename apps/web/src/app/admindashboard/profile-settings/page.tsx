'use client';

import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Shield, Save, Camera, Eye, EyeOff, CheckCircle, AlertTriangle, Mail, Phone, Globe, Key } from 'lucide-react';
import { useAuth } from '@/app/providers';
import { getNotificationPreferences, updateNotificationPreferences } from '@/app/actions/notifications';
import clsx from 'clsx';

type Tab = 'profile' | 'security' | 'notifications' | 'system';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<any>(null);
  const [loadingPrefs, setLoadingPrefs] = useState(false);

  // Load notification preferences
  useEffect(() => {
    if (user && activeTab === 'notifications') {
      setLoadingPrefs(true);
      getNotificationPreferences(user.id).then((res) => {
        if (res.success && res.data) {
          setNotificationPrefs(res.data);
        } else {
          // Set default preferences if none exist
          setNotificationPrefs({
            newBookingInquiry: true,
            feedbackSpamDetected: true,
            expiringContracts: true,
            overdueRentPayments: true,
            adSubmissionReceived: false,
            systemHealthReports: false,
          });
        }
        setLoadingPrefs(false);
      });
    }
  }, [user, activeTab]);

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    
    // Save notification preferences if on notifications tab
    if (activeTab === 'notifications' && user && notificationPrefs) {
      await updateNotificationPreferences(user.id, notificationPrefs);
    }
  };

  const updateNotificationPref = (key: string, value: boolean) => {
    setNotificationPrefs((prev: any) => prev ? { ...prev, [key]: value } : null);
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profile', label: 'Profile Info', icon: User },
    { key: 'security', label: 'Security', icon: Lock },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'system', label: 'System Access', icon: Shield },
  ];

  return (
    <div className={clsx('p-8', 'lg:p-10', 'animate-fade-in-up', 'max-w-[1200px]', 'mx-auto', 'space-y-8')}>
      {/* Header */}
      <div className={clsx('flex', 'items-end', 'justify-between')}>
        <div>
          <h1 className={clsx('text-3xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tight')}>Profile Settings</h1>
          <p className={clsx('text-sm', 'text-slate-500', 'font-medium', 'mt-1')}>Manage your administrator account and preferences.</p>
        </div>
        {saved && (
          <div className={clsx('flex', 'items-center', 'gap-2', 'px-4', 'py-2.5', 'bg-green-50', 'dark:bg-green-900/30', 'text-green-600', 'border', 'border-green-200', 'dark:border-green-900/50', 'rounded-xl', 'text-sm', 'font-bold', 'animate-fade-in')}>
            <CheckCircle size={16} /> Changes saved successfully!
          </div>
        )}
      </div>

      <div className={clsx('flex', 'flex-col', 'lg:flex-row', 'gap-8')}>
        {/* Sidebar Tabs */}
        <div className={clsx('w-full', 'lg:w-64', 'shrink-0', 'space-y-2')}>
          {/* Avatar Card */}
          <div className={clsx('bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-100', 'dark:border-white/5', 'rounded-[2rem]', 'p-6', 'text-center', 'mb-4', 'shadow-sm')}>
            <div className={clsx('relative', 'inline-block', 'mb-4')}>
              <div className={clsx('w-20', 'h-20', 'rounded-full', 'bg-primary', 'text-white', 'font-black', 'text-2xl', 'flex', 'items-center', 'justify-center', 'ring-4', 'ring-primary/20', 'shadow-xl', 'shadow-primary/20')}>
                AD
              </div>
              <button className={clsx('absolute', '-bottom-1', '-right-1', 'w-7', 'h-7', 'rounded-full', 'bg-charcoal', 'dark:bg-white', 'text-white', 'dark:text-black', 'flex', 'items-center', 'justify-center', 'shadow-md', 'hover:scale-110', 'transition-transform')}>
                <Camera size={13} />
              </button>
            </div>
            <h3 className={clsx('font-bold', 'text-charcoal', 'dark:text-white')}>Admin Module</h3>
            <p className={clsx('text-[10px]', 'font-bold', 'text-primary', 'uppercase', 'tracking-widest', 'mt-1')}>Super Administrator</p>
            <div className={clsx('mt-3', 'px-3', 'py-1.5', 'bg-green-50', 'dark:bg-green-900/20', 'border', 'border-green-200', 'dark:border-green-900/50', 'rounded-full', 'flex', 'items-center', 'justify-center', 'gap-2')}>
              <span className={clsx('w-1.5', 'h-1.5', 'bg-green-500', 'rounded-full', 'animate-pulse')}></span>
              <span className={clsx('text-[10px]', 'font-bold', 'text-green-600', 'uppercase', 'tracking-widest')}>Active Session</span>
            </div>
          </div>

          {/* Tab Links */}
          <div className={clsx('bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-100', 'dark:border-white/5', 'rounded-[2rem]', 'p-3', 'shadow-sm')}>
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === key
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-charcoal dark:hover:text-white'
                }`}
              >
                <Icon size={17} className={activeTab === key ? 'text-primary' : 'text-slate-400'} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">

          {/* ── Profile Info ── */}
          {activeTab === 'profile' && (
            <div className={clsx('bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-100', 'dark:border-white/5', 'rounded-[2rem]', 'shadow-sm', 'p-8', 'space-y-8')}>
              <h2 className={clsx('font-black', 'text-charcoal', 'dark:text-white', 'flex', 'items-center', 'gap-2', 'text-lg')}><User size={20} className="text-slate-400" /> Personal Information</h2>

              <div className={clsx('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-6')}>
                <div>
                  <label className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'block', 'mb-2')}>First Name</label>
                  <input type="text" defaultValue="Mall" className={clsx('w-full', 'px-4', 'py-3', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'transition-colors', 'text-sm', 'font-medium', 'text-charcoal', 'dark:text-white')} />
                </div>
                <div>
                  <label className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'block', 'mb-2')}>Last Name</label>
                  <input type="text" defaultValue="Administrator" className={clsx('w-full', 'px-4', 'py-3', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'transition-colors', 'text-sm', 'font-medium', 'text-charcoal', 'dark:text-white')} />
                </div>
                <div>
                  <label className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'flex', 'items-center', 'gap-1.5', 'mb-2')}><Mail size={12}/> Email Address</label>
                  <input type="email" defaultValue="srmall@admin.com" className={clsx('w-full', 'px-4', 'py-3', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'transition-colors', 'text-sm', 'font-medium', 'text-charcoal', 'dark:text-white')} />
                </div>
                <div>
                  <label className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'flex', 'items-center', 'gap-1.5', 'mb-2')}><Phone size={12}/> Phone Number</label>
                  <input type="tel" defaultValue="+63 917 555 0000" className={clsx('w-full', 'px-4', 'py-3', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'transition-colors', 'text-sm', 'font-medium', 'text-charcoal', 'dark:text-white')} />
                </div>
                <div className="md:col-span-2">
                  <label className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'flex', 'items-center', 'gap-1.5', 'mb-2')}><Globe size={12}/> Department / Role Title</label>
                  <input type="text" defaultValue="SR Mall Management — Super Administrator" className={clsx('w-full', 'px-4', 'py-3', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'transition-colors', 'text-sm', 'font-medium', 'text-charcoal', 'dark:text-white')} />
                </div>
                <div className="md:col-span-2">
                  <label className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'block', 'mb-2')}>Bio / Notes</label>
                  <textarea rows={3} defaultValue="Oversees all mall operations, tenant management, and administrative decisions for SR Mall." className={clsx('w-full', 'px-4', 'py-3', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'transition-colors', 'text-sm', 'font-medium', 'text-charcoal', 'dark:text-white', 'resize-none')} />
                </div>
              </div>

              <div className={clsx('pt-6', 'border-t', 'border-slate-100', 'dark:border-white/5', 'flex', 'justify-end')}>
                <button onClick={handleSave} className={clsx('flex', 'items-center', 'gap-2', 'px-8', 'py-3', 'bg-primary', 'text-white', 'hover:bg-primary-hover', 'rounded-xl', 'font-bold', 'text-xs', 'uppercase', 'tracking-widest', 'transition-all', 'shadow-lg', 'shadow-primary/20', 'hover:scale-[1.02]')}>
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className={clsx('bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-100', 'dark:border-white/5', 'rounded-[2rem]', 'shadow-sm', 'p-8', 'space-y-6')}>
                <h2 className={clsx('font-black', 'text-charcoal', 'dark:text-white', 'flex', 'items-center', 'gap-2', 'text-lg')}><Key size={20} className="text-slate-400" /> Change Password</h2>

                <div className="space-y-4">
                  <div>
                    <label className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'block', 'mb-2')}>Current Password</label>
                    <div className="relative">
                      <input type={showOldPass ? 'text' : 'password'} placeholder="••••••••" className={clsx('w-full', 'px-4', 'py-3', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'transition-colors', 'text-sm', 'font-medium', 'pr-12')} />
                      <button onClick={() => setShowOldPass(!showOldPass)} className={clsx('absolute', 'right-4', 'top-1/2', '-translate-y-1/2', 'text-slate-400', 'hover:text-primary', 'transition-colors')}>
                        {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'block', 'mb-2')}>New Password</label>
                    <div className="relative">
                      <input type={showNewPass ? 'text' : 'password'} placeholder="••••••••" className={clsx('w-full', 'px-4', 'py-3', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'transition-colors', 'text-sm', 'font-medium', 'pr-12')} />
                      <button onClick={() => setShowNewPass(!showNewPass)} className={clsx('absolute', 'right-4', 'top-1/2', '-translate-y-1/2', 'text-slate-400', 'hover:text-primary', 'transition-colors')}>
                        {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={clsx('text-[10px]', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest', 'block', 'mb-2')}>Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className={clsx('w-full', 'px-4', 'py-3', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-200', 'dark:border-white/10', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'transition-colors', 'text-sm', 'font-medium')} />
                  </div>
                </div>

                <div className={clsx('flex', 'justify-end', 'pt-2')}>
                  <button onClick={handleSave} className={clsx('flex', 'items-center', 'gap-2', 'px-8', 'py-3', 'bg-charcoal', 'dark:bg-white', 'text-white', 'dark:text-black', 'hover:scale-[1.02]', 'rounded-xl', 'font-bold', 'text-xs', 'uppercase', 'tracking-widest', 'transition-transform', 'shadow-lg')}>
                    <Lock size={16} /> Update Password
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className={clsx('bg-red-50', 'dark:bg-red-950/20', 'border', 'border-red-200', 'dark:border-red-900/40', 'rounded-[2rem]', 'shadow-sm', 'p-8', 'space-y-4')}>
                <h2 className={clsx('font-black', 'text-primary', 'flex', 'items-center', 'gap-2', 'text-lg')}><AlertTriangle size={20} /> Danger Zone</h2>
                <p className={clsx('text-sm', 'font-medium', 'text-slate-600', 'dark:text-slate-300')}>These actions are irreversible. Proceed with extreme caution.</p>
                <div className={clsx('flex', 'flex-col', 'sm:flex-row', 'gap-3', 'pt-2')}>
                  <button className={clsx('px-6', 'py-3', 'border-2', 'border-primary', 'text-primary', 'font-bold', 'text-xs', 'uppercase', 'tracking-widest', 'rounded-xl', 'hover:bg-primary', 'hover:text-white', 'transition-all')}>
                    Revoke All Active Sessions
                  </button>
                  <button className={clsx('px-6', 'py-3', 'bg-primary', 'text-white', 'font-bold', 'text-xs', 'uppercase', 'tracking-widest', 'rounded-xl', 'hover:bg-red-700', 'transition-colors', 'shadow-lg', 'shadow-primary/20')}>
                    Disable Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && (
            <div className={clsx('bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-100', 'dark:border-white/5', 'rounded-[2rem]', 'shadow-sm', 'p-8', 'space-y-8')}>
              <h2 className={clsx('font-black', 'text-charcoal', 'dark:text-white', 'flex', 'items-center', 'gap-2', 'text-lg')}><Bell size={20} className="text-slate-400" /> Notification Preferences</h2>

              <div className={clsx('space-y-1', 'divide-y', 'divide-slate-100', 'dark:divide-white/5')}>
                {[
                  { label: 'New Booking Inquiry', desc: 'Alert when a user sends a space booking request via Messenger.', key: 'newBookingInquiry' },
                  { label: 'Feedback Spam Detected', desc: 'Alert when the anti-spam system flags a user automatically.', key: 'feedbackSpamDetected' },
                  { label: 'Expiring Contracts', desc: 'Reminder 30 days before a tenant lease is set to expire.', key: 'expiringContracts' },
                  { label: 'Overdue Rent Payments', desc: 'Daily alert for tenants with outstanding payments.', key: 'overdueRentPayments' },
                  { label: 'Ad Submission Received', desc: 'Notify when a tenant uploads a new banner for approval.', key: 'adSubmissionReceived' },
                  { label: 'System Health Reports', desc: 'Weekly automated system status summary reports.', key: 'systemHealthReports' },
                ].map((notif) => (
                  <NotifRow 
                    key={notif.label} 
                    label={notif.label} 
                    desc={notif.desc} 
                    enabled={notificationPrefs?.[notif.key] || false}
                    onToggle={(enabled) => updateNotificationPref(notif.key, enabled)}
                  />
                ))}
              </div>

              <div className={clsx('flex', 'justify-end', 'pt-2')}>
                <button onClick={handleSave} className={clsx('flex', 'items-center', 'gap-2', 'px-8', 'py-3', 'bg-primary', 'text-white', 'hover:bg-primary-hover', 'rounded-xl', 'font-bold', 'text-xs', 'uppercase', 'tracking-widest', 'transition-all', 'shadow-lg', 'shadow-primary/20', 'hover:scale-[1.02]')}>
                  <Save size={16} /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* ── System Access ── */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className={clsx('bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-100', 'dark:border-white/5', 'rounded-[2rem]', 'shadow-sm', 'p-8', 'space-y-6')}>
                <h2 className={clsx('font-black', 'text-charcoal', 'dark:text-white', 'flex', 'items-center', 'gap-2', 'text-lg')}><Shield size={20} className="text-slate-400" /> System Access & Permissions</h2>

                <div className={clsx('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-4')}>
                  {[
                    { label: 'Tenant Management', granted: true },
                    { label: 'Financial Ledger', granted: true },
                    { label: 'Feedback Moderation', granted: true },
                    { label: 'User Blacklist Control', granted: true },
                    { label: 'Ad Scheduler', granted: true },
                    { label: 'System Configuration', granted: true },
                  ].map((perm) => (
                    <div key={perm.label} className={clsx('flex', 'items-center', 'justify-between', 'bg-slate-50', 'dark:bg-zinc-800', 'border', 'border-slate-100', 'dark:border-white/5', 'px-5', 'py-4', 'rounded-xl')}>
                      <span className={clsx('text-sm', 'font-bold', 'text-charcoal', 'dark:text-white')}>{perm.label}</span>
                      <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${perm.granted ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        {perm.granted ? <CheckCircle size={12} /> : null}
                        {perm.granted ? 'Granted' : 'Restricted'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={clsx('bg-blue-50/50', 'dark:bg-blue-900/10', 'border', 'border-blue-100', 'dark:border-blue-900/30', 'p-4', 'rounded-xl', 'flex', 'items-start', 'gap-3')}>
                  <Shield size={18} className={clsx('text-blue-500', 'shrink-0', 'mt-0.5')} />
                  <p className={clsx('text-xs', 'font-medium', 'text-slate-600', 'dark:text-slate-300')}>You hold <strong>Super Administrator</strong> access. All permissions are fully granted. Changes to system access require IT approval.</p>
                </div>
              </div>

              {/* Login History */}
              <div className={clsx('bg-white', 'dark:bg-zinc-900', 'border', 'border-slate-100', 'dark:border-white/5', 'rounded-[2rem]', 'shadow-sm', 'overflow-hidden')}>
                <div className={clsx('p-6', 'border-b', 'border-slate-100', 'dark:border-white/5')}>
                  <h2 className={clsx('font-black', 'text-charcoal', 'dark:text-white', 'text-lg')}>Recent Login Activity</h2>
                </div>
                <div className={clsx('divide-y', 'divide-slate-100', 'dark:divide-white/5')}>
                  {[
                    { device: 'Chrome on Windows', location: 'Manila, PH', time: 'Today, 9:18 AM', current: true },
                    { device: 'Safari on iPhone', location: 'Pasig, PH', time: 'Yesterday, 8:55 PM', current: false },
                    { device: 'Chrome on Windows', location: 'Manila, PH', time: 'Mar 18, 2:30 PM', current: false },
                  ].map((session, i) => (
                    <div key={i} className={clsx('px-6', 'py-5', 'flex', 'items-center', 'justify-between', 'hover:bg-slate-50', 'dark:hover:bg-white/5', 'transition-colors')}>
                      <div>
                        <p className={clsx('text-sm', 'font-bold', 'text-charcoal', 'dark:text-white', 'flex', 'items-center', 'gap-2')}>
                          {session.device}
                          {session.current && <span className={clsx('text-[9px]', 'font-bold', 'text-green-600', 'bg-green-50', 'dark:bg-green-900/30', 'px-2', 'py-0.5', 'rounded-full', 'uppercase', 'tracking-widest')}>Current</span>}
                        </p>
                        <p className={clsx('text-xs', 'font-medium', 'text-slate-400', 'mt-0.5')}>{session.location} · {session.time}</p>
                      </div>
                      {!session.current && (
                        <button className={clsx('text-[10px]', 'font-bold', 'text-primary', 'uppercase', 'tracking-widest', 'hover:underline')}>
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotifRow({ label, desc, enabled, onToggle }: { 
  label: string; 
  desc: string; 
  enabled: boolean; 
  onToggle: (enabled: boolean) => void; 
}) {
  return (
    <div className={clsx('flex', 'items-start', 'justify-between', 'py-5', 'gap-6')}>
      <div className="flex-1">
        <h4 className={clsx('text-sm', 'font-bold', 'text-charcoal', 'dark:text-white')}>{label}</h4>
        <p className={clsx('text-xs', 'font-medium', 'text-slate-400', 'mt-0.5')}>{desc}</p>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 mt-0.5 ${enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}
      >
        <span className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`}></span>
      </button>
    </div>
  );
}
