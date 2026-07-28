import React from 'react';
import {
  Wallet,
  Laptop,
  Home,
  ShoppingCart,
  Utensils,
  Car,
  Zap,
  ShoppingBag,
  ShieldCheck,
  Compass,
  Target,
  CreditCard,
  Building2,
  Briefcase,
  HeartPulse,
  Film,
  Sparkles,
  Package,
  LucideIcon,
} from 'lucide-react';

interface CategoryIconProps {
  icon?: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface IconConfig {
  icon: LucideIcon;
  bg: string;
  text: string;
  border: string;
}

export const getCategoryConfig = (iconStr?: string, nameStr?: string): IconConfig => {
  const key = `${iconStr || ''} ${nameStr || ''}`.toLowerCase();

  if (key.includes('salary') || key.includes('income') || key.includes('paycheck') || key.includes('💰')) {
    return {
      icon: Wallet,
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
    };
  }
  if (key.includes('freelance') || key.includes('design') || key.includes('consultancy') || key.includes('💻')) {
    return {
      icon: Laptop,
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
    };
  }
  if (key.includes('housing') || key.includes('rent') || key.includes('apartment') || key.includes('🏠')) {
    return {
      icon: Home,
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
    };
  }
  if (key.includes('groceries') || key.includes('food') || key.includes('market') || key.includes('🛒')) {
    return {
      icon: ShoppingCart,
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
    };
  }
  if (key.includes('dining') || key.includes('cafe') || key.includes('restaurant') || key.includes('bistro') || key.includes('🍔')) {
    return {
      icon: Utensils,
      bg: 'bg-pink-500/15',
      text: 'text-pink-400',
      border: 'border-pink-500/30',
    };
  }
  if (key.includes('transport') || key.includes('car') || key.includes('uber') || key.includes('gas') || key.includes('🚗')) {
    return {
      icon: Car,
      bg: 'bg-cyan-500/15',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
    };
  }
  if (key.includes('utilities') || key.includes('bills') || key.includes('electric') || key.includes('power') || key.includes('⚡')) {
    return {
      icon: Zap,
      bg: 'bg-indigo-500/15',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
    };
  }
  if (key.includes('shopping') || key.includes('store') || key.includes('clothes') || key.includes('🛍️')) {
    return {
      icon: ShoppingBag,
      bg: 'bg-lime-500/15',
      text: 'text-lime-400',
      border: 'border-lime-500/30',
    };
  }
  if (key.includes('emergency') || key.includes('buffer') || key.includes('reserve') || key.includes('🛡️')) {
    return {
      icon: ShieldCheck,
      bg: 'bg-teal-500/15',
      text: 'text-teal-400',
      border: 'border-teal-500/30',
    };
  }
  if (key.includes('japan') || key.includes('vacation') || key.includes('travel') || key.includes('trip') || key.includes('🏯')) {
    return {
      icon: Compass,
      bg: 'bg-purple-500/15',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
    };
  }
  if (key.includes('goal') || key.includes('target') || key.includes('🎯')) {
    return {
      icon: Target,
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
    };
  }
  if (key.includes('health') || key.includes('medical') || key.includes('pharmacy') || key.includes('💊')) {
    return {
      icon: HeartPulse,
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      border: 'border-red-500/30',
    };
  }
  if (key.includes('entertainment') || key.includes('movie') || key.includes('netflix') || key.includes('🎬')) {
    return {
      icon: Film,
      bg: 'bg-violet-500/15',
      text: 'text-violet-400',
      border: 'border-violet-500/30',
    };
  }

  return {
    icon: CreditCard,
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700/60',
  };
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  icon,
  name,
  className = '',
  size = 'md',
}) => {
  const config = getCategoryConfig(icon, name);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg border text-xs',
    md: 'w-10 h-10 rounded-xl border text-sm',
    lg: 'w-12 h-12 rounded-2xl border text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 transition-transform ${sizeClasses[size]} ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <IconComponent className={iconSizes[size]} />
    </div>
  );
};
