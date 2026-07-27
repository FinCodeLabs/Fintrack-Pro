import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuthStore } from '../store/authStore';
import { Sparkles, KeyRound, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const { login, loginAsDemo, isLoading } = useAuthStore();
  const [email, setEmail] = useState('demo@fintrackpro.com');
  const [password, setPassword] = useState('DemoPassword123!');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/20">
            💎
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">FinTrack <span className="text-emerald-400">Pro</span></h2>
          <p className="text-xs text-slate-400">Personal Financial Intelligence & Budgeting</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button variant="primary" type="submit" disabled={isLoading} className="w-full mt-2 flex items-center justify-center gap-2">
            {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Default Demo Account</span>
          </div>
          <p className="text-xs text-slate-300 font-mono">Email: demo@fintrackpro.com</p>
          <p className="text-xs text-slate-300 font-mono">Password: DemoPassword123!</p>
        </div>

        <div className="pt-2 border-t border-slate-800 space-y-3 text-center">
          <Button variant="secondary" onClick={loginAsDemo} className="w-full flex items-center justify-center gap-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
            <Sparkles className="w-4 h-4" /> Instant Demo Access (1-Click)
          </Button>
          <p className="text-xs text-slate-400">
            New to FinTrack Pro?{' '}
            <button onClick={onSwitchToRegister} className="text-emerald-400 font-bold hover:underline">
              Create Account Free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
