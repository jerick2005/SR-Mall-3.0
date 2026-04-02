'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCircle, X, AlertTriangle, Info, Calendar, CreditCard, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '@/app/providers';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock notification data for now (will be replaced with real API calls)
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'NEW_BOOKING_INQUIRY',
      title: 'New Booking Inquiry',
      message: 'A user is interested in booking space L2-205. Check your messages for details.',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    },
    {
      id: '2',
      type: 'AD_SUBMISSION_RECEIVED',
      title: 'Ad Submission Received',
      message: 'Fashion Hub has submitted a new banner for approval.',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      id: '3',
      type: 'EXPIRING_CONTRACTS',
      title: 'Contract Expiring Soon',
      message: 'Tech Zone contract expires in 30 days. Consider renewal discussions.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
  ];

  useEffect(() => {
    if (user) {
      // Load notifications (mock data for now)
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    }
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_BOOKING_INQUIRY':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'AD_SUBMISSION_RECEIVED':
        return <Info className="w-4 h-4 text-purple-500" />;
      case 'EXPIRING_CONTRACTS':
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'OVERDUE_RENT_PAYMENTS':
        return <CreditCard className="w-4 h-4 text-red-500" />;
      case 'FEEDBACK_SPAM_DETECTED':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'SYSTEM_HEALTH_REPORTS':
        return <Settings className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-2xl bg-slate-50 dark:bg-zinc-900 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all group"
      >
        <Bell size={20} className="group-hover:animate-pulse" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 top-12 w-96 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/5 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-charcoal dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No notifications yet</p>
                  <p className="text-xs text-slate-400 mt-1">We'll notify you when something important happens</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors ${
                      !notification.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-charcoal dark:text-white mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4 text-primary" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5">
              <button className="w-full text-center text-xs font-bold text-primary hover:text-primary-hover transition-colors">
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
