
import React, { useState } from "react";
import { useNostr } from "../hooks/useNostr";
import { Save, Plus, X, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tab } from '@headlessui/react';
import { useLocalStorage } from "../hooks/useLocalStorage";

export const Settings: React.FC = () => {
  const { relays, addRelay, removeRelay } = useNostr();
  const [onboardingData, setOnboardingData] = useLocalStorage("onboardingData", null);
  const [newRelay, setNewRelay] = useState("");
  const [profileVisibility, setProfileVisibility] = useState(onboardingData?.profileVisibility || "public");
  const [feedPreferences, setFeedPreferences] = useState(onboardingData?.feedPreferences || {
    showReplies: true,
    showReposts: true,
    contentWarnings: true,
    adultContent: false,
  });
  const [wellnessPreferences, setWellnessPreferences] = useState(
    onboardingData?.wellnessPreferences || {
      reminderFrequency: "medium",
      usageGoals: "balanced"
    }
  );

  const handleAddRelay = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRelay.trim() || !newRelay.startsWith("wss://")) {
      toast({
        title: "Invalid relay",
        description: "Relay URL must start with wss://",
        variant: "destructive",
      });
      return;
    }
    
    if (relays.includes(newRelay)) {
      toast({
        title: "Relay already added",
        description: "This relay is already in your list",
        variant: "destructive",
      });
      return;
    }
    
    addRelay(newRelay);
    setNewRelay("");
    toast({
      title: "Relay added",
      description: `Successfully added ${newRelay} to your relays`,
    });
  };

  const handleRemoveRelay = (relay: string) => {
    if (relays.length <= 1) {
      toast({
        title: "Cannot remove relay",
        description: "You must have at least one relay",
        variant: "destructive",
      });
      return;
    }
    
    removeRelay(relay);
    toast({
      title: "Relay removed",
      description: `Successfully removed ${relay} from your relays`,
    });
  };

  const saveProfileSettings = () => {
    setOnboardingData({
      ...onboardingData,
      profileVisibility
    });
    toast({
      title: "Settings saved",
      description: "Your profile settings have been updated",
    });
  };

  const saveFeedPreferences = () => {
    setOnboardingData({
      ...onboardingData,
      feedPreferences
    });
    toast({
      title: "Settings saved",
      description: "Your feed preferences have been updated",
    });
  };

  const saveWellnessPreferences = () => {
    setOnboardingData({
      ...onboardingData,
      wellnessPreferences
    });
    toast({
      title: "Settings saved",
      description: "Your wellness preferences have been updated",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <Tab.Group>
          <Tab.List className="flex border-b mb-6">
            <Tab className={({ selected }) => 
              `py-4 px-6 text-center font-medium text-sm flex items-center border-b-2 ${
                selected 
                  ? "border-gestalt-purple text-gestalt-purple" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }>
              Nostr Relays
            </Tab>
            <Tab className={({ selected }) => 
              `py-4 px-6 text-center font-medium text-sm flex items-center border-b-2 ${
                selected 
                  ? "border-gestalt-purple text-gestalt-purple" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }>
              Profile
            </Tab>
            <Tab className={({ selected }) => 
              `py-4 px-6 text-center font-medium text-sm flex items-center border-b-2 ${
                selected 
                  ? "border-gestalt-purple text-gestalt-purple" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }>
              Feed
            </Tab>
            <Tab className={({ selected }) => 
              `py-4 px-6 text-center font-medium text-sm flex items-center border-b-2 ${
                selected 
                  ? "border-gestalt-purple text-gestalt-purple" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }>
              Wellness
            </Tab>
          </Tab.List>
          
          <Tab.Panels>
            <Tab.Panel>
              <h2 className="text-xl font-semibold mb-4">Nostr Relays</h2>
              <p className="text-gray-600 mb-6">
                Relays are servers that help propagate your posts across the Nostr network.
                Having multiple relays improves your reach and content availability.
              </p>
              
              <form onSubmit={handleAddRelay} className="mb-6">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="wss://relay.example.com"
                    value={newRelay}
                    onChange={(e) => setNewRelay(e.target.value)}
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-gestalt-purple focus:border-gestalt-purple"
                  />
                  <button
                    type="submit"
                    className="bg-gestalt-purple text-white px-4 py-2 rounded-r-md hover:bg-gestalt-purple-dark"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </form>
              
              <div className="space-y-2">
                <h3 className="font-medium mb-2">Your Relays</h3>
                {relays.map((relay) => (
                  <div key={relay} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="text-sm font-mono truncate max-w-md">{relay}</div>
                    <button
                      onClick={() => handleRemoveRelay(relay)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                className="mt-6 flex items-center text-gestalt-purple hover:text-gestalt-purple-dark"
                onClick={() => {
                  // Refresh relay connections
                  toast({
                    title: "Relays refreshed",
                    description: "Your relay connections have been refreshed",
                  });
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh relay connections
              </button>
            </Tab.Panel>
            
            <Tab.Panel>
              <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
              <p className="text-gray-600 mb-6">
                Control how your profile is displayed and who can see your activity.
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Visibility
                  </label>
                  <select
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="public">Public (everyone can see your profile)</option>
                    <option value="follows">Follows only (only users you follow can see details)</option>
                    <option value="private">Private (minimal information shared)</option>
                  </select>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={saveProfileSettings}
                    className="flex items-center px-4 py-2 bg-gestalt-purple text-white rounded-md hover:bg-gestalt-purple-dark"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile Settings
                  </button>
                </div>
              </div>
            </Tab.Panel>
            
            <Tab.Panel>
              <h2 className="text-xl font-semibold mb-4">Feed Preferences</h2>
              <p className="text-gray-600 mb-6">
                Customize what appears in your feed and how content is displayed.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Show Replies</h3>
                    <p className="text-sm text-gray-600">
                      Display replies in your main feed
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="show-replies"
                      checked={feedPreferences.showReplies}
                      onChange={() => setFeedPreferences({...feedPreferences, showReplies: !feedPreferences.showReplies})}
                      className="h-4 w-4 text-gestalt-purple focus:ring-gestalt-purple border-gray-300 rounded"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-t">
                  <div>
                    <h3 className="font-medium">Show Reposts</h3>
                    <p className="text-sm text-gray-600">
                      Display reposts in your main feed
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="show-reposts"
                      checked={feedPreferences.showReposts}
                      onChange={() => setFeedPreferences({...feedPreferences, showReposts: !feedPreferences.showReposts})}
                      className="h-4 w-4 text-gestalt-purple focus:ring-gestalt-purple border-gray-300 rounded"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-t">
                  <div>
                    <h3 className="font-medium">Content Warnings</h3>
                    <p className="text-sm text-gray-600">
                      Blur potentially sensitive content
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="content-warnings"
                      checked={feedPreferences.contentWarnings}
                      onChange={() => setFeedPreferences({...feedPreferences, contentWarnings: !feedPreferences.contentWarnings})}
                      className="h-4 w-4 text-gestalt-purple focus:ring-gestalt-purple border-gray-300 rounded"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-t">
                  <div>
                    <h3 className="font-medium">Adult Content</h3>
                    <p className="text-sm text-gray-600">
                      Show posts marked as adult content
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="adult-content"
                      checked={feedPreferences.adultContent}
                      onChange={() => setFeedPreferences({...feedPreferences, adultContent: !feedPreferences.adultContent})}
                      className="h-4 w-4 text-gestalt-purple focus:ring-gestalt-purple border-gray-300 rounded"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={saveFeedPreferences}
                    className="flex items-center px-4 py-2 bg-gestalt-purple text-white rounded-md hover:bg-gestalt-purple-dark"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Feed Preferences
                  </button>
                </div>
              </div>
            </Tab.Panel>
            
            <Tab.Panel>
              <h2 className="text-xl font-semibold mb-4">Digital Wellness</h2>
              <p className="text-gray-600 mb-6">
                Tools to help you maintain a healthy relationship with technology.
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Frequency
                  </label>
                  <select
                    value={wellnessPreferences.reminderFrequency}
                    onChange={(e) => setWellnessPreferences({...wellnessPreferences, reminderFrequency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="high">High (every 15 minutes)</option>
                    <option value="medium">Medium (every 30 minutes)</option>
                    <option value="low">Low (every hour)</option>
                    <option value="none">None (no reminders)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usage Goals
                  </label>
                  <select
                    value={wellnessPreferences.usageGoals}
                    onChange={(e) => setWellnessPreferences({...wellnessPreferences, usageGoals: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="minimal">Minimal (less than 30 minutes/day)</option>
                    <option value="balanced">Balanced (30-60 minutes/day)</option>
                    <option value="regular">Regular (1-2 hours/day)</option>
                    <option value="unlimited">Unlimited (no restrictions)</option>
                  </select>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={saveWellnessPreferences}
                    className="flex items-center px-4 py-2 bg-gestalt-purple text-white rounded-md hover:bg-gestalt-purple-dark"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Wellness Preferences
                  </button>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};
