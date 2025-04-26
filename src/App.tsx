import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "@/pages/Dashboard";
import ChequeManagement from "@/pages/ChequeManagement";
import CashManagement from "@/pages/CashManagement";
import DigitalManagement from "@/pages/DigitalManagement";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Verify from "@/pages/auth/Verify";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SearchResultsPage from "@/pages/SearchResultsPage";
import ResetPassword from "@/pages/reset-password"; // ✅ Correct import

const queryClient = new QueryClient();

// Private route component for authentication check
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  return children;
}

const App = () => {
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/verify" element={<Verify />} />
              <Route path="/reset-password" element={<ResetPassword />} /> {/* Separate Reset Route */}

              {/* Protected Routes wrapped in MainLayout */}
              <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/cheques" element={<ChequeManagement />} />
                <Route path="/cash" element={<CashManagement />} />
                <Route path="/digital" element={<DigitalManagement />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/search" element={<SearchResultsPage />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
