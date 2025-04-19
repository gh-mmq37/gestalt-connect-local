
import React, { useState, useEffect } from "react";
import { useNostr } from "../hooks/useNostr";
import { Event, Filter } from "nostr-tools";
import { NostrPost } from "../components/Nostr/NostrPost";
import { UserCard } from "../components/Nostr/UserCard";
import { Search as SearchIcon, Users, MessageSquare, Hash, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";

export const Search: React.FC = () => {
  const location = useLocation();
  const { pool, relays } = useNostr();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [results, setResults] = useState<{
    posts: Event[];
    profiles: Event[];
    loading: boolean;
  }>({
    posts: [],
    profiles: [],
    loading: false,
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      handleSearch(q);
    }
  }, [location.search]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !pool) return;
    
    setResults(prev => ({ ...prev, loading: true }));
    
    try {
      const postFilter: Filter = {
        kinds: [1],
        limit: 40,
      };
      
      const postResults = await pool.querySync(relays, [postFilter]);
      
      const filteredPosts = postResults.filter(event => 
        event.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const profileFilter: Filter = {
        kinds: [0],
        limit: 20,
      };
      
      const profileResults = await pool.querySync(relays, [profileFilter]);
      
      const filteredProfiles = profileResults.filter(event => {
        try {
          const profile = JSON.parse(event.content);
          return (
            profile.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            profile.about?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            profile.nip05?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } catch (e) {
          return false;
        }
      });
      
      setResults({
        posts: filteredPosts,
        profiles: filteredProfiles,
        loading: false,
      });
    } catch (error) {
      console.error("Search error:", error);
      setResults(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Search Nostr</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for posts, people, hashtags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gestalt-purple focus:border-gestalt-purple"
          />
          <SearchIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <button
            type="submit"
            className="absolute right-3 top-2 px-3 py-1.5 bg-gestalt-purple text-white rounded-md hover:bg-gestalt-purple-dark"
          >
            Search
          </button>
        </div>
      </form>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center px-4 py-2 border-b-2 ${
              activeTab === "posts"
                ? "border-gestalt-purple text-gestalt-purple"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Posts
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`flex items-center px-4 py-2 border-b-2 ${
              activeTab === "people"
                ? "border-gestalt-purple text-gestalt-purple"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            People
          </button>
          <button
            onClick={() => setActiveTab("hashtags")}
            className={`flex items-center px-4 py-2 border-b-2 ${
              activeTab === "hashtags"
                ? "border-gestalt-purple text-gestalt-purple"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Hash className="h-4 w-4 mr-2" />
            Hashtags
          </button>
        </div>
      </div>
      
      {results.loading ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-gestalt-purple" />
        </div>
      ) : activeTab === "posts" ? (
        <div>
          {query && results.posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.posts.map(post => (
                <NostrPost key={post.id} event={post} />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "people" ? (
        <div>
          {query && results.profiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No people found for "{query}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.profiles.map(profile => (
                <UserCard key={profile.id} profileEvent={profile} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Hashtag search is coming soon</p>
        </div>
      )}
    </div>
  );
};
