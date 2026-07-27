import React from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, Lightbulb, RefreshCw, PlusCircle, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FinancialInsight, Transaction, Budget, SavingsGoal } from '../types';

interface InsightsPageProps {
  insights: FinancialInsight[];
  transactions: Transaction[];
  budgets: Budget[];
  savings: SavingsGoal[];
  onNewTransaction: () => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({
  insights,
  transactions,
  budgets,
  savings,
  onNewTransaction,
}) => {
  // Real Dynamic Calculations
  const totalIncomeCents = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount_cents, 0);

  const totalExpenseCents = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount_cents, 0);

  const netSavingsCents = totalIncomeCents - totalExpenseCents;
  const savingsRate = totalIncomeCents > 0 ? Math.max(0, (netSavingsCents / totalIncomeCents) * 100) : 0;

  const hasTransactions = transactions.length > 0;

  // Dynamic Health Score Calculation
  let healthScore = 0;
  let conditionTitle = 'Pending Financial Data';
  let conditionDesc =
    'Log your income and expenses using "+ Add Transaction" to calculate your AI Financial Health Score and receive personalized budget advice.';

  if (hasTransactions) {
    let score = 50;
    if (savingsRate >= 30) score += 30;
    else if (savingsRate >= 20) score += 20;
    else if (savingsRate >= 10) score += 10;

    if (totalIncomeCents > 0 && totalExpenseCents < totalIncomeCents) {
      score += 15;
    }

    if (budgets.length > 0) {
      const exceeded = budgets.filter((b) => b.is_exceeded).length;
      if (exceeded === 0) score += 5;
    }

    healthScore = Math.min(98, score);

    if (healthScore >= 80) {
      conditionTitle = 'Excellent Financial Condition';
      conditionDesc = `Your spending is within capacity, your savings rate is ${savingsRate.toFixed(1)}%, and your income exceeds monthly expenses.`;
    } else if (healthScore >= 60) {
      conditionTitle = 'Good Financial Condition';
      conditionDesc = `You are maintaining a positive cash flow with a ${savingsRate.toFixed(1)}% savings rate. Consider setting category budgets to optimize further.`;
    } else {
      conditionTitle = 'Needs Attention';
      conditionDesc = `Monthly expenses represent a high percentage of your income. Review your transaction history and set budget limits.`;
    }
  }

  // Generate Real Dynamic Insights
  const dynamicInsights: FinancialInsight[] = [];

  if (!hasTransactions) {
    dynamicInsights.push({
      id: 1,
      user_id: 1,
      category: 'onboarding',
      title: 'Welcome to AI Financial Intelligence',
      message: 'Start by recording your primary income stream (salary, freelance, or business) and recent expenses.',
      severity: 'info',
      is_read: false,
      generated_at: new Date().toISOString(),
    });
  } else {
    dynamicInsights.push({
      id: 1,
      user_id: 1,
      category: 'savings',
      title: savingsRate >= 20 ? 'Strong Savings Capacity!' : 'Savings Rate Alert',
      message: `Your current net savings rate is ${savingsRate.toFixed(1)}% of total income. ${
        savingsRate < 20 ? 'Recommended target benchmark is at least 20.0%.' : 'Great job building your reserve!'
      }`,
      severity: savingsRate >= 20 ? 'info' : 'warning',
      is_read: false,
      generated_at: new Date().toISOString(),
    });

    if (totalExpenseCents > 0) {
      const topCategory = transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => {
          const cat = t.category_name || 'General';
          acc[cat] = (acc[cat] || 0) + t.amount_cents;
          return acc;
        }, {} as Record<string, number>);

      const sorted = Object.entries(topCategory).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        dynamicInsights.push({
          id: 2,
          user_id: 1,
          category: 'expense',
          title: `Highest Spending Category: ${sorted[0][0]}`,
          message: `You spent $${(sorted[0][1] / 100).toFixed(2)} on ${sorted[0][0]}. Setting a budget limit can prevent overspending.`,
          severity: 'info',
          is_read: false,
          generated_at: new Date().toISOString(),
        });
      }
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span>AI Financial Advisor</span>
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </h2>
          <p className="text-xs text-slate-400">Automated spending anomaly detection, savings benchmarks, and health scores.</p>
        </div>
      </div>

      {/* Financial Health Score Hero */}
      <div className="glass-card rounded-3xl p-8 border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-emerald-500 bg-emerald-500/10 flex items-center justify-center text-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <div>
              <span className="text-3xl font-black text-white leading-none">
                {hasTransactions ? healthScore : '--'}
              </span>
              <span className="text-[10px] text-emerald-400 block font-bold mt-0.5">HEALTH SCORE</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{conditionTitle}</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-md">{conditionDesc}</p>
          </div>
        </div>

        {!hasTransactions && (
          <Button variant="primary" onClick={onNewTransaction} className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> + Add First Transaction
          </Button>
        )}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Automated AI Analysis Cards</h3>
        {dynamicInsights.map((ins) => (
          <Card key={ins.id} className="flex items-start gap-4 p-5">
            <div className={`p-3 rounded-2xl ${ins.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {ins.severity === 'warning' ? <AlertTriangle className="w-6 h-6" /> : <Lightbulb className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-100 text-base">{ins.title}</h4>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">{ins.category}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{ins.message}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
