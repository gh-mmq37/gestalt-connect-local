
import React, { useState } from "react";
import { MapPin } from "lucide-react";

type Scope = "neighborhood" | "city" | "county" | "state" | "country" | "world";

const scopeLabels: Record<Scope, string> = {
  neighborhood: "Neighborhood",
  city: "City",
  county: "County",
  state: "State",
  country: "Country",
  world: "World",
};

interface ScopeSelectorProps {
  onScopeChange: (scope: Scope) => void;
}

export const ScopeSelector: React.FC<ScopeSelectorProps> = ({ onScopeChange }) => {
  const [selectedScope, setSelectedScope] = useState<Scope>("neighborhood");

  const handleScopeChange = (scope: Scope) => {
    setSelectedScope(scope);
    onScopeChange(scope);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex items-center mb-4">
        <MapPin className="h-5 w-5 text-gestalt-purple mr-2" />
        <h3 className="text-lg font-medium">Community Scope</h3>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        {Object.entries(scopeLabels).map(([scope, label]) => (
          <button
            key={scope}
            onClick={() => handleScopeChange(scope as Scope)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedScope === scope
                ? "bg-gestalt-purple text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gestalt-purple/10 hover:text-gestalt-purple-dark"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        {selectedScope === "neighborhood" && "Viewing content from your local neighborhood."}
        {selectedScope === "city" && "Expanded to city-wide content and groups."}
        {selectedScope === "county" && "Viewing county-level community content."}
        {selectedScope === "state" && "Expanded to state-wide visibility."}
        {selectedScope === "country" && "Viewing country-wide content and groups."}
        {selectedScope === "world" && "Global content visibility activated."}
      </div>
    </div>
  );
};
