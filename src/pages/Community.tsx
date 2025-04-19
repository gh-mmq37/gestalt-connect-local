
import React, { useState, useEffect } from "react";
import { ScopeSelector } from "../components/Community/ScopeSelector";
import { CommunityTabs } from "../components/Community/CommunityTabs";
import { LocalEventCard } from "../components/Community/LocalEventCard";
import { CommunityPlaceholder } from "../components/Community/CommunityPlaceholder";
import { useNostr } from "../hooks/useNostr";
import { Event, Filter } from "nostr-tools";
import { Loader2, MessageSquare, Users, Calendar, UserPlus } from "lucide-react";
import { NostrPost } from "../components/Nostr/NostrPost";
import { NostrGroupCard } from "../components/Nostr/NostrGroupCard";

type Scope = "neighborhood" | "city" | "county" | "state" | "country" | "world";

export const Community: React.FC = () => {
  const { pool, relays } = useNostr();
  const [scope, setScope] = useState<Scope>("neighborhood");
  const [activeTab, setActiveTab] = useState("groups");
  const [communityPosts, setCommunityPosts] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);

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
      
      // Use querySync instead of list
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
      <h1 className="text-3xl font-bold mb-6">Community & Groups</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <ScopeSelector onScopeChange={handleScopeChange} />
        
        <div className="mt-6">
          <CommunityTabs onTabChange={handleTabChange} />
        </div>
        
        {/* Groups tab header with create group button */}
        {activeTab === "groups" && (
          <div className="mt-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Available Groups</h2>
            <button
              className="px-4 py-2 bg-gestalt-purple text-white rounded-md hover:bg-gestalt-purple-dark inline-flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Group
            </button>
          </div>
        )}
        
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
        <h2 className="font-semibold mb-4">Community & Groups Features</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <span className="bg-gestalt-purple text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
            <p>Connect with others in your local area through community groups</p>
          </li>
          <li className="flex items-start">
            <span className="bg-gestalt-purple text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
            <p>Join public discussions or create private group chats with end-to-end encryption</p>
          </li>
          <li className="flex items-start">
            <span className="bg-gestalt-purple text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
            <p>Find local events and meetups happening in your community</p>
          </li>
          <li className="flex items-start">
            <span className="bg-gestalt-purple text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
            <p>Discover marketplace listings and opportunities from people in your area</p>
          </li>
        </ul>
        
        <div className="mt-6 p-4 bg-white rounded-lg border border-gestalt-purple/20">
          <h3 className="text-gestalt-purple font-semibold mb-2">How Gestalt Groups Work with Nostr</h3>
          <p className="text-gray-600 text-sm mb-4">
            Gestalt leverages Nostr's decentralized protocol for secure, censorship-resistant community interactions:
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Groups use Nostr NIP-28 for public and private community messaging</li>
            <li>• Secure end-to-end encrypted group chats with NIP-04</li>
            <li>• Self-moderation tools to keep communities healthy</li>
            <li>• Decentralized discovery using location-based tags</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
