import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import AdminDashboard from "./pages/AdminDashboard";
import ClergyDashboard from "./pages/ClergyDashboard";
import ClergyPlanningDashboard from "./pages/ClergyPlanningDashboard";
import PhaseDetail from "./pages/PhaseDetail";
import ParishDashboard from "./pages/ParishDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clergy" 
              element={
                <ProtectedRoute>
                  <ClergyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clergy/planning" 
              element={
                <ProtectedRoute>
                  <ClergyPlanningDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clergy/phase/:phaseNumber" 
              element={
                <ProtectedRoute>
                  <PhaseDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/parish" 
              element={
                <ProtectedRoute>
                  <ParishDashboard />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
