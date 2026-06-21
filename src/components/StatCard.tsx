import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-xl bg-brand-50 px-5 py-4 dark:bg-surface-800">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
          {label}
        </span>
        {icon && <span className="text-brand-500">{icon}</span>}
      </div>
      <div className="mt-1.5 text-2xl font-bold text-brand-900 dark:text-brand-100">{value}</div>
    </div>
  );
}
