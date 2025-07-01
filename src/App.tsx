// vizuara-ai-learning-lab-main/src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext"; // Global Theme Provider
import { Analytics } from '@vercel/analytics/react';

import Index from "./pages/Index"; // This will be our new landing/module selection page
import Dashboard from "./pages/Dashboard";
// import Learning from "./pages/Learning"; // Old Learning page, will be replaced
import LearningModulePage from "./pages/LearningModulePage"; // NEW dynamic module page
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AdminDashboard } from "./components/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider> {/* Global ThemeProvider wraps everything */}
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* <Route path="/learning" element={<Learning />} />  OLD - REMOVE or COMMENT OUT */}
                <Route path="/learning/:moduleSlug" element={<LearningModulePage />} /> {/* NEW */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
    <Analytics />
  </>
);

export default App;