import { type ReactNode } from 'react';

export function Badge({ children, color = 'ink' }: { children: ReactNode; color?: 'ink' | 'green' | 'amber' | 'red' | 'blue' }) {
  const colors = {
    ink: 'bg-ink/5 text-ink border-ink/10',
    green: 'bg-green-50 text-green-800 border-green-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    red: 'bg-red-50 text-red-800 border-red-200',
    blue: 'bg-accent-soft text-primary border-primary/10',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-[3px] font-mono text-[11px] font-semibold leading-none border ${colors[color]}`} style={{ borderRadius: '2px' }}>
      {children}
    </span>
  );
}
