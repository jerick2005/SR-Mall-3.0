"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/auth";

const resetSchema = z.object({
    email: z.string().email("Invalid email address"),
    token: z.string().length(6, "Verification code must be 6 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            email: searchParams.get("email") || "",
            token: searchParams.get("token") || "",
            password: "",
            confirmPassword: "",
        }
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await resetPasswordAction({
                email: data.email,
                token: data.token,
                newPassword: data.password,
            });

            if (!res.success) throw new Error(res.error);

            setIsSuccess(true);
            setTimeout(() => {
                router.push("/"); // Back to home to login
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-10 animate-fade-in">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                    <CheckCircle2 size={40} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-charcoal dark:text-white mb-2">Password Secured!</h2>
                    <p className="text-sm text-slate-500 font-medium">
                        Your password has been successfully updated. Redirecting you to the login screen...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 sm:p-12 animate-fade-in-up">
            <div className="mb-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-primary/20">
                    <ShieldCheck size={32} />
                </div>
                <h1 className="text-2xl font-black text-charcoal dark:text-white uppercase tracking-tight">Set New Password</h1>
                <p className="text-sm text-slate-500 font-medium mt-2">Enter your verification code and new credentials.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500 text-xs font-bold rounded-2xl border border-red-100 dark:border-red-900/30 animate-shake">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email</label>
                        <input
                            {...register("email")}
                            type="email"
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all text-sm font-bold text-charcoal dark:text-white"
                        />
                        {errors.email && <span className="text-[10px] text-red-500 px-1">{errors.email.message as string}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">6-Digit Recovery Code</label>
                        <input
                            {...register("token")}
                            maxLength={6}
                            placeholder="000000"
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all text-sm font-bold text-charcoal dark:text-white tracking-[0.5em] text-center"
                        />
                        {errors.token && <span className="text-[10px] text-red-500 px-1">{errors.token.message as string}</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">New Password</label>
                            <input
                                {...register("password")}
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all text-sm font-bold text-charcoal dark:text-white"
                            />
                            {errors.password && <span className="text-[10px] text-red-500 px-1">{errors.password.message as string}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Confirm</label>
                            <input
                                {...register("confirmPassword")}
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all text-sm font-bold text-charcoal dark:text-white"
                            />
                            {errors.confirmPassword && <span className="text-[10px] text-red-500 px-1">{errors.confirmPassword.message as string}</span>}
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-all active:scale-[0.98] shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Update Credentials"}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_#be1e2d15,_transparent_40%)]">
            <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                <Suspense fallback={<div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </main>
    );
}
