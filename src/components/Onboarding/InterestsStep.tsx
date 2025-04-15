
import React, { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

interface InterestsStepProps {
  onNext: (data: { interests: string[] }) => void;
}

export const InterestsStep: React.FC<InterestsStepProps> = ({ onNext }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const allInterests = [
    { id: "localEvents", label: "Local Events", icon: "🎭" },
    { id: "music", label: "Music", icon: "🎵" },
    { id: "art", label: "Art & Culture", icon: "🎨" },
    { id: "tech", label: "Technology", icon: "💻" },
    { id: "outdoors", label: "Outdoors", icon: "🏞️" },
    { id: "food", label: "Food & Dining", icon: "🍲" },
    { id: "sports", label: "Sports & Fitness", icon: "🏃" },
    { id: "education", label: "Education", icon: "📚" },
    { id: "environment", label: "Environment", icon: "🌱" },
    { id: "community", label: "Community Service", icon: "👥" },
    { id: "politics", label: "Local Politics", icon: "🗳️" },
    { id: "business", label: "Local Business", icon: "🏪" },
    { id: "family", label: "Family Activities", icon: "👨‍👩‍👧‍👦" },
    { id: "pets", label: "Pets & Animals", icon: "🐾" },
    { id: "markets", label: "Markets & Trades", icon: "🛒" },
  ];
  
  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };
  
  const handleContinue = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      onNext({
        interests: selectedInterests
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <p className="text-gray-600">
        Select topics you're interested in to personalize your feed and discover relevant local groups.
      </p>
      
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {allInterests.map((interest) => (
          <button
            key={interest.id}
            onClick={() => toggleInterest(interest.id)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${
              selectedInterests.includes(interest.id)
                ? "border-gestalt-purple bg-gestalt-purple/10 text-gestalt-purple"
                : "border-gray-200 hover:border-gestalt-purple/30 hover:bg-gestalt-purple/5"
            }`}
          >
            <div className="text-2xl mb-1">{interest.icon}</div>
            <span className="text-sm">{interest.label}</span>
            {selectedInterests.includes(interest.id) && (
              <span className="absolute top-1 right-1">
                <Check className="h-4 w-4 text-gestalt-purple" />
              </span>
            )}
          </button>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Select at least 3 interests for the best experience. You can change these later.
      </p>
      
      <div className="pt-4">
        <button
          onClick={handleContinue}
          disabled={isLoading || selectedInterests.length < 3}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gestalt-purple hover:bg-gestalt-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gestalt-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Continue"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
