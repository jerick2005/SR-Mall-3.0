'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  X, ChevronRight, ChevronLeft, Lock, Store, MapPin,
  CheckCircle, AlertTriangle, Mail, Phone, RefreshCw, Eye, EyeOff, Building2, Copy,
  FileDown
} from 'lucide-react';
import { registerTenantAction, checkEmailExists } from '@/app/actions/tenant';
import { getAvailableSlots } from '@/app/actions/space-slot';
import clsx from 'clsx';

// ── PDF Voucher Generator (browser-native, zero-dependency) ──────────────────
function generateCredentialsPDF(data: {
  shopName: string;
  category: string;
  email: string;
  tempPass: string;
  slotId: string;
  slotLabel: string;
  rentCost: number;
  startDate: string;
  endDate: string;
  phone?: string;
}) {
  const now = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
  const filename = `${data.shopName.replace(/\s+/g, '_')}_Credentials_${data.slotId}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${filename}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background:#fff; color:#1e1e28; }
    .page { width:794px; min-height:1123px; margin:0 auto; display:flex; flex-direction:column; }
    .header { background:#BE1E2D; padding:28px 40px; display:flex; align-items:center; justify-content:space-between; }
    .logo-row { display:flex; align-items:center; gap:14px; }
    .logo-box { width:44px; height:44px; background:#fff; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:22px; color:#BE1E2D; }
    .brand h1 { color:#fff; font-size:20px; font-weight:900; letter-spacing:0.05em; }
    .brand p  { color:rgba(255,255,255,0.7); font-size:10px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; margin-top:2px; }
    .voucher-badge { color:rgba(255,255,255,0.85); font-size:9px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; text-align:right; }
    .body { flex:1; padding:40px; }
    .section-header { background:#f5f6f8; border-radius:6px; padding:6px 12px; margin-bottom:12px; margin-top:24px; }
    .section-header span { font-size:9px; font-weight:800; letter-spacing:0.18em; text-transform:uppercase; color:#BE1E2D; }
    .row { display:flex; align-items:baseline; padding:7px 4px; border-bottom:1px solid #e8eaed; }
    .row:last-child { border-bottom:none; }
    .row .lbl { min-width:160px; font-size:10px; color:#6468748; font-weight:500; }
    .row .val { font-size:11px; font-weight:700; color:#1e1e28; }
    .row .val.mono { font-family:'Courier New', Courier, monospace; letter-spacing:0.06em; }
    .cred-box { margin-top:28px; border:2px solid #BE1E2D; border-radius:10px; overflow:hidden; }
    .cred-title { background:#BE1E2D; color:#fff; text-align:center; font-size:10px; font-weight:800; letter-spacing:0.2em; text-transform:uppercase; padding:8px; }
    .cred-body { padding:20px 24px; background:#fff5f5; }
    .cred-row { display:flex; align-items:center; padding:8px 0; border-bottom:1px solid #fde8e8; }
    .cred-row:last-child { border-bottom:none; }
    .cred-row .lbl { min-width:160px; font-size:10px; color:#9e4040; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; }
    .cred-row .val { font-size:13px; font-weight:800; color:#1e1e28; font-family:'Courier New', Courier, monospace; letter-spacing:0.05em; }
    .warning { margin-top:24px; background:#fffbeb; border:1.5px solid #f59e0b; border-radius:8px; padding:14px 18px; }
    .warning .wt { font-size:10px; font-weight:800; color:#78500; margin-bottom:4px; }
    .warning .wb { font-size:10px; font-weight:500; color:#78500; line-height:1.6; }
    .chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:24px; }
    .chip { font-size:8px; font-weight:800; letter-spacing:0.14em; text-transform:uppercase; padding:4px 10px; border-radius:999px; border:1.5px solid; }
    .chip.blue   { background:#eff6ff; color:#2563eb; border-color:#bfdbfe; }
    .chip.red    { background:#fff1f2; color:#BE1E2D; border-color:#fecdd3; }
    .chip.green  { background:#f0fdf4; color:#16a34a; border-color:#bbf7d0; }
    .chip.purple { background:#faf5ff; color:#7c3aed; border-color:#e9d5ff; }
    .signature { margin-top:40px; display:flex; justify-content:space-between; padding:0 20px; }
    .sig-line { text-align:center; }
    .sig-line .line { border-top:1.5px solid #ccc; width:180px; margin:0 auto; }
    .sig-line p { font-size:9px; color:#888; margin-top:6px; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; }
    .footer { background:#BE1E2D; padding:12px 40px; display:flex; justify-content:center; align-items:center; }
    .footer p { color:rgba(255,255,255,0.8); font-size:8px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; }
    @media print {
      body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .page { width:100%; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo-row">
      <div class="logo-box">S</div>
      <div class="brand">
        <h1>SR-MANAGE</h1>
        <p>SR Mall Management System &nbsp;—&nbsp; Official Tenant Document</p>
      </div>
    </div>
    <div class="voucher-badge">Confidential<br/>Credential Voucher</div>
  </div>
  <div class="body">
    <div class="section-header"><span>Tenant Business Information</span></div>
    <div class="row"><span class="lbl">Shop Name</span><span class="val">${data.shopName}</span></div>
    <div class="row"><span class="lbl">Business Category</span><span class="val">${data.category}</span></div>
    <div class="row"><span class="lbl">Owner Contact</span><span class="val">${data.phone || 'N/A'}</span></div>
    <div class="section-header"><span>Space &amp; Lease Details</span></div>
    <div class="row"><span class="lbl">Assigned Unit</span><span class="val">${data.slotId} &nbsp;<span style="font-weight:500;color:#666;">(${data.slotLabel})</span></span></div>
    <div class="row"><span class="lbl">Monthly Rent Cost</span><span class="val" style="color:#16a34a;">&#8369;${Number(data.rentCost).toLocaleString()}.00</span></div>
    <div class="row"><span class="lbl">Lease Start Date</span><span class="val">${data.startDate}</span></div>
    <div class="row"><span class="lbl">Lease End Date</span><span class="val">${data.endDate}</span></div>
    <div class="cred-box">
      <div class="cred-title">&#8212; Secure Login Details &#8212;</div>
      <div class="cred-body">
        <div class="cred-row"><span class="lbl">Gmail / Login ID</span><span class="val">${data.email}</span></div>
        <div class="cred-row"><span class="lbl">Temporary Password</span><span class="val">${data.tempPass}</span></div>
      </div>
    </div>
    <div class="chips">
      <span class="chip blue">&#10003; Auth Account Created</span>
      <span class="chip red">&#10003; Slot ${data.slotId} &rarr; Occupied</span>
      <span class="chip green">&#10003; Revenue KPI Updated</span>
      <span class="chip purple">&#10003; Welcome Thread Sent</span>
    </div>
    <div class="warning">
      <div class="wt">&#9888;&nbsp; Important Notice</div>
      <div class="wb">Provide this voucher directly to the tenant. They are required to change their password upon first login.
      Keep a signed copy for your mall office records. This document is confidential.</div>
    </div>
    <div class="signature">
      <div class="sig-line">
        <div class="line"></div>
        <p>Tenant Signature &amp; Date</p>
      </div>
      <div class="sig-line">
        <div class="line"></div>
        <p>Mall Administrator Signature</p>
      </div>
    </div>
  </div>
  <div class="footer">
    <p>Generated: ${now} &nbsp;|&nbsp; SR Mall Management System &nbsp;|&nbsp; Confidential</p>
  </div>
</div>
<script>window.onload = function(){ window.print(); window.onafterprint = function(){ window.close(); }; };</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=1100');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
  return win;
}

// ── Mock available slots ────────────────────────────────────────
const AVAILABLE_SLOTS = [
  { id: 'GF-A01', label: 'Ground Floor A-01', basePrice: 12000 },
  { id: 'GF-A02', label: 'Ground Floor A-02', basePrice: 14500 },
  { id: 'L1-105', label: 'Level 1 – Unit 105', basePrice: 15000 },
  { id: 'L1-108', label: 'Level 1 – Unit 108', basePrice: 18500 },
  { id: 'L2-210', label: 'Level 2 – Unit 210', basePrice: 11000 },
  { id: 'L3-308', label: 'Level 3 – Unit 308', basePrice: 9500 },
  { id: 'EVT-C1', label: 'Event Center C-1', basePrice: 45000 },
];

interface AvailableSlot {
  id: string;
  unit_id: string;
  status: string;
  sqm_size: number;
  base_rent: number;
}

const CATEGORIES = [
  'Food & Beverage', 'Fashion & Apparel', 'Electronics & Tech',
  'Health & Wellness', 'Beauty & Cosmetics', 'Services',
  'Books & Hobbies', 'Other',
];

function generatePassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const all = upper + lower + digits;
  const rand = (s: string) => s[Math.floor(Math.random() * s.length)];
  const base = [rand(upper), rand(lower), rand(digits)];
  for (let i = 0; i < 5; i++) base.push(rand(all));
  return base.sort(() => Math.random() - 0.5).join('');
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tenantName: string, slotId: string) => void;
}

const STEPS = [
  { key: 1, label: 'Credentials', sub: 'Login Access', icon: Lock },
  { key: 2, label: 'Store Info', sub: 'Business Profile', icon: Store },
  { key: 3, label: 'Slot & Rent', sub: 'Revenue Link', icon: MapPin },
] as const;

export function RegisterTenantModal({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirm] = useState('');
  const [tempPass, setTempPass] = useState('WelcomeSR2026');

  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');

  const [slotId, setSlotId] = useState('');
  const [rentCost, setRentCost] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch available slots when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableSlots();
    }
  }, [isOpen]);

  const loadAvailableSlots = async () => {
    setSlotsLoading(true);
    const result = await getAvailableSlots();
    if (result.success && result.data) {
      setAvailableSlots(result.data);
    } else {
      // Fallback to mock slots if API fails
      setAvailableSlots(AVAILABLE_SLOTS.map(s => ({
        id: s.id,
        unit_id: s.id,
        status: 'AVAILABLE',
        sqm_size: 50,
        base_rent: s.basePrice,
      })));
    }
    setSlotsLoading(false);
  };

  const selectedSlot = availableSlots.find(s => s.unit_id === slotId);

  const handleSlotChange = (id: string) => {
    setSlotId(id);
    const s = availableSlots.find(x => x.unit_id === id);
    if (s) setRentCost(s.base_rent);
  };

  const generatePass = () => {
    const p = generatePassword();
    setTempPass(p);
    setShowPass(true);
  };

  const copyPass = () => {
    navigator.clipboard.writeText(tempPass).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = useCallback(() => {
    setStep(1); setEmail(''); setConfirm(''); setTempPass('WelcomeSR2026');
    setShopName(''); setCategory(''); setPhone('');
    setSlotId(''); setRentCost(''); setStartDate(''); setEndDate('');
    setSuccessMsg(null); setErrorMsg(null); setShowPass(false);
    setIsLoading(false);
  }, []);

  const handleRegister = async () => {
    console.log('handleRegister started', { email, shopName, category, unitId: slotId, rentCost });
    setIsLoading(true);
    setErrorMsg(null);

    try {
      console.log('Calling registerTenantAction...');
      const res = await registerTenantAction({
        email,
        password: tempPass,
        shopName,
        category,
        unitId: slotId,
        rentCost: Number(rentCost),
      });
      console.log('registerTenantAction result:', res);

      if (!res.success) {
        console.error('Registration failed:', res.error);
        setErrorMsg(res.error || 'Failed to establish tenant account.');
        setIsLoading(false);
        return;
      }

      console.log('Registration successful!');

      // PDF Generation with better error handling
      try {
        console.log('Generating PDF...');
        const pdfWindow = generateCredentialsPDF({
          shopName, category, email, tempPass, slotId,
          slotLabel: selectedSlot?.unit_id ?? slotId,
          rentCost: Number(rentCost), startDate, endDate, phone,
        });
        
        if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === 'undefined') {
          setErrorMsg('Popup blocked! Please allow popups for this site to download the voucher.');
          setIsLoading(false);
          return;
        }
        console.log('PDF opened successfully');
      } catch (e) { 
        console.warn('PDF generation failed', e);
        setErrorMsg('Could not generate PDF voucher. Tenant was registered successfully.');
      }

      setIsLoading(false);
      setSuccessMsg(`Success! ${shopName} registered. Voucher downloaded.`);

      setTimeout(() => {
        onSuccess(shopName, slotId);
        reset();
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Unexpected error in handleRegister:', err);
      setErrorMsg('An unexpected error occurred. Check console for details.');
      setIsLoading(false);
    }
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailsMatch = email === confirmEmail;
  const canStep1 = emailValid && emailsMatch && tempPass.length >= 6;
  const canStep2 = shopName.trim() !== '' && category !== '';
  const canStep3 = slotId !== '' && rentCost !== '' && rentCost !== null && rentCost !== undefined && startDate !== '' && endDate !== '';

  if (!isOpen) return null;

  return (
    <div className={clsx('fixed', 'inset-0', 'z-[200]', 'flex', 'items-center', 'justify-center', 'p-4', 'overflow-auto')}>
      <div className={clsx('absolute', 'inset-0', 'bg-black/60', 'backdrop-blur-sm', 'animate-fade-in', 'pointer-events-none')} />

      <div className={clsx('relative', 'z-10', 'w-full', 'max-w-lg', 'bg-zinc-900', 'rounded-[2.5rem]', 'shadow-2xl', 'border', 'border-white/5', 'overflow-hidden', 'animate-fade-in-up', 'my-auto', 'pointer-events-auto')}>
        <div className={clsx('relative', 'bg-primary', 'h-32', 'flex', 'flex-col', 'items-center', 'justify-center', 'px-8')}>
          <div className={clsx('w-11', 'h-11', 'bg-white', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'shadow-xl', 'mb-2')}>
            <Building2 size={20} className="text-primary" />
          </div>
          <h2 className={clsx('text-white', 'font-black', 'text-sm', 'uppercase', 'tracking-[0.2em]')}>Register New Tenant</h2>
          <button onClick={() => { reset(); onClose(); }} className={clsx('absolute', 'top-4', 'right-5', 'p-2', 'text-white/60', 'hover:text-white', 'transition-colors')}>
            <X size={20} />
          </button>
        </div>

        <div className={clsx('flex', 'items-center', 'px-8', 'pt-5', 'pb-3')}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className={clsx('flex', 'flex-col', 'items-center', 'shrink-0')}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${step === s.key ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : step > s.key ? 'bg-green-500 border-green-500 text-white' : 'bg-zinc-800 border-white/5 text-zinc-500'}`}>
                  {step > s.key ? <CheckCircle size={16} /> : <s.icon size={15} />}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${step === s.key ? 'text-primary' : 'text-zinc-500'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mb-5 mx-2 rounded-full ${step > s.key ? 'bg-green-400' : 'bg-zinc-800'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className={clsx('px-8', 'pb-8', 'pt-2')}>
          {step === 1 && (
            <div className={clsx('space-y-5', 'animate-fade-in')}>
              <div>
                <label className={clsx('text-[10px]', 'font-bold', 'text-zinc-500', 'uppercase', 'tracking-widest', 'mb-1.5', 'flex', 'items-center', 'gap-1.5')}><Mail size={11} /> Gmail Address *</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="tenant@gmail.com" className={clsx('w-full', 'px-4', 'py-3', 'bg-zinc-800', 'border', 'border-white/5', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'text-sm', 'font-medium')} />
              </div>
              <div>
                <label className={clsx('text-[10px]', 'font-bold', 'text-zinc-500', 'uppercase', 'tracking-widest', 'block', 'mb-1.5')}>Confirm Gmail *</label>
                <input value={confirmEmail} onChange={e => setConfirm(e.target.value)} type="email" placeholder="Confirm email" className={clsx('w-full', 'px-4', 'py-3', 'bg-zinc-800', 'border', 'border-white/5', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'text-sm', 'font-medium')} />
              </div>
              <div>
                <label className={clsx('text-[10px]', 'font-bold', 'text-zinc-500', 'uppercase', 'tracking-widest', 'block', 'mb-1.5')}>Temporary Password *</label>
                <div className={clsx('flex', 'items-center', 'gap-2')}>
                  <div className={clsx('relative', 'flex-1')}>
                    <input value={tempPass} onChange={e => setTempPass(e.target.value)} type={showPass ? 'text' : 'password'} className={clsx('w-full', 'pr-10', 'px-4', 'py-3', 'bg-zinc-800', 'border', 'border-white/5', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'text-sm', 'font-mono', 'font-bold', 'text-white')} />
                    <button onClick={() => setShowPass(!showPass)} className={clsx('absolute', 'right-3', 'top-1/2', '-translate-y-1/2', 'text-zinc-500', 'hover:text-primary')}><Eye size={16} /></button>
                  </div>
                  <button onClick={generatePass} className={clsx('px-3', 'py-3', 'bg-zinc-800', 'border', 'border-white/5', 'text-zinc-300', 'rounded-xl', 'hover:bg-zinc-700', 'font-bold', 'text-xs')}><RefreshCw size={14} /></button>
                </div>
              </div>
              {errorMsg && <div className={clsx('p-3', 'bg-red-900/20', 'border', 'border-red-900/50', 'text-primary', 'rounded-xl', 'text-xs', 'font-bold', 'flex', 'items-center', 'gap-2')}><AlertTriangle size={14}/> {errorMsg}</div>}
              <button 
                disabled={!canStep1 || isCheckingEmail} 
                onClick={async () => {
                  setIsCheckingEmail(true);
                  setErrorMsg(null);
                  const result = await checkEmailExists(email);
                  if (result.success && result.exists) {
                    setErrorMsg('This email is already registered. Please use a different email.');
                    setIsCheckingEmail(false);
                    return;
                  }
                  setIsCheckingEmail(false);
                  setStep(2);
                }} 
                className={clsx('w-full', 'py-3.5', 'mt-2', 'bg-primary', 'text-white', 'font-bold', 'text-xs', 'uppercase', 'tracking-widest', 'rounded-xl', 'shadow-lg', 'shadow-primary/20', 'flex', 'items-center', 'justify-center', 'gap-2', 'disabled:opacity-40')}
              >
                {isCheckingEmail ? <><RefreshCw size={16} className="animate-spin" /> Checking...</> : <>Next: Store Info <ChevronRight size={16}/></>}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className={clsx('space-y-5', 'animate-fade-in')}>
              <div>
                <label className={clsx('text-[10px]', 'font-bold', 'text-zinc-500', 'uppercase', 'tracking-widest', 'block', 'mb-1.5')}>Shop Name *</label>
                <input value={shopName} onChange={e => setShopName(e.target.value)} type="text" placeholder="e.g. Aradilla Tech" className={clsx('w-full', 'px-4', 'py-3', 'bg-zinc-800', 'border', 'border-white/5', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'text-sm', 'font-medium')} />
              </div>
              <div>
                <label className={clsx('text-[10px]', 'font-bold', 'text-zinc-500', 'uppercase', 'tracking-widest', 'block', 'mb-1.5')}>Category *</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={clsx('w-full', 'px-4', 'py-3', 'bg-zinc-800', 'border', 'border-white/5', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'text-sm', 'font-medium', 'text-white')}>
                  <option value="">Select...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={clsx('text-[10px]', 'font-bold', 'text-zinc-500', 'uppercase', 'tracking-widest', 'block', 'mb-1.5')}>Phone (Optional)</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+63..." className={clsx('w-full', 'px-4', 'py-3', 'bg-zinc-800', 'border', 'border-white/5', 'rounded-xl', 'focus:border-primary', 'focus:outline-none', 'text-sm', 'font-medium')} />
              </div>
              <div className={clsx('flex', 'gap-3', 'mt-4')}>
                <button onClick={() => setStep(1)} className={clsx('px-5', 'py-3.5', 'bg-zinc-800', 'text-zinc-300', 'font-bold', 'text-xs', 'uppercase', 'tracking-widest', 'rounded-xl')}><ChevronLeft size={16}/></button>
                <button disabled={!canStep2} onClick={() => setStep(3)} className={clsx('flex-1', 'py-3.5', 'bg-primary', 'text-white', 'font-bold', 'text-xs', 'uppercase', 'tracking-widest', 'rounded-xl', 'shadow-lg', 'shadow-primary/20', 'flex', 'items-center', 'justify-center', 'gap-2', 'disabled:opacity-40')}>Next: Slot <ChevronRight size={16}/></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={clsx('space-y-5', 'animate-fade-in')}>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Select Slot *</label>
                <select value={slotId} onChange={e => handleSlotChange(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 border border-white/5 rounded-xl focus:border-primary focus:outline-none text-sm font-medium text-white">
                  <option value="">{slotsLoading ? 'Loading slots...' : 'Choose unit...'}</option>
                  {availableSlots.map(s => <option key={s.id} value={s.unit_id}>{s.unit_id} — ₱{s.base_rent.toLocaleString()}</option>)}
                </select>
                {availableSlots.length === 0 && !slotsLoading && (
                  <p className="text-[10px] text-amber-500 mt-2">No available slots. Create slots in Space Manager first.</p>
                )}
              </div>
              <div className={clsx('grid', 'grid-cols-2', 'gap-4')}>
                <div>
                   <label className={clsx('text-[10px]', 'font-bold', 'text-zinc-500', 'uppercase', 'tracking-widest', 'block', 'mb-1.5')}>Monthly Rent (₱) *</label>
                   <input 
                     value={rentCost} 
                     onChange={e => setRentCost(e.target.value === '' ? '' : Number(e.target.value))} 
                     type="number" 
                     className={clsx('w-full', 'px-4', 'py-3', 'bg-zinc-800', 'border', 'border-white/5', 'rounded-xl', 'text-sm', 'font-black', 'text-green-500', 'focus:border-primary', 'focus:outline-none')} 
                   />
                </div>
                <div>
                  <label className={clsx('text-[10px]', 'font-bold', 'text-zinc-500', 'uppercase', 'tracking-widest', 'mb-1.5', 'flex', 'items-center', 'gap-1.5')}>Lease Start *</label>
                  <input value={startDate} onChange={e => setStartDate(e.target.value)} type="date" className={clsx('w-full', 'px-4', 'py-3', 'bg-zinc-800', 'border', 'border-white/5', 'rounded-xl', 'text-sm', 'text-zinc-400')} />
                </div>
              </div>

              <div>
                <label className={clsx('text-[10px]', 'font-bold', 'text-zinc-500', 'uppercase', 'tracking-widest', 'block', 'mb-1.5')}>Lease End *</label>
                <input value={endDate} onChange={e => setEndDate(e.target.value)} type="date" className={clsx('w-full', 'px-4', 'py-3', 'bg-zinc-800', 'border', 'border-white/5', 'rounded-xl', 'text-sm', 'text-zinc-400')} />
              </div>
              {successMsg && <div className={clsx('p-3', 'bg-green-900/20', 'border', 'border-green-900/50', 'text-green-500', 'rounded-xl', 'text-xs', 'font-bold', 'flex', 'items-center', 'gap-2')}><CheckCircle size={14}/> {successMsg}</div>}
              
              {/* Debug: Show what's missing */}
              {!canStep3 && !isLoading && (
                <div className={clsx('p-3', 'bg-amber-900/20', 'border', 'border-amber-900/50', 'text-amber-500', 'rounded-xl', 'text-xs', 'font-bold')}>
                  Please fill in: {[
                    !slotId && 'Slot',
                    (rentCost === '' || rentCost === 0) && 'Monthly Rent',
                    !startDate && 'Lease Start',
                    !endDate && 'Lease End'
                  ].filter(Boolean).join(', ')}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', position: 'relative', zIndex: 100 }}>
                <button 
                  disabled={isLoading} 
                  onClick={() => setStep(2)}
                  style={{ 
                    padding: '14px 20px', 
                    background: '#27272a', 
                    color: '#d4d4d8',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft size={16}/>
                </button>
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    console.log('CLICKED!', { slotId, rentCost, startDate, endDate, canStep3 });
                    e.preventDefault();
                    e.stopPropagation();
                    if (isLoading) return;
                    if (!canStep3) {
                      const missing = [
                        !slotId && 'Slot',
                        (rentCost === '' || rentCost === 0) && 'Monthly Rent',
                        !startDate && 'Lease Start',
                        !endDate && 'Lease End'
                      ].filter(Boolean);
                      setErrorMsg(`Please fill in: ${missing.join(', ')}`);
                      return;
                    }
                    handleRegister();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (isLoading) return;
                      if (!canStep3) {
                        const missing = [
                          !slotId && 'Slot',
                          (rentCost === '' || rentCost === 0) && 'Monthly Rent',
                          !startDate && 'Lease Start',
                          !endDate && 'Lease End'
                        ].filter(Boolean);
                        setErrorMsg(`Please fill in: ${missing.join(', ')}`);
                        return;
                      }
                      handleRegister();
                    }
                  }}
                  style={{ 
                    flex: 1,
                    padding: '14px 20px', 
                    background: isLoading ? '#52525b' : '#BE1E2D', 
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 10px 15px -3px rgba(190, 30, 45, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: isLoading ? 0.5 : 1,
                    userSelect: 'none'
                  }}
                >
                  {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <><FileDown size={16} /> Register & Download</>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
