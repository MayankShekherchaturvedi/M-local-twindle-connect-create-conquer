import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Main Pages
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Community Pages
import Community from "./pages/Community";
import CommunityDetail from "./pages/CommunityDetail";

// Connect Pages (Projects & Startups)
import Connect from "./pages/Connect";
import CreateProject from "./pages/connect/CreateProject";
import ProjectDetails from "./pages/connect/ProjectDetails";
import CreateStartup from "./pages/connect/CreateStartup";
import StartupDetails from "./pages/connect/StartupDetails";
import ManageApplications from "./pages/connect/ManageApplications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Connect Section Routes */}
            <Route path="/connect" element={<Connect />} />
            <Route path="/connect/create-project" element={<CreateProject />} />
            <Route path="/connect/projects/:projectId" element={<ProjectDetails />} />
            <Route path="/connect/create-startup" element={<CreateStartup />} />
            <Route path="/connect/startups/:startupId" element={<StartupDetails />} />
            <Route path="/connect/projects/:id/applications" element={<ManageApplications />} />
            <Route path="/connect/startups/:id/applications" element={<ManageApplications />} />
            
            {/* Community Section Routes */}
            <Route path="/community" element={<Community />} />
            <Route path="/community/:id" element={<CommunityDetail />} />
            
            {/* Other Routes */}
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth/*" element={<Auth />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
