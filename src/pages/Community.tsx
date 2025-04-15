
import React, { useState, useEffect } from "react";
import { ScopeSelector } from "../components/Community/ScopeSelector";
import { CommunityTabs } from "../components/Community/CommunityTabs";
import { LocalEventCard } from "../components/Community/LocalEventCard";
import { CommunityPlaceholder } from "../components/Community/CommunityPlaceholder";

// Sample data for events
const sampleEvents = [
  {
    id: 1,
    title: "Neighborhood Clean-up",
    date: "Apr 20, 2025",
    time: "9:00 AM - 12:00 PM",
    location: "Downtown Park",
    attendees: 12,
    imageUrl: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=800&q=80",
    scope: "neighborhood"
  },
  {
    id: 2,
    title: "Community Farmers Market",
    date: "Apr 22, 2025",
    time: "8:00 AM - 1:00 PM",
    location: "Main Street Plaza",
    attendees: 45,
    imageUrl: "https://images.unsplash.com/photo-1563843007199-e91917a1a411?auto=format&fit=crop&w=800&q=80",
    scope: "neighborhood"
  },
  {
    id: 3,
    title: "Local Business Networking",
    date: "Apr 25, 2025",
    time: "6:00 PM - 8:00 PM",
    location: "Community Center",
    attendees: 28,
    imageUrl: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80",
    scope: "city"
  },
  {
    id: 4,
    title: "County Art Festival",
    date: "May 5, 2025",
    time: "10:00 AM - 6:00 PM",
    location: "County Fairgrounds",
    attendees: 120,
    imageUrl: "https://images.unsplash.com/photo-1576502200916-3808e07386a5?auto=format&fit=crop&w=800&q=80",
    scope: "county"
  }
];

type Scope = "neighborhood" | "city" | "county" | "state" | "country" | "world";

export const Community: React.FC = () => {
  const [scope, setScope] = useState<Scope>("neighborhood");
  const [activeTab, setActiveTab] = useState("events");
  const [filteredEvents, setFilteredEvents] = useState(sampleEvents);

  // Filter events based on scope
  useEffect(() => {
    // In a real app, we would fetch based on scope
    // For now, simulate filtering based on our sample data
    const scopePriority = {
      neighborhood: 1,
      city: 2,
      county: 3,
      state: 4,
      country: 5,
      world: 6
    };

    const currentPriority = scopePriority[scope];
    
    const filtered = sampleEvents.filter(event => {
      const eventScopePriority = scopePriority[event.scope as Scope] || 0;
      return eventScopePriority <= currentPriority;
    });
    
    setFilteredEvents(filtered);
  }, [scope]);

  const handleScopeChange = (newScope: Scope) => {
    setScope(newScope);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Community</h1>
      
      <ScopeSelector onScopeChange={handleScopeChange} />
      
      <CommunityTabs onTabChange={handleTabChange} />
      
      <div className="mt-6">
        {activeTab === "events" && (
          <>
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredEvents.map(event => (
                  <LocalEventCard 
                    key={event.id}
                    title={event.title}
                    date={event.date}
                    time={event.time}
                    location={event.location}
                    attendees={event.attendees}
                    imageUrl={event.imageUrl}
                  />
                ))}
              </div>
            ) : (
              <CommunityPlaceholder activeTab={activeTab} scope={scope} />
            )}
          </>
        )}
        
        {/* Placeholders for other tabs */}
        {activeTab !== "events" && (
          <CommunityPlaceholder activeTab={activeTab} scope={scope} />
        )}
      </div>
    </div>
  );
};
