
import React from "react";
import { ArrowLeft } from "lucide-react";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  totalSteps,
  title
}) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-full bg-gestalt-purple flex items-center justify-center mr-2">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <span className="text-xl font-bold text-gestalt-purple-dark">Gestalt</span>
          
          {currentStep > 0 && (
            <button 
              onClick={() => window.history.back()}
              className="ml-auto text-gray-500 hover:text-gestalt-purple transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </button>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        
        <div className="bg-white rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
};
