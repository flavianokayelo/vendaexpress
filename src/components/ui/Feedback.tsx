import { type ReactNode } from 'react';
import {
  Loader2,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  BarChart3,
  Search,
  Filter,
  FileQuestion,
  Store,
} from 'lucide-react';
import { Surface } from './Surface';
import { useAuth } from '../../lib/auth';

export function Spinner({ className = '', label }: { className?: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className={`animate-spin ${className}`} size={20} />
      {label && <span className="font-mono text-[13px] text-ink-2">{label}</span>}
    </span>
  );
}

export function PageLoader() {
  const { store } = useAuth();
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5">
      <div className="relative">
        <div
          className="animate-sf-loader-pop flex h-14 w-14 items-center justify-center bg-ink text-paper"
          style={{ borderRadius: '2px' }}
        >
          <Store size={24} />
        </div>
        <span className="absolute -right-1.5 -top-1.5 h-3 w-3 bg-accent" style={{ borderRadius: '1px' }} />
      </div>

      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-bold tracking-wide text-ink">
          {store?.name ?? 'VendaExpress'}
        </span>
      </div>

      <div className="relative h-px w-40 overflow-hidden bg-ink/10">
        <div className="animate-sf-loader-swipe absolute inset-y-0 left-0 w-1/3 bg-ink" />
      </div>

      <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-2">
        A carregar
      </span>
    </div>
  );
}

export type EmptyStateType =
  | 'products'
  | 'orders'
  | 'customers'
  | 'coupons'
  | 'analytics'
  | 'search'
  | 'filter'
  | 'notFound';

const EMPTY_ICON: Record<EmptyStateType, ReactNode> = {
  products: <Package size={24} />,
  orders: <ShoppingCart size={24} />,
  customers: <Users size={24} />,
  coupons: <Ticket size={24} />,
  analytics: <BarChart3 size={24} />,
  search: <Search size={24} />,
  filter: <Filter size={24} />,
  notFound: <FileQuestion size={24} />,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  type,
  size = 'md',
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  type?: EmptyStateType;
  size?: 'sm' | 'md';
}) {
  const iconNode = icon ?? (type ? EMPTY_ICON[type] : null);
  const padding = size === 'sm' ? 'px-6 py-10' : 'px-6 py-16';
  return (
    <Surface
      className={`flex flex-col items-center justify-center border-dashed bg-paper px-6 text-center ${padding}`}
    >
      {iconNode && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center ring-1 ring-inset ring-ink/10 bg-ink/[0.04] text-ink-2" style={{ borderRadius: '2px' }}>
          {iconNode}
        </div>
      )}
      <h3 className="font-heading text-base font-bold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-2">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </Surface>
  );
}