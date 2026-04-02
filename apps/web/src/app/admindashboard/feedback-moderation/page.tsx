'use client';

import React, { useState } from 'react';
import { ShieldAlert, Check, Trash2, Ban } from 'lucide-react';

const mockFeedback = [
  { id: 1, user: 'John Doe', ip: '192.168.1.1', score: 10, text: 'Great place to shop!', isSpam: false, date: '2 min ago' },
  { id: 2, user: 'Spammer99', ip: '10.0.0.5', score: 85, text: 'Buy cheap watches here: http://spam.link', isSpam: true, date: '4 min ago' },
  { id: 3, user: 'Spammer99', ip: '10.0.0.5', score: 95, text: 'Buy cheap watches here: http://spam.link', isSpam: true, date: '5 min ago' },
  { id: 4, user: 'Jane Smith', ip: '172.16.0.2', score: 5, text: 'Loved the new cafe on Level 2.', isSpam: false, date: '15 min ago' },
];

export default function FeedbackModeration() {
  const [feedbacks, setFeedbacks] = useState(mockFeedback);

  return (
    <div className="p-10 animate-fade-in-up">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-charcoal dark:text-white tracking-tight">Feedback Moderation</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Anti-spam moderation & real-time comment feed.</p>
        </div>
      </div>

      <div className="space-y-4">
        {feedbacks.map((item) => (
          <div
            key={item.id}
            className={`p-6 rounded-[2rem] border transition-all ${item.isSpam
              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
              : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-white/5 shadow-sm'
              }`}
          >
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="font-bold text-charcoal dark:text-white">{item.user}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.score > 70 ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300'
                    }`}>
                    Spam Score: {item.score}
                  </span>
                  {item.isSpam && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary tracking-wider">
                      <ShieldAlert size={12} /> Automated Flag
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-medium ml-auto">{item.date} • IP: {item.ip}</span>
                </div>
                <p className={`text-sm leading-relaxed ${item.isSpam ? 'text-red-900 dark:text-red-200 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                  "{item.text}"
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white rounded-xl text-xs font-bold transition-colors">
                  <Check size={14} /> Approve
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition-colors">
                  <Trash2 size={14} /> Delete
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white hover:bg-primary-hover rounded-xl text-xs font-bold transition-colors shadow-lg shadow-primary/20 active:scale-95">
                  <Ban size={14} /> Block User
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
