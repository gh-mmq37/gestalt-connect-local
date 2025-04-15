
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";
import { Home } from "./pages/Home";
import { Community } from "./pages/Community";
import { Profile } from "./pages/Profile";
import { Onboarding } from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import { useLocalStorage } from "./hooks/useLocalStorage";

const queryClient = new QueryClient();

const App = () => {
  const [onboardingComplete] = useLocalStorage("onboardingComplete", false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect to onboarding if not completed */}
            <Route
              path="/"
              element={
                !onboardingComplete ? (
                  <Navigate to="/onboarding" replace />
                ) : (
                  <MainLayout />
                )
              }
            >
              <Route index element={<Home />} />
              <Route path="/community" element={<Community />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
