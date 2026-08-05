// =============================================================================
// SearchPage — wrapper fino da rota /s/:slug/search?q=.
// A fetchar e a derivar dados está a cargo do StorefrontRoutePage; aqui apenas
// descrevemos a rota e delegamos o render ao tema (getThemePage → "Search").
// =============================================================================
import type { StorefrontRoute } from "../storefront/contract";
import { StorefrontRoutePage } from "./StorefrontRoutePage";

export function SearchPage({
  slug,
  query,
  navigate,
}: {
  slug: string;
  query: string;
  navigate: (to: string) => void;
}) {
  const route: StorefrontRoute = { kind: "search", query };
  return <StorefrontRoutePage slug={slug} navigate={navigate} route={route} />;
}