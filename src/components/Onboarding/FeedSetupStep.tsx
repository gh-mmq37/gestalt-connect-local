
import React, { useState } from "react";
import { ArrowRight, RefreshCcw, Rss, Globe, AtSign } from "lucide-react";

interface FeedSetupStepProps {
  onNext: (data: { feedSources: string[] }) => void;
}

export const FeedSetupStep: React.FC<FeedSetupStepProps> = ({ onNext }) => {
  const [selectedSources, setSelectedSources] = useState<string[]>(["nostr"]);
  const [isLoading, setIsLoading] = useState(false);
  const [customRssFeed, setCustomRssFeed] = useState("");
  const [showAddRss, setShowAddRss] = useState(false);
  
  const feedSources = [
    { 
      id: "nostr", 
      name: "Nostr", 
      description: "The core decentralized protocol", 
      icon: RefreshCcw,
      required: true
    },
    { 
      id: "fediverse", 
      name: "Fediverse Bridge", 
      description: "Connect to Mastodon & more", 
      icon: Globe 
    },
    { 
      id: "bluesky", 
      name: "Bluesky Bridge", 
      description: "Connect to the Bluesky network", 
      icon: AtSign 
    },
    { 
      id: "rss", 
      name: "RSS Feeds", 
      description: "Add news & blogs", 
      icon: Rss 
    }
  ];
  
  const toggleSource = (sourceId: string) => {
    // Don't allow unchecking Nostr as it's required
    if (sourceId === "nostr") return;
    
    setSelectedSources((prev) => 
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };
  
  const addRssFeed = () => {
    if (customRssFeed && !selectedSources.includes("rss")) {
      setSelectedSources(prev => [...prev, "rss"]);
    }
    setShowAddRss(false);
  };
  
  const handleContinue = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      onNext({
        feedSources: selectedSources
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <p className="text-gray-600">
        Gestalt can connect to multiple protocols and sources. Customize which feeds you want to include.
      </p>
      
      <div className="space-y-3">
        {feedSources.map((source) => (
          <div key={source.id} className="relative">
            <div 
              className={`flex items-center p-3 rounded-lg border transition-colors ${
                selectedSources.includes(source.id)
                  ? "border-gestalt-purple/30 bg-gestalt-purple/5"
                  : "border-gray-200"
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                selectedSources.includes(source.id) ? "bg-gestalt-purple/20" : "bg-gray-100"
              }`}>
                <source.icon className={`h-5 w-5 ${
                  selectedSources.includes(source.id) ? "text-gestalt-purple" : "text-gray-500"
                }`} />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{source.name}</h3>
                  {source.id === "rss" && selectedSources.includes("rss") && (
                    <button
                      onClick={() => setShowAddRss(true)}
                      className="text-xs text-gestalt-purple hover:underline"
                    >
                      Add Feed
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">{source.description}</p>
              </div>
              <div className="ml-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source.id)}
                    onChange={() => toggleSource(source.id)}
                    disabled={source.required}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-gestalt-purple peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gestalt-purple ${
                    source.required ? "opacity-70" : ""
                  }`}></div>
                </label>
              </div>
            </div>
            
            {source.id === "rss" && selectedSources.includes("rss") && showAddRss && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label htmlFor="rssFeed" className="block text-xs font-medium text-gray-700 mb-1">
                  RSS Feed URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="rssFeed"
                    value={customRssFeed}
                    onChange={(e) => setCustomRssFeed(e.target.value)}
                    placeholder="https://example.com/feed.xml"
                    className="flex-1 border border-gray-300 rounded-md shadow-sm px-3 py-1 text-sm focus:outline-none focus:ring-gestalt-purple focus:border-gestalt-purple"
                  />
                  <button
                    onClick={addRssFeed}
                    className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gestalt-purple hover:bg-gestalt-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gestalt-purple"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  You can add more feeds after setup.
                </p>
              </div>
            )}
          </div>
        ))}
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
