
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { OnboardingLayout } from "../components/Onboarding/OnboardingLayout";
import { WelcomeStep } from "../components/Onboarding/WelcomeStep";
import { CommunitySelectionStep } from "../components/Onboarding/CommunitySelectionStep";
import { AccountSetupStep } from "../components/Onboarding/AccountSetupStep";
import { InterestsStep } from "../components/Onboarding/InterestsStep";
import { FeedSetupStep } from "../components/Onboarding/FeedSetupStep";
import { WellnessPreferencesStep } from "../components/Onboarding/WellnessPreferencesStep";
import { CompletionStep } from "../components/Onboarding/CompletionStep";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Check } from "lucide-react";

export const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingComplete, setOnboardingComplete] = useLocalStorage("onboardingComplete", false);
  const [onboardingData, setOnboardingData] = useLocalStorage("onboardingData", {
    community: null,
    location: null,
    accountType: "simple",
    nostrKeys: null,
    interests: [],
    feedSources: ["nostr"],
    wellnessPreferences: {
      reminderFrequency: "medium",
      usageGoals: "balanced"
    }
  });

  // If onboarding is already complete, redirect to home
  if (onboardingComplete) {
    return <Navigate to="/" replace />;
  }

  const steps = [
    {
      title: "Welcome to Gestalt",
      component: <WelcomeStep onNext={() => setCurrentStep(1)} />
    },
    {
      title: "Your Local Community",
      component: (
        <CommunitySelectionStep
          onNext={(data) => {
            setOnboardingData({ ...onboardingData, ...data });
            setCurrentStep(2);
          }}
        />
      )
    },
    {
      title: "Account Setup",
      component: (
        <AccountSetupStep
          onNext={(data) => {
            setOnboardingData({ ...onboardingData, ...data });
            setCurrentStep(3);
          }}
        />
      )
    },
    {
      title: "Your Interests",
      component: (
        <InterestsStep
          onNext={(data) => {
            setOnboardingData({ ...onboardingData, ...data });
            setCurrentStep(4);
          }}
        />
      )
    },
    {
      title: "Feed Sources",
      component: (
        <FeedSetupStep
          onNext={(data) => {
            setOnboardingData({ ...onboardingData, ...data });
            setCurrentStep(5);
          }}
        />
      )
    },
    {
      title: "Digital Wellness",
      component: (
        <WellnessPreferencesStep
          onNext={(data) => {
            setOnboardingData({ ...onboardingData, ...data });
            setCurrentStep(6);
          }}
        />
      )
    },
    {
      title: "All Set!",
      component: (
        <CompletionStep
          onboardingData={onboardingData}
          onComplete={() => {
            setOnboardingComplete(true);
          }}
        />
      )
    }
  ];

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={steps.length}
      title={steps[currentStep].title}
    >
      {steps[currentStep].component}
      
      <div className="mt-8">
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-8 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? "bg-gestalt-purple"
                  : index < currentStep
                  ? "bg-gestalt-purple/50"
                  : "bg-gray-200"
              }`}
            >
              {index < currentStep && (
                <span className="sr-only">
                  <Check className="h-4 w-4" />
                  Completed
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-2 text-sm text-gray-500">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
    </OnboardingLayout>
  );
};
