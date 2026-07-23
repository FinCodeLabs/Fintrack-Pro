import React from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FinancialInsight } from '../types';

interface InsightsPageProps {
  insights: FinancialInsight[];
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ insights }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span>AI Financial Advisor</span>
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </h2>
          <p className="text-xs text-slate-400">Automated spending anomaly detection, savings benchmarks, and financial health scores.</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4" />
          <span>Re-analyze</span>
        </Button>
      </div>

      {/* Financial Health Score Hero */}
      <div className="glass-card rounded-3xl p-8 border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-emerald-500 bg-emerald-500/10 flex items-center justify-center text-center shadow-lg shadow-emerald-500/20">
            <div>
              <span className="text-3xl font-black text-white leading-none">88</span>
              <span className="text-[10px] text-emerald-400 block font-bold mt-0.5">HEALTH SCORE</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Excellent Financial Condition</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-md">
              Your spending is 28% below your monthly income capacity, emergency fund goal is 65% funded, and no high-interest debt has been flagged.
            </p>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((ins) => (
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
