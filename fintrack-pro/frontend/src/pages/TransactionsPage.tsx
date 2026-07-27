import React, { useState } from 'react';
import { Search, Filter, Download, Plus, Trash2, Tag, Calendar, MapPin, Inbox } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../store/authStore';
import { Transaction } from '../types';

interface TransactionsPageProps {
  transactions: Transaction[];
  onNewTransaction: () => void;
  onDeleteTransaction: (id: number) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  onNewTransaction,
  onDeleteTransaction,
}) => {
  const { currency } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$';

  const formatMoney = (cents: number) => {
    return `${symbol}${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.category_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions logged to export.');
      return;
    }

    const headers = ['ID', 'Type', 'Description', 'Category', 'Amount', 'Date'];
    const rows = transactions.map((t) => [
      t.id,
      t.type,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.category_name || '').replace(/"/g, '""')}"`,
      (t.amount_cents / 100).toFixed(2),
      t.transaction_date,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fintrack_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Transactions History</h2>
          <p className="text-xs text-slate-400">Search, filter, export, and record financial transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Button variant="primary" size="md" onClick={onNewTransaction}>
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search description, category, or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/70 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Type:
            </span>
            <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
              {(['all', 'income', 'expense'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                    typeFilter === t
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions Data Table */}
      <Card className="p-0 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-500">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No transactions found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {transactions.length === 0
                ? 'Your transaction ledger is currently empty. Add your first income or expense to get started!'
                : 'No transactions match your search filter criteria.'}
            </p>
            <Button variant="primary" size="md" onClick={onNewTransaction} className="mt-2">
              + Add Transaction
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-base">
                          {tx.category_icon || (tx.type === 'income' ? '💰' : '📦')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">{tx.description || 'Transaction'}</p>
                          {tx.location && (
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {tx.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                        <Tag className="w-3 h-3 text-emerald-400" />
                        {tx.category_name || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {tx.transaction_date}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-sm">
                      <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}>
                        {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount_cents)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        title="Delete"
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
