
import React from 'react';
import { Users, Globe, Lock } from 'lucide-react';

interface NostrGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  tags: string[];
  isPrivate?: boolean;
}

interface NostrGroupCardProps {
  group: NostrGroup;
}

export const NostrGroupCard: React.FC<NostrGroupCardProps> = ({ group }) => {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-24 bg-gradient-to-r from-gestalt-purple/80 to-gestalt-purple flex items-center justify-center">
        {group.isPrivate ? (
          <Lock className="h-12 w-12 text-white opacity-70" />
        ) : (
          <Globe className="h-12 w-12 text-white opacity-70" />
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{group.name}</h3>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            <span>{group.memberCount}</span>
          </div>
        </div>
        
        <p className="text-gray-600 mt-2 text-sm line-clamp-2">{group.description}</p>
        
        {group.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {group.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <button className="px-3 py-1.5 bg-gestalt-purple text-white rounded-md text-sm hover:bg-gestalt-purple-dark transition-colors">
            {group.isPrivate ? "Request to Join" : "Join Group"}
          </button>
        </div>
      </div>
    </div>
  );
};
