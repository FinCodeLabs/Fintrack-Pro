import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Sparkles,
  Settings,
  LogOut,
  Wallet,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab }) => {
  const { user, logout } = useAuthStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'savings', label: 'Savings Goals', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: Wallet },
    { id: 'insights', label: 'AI Insights', icon: Sparkles, badge: 'AI' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between h-screen sticky top-0 shrink-0 bg-[#0e111a] border-r border-[#1e2333] transition-all duration-300 w-16 lg:w-60 p-3 lg:p-4 z-40">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 py-3 mb-6 border-b border-[#1e2333] justify-center lg:justify-start">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0 font-black">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div className="hidden lg:block truncate">
            <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
              FinTrack<span className="text-emerald-400">Pro</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium truncate">Financial Intelligence</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-center lg:justify-between px-2.5 lg:px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                  isActive
                    ? 'bg-[#1a202c] text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/5'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#151924]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="hidden lg:inline text-xs font-semibold">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="pt-4 border-t border-[#1e2333]">
        <div className="flex items-center justify-center lg:justify-between p-2 rounded-xl bg-[#131722] border border-[#1e2333]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="hidden lg:block truncate max-w-[100px]">
              <p className="text-xs font-semibold text-slate-100 truncate">{user?.full_name || 'Alex Morgan'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'demo@fintrackpro.com'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="hidden lg:block p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
