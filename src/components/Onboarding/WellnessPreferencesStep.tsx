
import React, { useState } from "react";
import { ArrowRight, Bell, Clock, Heart } from "lucide-react";

interface WellnessPreferencesStepProps {
  onNext: (data: { wellnessPreferences: any }) => void;
}

export const WellnessPreferencesStep: React.FC<WellnessPreferencesStepProps> = ({ onNext }) => {
  const [preferences, setPreferences] = useState({
    reminderFrequency: "medium",
    usageGoals: "balanced",
    enableBreakReminders: true,
    showUsageStats: true,
    mentalHealthDisclosures: true
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  const handleContinue = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      onNext({
        wellnessPreferences: preferences
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <p className="text-gray-600">
        Gestalt is designed to enhance your real-world connections, not replace them. Customize your digital wellness settings:
      </p>
      
      <div className="space-y-5">
        <div>
          <h3 className="flex items-center text-sm font-medium text-gray-900 mb-2">
            <Bell className="h-4 w-4 mr-2 text-gestalt-purple" />
            Break Reminders
          </h3>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="reminderFrequency"
                value="low"
                checked={preferences.reminderFrequency === "low"}
                onChange={handleChange}
                className="h-4 w-4 text-gestalt-purple border-gray-300 focus:ring-gestalt-purple"
              />
              <span className="ml-2 text-sm text-gray-700">Infrequent (every 30 mins)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="reminderFrequency"
                value="medium"
                checked={preferences.reminderFrequency === "medium"}
                onChange={handleChange}
                className="h-4 w-4 text-gestalt-purple border-gray-300 focus:ring-gestalt-purple"
              />
              <span className="ml-2 text-sm text-gray-700">Balanced (every 15 mins)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="reminderFrequency"
                value="high"
                checked={preferences.reminderFrequency === "high"}
                onChange={handleChange}
                className="h-4 w-4 text-gestalt-purple border-gray-300 focus:ring-gestalt-purple"
              />
              <span className="ml-2 text-sm text-gray-700">Frequent (every 5 mins)</span>
            </label>
          </div>
        </div>
        
        <div>
          <h3 className="flex items-center text-sm font-medium text-gray-900 mb-2">
            <Clock className="h-4 w-4 mr-2 text-gestalt-purple" />
            Usage Goals
          </h3>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="usageGoals"
                value="minimal"
                checked={preferences.usageGoals === "minimal"}
                onChange={handleChange}
                className="h-4 w-4 text-gestalt-purple border-gray-300 focus:ring-gestalt-purple"
              />
              <span className="ml-2 text-sm text-gray-700">Minimal (15 min daily)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="usageGoals"
                value="balanced"
                checked={preferences.usageGoals === "balanced"}
                onChange={handleChange}
                className="h-4 w-4 text-gestalt-purple border-gray-300 focus:ring-gestalt-purple"
              />
              <span className="ml-2 text-sm text-gray-700">Balanced (30 min daily)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="usageGoals"
                value="regular"
                checked={preferences.usageGoals === "regular"}
                onChange={handleChange}
                className="h-4 w-4 text-gestalt-purple border-gray-300 focus:ring-gestalt-purple"
              />
              <span className="ml-2 text-sm text-gray-700">Regular (1 hour daily)</span>
            </label>
          </div>
        </div>
        
        <div className="pt-2">
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="enableBreakReminders"
                checked={preferences.enableBreakReminders}
                onChange={handleChange}
                className="h-4 w-4 text-gestalt-purple border-gray-300 rounded focus:ring-gestalt-purple"
              />
              <span className="ml-2 text-sm text-gray-700">Enable break reminders</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                name="showUsageStats"
                checked={preferences.showUsageStats}
                onChange={handleChange}
                className="h-4 w-4 text-gestalt-purple border-gray-300 rounded focus:ring-gestalt-purple"
              />
              <span className="ml-2 text-sm text-gray-700">Show usage statistics</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                name="mentalHealthDisclosures"
                checked={preferences.mentalHealthDisclosures}
                onChange={handleChange}
                className="h-4 w-4 text-gestalt-purple border-gray-300 rounded focus:ring-gestalt-purple"
              />
              <span className="ml-2 text-sm text-gray-700">Show mental health disclosures</span>
            </label>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start">
            <Heart className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800">Digital Wellness Commitment</h4>
              <p className="text-xs text-green-700 mt-1">
                Gestalt is designed to enhance your real-world connections, not replace them. We're committed to creating a platform that promotes healthy digital habits and meaningful community engagement.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gestalt-purple hover:bg-gestalt-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gestalt-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Continue"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
