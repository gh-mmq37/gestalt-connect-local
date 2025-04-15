
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";
import { PublicHome } from "./pages/PublicHome";
import { NostrFeed } from "./pages/NostrFeed";
import { Community } from "./pages/Community";
import { Profile } from "./pages/Profile";
import { Groups } from "./pages/Groups";
import { Interests } from "./pages/Interests";
import { Explore } from "./pages/Explore";
import { Contribute } from "./pages/Contribute";
import { Settings } from "./pages/Settings";
import { Onboarding } from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { NostrProvider } from "./contexts/NostrContext";
import { Search } from "./pages/Search";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [onboardingComplete] = useLocalStorage("onboardingComplete", false);

  return (
    <QueryClientProvider client={queryClient}>
      <NostrProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Home - Accessible without onboarding */}
              <Route path="/" element={!onboardingComplete ? <PublicHome /> : <Navigate to="/feed" replace />} />
              
              {/* Onboarding Route */}
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Authenticated Routes - Require onboarding */}
              <Route 
                path="/" 
                element={onboardingComplete ? <MainLayout /> : <Navigate to="/" replace />}
              >
                <Route path="/feed" element={<NostrFeed />} />
                <Route path="/community" element={<Community />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/interests" element={<Interests />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:npub" element={<Profile />} />
                <Route path="/contribute" element={<Contribute />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/search" element={<Search />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NostrProvider>
    </QueryClientProvider>
  );
};

export default App;
