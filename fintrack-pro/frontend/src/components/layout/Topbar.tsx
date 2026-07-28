import React, { useState, useEffect, useRef } from 'react';
import { Bell, Plus, CheckCheck, Trash2, X, AlertTriangle, CheckCircle2, BellOff, Menu, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/authStore';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  type: 'warning' | 'success' | 'info';
}

interface TopbarProps {
  title: string;
  onQuickAdd: () => void;
  onToggleMobileNav?: () => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Budget Threshold Warning',
    description: 'Dining & Cafes spending reached 68% of monthly limit.',
    time: '10m ago',
    isRead: false,
    type: 'warning',
  },
  {
    id: '2',
    title: 'Savings Goal Progress',
    description: 'Emergency Fund reached 65% completion milestone.',
    time: '2h ago',
    isRead: false,
    type: 'success',
  },
];

export const Topbar: React.FC<TopbarProps> = ({ title, onQuickAdd, onToggleMobileNav }) => {
  const { currency, setCurrency } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('fintrack_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('fintrack_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState && unreadCount > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleItemClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'INR', symbol: '₹' },
  ];

  return (
    <header className="h-16 sm:h-20 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleMobileNav}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex md:hidden items-center justify-center font-black">
            <ShieldCheck className="w-4 h-4 text-slate-950" />
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Currency Switcher */}
        <div className="hidden sm:flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800">
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                currency === c.code
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.symbol} {c.code}
            </button>
          ))}
        </div>

        {/* Quick Add Button */}
        <Button variant="primary" size="md" onClick={onQuickAdd} className="px-3 sm:px-4 text-xs sm:text-sm">
          <Plus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">New Transaction</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {/* Notifications Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleToggleNotifications}
            title={unreadCount > 0 ? `${unreadCount} new notifications` : 'Notifications'}
            className="relative p-2.5 text-slate-400 hover:text-slate-100 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-500/50" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card rounded-2xl p-4 border border-slate-700/80 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100">Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium bg-slate-800/60 px-2 py-0.5 rounded-full">
                      All Caught Up
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {notifications.length > 0 && unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-slate-400 hover:text-emerald-400 font-medium transition-colors flex items-center gap-1"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-[11px] text-slate-400 hover:text-rose-400 font-medium transition-colors flex items-center gap-1"
                      title="Clear all notifications"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-500">
                    <BellOff className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">No notifications</p>
                  <p className="text-[11px] text-slate-500">You're completely caught up!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                        item.isRead
                          ? 'bg-slate-900/40 border-slate-800/60 opacity-75 hover:opacity-100 hover:border-slate-700'
                          : 'bg-slate-900/90 border-slate-700/80 shadow-sm hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0">
                            {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                            {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-xs text-slate-200">{item.title}</p>
                              {!item.isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                              )}
                            </div>
                            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{item.description}</p>
                            <span className="text-[10px] text-slate-500 mt-1 block">{item.time}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDismiss(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all shrink-0"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
