import React, { useState } from 'react';
import { Target, Plus, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { useAuthStore } from '../store/authStore';
import { SavingsGoal } from '../types';

interface SavingsPageProps {
  savings: SavingsGoal[];
  onAddGoal: (goal: Partial<SavingsGoal>) => void;
  onDeposit: (id: number, amountCents: number) => void;
}

export const SavingsPage: React.FC<SavingsPageProps> = ({ savings, onAddGoal, onDeposit }) => {
  const { currency } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<SavingsGoal | null>(null);

  const [name, setName] = useState('');
  const [targetDollars, setTargetDollars] = useState('1000');
  const [icon, setIcon] = useState('🎯');

  const [depositDollars, setDepositDollars] = useState('100');

  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$';

  const formatMoney = (cents: number) => {
    return `${symbol}${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCents = Math.round(parseFloat(targetDollars) * 100);

    onAddGoal({
      name,
      icon,
      target_cents: targetCents,
      current_cents: 0,
      remaining_cents: targetCents,
      progress_percentage: 0,
      status: 'active',
      auto_save: false,
    });

    setName('');
    setIsModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositModalGoal) {
      const depCents = Math.round(parseFloat(depositDollars) * 100);
      onDeposit(depositModalGoal.id, depCents);
      setDepositModalGoal(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Savings Goals</h2>
          <p className="text-xs text-slate-400">Track long-term financial milestones, emergency buffers, and vacations.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savings.map((g) => {
          const pct = Math.min(100, Math.round((g.current_cents / g.target_cents) * 100) || 0);
          const isCompleted = pct >= 100;

          return (
            <Card key={g.id} hoverable className="space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center text-2xl shadow-inner">
                    {g.icon || '🎯'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100">{g.name}</h4>
                    <p className="text-[11px] text-slate-400">Target: {formatMoney(g.target_cents)}</p>
                  </div>
                </div>
                {isCompleted ? (
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <Trophy className="w-5 h-5" />
                  </span>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setDepositModalGoal(g)}>
                    + Deposit
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-400">{formatMoney(g.current_cents)} saved</span>
                  <span className="text-slate-200">{pct}%</span>
                </div>
                <div className="h-3.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-md shadow-emerald-500/20"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Remaining:</span>
                <span className="font-bold text-slate-200">{formatMoney(Math.max(0, g.target_cents - g.current_cents))}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Savings Goal Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Savings Goal">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Goal Name" placeholder="e.g. Vacation to Europe" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label={`Target Amount (${symbol})`} type="number" value={targetDollars} onChange={(e) => setTargetDollars(e.target.value)} required min="1" />
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Select Icon Emoji</label>
            <div className="flex gap-2">
              {['🎯', '🛡️', '🏯', '💻', '🚗', '🏠'].map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                    icon === e ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Goal</Button>
          </div>
        </form>
      </Dialog>

      {/* Deposit Modal */}
      <Dialog isOpen={!!depositModalGoal} onClose={() => setDepositModalGoal(null)} title={`Deposit to ${depositModalGoal?.name || ''}`}>
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          <Input label={`Deposit Amount (${symbol})`} type="number" value={depositDollars} onChange={(e) => setDepositDollars(e.target.value)} required min="1" />
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setDepositModalGoal(null)}>Cancel</Button>
            <Button variant="primary" type="submit">Confirm Deposit</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
