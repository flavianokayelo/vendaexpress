import { AuthProvider } from './lib/auth';
import { useHashRoute, matchRoute } from './lib/router';
import { LandingPage } from './pages/LandingPage';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { StorefrontPage } from './pages/StorefrontPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AdminPage } from './pages/AdminPage';

function Router() {
  const [route, navigate] = useHashRoute();
  const path = route.path;

  // /s/:slug/products/:id — public product detail
  const productParams = matchRoute('/s/:slug/products/:id', path);
  if (productParams) {
    return <ProductDetailPage slug={productParams.slug} productId={productParams.id} navigate={navigate} />;
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

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;