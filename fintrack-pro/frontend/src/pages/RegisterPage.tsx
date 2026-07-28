import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuthStore } from '../store/authStore';
import { Sparkles, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const { register, loginAsDemo, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password, currency);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/20 font-black">
            <ShieldCheck className="w-8 h-8 text-slate-950" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Free Account</h2>
          <p className="text-xs text-slate-400">Join FinTrack Pro for smart financial analytics</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">Preferred Currency</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'USD', name: 'USD ($)' },
                { code: 'EUR', name: 'EUR (€)' },
                { code: 'GBP', name: 'GBP (£)' },
                { code: 'INR', name: 'INR (₹)' },
                { code: 'CAD', name: 'CAD ($)' },
                { code: 'AUD', name: 'AUD ($)' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    currency === c.code
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" type="submit" disabled={isLoading} className="w-full mt-2 flex items-center justify-center gap-2">
            <UserCheck className="w-4 h-4" /> {isLoading ? 'Creating Account...' : 'Get Started Free'}
          </Button>
        </form>

        <div className="pt-3 border-t border-slate-800 space-y-3 text-center">
          <Button variant="secondary" onClick={loginAsDemo} className="w-full flex items-center justify-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Explore Demo Account First
          </Button>
          <p className="text-xs text-slate-400">
            Already registered?{' '}
            <button onClick={onSwitchToLogin} className="text-emerald-400 font-bold hover:underline">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
