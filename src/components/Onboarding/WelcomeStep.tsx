
import React from "react";
import { ArrowRight, Globe, Shield, Heart } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gestalt-purple/10 mb-4">
          <Globe className="h-8 w-8 text-gestalt-purple" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Local-First Community Platform
        </h2>
        <p className="text-gray-600">
          Gestalt connects you with your local community while respecting your privacy and digital wellbeing.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <Shield className="h-5 w-5 text-gestalt-purple" />
          </div>
          <div className="ml-3">
            <h3 className="text-base font-medium text-gray-900">Privacy-Respecting</h3>
            <p className="text-sm text-gray-500">
              Your data belongs to you. No tracking, no ads, no exploitation.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <Globe className="h-5 w-5 text-gestalt-purple" />
          </div>
          <div className="ml-3">
            <h3 className="text-base font-medium text-gray-900">Open & Connected</h3>
            <p className="text-sm text-gray-500">
              Built on Nostr with bridges to Fediverse, Bluesky, and RSS feeds.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <Heart className="h-5 w-5 text-gestalt-purple" />
          </div>
          <div className="ml-3">
            <h3 className="text-base font-medium text-gray-900">Digital Wellness</h3>
            <p className="text-sm text-gray-500">
              Designed to enhance real-life connections, not replace them.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gestalt-purple hover:bg-gestalt-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gestalt-purple transition-colors"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
