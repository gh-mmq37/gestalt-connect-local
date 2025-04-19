
import React, { useState, useEffect } from "react";
import { useNostr } from "../hooks/useNostr";
import { NostrPost } from "../components/Nostr/NostrPost";
import { Event, Filter } from "nostr-tools";
import { Compass, TrendingUp, Globe, MapPin, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const Explore: React.FC = () => {
  const { pool, relays, profileData } = useNostr();
  const [activeTab, setActiveTab] = useState("trending");
  const [posts, setPosts] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExploreContent();
  }, [activeTab]);

  const fetchExploreContent = async () => {
    if (!pool) return;
    
    setLoading(true);
    
    try {
      let events: Event[] = [];
      
      switch (activeTab) {
        case "trending":
          // Get posts from the last 24 hours
          const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - 86400;
          const trendingFilter: Filter = {
            kinds: [1],
            limit: 50,
            since: twentyFourHoursAgo,
          };
          
          events = await pool.querySync(relays, trendingFilter);
          
          // Find posts with reactions (likes, reposts)
          const postIds = events.map(event => event.id);
          
          // Get reactions to these posts
          if (postIds.length > 0) {
            const reactionsFilter: Filter = {
              kinds: [7, 6], // Likes and reposts
              '#e': postIds,
            };
            
            const reactions = await pool.querySync(relays, reactionsFilter);
            
            // Count reactions per post
            const reactionCounts: Record<string, number> = {};
            reactions.forEach(reaction => {
              const eventId = reaction.tags.find(tag => tag[0] === 'e')?.[1];
              if (eventId) {
                reactionCounts[eventId] = (reactionCounts[eventId] || 0) + 1;
              }
            });
            
            // Sort posts by reaction count
            events.sort((a, b) => {
              const countA = reactionCounts[a.id] || 0;
              const countB = reactionCounts[b.id] || 0;
              return countB - countA;
            });
          } else {
            // If no posts from the last 24 hours, just sort by created_at
            events.sort((a, b) => b.created_at - a.created_at);
          }
          break;
          
        case "global":
          const globalFilter: Filter = {
            kinds: [1],
            limit: 50,
          };
          
          events = await pool.querySync(relays, globalFilter);
          // Sort by created_at in descending order (newest first)
          events.sort((a, b) => b.created_at - a.created_at);
          break;
          
        case "local":
          // Get user's location
          const userLocation = getUserLocation();
          
          if (userLocation) {
            const localFilter: Filter = {
              kinds: [1],
              limit: 50,
            };
            
            events = await pool.querySync(relays, localFilter);
            
            // Filter posts by those with matching location
            events = events.filter(event => {
              // Check if the author has location metadata
              const authorProfile = profileData[event.pubkey];
              if (authorProfile && authorProfile.location) {
                // Simple string matching - a more sophisticated approach would use geocoding
                return authorProfile.location.toLowerCase().includes(userLocation.toLowerCase());
              }
              return false;
            });
          } else {
            // If no location, just show some sample posts with location tags
            const localFilter: Filter = {
              kinds: [1],
              limit: 50,
              '#t': ["local", "location"]
            };
            
            events = await pool.querySync(relays, localFilter);
          }
          
          // Sort by created_at in descending order (newest first)
          events.sort((a, b) => b.created_at - a.created_at);
          break;
      }
      
      setPosts(events);
    } catch (error) {
      console.error("Error fetching explore content:", error);
      toast({
        title: "Error loading content",
        description: "Failed to load explore content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = (): string | null => {
    // In a real app, this would use the browser's geolocation API
    // or a stored user preference for their location
    return localStorage.getItem("userLocation");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Explore</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("trending")}
            className={`flex items-center px-6 py-3 ${
              activeTab === "trending"
                ? "bg-gestalt-purple/10 text-gestalt-purple border-b-2 border-gestalt-purple"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </button>
          <button
            onClick={() => setActiveTab("global")}
            className={`flex items-center px-6 py-3 ${
              activeTab === "global"
                ? "bg-gestalt-purple/10 text-gestalt-purple border-b-2 border-gestalt-purple"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Globe className="h-4 w-4 mr-2" />
            Global
          </button>
          <button
            onClick={() => setActiveTab("local")}
            className={`flex items-center px-6 py-3 ${
              activeTab === "local"
                ? "bg-gestalt-purple/10 text-gestalt-purple border-b-2 border-gestalt-purple"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Local
          </button>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-gestalt-purple" />
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map(post => (
                <NostrPost key={post.id} event={post} />
              ))}
            </div>
          ) : (
            <div className="text-center my-12 p-6 bg-gestalt-purple/5 rounded-lg">
              <Compass className="h-12 w-12 text-gestalt-purple mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No content found</h3>
              <p className="text-gray-600">
                {activeTab === "local" 
                  ? "There's no local content available yet. Be the first to post something in your area!"
                  : "We couldn't find any posts. Try a different category or check back later."}
              </p>
              {activeTab === "local" && !getUserLocation() && (
                <button
                  onClick={() => {
                    const location = prompt("Enter your location (city, country):");
                    if (location) {
                      localStorage.setItem("userLocation", location);
                      fetchExploreContent();
                    }
                  }}
                  className="mt-4 px-4 py-2 bg-gestalt-purple text-white rounded-md hover:bg-gestalt-purple-dark"
                >
                  Set Your Location
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
