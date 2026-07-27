import React, { useState } from 'react';
import { Bot, Sparkles, X, Send, ChevronRight, CheckCircle2, HelpCircle, ArrowRight, ShieldCheck, PieChart, PlusCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Transaction } from '../types';

interface AIAssistantWidgetProps {
  currentTab: string;
  setTab: (tab: string) => void;
  transactions: Transaction[];
  onOpenAddTransaction: () => void;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  action?: { label: string; tab?: string; triggerAdd?: boolean };
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  currentTab,
  setTab,
  transactions,
  onOpenAddTransaction,
}) => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<number | null>(0); // 0 = welcome banner
  const [inputQuery, setInputQuery] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Hello ${user?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your AI Financial Assistant. I can guide you step-by-step to set up your budget, log transactions, and optimize your financial health score.`,
      action: { label: '🚀 Start 1-Minute Guided Tour' },
    },
  ]);

  const tutorialSteps = [
    {
      title: 'Step 1: Record Your Income & Expenses',
      desc: 'Start by clicking "+ Add Transaction" to log your salary, freelance earnings, or recent expenses.',
      actionLabel: '+ Add First Transaction',
      onAction: () => {
        setIsOpen(false);
        onOpenAddTransaction();
      },
    },
    {
      title: 'Step 2: Set Category Budgets',
      desc: 'Go to the Budgets tab to set monthly limits for Groceries, Rent, Dining out, or Transportation.',
      actionLabel: 'Go to Budgets Tab',
      onAction: () => {
        setTab('budgets');
      },
    },
    {
      title: 'Step 3: Track Savings Goals',
      desc: 'Create savings targets like Emergency Buffer, Vacation, or Debt Payoff in the Savings Goals tab.',
      actionLabel: 'Go to Savings Goals',
      onAction: () => {
        setTab('savings');
      },
    },
    {
      title: 'Step 4: AI Financial Health Scoring',
      desc: 'As you record transactions, your AI Financial Advisor calculates your Health Score and flags anomalies in real time.',
      actionLabel: 'View AI Insights',
      onAction: () => {
        setTab('insights');
      },
    },
  ];

  const handleSendMessage = (userText: string) => {
    if (!userText.trim()) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setInputQuery('');

    const lower = userText.toLowerCase();
    setTimeout(() => {
      let reply = '';
      let action: { label: string; tab?: string; triggerAdd?: boolean } | undefined;

      if (lower.includes('add') || lower.includes('transaction') || lower.includes('income') || lower.includes('expense')) {
        reply = 'To record a new income or expense, click the "+ Add Transaction" button at the top header or right below!';
        action = { label: '+ Add Transaction', triggerAdd: true };
      } else if (lower.includes('score') || lower.includes('health') || lower.includes('insight') || lower.includes('88')) {
        reply = `Your AI Health Score is calculated dynamically from your actual transactions and savings rate. Currently you have ${transactions.length} transactions logged.`;
        action = { label: 'Check AI Insights Tab', tab: 'insights' };
      } else if (lower.includes('budget') || lower.includes('limit')) {
        reply = 'You can set monthly budget limits for each category under the Budgets tab to receive alert warnings when approaching thresholds.';
        action = { label: 'Manage Category Budgets', tab: 'budgets' };
      } else if (lower.includes('export') || lower.includes('csv')) {
        reply = 'Go to the Transactions tab and click "Export CSV" to instantly download a spreadsheet of all your logged financial entries.';
        action = { label: 'Go to Transactions History', tab: 'transactions' };
      } else if (lower.includes('currency') || lower.includes('usd') || lower.includes('inr') || lower.includes('eur')) {
        reply = 'You can change your default currency (USD $, EUR €, GBP £, INR ₹, etc.) anytime under the Settings tab!';
        action = { label: 'Open Account Settings', tab: 'settings' };
      } else {
        reply = `I can help you navigate FinTrack Pro! Try adding your transactions, setting monthly budgets, or exporting data to CSV.`;
        action = { label: 'Explore Dashboard', tab: 'dashboard' };
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply, action }]);
    }, 400);
  };

  return (
    <>
      {/* Floating AI Bot Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-slate-950/20 flex items-center justify-center text-slate-950">
            <Bot className="w-4 h-4" />
          </div>
          <span>AI Advisor</span>
          {transactions.length === 0 && (
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute -top-1 -right-1" />
          )}
        </button>
      </div>

      {/* Floating AI Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] glass-card rounded-3xl border border-emerald-500/30 shadow-2xl overflow-hidden z-50 flex flex-col h-[520px] animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  FinTrack AI Guide <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </h4>
                <p className="text-[10px] text-slate-400">Interactive Workspace Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Guided Tour Banner */}
          {tutorialStep !== null && tutorialStep < tutorialSteps.length && (
            <div className="p-3.5 bg-emerald-950/40 border-b border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {tutorialSteps[tutorialStep].title}
                </span>
                <span className="text-[10px] text-slate-400">{tutorialStep + 1} / 4</span>
              </div>
              <p className="text-[11px] text-slate-300">{tutorialSteps[tutorialStep].desc}</p>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={tutorialSteps[tutorialStep].onAction}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1"
                >
                  {tutorialSteps[tutorialStep].actionLabel} <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setTutorialStep((prev) => (prev !== null && prev < 3 ? prev + 1 : null))}
                  className="text-[11px] text-slate-400 hover:text-slate-200 font-semibold"
                >
                  Next Step &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                    m.sender === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>

                {m.action && (
                  <button
                    onClick={() => {
                      if (m.action?.triggerAdd) {
                        setIsOpen(false);
                        onOpenAddTransaction();
                      } else if (m.action?.tab) {
                        setTab(m.action.tab);
                      } else {
                        setTutorialStep(0);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-bold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    {m.action.label} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Quick Preset Prompt Chips */}
          <div className="px-3 py-2 bg-slate-900/80 border-t border-slate-800 flex gap-2 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleSendMessage('How do I log a transaction?')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white whitespace-nowrap border border-slate-700/60"
            >
              💬 Add Transaction
            </button>
            <button
              onClick={() => handleSendMessage('How is my Health Score calculated?')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white whitespace-nowrap border border-slate-700/60"
            >
              💬 AI Health Score
            </button>
            <button
              onClick={() => handleSendMessage('How do I export to CSV?')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white whitespace-nowrap border border-slate-700/60"
            >
              💬 Export CSV
            </button>
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputQuery);
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask AI Assistant anything..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
