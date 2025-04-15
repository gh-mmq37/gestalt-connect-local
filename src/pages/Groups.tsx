
import React from "react";
import { useNostr } from "../hooks/useNostr";
import { UserPlus, Users } from "lucide-react";

export const Groups: React.FC = () => {
  const { keys } = useNostr();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Groups</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gestalt-purple mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Groups are coming soon!</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Community groups will let you connect with others who share your interests in your local area.
          </p>
          <button
            className="px-4 py-2 bg-gestalt-purple text-white rounded-md hover:bg-gestalt-purple-dark inline-flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Join the waiting list
          </button>
        </div>
      </div>
      
      <div className="bg-gestalt-purple/10 rounded-lg p-6">
        <h2 className="font-semibold mb-4">How Gestalt Groups will work with Nostr</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <span className="bg-gestalt-purple text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
            <p>Groups will be implemented as Nostr communities using NIP-28 for public and private messaging</p>
          </li>
          <li className="flex items-start">
            <span className="bg-gestalt-purple text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
            <p>Secure end-to-end encrypted group chats with NIP-04</p>
          </li>
          <li className="flex items-start">
            <span className="bg-gestalt-purple text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
            <p>Decentralized group discovery using location-based tags</p>
          </li>
          <li className="flex items-start">
            <span className="bg-gestalt-purple text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
            <p>Self-moderation tools to keep communities healthy</p>
          </li>
        </ul>
      </div>
    </div>
  );
};
