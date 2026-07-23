import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuthStore } from '../store/authStore';

export const LoginPage: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const { login, loginAsDemo } = useAuthStore();
  const [email, setEmail] = useState('demo@fintrackpro.com');
  const [password, setPassword] = useState('DemoPassword123!');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
            💎
          </div>
          <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to your FinTrack Pro account</p>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <Button variant="primary" type="submit" className="w-full mt-2">
            Sign In
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800 space-y-3 text-center">
          <Button variant="secondary" onClick={loginAsDemo} className="w-full">
            ⚡ Explore Instant Demo Account
          </Button>
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <button onClick={onSwitchToRegister} className="text-emerald-400 font-bold hover:underline">
              Create One
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
