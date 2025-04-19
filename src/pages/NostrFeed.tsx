
import React, { useEffect, useState } from "react";
import { useNostr } from "../hooks/useNostr";
import { Event, Filter } from "nostr-tools";
import { NostrPost } from "../components/Nostr/NostrPost";
import { CreatePost } from "../components/Nostr/CreatePost";
import { Loader2, Plus, Hash, Filter as FilterIcon, ChevronDown, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface CustomFeed {
  id: string;
  name: string;
  type: 'hashtag' | 'authors';
  value: string;
}

export const NostrFeed: React.FC = () => {
  const { getPostEvents, refreshFollows, userFollows, pool, relays } = useNostr();
  const [posts, setPosts] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [customFeeds, setCustomFeeds] = useLocalStorage<CustomFeed[]>("customFeeds", []);
  const [activeFeed, setActiveFeed] = useState<string>("following");
  const [showAddFeedDropdown, setShowAddFeedDropdown] = useState(false);
  const [newFeedName, setNewFeedName] = useState("");
  const [newFeedType, setNewFeedType] = useState<"hashtag" | "authors">("hashtag");
  const [newFeedValue, setNewFeedValue] = useState("");

  useEffect(() => {
    refreshFollows();
    fetchPosts();
  }, [activeFeed]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      if (activeFeed === "following") {
        const events = await getPostEvents(50);
        // Sort by created_at in descending order (newest first)
        const sortedEvents = events.sort((a, b) => b.created_at - a.created_at);
        setPosts(sortedEvents);
      } else {
        // Find the custom feed
        const customFeed = customFeeds.find(feed => feed.id === activeFeed);
        
        if (customFeed && pool) {
          let filter: Filter = {
            kinds: [1],
            limit: 50,
          };
          
          if (customFeed.type === 'hashtag') {
            filter['#t'] = [customFeed.value];
          } else if (customFeed.type === 'authors') {
            // This would be for a feed of specific users
            filter.authors = [customFeed.value];
          }
          
          // Use querySync instead of list
          const events = await pool.querySync(relays, [filter]);
          const sortedEvents = events.sort((a, b) => b.created_at - a.created_at);
          setPosts(sortedEvents);
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error loading feed",
        description: "There was a problem loading your feed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomFeed = () => {
    if (!newFeedName.trim() || !newFeedValue.trim()) {
      toast({
        title: "Invalid input",
        description: "Please provide a name and value for your custom feed.",
        variant: "destructive",
      });
      return;
    }
    
    const newFeed: CustomFeed = {
      id: Date.now().toString(),
      name: newFeedName,
      type: newFeedType,
      value: newFeedValue,
    };
    
    setCustomFeeds([...customFeeds, newFeed]);
    setNewFeedName("");
    setNewFeedValue("");
    setShowAddFeedDropdown(false);
    
    toast({
      title: "Feed Added",
      description: `Your custom feed "${newFeedName}" has been created.`,
    });
  };

  const handleRemoveCustomFeed = (id: string) => {
    setCustomFeeds(customFeeds.filter(feed => feed.id !== id));
    
    if (activeFeed === id) {
      setActiveFeed("following");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Feed</h1>
        
        <div className="relative">
          <button
            onClick={() => setShowAddFeedDropdown(!showAddFeedDropdown)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gestalt-purple text-white rounded-md hover:bg-gestalt-purple-dark transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Feed</span>
          </button>
          
          {showAddFeedDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-10 border border-gray-200 p-4">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Create Custom Feed</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feed Name</label>
                  <input
                    type="text"
                    value={newFeedName}
                    onChange={(e) => setNewFeedName(e.target.value)}
                    placeholder="My Custom Feed"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gestalt-purple focus:border-gestalt-purple"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feed Type</label>
                  <select
                    value={newFeedType}
                    onChange={(e) => setNewFeedType(e.target.value as "hashtag" | "authors")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gestalt-purple focus:border-gestalt-purple"
                  >
                    <option value="hashtag">Hashtag</option>
                    <option value="authors">Specific Author</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newFeedType === "hashtag" ? "Hashtag (without #)" : "Author Pubkey"}
                  </label>
                  <input
                    type="text"
                    value={newFeedValue}
                    onChange={(e) => setNewFeedValue(e.target.value)}
                    placeholder={newFeedType === "hashtag" ? "nostr" : "Public key"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gestalt-purple focus:border-gestalt-purple"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddFeedDropdown(false)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomFeed}
                    className="px-3 py-1.5 bg-gestalt-purple text-white rounded-md hover:bg-gestalt-purple-dark"
                  >
                    Create Feed
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFeed("following")}
          className={`flex items-center px-3 py-1.5 rounded-md ${
            activeFeed === "following"
              ? "bg-gestalt-purple text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FilterIcon className="h-4 w-4 mr-1" />
          Following
        </button>
        
        {customFeeds.map((feed) => (
          <div key={feed.id} className="relative group">
            <button
              onClick={() => setActiveFeed(feed.id)}
              className={`flex items-center px-3 py-1.5 rounded-md ${
                activeFeed === feed.id
                  ? "bg-gestalt-purple text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {feed.type === "hashtag" ? (
                <Hash className="h-4 w-4 mr-1" />
              ) : (
                <User className="h-4 w-4 mr-1" />
              )}
              {feed.name}
            </button>
            <button
              onClick={() => handleRemoveCustomFeed(feed.id)}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      
      <CreatePost onPostCreated={fetchPosts} />
      
      {loading ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-gestalt-purple" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6 mt-8">
          {posts.map((post) => (
            <NostrPost key={post.id} event={post} />
          ))}
        </div>
      ) : (
        <div className="text-center my-12 p-6 bg-gestalt-purple/5 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Your feed is empty</h3>
          {activeFeed === "following" ? (
            userFollows.length === 0 ? (
              <p className="text-gray-600">
                You're not following anyone yet. Explore the community to find people to follow!
              </p>
            ) : (
              <p className="text-gray-600">
                There are no posts from people you follow. Check back later or explore more accounts to follow.
              </p>
            )
          ) : (
            <p className="text-gray-600">
              No posts found for this custom feed. Try a different hashtag or check back later.
            </p>
          )}
          <button
            onClick={fetchPosts}
            className="mt-4 px-4 py-2 bg-gestalt-purple text-white rounded-md hover:bg-gestalt-purple-dark transition-colors"
          >
            Refresh Feed
          </button>
        </div>
      )}
    </div>
  );
};

// User component
const User = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
};
