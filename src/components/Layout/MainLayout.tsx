
import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Navigation } from "./Navigation";
import { WellnessReminder } from "../Wellness/WellnessReminder";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export const MainLayout: React.FC = () => {
  const [onboardingComplete] = useLocalStorage("onboardingComplete", false);
  const [onboardingData] = useLocalStorage("onboardingData", null);

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
