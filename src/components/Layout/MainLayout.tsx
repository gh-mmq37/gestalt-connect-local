
import React, { useEffect } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { Navigation } from "./Navigation";
import { WellnessReminder } from "../Wellness/WellnessReminder";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { toast } from "@/components/ui/use-toast";

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [onboardingComplete] = useLocalStorage("onboardingComplete", false);
  const [onboardingData] = useLocalStorage("onboardingData", null);

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

  // Redirect to onboarding if not complete
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  // Check if we have valid Nostr keys
  if (!onboardingData?.nostrKeys) {
    console.error("No Nostr keys found. Redirecting to onboarding.");
    return <Navigate to="/onboarding" replace />;
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
