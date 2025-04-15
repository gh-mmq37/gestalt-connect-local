
import React from "react";
import { AlertCircle } from "lucide-react";

interface CommunityPlaceholderProps {
  activeTab: string;
  scope: string;
}

export const CommunityPlaceholder: React.FC<CommunityPlaceholderProps> = ({
  activeTab,
  scope,
}) => {
  return (
    <div className="bg-gestalt-purple/5 rounded-lg border border-gestalt-purple/20 p-8 text-center">
      <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-gestalt-purple/20 mb-4">
        <AlertCircle className="h-6 w-6 text-gestalt-purple" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">
        No {activeTab} available
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        There are currently no {activeTab} in your {scope}. Be the first to add content or expand your community scope.
      </p>
      <div className="mt-6">
        <button className="btn-primary">
          Add {activeTab.substring(0, activeTab.length - 1)}
        </button>
      </div>
    </div>
  );
};
