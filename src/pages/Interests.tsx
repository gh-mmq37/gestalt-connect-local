
import React, { useState } from "react";
import { useNostr } from "../hooks/useNostr";
import { Bookmark, Tag, Plus, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const SUGGESTED_INTERESTS = [
  "local-community", "sustainability", "gardening", "crafts", "tech",
  "art", "music", "food", "outdoors", "education", "sports", "science",
  "books", "philosophy", "politics", "activism", "wellness", "parenting"
];

export const Interests: React.FC = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const { publishEvent, keys } = useNostr();

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const addCustomInterest = () => {
    if (!customInterest.trim()) return;
    
    const formatted = customInterest.trim().toLowerCase().replace(/\s+/g, '-');
    
    if (selectedInterests.includes(formatted)) {
      toast({
        title: "Interest already added",
        description: "This interest is already in your list.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedInterests([...selectedInterests, formatted]);
    setCustomInterest("");
  };

  const saveInterests = async () => {
    if (!keys) return;
    
    try {
      // Create a Nostr event with interests as tags
      const tags = selectedInterests.map(interest => ['t', interest]);
      
      // Add a special tag to identify this as an interests list
      tags.push(['interests', 'list']);
      
      await publishEvent({
        kind: 30001, // Custom event kind for interests
        content: JSON.stringify({ interests: selectedInterests }),
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });
      
      toast({
        title: "Interests saved",
        description: "Your interests have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving interests:", error);
      toast({
        title: "Failed to save interests",
        description: "There was an error saving your interests. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Interests</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Manage Your Interests</h2>
        <p className="text-gray-600 mb-6">
          Select interests to personalize your content and find like-minded community members.
          Your interests help tailor your Nostr experience on Gestalt.
        </p>
        
        <div className="mb-6">
          <div className="flex mb-2">
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              placeholder="Add a custom interest..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-gestalt-purple focus:border-gestalt-purple"
            />
            <button
              onClick={addCustomInterest}
              className="bg-gestalt-purple text-white px-4 py-2 rounded-r-md hover:bg-gestalt-purple-dark"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Use hyphens instead of spaces for multi-word interests (e.g., "local-food")
          </p>
        </div>
        
        <div className="mb-8">
          <h3 className="font-medium mb-3">Suggested Interests</h3>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_INTERESTS.map(interest => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1 rounded-full text-sm flex items-center ${
                  selectedInterests.includes(interest)
                    ? "bg-gestalt-purple text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {selectedInterests.includes(interest) ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <Tag className="h-3 w-3 mr-1" />
                )}
                {interest}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Your Selected Interests</h3>
          {selectedInterests.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedInterests.map(interest => (
                <div
                  key={interest}
                  className="bg-gestalt-purple/10 text-gestalt-purple px-3 py-1 rounded-full text-sm flex items-center"
                >
                  <Bookmark className="h-3 w-3 mr-1" />
                  {interest}
                  <button
                    onClick={() => toggleInterest(interest)}
                    className="ml-1 text-gestalt-purple hover:text-gestalt-purple-dark"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-6">No interests selected yet.</p>
          )}
          
          <button
            onClick={saveInterests}
            disabled={selectedInterests.length === 0}
            className={`px-4 py-2 rounded-md ${
              selectedInterests.length === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gestalt-purple text-white hover:bg-gestalt-purple-dark"
            }`}
          >
            Save Interests
          </button>
        </div>
      </div>
    </div>
  );
};
