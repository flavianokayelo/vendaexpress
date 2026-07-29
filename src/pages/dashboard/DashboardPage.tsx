import { useState } from "react";
import { useAuth } from "../../lib/auth";
import { DashboardShell, type DashPage } from "./Shell";
import { OverviewPage } from "./OverviewPage";
import { ProductsPage } from "./ProductsPage";
import { CategoriesPage } from "./CategoriesPage";
import { OrdersPage } from "./OrdersPage";
import { CustomersPage } from "./CustomersPage";
import { CouponsPage } from "./CouponsPage";
import { AppearancePage } from "./AppearancePage";
import { ThemesPage } from "./ThemesPage";
import { SettingsPage } from "./SettingsPage";
import { PagesPage } from "./PagesPage";
import { BuilderPageView } from "./BuilderPageView";
import { TrialBanner } from "../../components/TrialBanner";
import { PageLoader } from "../../components/ui/Feedback";
import { Button } from "../../components/ui/Button";
import { Store } from "lucide-react";

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
      <BuilderPageView
        pageId={editingPageId}
        onClose={() => setEditingPageId(null)}
      />
    );
  }

  return (
    <DashboardShell page={page} onNavigate={setPage}>
      {/* Aviso de teste/expiração — aparece em TODAS as páginas do painel
          e não tem botão de fechar. Só desaparece quando o plano for pago. */}
      <TrialBanner />

      {page === "overview" && (
        <OverviewPage navigate={navigate} onGoToTab={setPage} />
      )}
      {page === "products" && <ProductsPage />}
      {page === "categories" && <CategoriesPage />}
      {page === "orders" && <OrdersPage />}
      {page === "customers" && <CustomersPage />}
      {page === "coupons" && <CouponsPage />}
      {page === "pages" && (
        <PagesPage onEditPage={(id) => setEditingPageId(id)} />
      )}
      {page === "appearance" && <AppearancePage />}
      {page === "themes" && <ThemesPage />}
      {page === "settings" && <SettingsPage />}
    </DashboardShell>
  );
}
