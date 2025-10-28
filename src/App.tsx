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
import OnboardingStep1Modules from "./pages/OnboardingStep1Modules";
import OnboardingStep2Agents from "./pages/OnboardingStep2Agents";
import OnboardingStep3Bundles from "./pages/OnboardingStep3Bundles";
import AdminDashboard from "./pages/AdminDashboard";
import ClergyDashboard from "./pages/ClergyDashboard";
import ClergyPlanningDashboard from "./pages/ClergyPlanningDashboard";
import PhaseDetail from "./pages/PhaseDetail";
import CampaignCreationPage from "./pages/CampaignCreationPage";
import ChurchMembersPage from "./pages/ChurchMembersPage";
import StrategicPlansPage from "./pages/StrategicPlansPage";
import DocumentsPage from "./pages/DocumentsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ParishDashboard from "./pages/ParishDashboard";
import EventsPage from "./pages/EventsPage";
import ProfilePage from "./pages/ProfilePage";
import GroupsPage from "./pages/GroupsPage";
import ResourcesPage from "./pages/ResourcesPage";
import PrayerRequestsPage from "./pages/PrayerRequestsPage";
import ConnectPage from "./pages/ConnectPage";
import PurchasedModulesPage from "./pages/PurchasedModulesPage";
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
              path="/onboarding/step1-modules" 
              element={
                <ProtectedRoute>
                  <OnboardingStep1Modules />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/onboarding/step2-agents" 
              element={
                <ProtectedRoute>
                  <OnboardingStep2Agents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/onboarding/step3-bundles" 
              element={
                <ProtectedRoute>
                  <OnboardingStep3Bundles />
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
              path="/clergy/campaign/create" 
              element={
                <ProtectedRoute>
                  <CampaignCreationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clergy/members" 
              element={
                <ProtectedRoute>
                  <ChurchMembersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clergy/resources" 
              element={
                <ProtectedRoute>
                  <ResourcesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clergy/events" 
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clergy/strategic-plans" 
              element={
                <ProtectedRoute>
                  <StrategicPlansPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clergy/documents" 
              element={
                <ProtectedRoute>
                  <DocumentsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clergy/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
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
            <Route 
              path="/parish/events" 
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/parish/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/parish/groups" 
              element={
                <ProtectedRoute>
                  <GroupsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/parish/resources" 
              element={
                <ProtectedRoute>
                  <ResourcesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/parish/prayer-requests" 
              element={
                <ProtectedRoute>
                  <PrayerRequestsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/parish/connect" 
              element={
                <ProtectedRoute>
                  <ConnectPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/purchased-modules" 
              element={
                <ProtectedRoute>
                  <PurchasedModulesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clergy/purchased-modules" 
              element={
                <ProtectedRoute>
                  <PurchasedModulesPage />
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
