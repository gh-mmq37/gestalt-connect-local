
import React, { useState, useEffect } from "react";
import { useNostr } from "../hooks/useNostr";
import { Event } from "nostr-tools";
import { NostrPost } from "../components/Nostr/NostrPost";
import { UserCard } from "../components/Nostr/UserCard";
import { Search as SearchIcon, Users, MessageSquare, Hash, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export const Search: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchContent, searchProfiles, searchHashtags, relays } = useNostr();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [results, setResults] = useState<{
    posts: Event[];
    profiles: Event[];
    hashtags: Event[];
    loading: boolean;
  }>({
    posts: [],
    profiles: [],
    hashtags: [],
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
    if (!searchQuery.trim()) return;
    
    setResults(prev => ({ ...prev, loading: true }));
    
    try {
      // First, let's show what relays we're searching
      console.log(`Searching across ${relays.length} relays: ${relays.join(', ')}`);
      
      // Posts search
      const postResults = await searchContent(searchQuery);
      console.log(`Found ${postResults.length} posts matching "${searchQuery}"`);
      
      // Profile search
      const profileResults = await searchProfiles(searchQuery);
      console.log(`Found ${profileResults.length} profiles matching "${searchQuery}"`);
      
      // Hashtag search (if the query starts with #, search for that tag without the #)
      let hashtagResults: Event[] = [];
      if (searchQuery.startsWith('#')) {
        hashtagResults = await searchHashtags(searchQuery.slice(1));
      } else {
        // Also search for the term as a hashtag
        hashtagResults = await searchHashtags(searchQuery);
      }
      console.log(`Found ${hashtagResults.length} posts with hashtag "${searchQuery}"`);
      
      setResults({
        posts: postResults,
        profiles: profileResults,
        hashtags: hashtagResults,
        loading: false,
      });
      
      // Show search summary toast
      const totalResults = postResults.length + profileResults.length + hashtagResults.length;
      toast({
        title: "Search complete",
        description: `Found ${totalResults} results for "${searchQuery}"`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Search error:", error);
      setResults(prev => ({ ...prev, loading: false }));
      toast({
        title: "Search failed",
        description: "There was an error performing your search. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Update URL to reflect search
    navigate(`/search?q=${encodeURIComponent(query)}`);
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
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gestalt-purple focus:border-gestalt-purple"
          />
          <SearchIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <button
            type="submit"
            className="absolute right-3 top-2 px-3 py-1.5 bg-gestalt-purple text-white rounded-md hover:bg-gestalt-purple-dark transition-colors"
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
            {results.posts.length > 0 && ` (${results.posts.length})`}
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
            {results.profiles.length > 0 && ` (${results.profiles.length})`}
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
            {results.hashtags.length > 0 && ` (${results.hashtags.length})`}
          </button>
        </div>
      </div>
      
      {/* Search info */}
      {query && !results.loading && (
        <div className="mb-4 text-sm text-gray-500">
          Searching across {relays.length} relay{relays.length !== 1 ? 's' : ''}
        </div>
      )}
      
      {results.loading ? (
        <div className="flex flex-col items-center justify-center my-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-gestalt-purple" />
          <p className="text-gray-600">Searching Nostr network...</p>
        </div>
      ) : activeTab === "posts" ? (
        <div>
          {query && results.posts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 font-medium">No posts found for "{query}"</p>
              <p className="text-gray-400 text-sm mt-2">Try a different search term or check your relay connections</p>
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
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 font-medium">No people found for "{query}"</p>
              <p className="text-gray-400 text-sm mt-2">Try a different search term or check your relay connections</p>
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
        <div>
          {query && results.hashtags.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Hash className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 font-medium">No posts found with hashtag "{query}"</p>
              <p className="text-gray-400 text-sm mt-2">Try a different hashtag or check your relay connections</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center">
                <Hash className="h-5 w-5 mr-1" />
                {query.startsWith('#') ? query.slice(1) : query}
              </h2>
              {results.hashtags.map(post => (
                <NostrPost key={post.id} event={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
