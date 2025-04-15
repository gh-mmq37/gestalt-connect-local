
import React, { useState, useEffect } from "react";
import { Clock, X } from "lucide-react";

export const WellnessReminder: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Start tracking session time
    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show reminder after 15 minutes if not dismissed
    if (sessionTime >= 15 && !isDismissed) {
      setIsVisible(true);
    }
  }, [sessionTime, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    
    // Reset dismissal after 30 minutes
    setTimeout(() => {
      setIsDismissed(false);
    }, 30 * 60 * 1000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border border-gestalt-purple/20 p-4 animate-fade-in">
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-gestalt-purple/10 p-2 rounded-full">
          <Clock className="h-6 w-6 text-gestalt-purple" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">Digital Wellness Reminder</h3>
          <p className="mt-1 text-sm text-gray-500">
            You've been browsing for {sessionTime} minutes. Consider taking a short break or connecting with someone in your local community.
          </p>
          <div className="mt-4 flex">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gestalt-purple-dark bg-gestalt-purple/10 hover:bg-gestalt-purple/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gestalt-purple"
              onClick={handleDismiss}
            >
              Take a break
            </button>
            <button
              type="button"
              className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={handleDismiss}
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          className="ml-2 text-gray-400 hover:text-gray-500"
          onClick={handleDismiss}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
