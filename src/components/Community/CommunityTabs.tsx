
import React, { useState } from "react";
import { Users, Calendar, MessageSquare, ShoppingCart, BookOpen } from "lucide-react";

const tabs = [
  { id: "groups", label: "Groups", icon: Users },
  { id: "events", label: "Events", icon: Calendar },
  { id: "discussions", label: "Discussions", icon: MessageSquare },
  { id: "marketplace", label: "Marketplace", icon: ShoppingCart },
  { id: "directory", label: "Directory", icon: BookOpen },
];

interface CommunityTabsProps {
  onTabChange: (tabId: string) => void;
}

export const CommunityTabs: React.FC<CommunityTabsProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState("groups");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange(tabId);
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-4 overflow-x-auto pb-2 sm:space-x-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`group inline-flex items-center px-1 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === id
                ? "border-gestalt-purple text-gestalt-purple-dark"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Icon
              className={`mr-2 h-5 w-5 ${
                activeTab === id ? "text-gestalt-purple" : "text-gray-400 group-hover:text-gray-500"
              }`}
            />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
};
