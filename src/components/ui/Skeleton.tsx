export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-[2px] bg-ink/[0.06] ${className}`}
    />
  );
}

export function SkeletonText({
  className = "",
  lines = 1,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

export function SkeletonCircle({ className = "" }: { className?: string }) {
  return <Skeleton className={`rounded-full ${className}`} />;
}

export function SkeletonImage({ className = "" }: { className?: string }) {
  return <Skeleton className={`aspect-[4/3] ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-[2px] border border-border bg-paper p-5 shadow-card ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <SkeletonCircle className="h-9 w-9" />
      </div>
      <Skeleton className="mt-3 h-6 w-24" />
    </div>
  );
}

export function SkeletonStatCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-[2px] border border-border bg-paper p-5 shadow-card ${className}`}>
      <div className="flex items-center justify-between">
        <SkeletonText className="w-full max-w-[90px]" />
        <SkeletonCircle className="h-9 w-9" />
      </div>
      <Skeleton className="mt-3 h-7 w-20" />
    </div>
  );
}

export function SkeletonProductCard({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[2px] border border-border bg-paper shadow-card ${className}`}>
      <SkeletonImage className="rounded-none" />
      <div className="p-3">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-2 h-4 w-1/3" />
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <SkeletonCircle className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonProductGrid({ count = 6, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStatsGrid({ count = 4, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

/** Placeholder de um card de produto da loja pública (grid denso tipo Shopee). */
export function SkeletonStorefrontCard({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[3px] border border-ink/[0.06] ${className}`}>
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-1.5 p-2">
        <Skeleton className="h-2.5 w-4/5" />
        <Skeleton className="h-3.5 w-1/2" />
      </div>
    </div>
  );
}

/** Esqueleto da home da loja pública — espelha Header/Hero/categorias/grade
 * de produtos, mostrado antes do tema da loja (cores) estar disponível. */
export function StorefrontHomeSkeleton() {
  return (
    <div className="min-h-screen bg-white" aria-hidden="true">
      <div className="bg-ink/[0.06] px-4 py-2.5" style={{ minHeight: 74 }}>
        <div className="mx-auto flex max-w-[1240px] items-center gap-4">
          <Skeleton className="h-9 w-9 flex-shrink-0 rounded-[9px] bg-ink/10" />
          <Skeleton className="hidden h-6 w-32 sm:block bg-ink/10" />
          <Skeleton className="h-9 flex-1 rounded-[3px] bg-ink/10 sm:h-10" />
          <Skeleton className="h-6 w-6 flex-shrink-0 rounded-full bg-ink/10" />
          <Skeleton className="h-6 w-6 flex-shrink-0 rounded-full bg-ink/10" />
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-2 pt-2 sm:px-4">
        <Skeleton className="h-[clamp(150px,24vw,300px)] w-full rounded-[6px]" />
      </div>

      <div className="mx-auto max-w-[1240px] px-2 pt-4 sm:px-4">
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-shrink-0 flex-col items-center gap-1.5">
              <SkeletonCircle className="h-12 w-12 sm:h-14 sm:w-14" />
              <Skeleton className="h-2 w-10" />
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-2 pt-6 sm:px-4">
        <Skeleton className="mb-2.5 h-4 w-32" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonStorefrontCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Esqueleto da página de produto — galeria + coluna de informação. */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white" aria-hidden="true">
      <Skeleton className="h-[52px] w-full rounded-none bg-ink/[0.08]" />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-[10px]" />
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="mt-6 h-11 w-full rounded-[3px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Esqueleto da página de categoria — breadcrumb + carrossel + grade. */
export function CategoryPageSkeleton() {
  return (
    <div className="min-h-screen bg-white" aria-hidden="true">
      <Skeleton className="h-[52px] w-full rounded-none bg-ink/[0.08]" />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Skeleton className="mb-4 h-3 w-40" />
        <div className="mb-6 flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCircle key={i} className="h-12 w-12 flex-shrink-0 sm:h-14 sm:w-14" />
          ))}
        </div>
        <div className="mb-6 flex items-center gap-3">
          <SkeletonCircle className="h-11 w-11" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonStorefrontCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonTableRows({
  rows = 5,
  cols = 4,
  className = "",
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-[2px] border border-border bg-paper shadow-card ${className}`}>
      <div className="flex items-center gap-4 border-b border-border bg-accent-soft/30 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-2.5" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className={`h-3 ${c === 0 ? "w-1/4" : c === cols - 1 ? "w-1/6" : "w-1/5"}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}