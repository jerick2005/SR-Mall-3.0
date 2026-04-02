'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Chrome, Github, LogIn, Lock, Mail, X, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { loginAction, signUpAction } from '@/app/actions/auth';
import clsx from 'clsx';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(isSignUp ? signUpSchema : loginSchema),
  });

  const router = useRouter();

  if (!isOpen) return null;

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    reset();
    setError(null);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const res = await signUpAction({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        });

        if (!res.success || !res.data) {
          throw new Error(res.error || 'Error creating account.');
        }

        const newUser = res.data;
        login(newUser.id, newUser.name || newUser.email, newUser.email, 'USER');
        onClose();
        
        // Redirect standard user
        router.push('/public-view');
      } else {
        // ── Real Database Login ──
        const res = await loginAction({ email: data.email, password: data.password });
        
        if (!res.success || !res.data) {
          throw new Error(res.error || 'Invalid email or password.');
        }

        const userAccount = res.data;
        login(userAccount.id, userAccount.name, userAccount.email, userAccount.role);
        onClose();

        // Redirect based on role
        if (userAccount.role === 'ADMIN') {
          router.push('/admindashboard');
        } else if (userAccount.role === 'TENANT') {
          router.push('/tenantdashboard');
        } else {
          router.push('/public-view');
        }
      }
    } catch (err: any) {
      setError(err?.message || (isSignUp ? 'Error creating account.' : 'Invalid email or password.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-md bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden animate-fade-in-up">
        <div className="relative h-32 bg-primary flex items-center justify-center overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden shadow-lg mb-2 p-0.5">
              <img src="/images/srmall-logo/sr_logo2.jpg" alt="Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <h2 className="text-white font-bold tracking-tight uppercase text-[10px] tracking-[0.3em]">{isSignUp ? 'Create an Account' : 'SR MALL Member Login'}</h2>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-950/30 text-red-500 text-xs font-bold rounded-2xl border border-red-900/30 animate-shake">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">First Name</label>
                    <input {...register('firstName')} type="text" placeholder="John" className="w-full px-4 py-4 bg-zinc-800 rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all text-sm font-medium" />
                    {errors.firstName && <span className="text-[10px] text-red-500 px-1">{errors.firstName.message?.toString()}</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Last Name</label>
                    <input {...register('lastName')} type="text" placeholder="Doe" className="w-full px-4 py-4 bg-zinc-800 rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all text-sm font-medium" />
                    {errors.lastName && <span className="text-[10px] text-red-500 px-1">{errors.lastName.message?.toString()}</span>}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input {...register('email')} type="email" placeholder="Enter your email" className="w-full pl-14 pr-6 py-4 bg-zinc-800 rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all text-sm font-medium" />
                </div>
                {errors.email && <span className="text-[10px] text-red-500 px-1">{errors.email.message?.toString()}</span>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Password</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input {...register('password')} type="password" placeholder="••••••••" className="w-full pl-14 pr-6 py-4 bg-zinc-800 rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all text-sm font-medium" />
                </div>
                {errors.password && <span className="text-[10px] text-red-500 px-1">{errors.password.message?.toString()}</span>}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-all active:scale-95 shadow-xl shadow-primary/30 disabled:opacity-70 disabled:scale-100">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><LogIn size={18} /> {isSignUp ? 'Create Account' : 'Authorize Access'}</>}
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-slate-500 font-medium">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button" onClick={toggleMode} className="text-primary font-bold hover:underline">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
