
import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Zap, Users, Calendar, Heart } from "lucide-react";

interface CompletionStepProps {
  onboardingData: any;
  onComplete: () => void;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({ onboardingData, onComplete }) => {
  // Extract data to show user summary
  const { nostrKeys, community } = onboardingData;
  const publicKey = nostrKeys?.publicKey ? nostrKeys.publicKey.substring(0, 8) + '...' : 'Not set';

  return (
    <div className="space-y-6 animate-fade-in text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          You're All Set!
        </h2>
        <p className="text-gray-600">
          Welcome to Gestalt. Your local-first, privacy-respecting community platform is ready to go.
        </p>
      </div>
      
      {/* Show summary of key setup */}
      <div className="py-3 px-4 bg-gestalt-purple/5 rounded-lg border border-gestalt-purple/20 text-left">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Your Account Summary</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p>Public Key: <span className="font-mono">{publicKey}</span></p>
          <p>Community Level: {community || 'Neighborhood'}</p>
          <p>Setup complete and ready to use!</p>
        </div>
      </div>
      
      <div className="py-2">
        <hr className="border-gray-200" />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gestalt-purple/5 rounded-lg border border-gestalt-purple/20 text-left">
          <div className="flex items-center mb-2">
            <Zap className="h-5 w-5 text-gestalt-purple mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Browse Your Community</h3>
          </div>
          <p className="text-xs text-gray-600">
            Discover local events, groups, and opportunities in your area.
          </p>
        </div>
        
        <div className="p-3 bg-gestalt-purple/5 rounded-lg border border-gestalt-purple/20 text-left">
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-gestalt-purple mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Join Groups</h3>
          </div>
          <p className="text-xs text-gray-600">
            Connect with like-minded people around shared interests.
          </p>
        </div>
        
        <div className="p-3 bg-gestalt-purple/5 rounded-lg border border-gestalt-purple/20 text-left">
          <div className="flex items-center mb-2">
            <Calendar className="h-5 w-5 text-gestalt-purple mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Find Events</h3>
          </div>
          <p className="text-xs text-gray-600">
            Discover local happenings and add them to your calendar.
          </p>
        </div>
        
        <div className="p-3 bg-gestalt-purple/5 rounded-lg border border-gestalt-purple/20 text-left">
          <div className="flex items-center mb-2">
            <Heart className="h-5 w-5 text-gestalt-purple mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Contribute</h3>
          </div>
          <p className="text-xs text-gray-600">
            Create events, share resources, and build your community.
          </p>
        </div>
      </div>
      
      <div className="pt-4">
        <button
          onClick={onComplete}
          className="w-full inline-block py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gestalt-purple hover:bg-gestalt-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gestalt-purple transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};
