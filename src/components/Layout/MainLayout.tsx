
import React, { useEffect } from "react";
import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Navigation } from "./Navigation";
import { WellnessReminder } from "../Wellness/WellnessReminder";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { toast } from "@/components/ui/use-toast";
import { useNostr } from "../../hooks/useNostr";

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [onboardingComplete, setOnboardingComplete] = useLocalStorage("onboardingComplete", false);
  const [onboardingData, setOnboardingData] = useLocalStorage("onboardingData", null);
  const { keys, refreshProfileData, refreshFollows } = useNostr();

  useEffect(() => {
    // Check if we need to redirect to onboarding
    if (!onboardingComplete || !onboardingData?.nostrKeys) {
      if (location.pathname !== "/") {
        // Only show toast if we're not already on the landing page
        toast({
          title: "Welcome to Gestalt",
          description: "Please complete the onboarding process to get started.",
          duration: 5000,
        });
      }
      // Redirect to onboarding
      navigate("/", { replace: true });
    } else {
      // Show welcome toast when a user first arrives after completing onboarding
      const hasShownWelcome = sessionStorage.getItem("hasShownWelcome");
      if (!hasShownWelcome) {
        toast({
          title: "Welcome to Gestalt!",
          description: "Your community hub is ready for you to explore.",
          duration: 5000,
        });
        sessionStorage.setItem("hasShownWelcome", "true");
      }
    }
  }, [onboardingComplete, onboardingData, location.pathname]);

  // Refresh Nostr data when layout mounts
  useEffect(() => {
    if (keys?.publicKey) {
      refreshProfileData();
      refreshFollows();
    }
  }, [keys]);

  // Redirect to onboarding if not complete
  if (!onboardingComplete) {
    return <Navigate to="/" replace />;
  }

  // Check if we have valid Nostr keys
  if (!onboardingData?.nostrKeys) {
    console.error("No Nostr keys found. Redirecting to onboarding.");
    return <Navigate to="/" replace />;
  }

  // If user navigates to root, redirect to feed
  if (location.pathname === '/') {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto py-6 px-4 sm:px-6 animate-fade-in">
        <Outlet />
      </main>
      <WellnessReminder />
    </div>
  );
};
