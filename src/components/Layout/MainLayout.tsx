
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
  const [onboardingComplete] = useLocalStorage("onboardingComplete", false);
  const [onboardingData] = useLocalStorage("onboardingData", null);
  const { keys, refreshProfileData, refreshFollows } = useNostr();

  useEffect(() => {
    // Show welcome toast when a user first arrives after completing onboarding
    if (onboardingComplete && onboardingData) {
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
  }, [onboardingComplete, onboardingData]);

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
