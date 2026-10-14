import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { isRestaurantProfileComplete } from "@/lib/restaurantProfile";
import Index from "./pages/Index";
import MealsPage from "./pages/MealsPage";
import OrdersPage from "./pages/OrdersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import RestaurantPage from "./pages/RestaurantPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminAccessDenied from "./pages/admin/AdminAccessDenied";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRestaurantsPage from "./pages/admin/AdminRestaurantsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminListingsPage from "./pages/admin/AdminListingsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminAuditLogPage from "./pages/admin/AdminAuditLogPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import "./i18n";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, syncing, restaurant, isAdmin } = useAuth();
  const location = useLocation();
  if (loading || syncing) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Admin accounts operate the platform, not a restaurant.
  if (isAdmin) return <Navigate to="/admin" replace />;

  const onRestaurant = location.pathname === "/restaurant";
  if (!isRestaurantProfileComplete(restaurant) && !onRestaurant) {
    return <Navigate to="/restaurant" replace />;
  }

  return <>{children}</>;
};

/**
 * Frontend gate for /admin routes. Real enforcement lives in Supabase:
 * admin RLS policies and RPCs validate is_admin() server-side, so a
 * non-admin who bypasses this component still gets no data.
 */
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdminAuthenticated, loading } = useAdminAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdminAuthenticated) return <AdminAccessDenied />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, loading, restaurant, isAdmin } = useAuth();
  const { isAdminAuthenticated } = useAdminAuth();

  if (loading) return null;

  const profileComplete = isRestaurantProfileComplete(restaurant);
  const postLoginPath = isAdmin ? "/admin" : profileComplete ? "/" : "/restaurant";

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={postLoginPath} replace /> : <LoginPage />}
      />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/listings" element={<ProtectedRoute><MealsPage /></ProtectedRoute>} />
      <Route path="/meals" element={<ProtectedRoute><MealsPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/restaurant" element={<ProtectedRoute><RestaurantPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      <Route
        path="/admin/login"
        element={isAdminAuthenticated ? <Navigate to="/admin" replace /> : <AdminLoginPage />}
      />
      <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/restaurants" element={<ProtectedAdminRoute><AdminRestaurantsPage /></ProtectedAdminRoute>} />
      <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsersPage /></ProtectedAdminRoute>} />
      <Route path="/admin/listings" element={<ProtectedAdminRoute><AdminListingsPage /></ProtectedAdminRoute>} />
      <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminOrdersPage /></ProtectedAdminRoute>} />
      <Route path="/admin/analytics" element={<ProtectedAdminRoute><AdminAnalyticsPage /></ProtectedAdminRoute>} />
      <Route path="/admin/audit" element={<ProtectedAdminRoute><AdminAuditLogPage /></ProtectedAdminRoute>} />
      <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettingsPage /></ProtectedAdminRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
