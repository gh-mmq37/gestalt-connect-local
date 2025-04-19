
import React, { useState, useEffect } from "react";
import { useNostr } from "../hooks/useNostr";
import { NostrPost } from "../components/Nostr/NostrPost";
import { Event, Filter } from "nostr-tools";
import { Compass, TrendingUp, Globe, MapPin, Loader2 } from "lucide-react";

export const Explore: React.FC = () => {
  const { pool, relays } = useNostr();
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
          // In a real app, would use a specialized trending algorithm
          const trendingFilter: Filter = {
            kinds: [1],
            limit: 30,
          };
          // Important: Don't wrap filter in array when passing to querySync
          events = await pool.querySync(relays, trendingFilter);
          break;
        case "global":
          const globalFilter: Filter = {
            kinds: [1],
            limit: 30,
          };
          // Important: Don't wrap filter in array when passing to querySync
          events = await pool.querySync(relays, globalFilter);
          break;
        case "local":
          // In a real app, would filter by location tags
          const localFilter: Filter = {
            kinds: [1],
            limit: 30,
            "#t": ["local"]
          };
          // Important: Don't wrap filter in array when passing to querySync
          events = await pool.querySync(relays, localFilter);
          break;
      }
      
      // Sort by created_at in descending order (newest first)
      const sortedEvents = events.sort((a, b) => b.created_at - a.created_at);
      setPosts(sortedEvents);
    } catch (error) {
      console.error("Error fetching explore content:", error);
    } finally {
      setLoading(false);
    }
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
                  ? "There's no local content available yet. Be the first to post something!"
                  : "We couldn't find any posts. Try a different category or check back later."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
