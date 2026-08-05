// =============================================================================
// CategoryPage — wrapper fino da rota /s/:slug/categories/:categoryId.
// A fetchar e a derivar dados está a cargo do StorefrontRoutePage; aqui apenas
// descrevemos a rota e delegamos o render ao tema (getThemePage → "Category").
// =============================================================================
import type { StorefrontRoute } from "../storefront/contract";
import { StorefrontRoutePage } from "./StorefrontRoutePage";

export function CategoryPage({
  slug,
  categoryId,
  navigate,
}: {
  slug: string;
  categoryId: string;
  navigate: (to: string) => void;
}) {
  const route: StorefrontRoute = { kind: "category", categoryId };
  return <StorefrontRoutePage slug={slug} navigate={navigate} route={route} />;
}