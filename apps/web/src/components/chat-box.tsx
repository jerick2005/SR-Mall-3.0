'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Paperclip, Smile, Minimize2, MapPin } from 'lucide-react';
import { useAuth } from '@/app/providers';
import { LoginModal } from './login-modal';

import { getAllStorefrontsAction } from '@/app/actions/tenant';

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  initialRecipient?: 'admin' | 'shop';
  initialShopName?: string;
}

const DEFAULT_SHOPS = [
  "Velvet & Vine", "Coffee Culture", "Gadget Sphere", "Prism Fitness", "Modern Home"
];

export const ChatBox = ({
  isOpen,
  onClose,
  isAuthenticated,
  initialRecipient = 'shop',
  initialShopName
}: ChatBoxProps) => {
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [recipient, setRecipient] = useState<'admin' | 'shop'>(initialRecipient);
  const [availableShops, setAvailableShops] = useState<string[]>(DEFAULT_SHOPS);
  const [selectedShop, setSelectedShop] = useState(initialShopName || DEFAULT_SHOPS[0]);

  // Fetch true shops from DB
  useEffect(() => {
    async function fetchShops() {
      const res = await getAllStorefrontsAction();
      if (res.success && res.data) {
        const names = res.data.map((s: any) => s.shop_name);
        setAvailableShops(names.length > 0 ? names : DEFAULT_SHOPS);
        if (initialShopName) {
          setSelectedShop(initialShopName);
        } else if (names.length > 0 && !names.includes(selectedShop)) {
          setSelectedShop(names[0]);
        }
      }
    }
    fetchShops();
  }, [initialShopName]);

  // Effect to handle prop changes (e.g. when changing shops via profile)
  useEffect(() => {
    if (initialRecipient) setRecipient(initialRecipient);
    if (initialShopName) setSelectedShop(initialShopName);
    // Clear messages when switching context to ensure isolation
    setDbMessages([]);
  }, [initialRecipient, initialShopName]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real DB Messages state
  const [dbMessages, setDbMessages] = useState<any[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Poll for messages
  useEffect(() => {
    if (!isOpen || !user?.email) return;

    const fetchMessages = async () => {
      const { getConversationHistory } = await import('@/app/actions/chat-queries');
      const history = await getConversationHistory(user.email, recipient, selectedShop);
      setDbMessages(history);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isOpen, user?.email, recipient, selectedShop]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [dbMessages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent, slotId?: string) => {
    e.preventDefault();
    if (!inputText.trim() && !slotId) return;

    const textToSend = inputText || `Inquiring about Slot: ${slotId}`;
    setInputText('');

    if (user?.email) {
      // Optimistic update
      setDbMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), content: textToSend, sender: { email: user.email }, createdAt: new Date() }
      ]);

      const { sendMessage } = await import('@/app/actions/chat');
      await sendMessage({
        userId: user.email,
        recipientType: recipient,
        content: textToSend,
        shopName: selectedShop,
        slotId: slotId,
      });
    }
  };

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-32 sm:right-10 z-[100] w-full h-[85vh] sm:w-[400px] sm:h-[600px] bg-white dark:bg-zinc-900 rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl border-0 sm:border border-slate-100 dark:border-white/5 flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 bg-primary flex items-center justify-between text-white shadow-md z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl shadow-inner">
                S
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-primary animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-sm tracking-tight">Mall Messenger</h3>
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Live Connect</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95"><Minimize2 size={18} /></button>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95"><X size={18} /></button>
          </div>
        </div>

        {isAuthenticated && (
          <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 border-b border-slate-100 dark:border-white/5 text-xs">
            <div className="flex flex-col gap-2 px-1">
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value as 'admin' | 'shop')}
                className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 font-bold text-charcoal dark:text-white focus:outline-none focus:border-primary shadow-sm w-full"
              >
                <option value="shop">Specific Shop (Product Inquiries)</option>
                <option value="admin">Mall Admin (Booking & Support)</option>
              </select>
              {recipient === 'shop' && (
                <select
                  value={selectedShop}
                  onChange={(e) => {
                    setSelectedShop(e.target.value);
                    setDbMessages([]); // Isolate chats immediately
                  }}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 font-bold text-charcoal dark:text-white focus:outline-none focus:border-primary w-full shadow-sm"
                >
                  {initialShopName && !availableShops.includes(initialShopName) && (
                    <option value={initialShopName}>{initialShopName}</option>
                  )}
                  {availableShops.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-50/50 dark:bg-black/20">
          <div className="flex flex-col items-start animate-fade-in">
            <div className="max-w-[85%] rounded-3xl px-5 py-3.5 shadow-sm text-sm font-medium leading-relaxed bg-white dark:bg-zinc-800 text-charcoal dark:text-slate-300 rounded-tl-sm border border-slate-100 dark:border-white/5">
              {isAuthenticated ? `Welcome back ${user?.name || ''}! How can we help you seamlessly access ${recipient === 'admin' ? 'Mall Administration' : selectedShop}?` : `Welcome to SR Mall. Login to start a conversation with Mall Admin or Tenants.`}
            </div>
          </div>

          {dbMessages.map((msg: any) => {
            const isUserSender = msg.sender?.email === user?.email;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUserSender ? 'items-end' : 'items-start'} animate-fade-in`}
              >
                <div className={`max-w-[85%] rounded-3xl px-5 py-3.5 shadow-sm text-sm font-medium leading-relaxed ${isUserSender
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-white dark:bg-zinc-800 text-charcoal dark:text-slate-300 rounded-tl-sm border border-slate-100 dark:border-white/5'
                  }`}>
                  {msg.content}
                </div>
                <div className="mt-1.5 px-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {isAuthenticated ? (
          <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            {recipient === 'admin' && (
              <div className="mb-3 px-1">
                <button
                  onClick={(e) => handleSend(e, 'GF-A12 (Available)')}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-900/50 hover:bg-green-100 transition-colors"
                >
                  <MapPin size={12} /> Share Currently Viewed Slot (GF-A12)
                </button>
              </div>
            )}
            <form onSubmit={handleSend} className="relative flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-white/10 p-1.5 focus-within:ring-2 ring-primary/20 focus-within:border-primary transition-all">
              <button type="button" className="p-2.5 text-slate-400 hover:text-primary transition-colors rounded-xl hover:bg-white dark:hover:bg-zinc-700"><Paperclip size={18} /></button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Message..."
                className="flex-1 px-2 py-2 bg-transparent outline-none text-sm font-medium dark:text-white placeholder:text-slate-400 min-w-0"
              />
              <button type="button" className="p-2 text-slate-400 hover:text-primary transition-colors sm:block hidden"><Smile size={18} /></button>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-md"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-zinc-900 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              Read-Only Mode
            </p>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="mt-3 px-6 py-2 bg-charcoal dark:bg-white text-white dark:text-black font-bold text-xs rounded-full hover:scale-105 transition-all shadow-lg"
            >
              Login to Reply
            </button>
          </div>
        )}

      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};
