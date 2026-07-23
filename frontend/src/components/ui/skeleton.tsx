import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-6 w-full' }) => {
  return <div className={`animate-pulse rounded-lg bg-slate-800/80 ${className}`} />;
};
