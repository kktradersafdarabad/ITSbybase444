import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import CustomDomainRouter from './components/CustomDomainRouter';
import { isCustomDomain } from './lib/customDomain';

// Pages
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import WelcomePage from './pages/WelcomePage';
import BookingForm from './pages/BookingForm';
import BookingStatus from './pages/BookingStatus';
import DriverPortal from './pages/DriverPortal';
import TenantBookingForm from './pages/TenantBookingForm';
import TenantDriverPortal from './pages/TenantDriverPortal';
import DriverApp from './pages/DriverApp';
import PaymentPage from './pages/PaymentPage';
import Dashboard from './pages/admin/Dashboard';
import Bookings from './pages/admin/Bookings';
import Fleet from './pages/admin/Fleet';
import Drivers from './pages/admin/Drivers';
import AdminRoutes from './pages/admin/Routes';
import Promos from './pages/admin/Promos';
import Settings from './pages/admin/Settings';
import Tenants from './pages/admin/Tenants';
import TenantDashboard from './pages/admin/TenantDashboard';
import FormBuilder from './pages/admin/FormBuilder';
import Integrations from './pages/admin/Integrations';
// Tenant sub-pages
import TenantAdminDashboard from './pages/tenant/TenantAdminDashboard';
import TenantHome from './pages/tenant/TenantHome';
import TenantBookings from './pages/tenant/TenantBookings';
import TenantFleet from './pages/tenant/TenantFleet';
import TenantDrivers from './pages/tenant/TenantDrivers';
import TenantRoutes from './pages/tenant/TenantRoutes';
import TenantPromos from './pages/tenant/TenantPromos';
import TenantFormBuilderPage from './pages/tenant/TenantFormBuilderPage';
import TenantEmbed from './pages/tenant/TenantEmbed';
import TenantSettings from './pages/tenant/TenantSettings';
import TenantFareSettings from './pages/tenant/TenantFareSettings';
import TenantIntegrations from './pages/tenant/TenantIntegrations';
import TenantFormTemplates from './pages/tenant/TenantFormTemplates';
import TenantReviews from './pages/tenant/TenantReviews';
import TenantFleetMap from './pages/tenant/TenantFleetMap';
import TenantPayouts from './pages/tenant/TenantPayouts';

// Layout
import AdminLayout from './components/layout/AdminLayout';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Custom domain detection — agar custom domain hai to CustomDomainRouter handle kare
  if (isCustomDomain()) {
    return <CustomDomainRouter />;
  }

  // These paths are fully public — no auth check needed
  const path = window.location.pathname;
  const isPublicRoute =
    path.startsWith('/book/') ||
    path.startsWith('/driver/') ||
    path.startsWith('/pay/');

  if (!isPublicRoute && (isLoadingPublicSettings || isLoadingAuth)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isPublicRoute && authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/super-admin" element={<SuperAdminDashboard />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/book" element={<BookingForm />} />
      <Route path="/book/:slug" element={<TenantBookingForm />} />
      <Route path="/booking/status" element={<BookingStatus />} />
      <Route path="/driver" element={<DriverPortal />} />
      <Route path="/driver/:slug" element={<DriverApp />} />
      <Route path="/pay/:slug" element={<PaymentPage />} />

      {/* Admin Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/bookings" element={<Bookings />} />
        <Route path="/admin/fleet" element={<Fleet />} />
        <Route path="/admin/drivers" element={<Drivers />} />
        <Route path="/admin/routes" element={<AdminRoutes />} />
        <Route path="/admin/promos" element={<Promos />} />
        <Route path="/admin/tenants" element={<Tenants />} />
        <Route path="/admin/tenants/:slug" element={<TenantDashboard />} />
        <Route path="/admin/form-builder" element={<FormBuilder />} />
        <Route path="/admin/integrations" element={<Integrations />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>

      {/* Per-Tenant Full Dashboard Routes */}
      <Route path="/tenant/:slug" element={<TenantAdminDashboard />}>
        <Route path="dashboard" element={<TenantHome />} />
        <Route path="bookings" element={<TenantBookings />} />
        <Route path="fleet" element={<TenantFleet />} />
        <Route path="drivers" element={<TenantDrivers />} />
        <Route path="routes" element={<TenantRoutes />} />
        <Route path="promos" element={<TenantPromos />} />
        <Route path="form-builder" element={<TenantFormBuilderPage />} />
        <Route path="templates" element={<TenantFormTemplates />} />
        <Route path="embed" element={<TenantEmbed />} />
        <Route path="fare" element={<TenantFareSettings />} />
        <Route path="integrations" element={<TenantIntegrations />} />
        <Route path="settings" element={<TenantSettings />} />
        <Route path="reviews" element={<TenantReviews />} />
        <Route path="fleet-map" element={<TenantFleetMap />} />
        <Route path="payouts" element={<TenantPayouts />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App