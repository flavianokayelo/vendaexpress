import { lazy, Suspense } from 'react';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './components/ui/Toast';
import { PageLoader } from './components/ui/Feedback';
import { useHashRoute, matchRoute } from './lib/router';

const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })),
);
const SignupPage = lazy(() =>
  import('./pages/SignupPage').then((m) => ({ default: m.SignupPage })),
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import('./pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const StorefrontPage = lazy(() =>
  import('./pages/StorefrontPage').then((m) => ({ default: m.StorefrontPage })),
);
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })),
);
const CategoryPage = lazy(() =>
  import('./pages/CategoryPage').then((m) => ({ default: m.CategoryPage })),
);
const SearchPage = lazy(() =>
  import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })),
);
const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })),
);

function Router() {
  const [route, navigate] = useHashRoute();
  const path = route.path;

  // /s/:slug/products/:id — public product detail
  const productParams = matchRoute('/s/:slug/products/:id', path);
  if (productParams) {
    return (
      <ProductDetailPage slug={productParams.slug} productId={productParams.id} navigate={navigate} />
    );
  }

  // /s/:slug/categories/:categoryId — public category listing
  const categoryParams = matchRoute('/s/:slug/categories/:categoryId', path);
  if (categoryParams) {
    return (
      <CategoryPage slug={categoryParams.slug} categoryId={categoryParams.categoryId} navigate={navigate} />
    );
  }

  // /s/:slug/search?q= — public search
  const searchParams = matchRoute('/s/:slug/search', path);
  if (searchParams) {
    return (
      <SearchPage slug={searchParams.slug} query={route.query.get('q') || ''} navigate={navigate} />
    );
  }

  // /s/:slug — public storefront
  const storeParams = matchRoute('/s/:slug', path);
  if (storeParams) return <StorefrontPage slug={storeParams.slug} navigate={navigate} />;

  // /signup
  if (path === '/signup') {
    const planId = route.query.get('plan') || undefined;
    return <SignupPage navigate={navigate} planId={planId} />;
  }

  // /login
  if (path === '/login') return <LoginPage navigate={navigate} />;

  // /app — merchant dashboard
  if (path === '/app') return <DashboardPage navigate={navigate} />;

  // /admin — super admin
  if (path === '/admin') return <AdminPage navigate={navigate} />;

  // default — landing
  return <LandingPage navigate={navigate} />;
}

function ThemedApp() {
  return (
    <ToastProvider>
      <Suspense fallback={<PageLoader />}>
        <Router />
      </Suspense>
    </ToastProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemedApp />
    </AuthProvider>
  );
}

export default App;