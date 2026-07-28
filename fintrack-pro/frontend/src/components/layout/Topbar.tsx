import React, { useState, useEffect, useRef } from 'react';
import { Bell, Plus, CheckCheck, Trash2, X, AlertTriangle, CheckCircle2, BellOff, Menu, ShieldCheck, Search, User } from 'lucide-react';
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
  currentTab: string;
  setTab: (tab: string) => void;
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

export const Topbar: React.FC<TopbarProps> = ({ title, currentTab, setTab, onQuickAdd, onToggleMobileNav }) => {
  const { user, currency, setCurrency } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('fintrack_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('fintrack_notifications', JSON.stringify(notifications));
  }, [notifications]);

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
    <header className="h-16 sm:h-20 border-b border-[#1e2333] bg-[#0b0e14]/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 gap-2">
      {/* Mobile Drawer Trigger & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
        <button
          onClick={onToggleMobileNav}
          className="p-2 text-slate-400 hover:text-white bg-[#131722] border border-[#1e2333] rounded-xl md:hidden shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex md:hidden items-center justify-center font-black shrink-0">
            <ShieldCheck className="w-4 h-4 text-slate-950" />
          </div>
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight truncate">{title}</h2>
        </div>
      </div>

      {/* Right Action Icons matching Image 2 */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
        {/* Currency Switcher */}
        <div className="hidden sm:flex items-center bg-[#131722] rounded-xl p-1 border border-[#1e2333]">
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => setCurrency(c.code)}
              title={`${c.symbol} (${c.code})`}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                currency === c.code
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{c.symbol}</span>
              <span className="hidden xl:inline">{c.code}</span>
            </button>
          ))}
        </div>

        {/* Quick Add Button */}
        <Button variant="primary" size="md" onClick={onQuickAdd} className="px-2.5 sm:px-3 lg:px-4 text-xs font-semibold">
          <Plus className="w-4 h-4 shrink-0" />
          <span className="hidden lg:inline">New Transaction</span>
          <span className="hidden sm:inline lg:hidden">Add</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {/* Search Icon button */}
        <button
          onClick={() => setTab('transactions')}
          className="p-2 text-slate-400 hover:text-white bg-[#131722] hover:bg-[#181c2b] rounded-xl border border-[#1e2333] transition-colors"
          title="Search transactions"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleToggleNotifications}
            title={unreadCount > 0 ? `${unreadCount} new notifications` : 'Notifications'}
            className="relative p-2 text-slate-400 hover:text-slate-100 bg-[#131722] hover:bg-[#181c2b] rounded-xl border border-[#1e2333] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-500/50" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card rounded-2xl p-4 border border-[#2a3045] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e2333]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100">Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium bg-[#131722] px-2 py-0.5 rounded-full">
                      All Caught Up
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {notifications.length > 0 && unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-slate-400 hover:text-emerald-400 font-medium transition-colors flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-[11px] text-slate-400 hover:text-rose-400 font-medium transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#0b0e14] border border-[#1e2333] mx-auto flex items-center justify-center text-slate-500">
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
                          ? 'bg-[#0b0e14]/40 border-[#1e2333] opacity-75 hover:opacity-100 hover:border-[#2a3045]'
                          : 'bg-[#131722] border-[#2a3045] shadow-sm hover:border-emerald-500/40'
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
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-[#181c2b] transition-all shrink-0"
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

        {/* User Avatar Badge matching Image 2 */}
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer" title={user?.full_name || 'Account'}>
          {user?.full_name?.charAt(0) || 'A'}
        </div>
      </div>
    </header>
  );
};
