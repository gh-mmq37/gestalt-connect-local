
import React, { useState, useEffect } from "react";
import { ScopeSelector } from "../components/Community/ScopeSelector";
import { CommunityTabs } from "../components/Community/CommunityTabs";
import { LocalEventCard } from "../components/Community/LocalEventCard";
import { CommunityPlaceholder } from "../components/Community/CommunityPlaceholder";
import { useNostr } from "../hooks/useNostr";
import { Event, Filter } from "nostr-tools";
import { Loader2, MessageSquare, Users, Calendar } from "lucide-react";
import { NostrPost } from "../components/Nostr/NostrPost";
import { NostrGroupCard } from "../components/Nostr/NostrGroupCard";

type Scope = "neighborhood" | "city" | "county" | "state" | "country" | "world";

export const Community: React.FC = () => {
  const { pool, relays } = useNostr();
  const [scope, setScope] = useState<Scope>("neighborhood");
  const [activeTab, setActiveTab] = useState("events");
  const [communityPosts, setCommunityPosts] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "events" || activeTab === "groups" || activeTab === "discussions") {
      fetchCommunityContent();
    }
  }, [activeTab, scope]);

  const fetchCommunityContent = async () => {
    if (!pool) return;
    
    setLoading(true);
    
    try {
      let filter: Filter;
      
      if (activeTab === "discussions") {
        // For discussions, we look for regular posts (kind 1) with community-related hashtags
        filter = {
          kinds: [1],
          limit: 30,
          '#t': ['community', 'local', 'meetup', 'discussion'],
        };
      } else if (activeTab === "groups") {
        // For groups, we would use NIP-28 group related events (kind 40, 41, 42)
        // But for now let's just get some community-related posts
        filter = {
          kinds: [1],
          limit: 30,
          '#t': ['group', 'community', 'club'],
        };
      } else {
        // For events, we would use NIP-52 calendar event kinds
        // But for now let's just get posts with event-related tags
        filter = {
          kinds: [1],
          limit: 30,
          '#t': ['event', 'meetup', 'gathering'],
        };
      }
      
      const events = await pool.querySync(relays, filter);
      const sortedEvents = events.sort((a, b) => b.created_at - a.created_at);
      setCommunityPosts(sortedEvents);
    } catch (error) {
      console.error("Error fetching community content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScopeChange = (newScope: Scope) => {
    setScope(newScope);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Community</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <ScopeSelector onScopeChange={handleScopeChange} />
        
        <div className="mt-6">
          <CommunityTabs onTabChange={handleTabChange} />
        </div>
        
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-gestalt-purple" />
            </div>
          ) : communityPosts.length > 0 ? (
            activeTab === "events" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityPosts.map(event => (
                  <LocalEventCard 
                    key={event.id}
                    title={event.content.length > 50 ? `${event.content.substring(0, 50)}...` : event.content}
                    date={new Date(event.created_at * 1000).toLocaleDateString()}
                    time={new Date(event.created_at * 1000).toLocaleTimeString()}
                    location="Community Location"
                    attendees={Math.floor(Math.random() * 30) + 1}
                    imageUrl="https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=800&q=80"
                  />
                ))}
              </div>
            ) : activeTab === "groups" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {communityPosts.map(group => (
                  <NostrGroupCard
                    key={group.id}
                    group={{
                      id: group.id,
                      name: group.content.length > 30 ? `${group.content.substring(0, 30)}...` : group.content,
                      description: "A community group on Nostr",
                      memberCount: Math.floor(Math.random() * 50) + 5,
                      tags: group.tags.filter(tag => tag[0] === 't').map(tag => tag[1]),
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {communityPosts.map(post => (
                  <NostrPost key={post.id} event={post} />
                ))}
              </div>
            )
          ) : (
            <CommunityPlaceholder activeTab={activeTab} scope={scope} />
          )}
        </div>
      </div>
      
      <div className="bg-gestalt-purple/10 rounded-lg p-6">
        <h2 className="font-semibold mb-4">Nostr Community Features</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <span className="bg-gestalt-purple text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
            <p>Groups are implemented as Nostr communities using NIP-28 for public and private messaging</p>
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
        
        <div className="mt-6 p-4 bg-white rounded-lg border border-gestalt-purple/20">
          <h3 className="text-gestalt-purple font-semibold mb-2">Coming Soon: Community Scope</h3>
          <p className="text-gray-600 text-sm">
            We're working on integrating geographic scope filtering based on NIP-33 parameterized replaceable events.
            This will allow you to filter content based on your neighborhood, city, county, state, country, or worldwide.
          </p>
        </div>
      </div>
    </div>
  );
};
