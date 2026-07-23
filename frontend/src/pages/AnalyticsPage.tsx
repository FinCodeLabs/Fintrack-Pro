import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '../components/ui/card';
import { useAuthStore } from '../store/authStore';

export const AnalyticsPage: React.FC = () => {
  const { currency } = useAuthStore();
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$';

  const monthlyComparison = [
    { month: 'Jan', income: 4500, expense: 2100 },
    { month: 'Feb', income: 4800, expense: 2300 },
    { month: 'Mar', income: 5100, expense: 1900 },
    { month: 'Apr', income: 4900, expense: 2400 },
    { month: 'May', income: 5300, expense: 2200 },
    { month: 'Jun', income: 5250, expense: 2148 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Financial Analytics</h2>
        <p className="text-xs text-slate-400">Deep dive into revenue trends, cost distributions, and period comparisons.</p>
      </div>

      <Card>
        <h3 className="text-lg font-bold text-slate-100 mb-4">6-Month Income vs Expenses Comparison ({symbol})</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyComparison} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }} />
              <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#F43F5E" radius={[6, 6, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
