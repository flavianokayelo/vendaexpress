import { lazy, Suspense, useState, type ReactNode } from "react";
import { useAuth } from "../../lib/auth";
import { DashboardShell, type DashPage } from "./Shell";
import { TrialBanner } from "../../components/TrialBanner";
import { PageLoader } from "../../components/ui/Feedback";
import { Button } from "../../components/ui/Button";
import { PageTransition } from "../../components/ui/Animation";
import { SkeletonProductGrid, SkeletonStatsGrid, SkeletonTableRows } from "../../components/ui/Skeleton";
import { Store } from "lucide-react";

const OverviewPage = lazy(() =>
  import("./OverviewPage").then((m) => ({ default: m.OverviewPage })),
);
const ProductsPage = lazy(() =>
  import("./ProductsPage").then((m) => ({ default: m.ProductsPage })),
);
const CategoriesPage = lazy(() =>
  import("./CategoriesPage").then((m) => ({ default: m.CategoriesPage })),
);
const OrdersPage = lazy(() =>
  import("./OrdersPage").then((m) => ({ default: m.OrdersPage })),
);
const CustomersPage = lazy(() =>
  import("./CustomersPage").then((m) => ({ default: m.CustomersPage })),
);
const CouponsPage = lazy(() =>
  import("./CouponsPage").then((m) => ({ default: m.CouponsPage })),
);
const AppearancePage = lazy(() =>
  import("./AppearancePage").then((m) => ({ default: m.AppearancePage })),
);
const ThemesPage = lazy(() =>
  import("./ThemesPage").then((m) => ({ default: m.ThemesPage })),
);
const SettingsPage = lazy(() =>
  import("./SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const BuilderPageView = lazy(() =>
  import("./BuilderPageView").then((m) => ({ default: m.BuilderPageView })),
);

const PAGE_SKELETON: Record<DashPage, ReactNode> = {
  overview: <SkeletonStatsGrid />,
  products: <SkeletonProductGrid />,
  categories: <SkeletonTableRows rows={5} cols={4} />,
  orders: <SkeletonTableRows rows={6} cols={6} />,
  customers: <SkeletonTableRows rows={6} cols={5} />,
  coupons: <SkeletonProductGrid count={3} />,
  appearance: <PageLoader />,
  themes: <PageLoader />,
  settings: <PageLoader />,
};

export function DashboardPage({
  navigate,
}: {
  navigate: (to: string) => void;
}) {
  const { user, store, loading } = useAuth();
  const [page, setPage] = useState<DashPage>("overview");
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  if (loading) return <PageLoader />;

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 text-white">
          <Store size={28} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          Ainda não tens uma loja
        </h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Cria a tua loja para começares a vender online.
        </p>
        <Button className="mt-6" onClick={() => navigate("/signup")}>
          Criar minha loja
        </Button>
      </div>
    );
  }

  // Modo editor a ecrã inteiro (fora do Shell)
  if (editingPageId !== null) {
    return (
      <Suspense fallback={<PageLoader />}>
        <BuilderPageView
          pageId={editingPageId}
          onClose={() => setEditingPageId(null)}
        />
      </Suspense>
    );
  }

  return (
    <DashboardShell page={page} onNavigate={setPage}>
      {/* Aviso de teste/expiração — aparece em TODAS as páginas do painel
          e não tem botão de fechar. Só desaparece quando o plano for pago. */}
      <PageTransition animateKey={page}>
        <TrialBanner />

        <Suspense fallback={PAGE_SKELETON[page]}>
          {page === "overview" && <OverviewPage onGoToTab={setPage} />}
          {page === "products" && <ProductsPage />}
          {page === "categories" && <CategoriesPage />}
          {page === "orders" && <OrdersPage />}
          {page === "customers" && <CustomersPage />}
          {page === "coupons" && <CouponsPage />}
          {page === "appearance" && <AppearancePage />}
          {page === "themes" && <ThemesPage />}
          {page === "settings" && <SettingsPage />}
        </Suspense>
      </PageTransition>
    </DashboardShell>
  );
}
