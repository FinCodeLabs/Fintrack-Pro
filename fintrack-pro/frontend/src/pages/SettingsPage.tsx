import React from 'react';
import { User, Bell, Shield, Wallet, Save } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuthStore } from '../store/authStore';

export const SettingsPage: React.FC = () => {
  const { user, currency, setCurrency } = useAuthStore();

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Account Settings</h2>
        <p className="text-xs text-slate-400">Manage your profile, primary currency, security, and preferences.</p>
      </div>

      <Card className="space-y-6">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <User className="w-5 h-5 text-emerald-400" /> Personal Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" defaultValue={user?.full_name || 'Alex Morgan'} />
          <Input label="Email Address" defaultValue={user?.email || 'demo@fintrackpro.com'} disabled />
        </div>
      </Card>

      <Card className="space-y-6">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Wallet className="w-5 h-5 text-emerald-400" /> Currency & Locale
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">Default Currency</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { code: 'USD', name: 'US Dollar ($)' },
              { code: 'EUR', name: 'Euro (€)' },
              { code: 'GBP', name: 'British Pound (£)' },
              { code: 'INR', name: 'Indian Rupee (₹)' },
            ].map((c) => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                  currency === c.code
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary">
          <Save className="w-4 h-4" /> Save Preferences
        </Button>
      </div>
    </div>
  );
};
