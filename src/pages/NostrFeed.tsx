
import React, { useEffect, useState } from "react";
import { useNostr } from "../hooks/useNostr";
import { Event } from "nostr-tools";
import { NostrPost } from "../components/Nostr/NostrPost";
import { CreatePost } from "../components/Nostr/CreatePost";
import { Loader2 } from "lucide-react";

export const NostrFeed: React.FC = () => {
  const { getPostEvents, refreshFollows, userFollows } = useNostr();
  const [posts, setPosts] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    refreshFollows();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const events = await getPostEvents(50);
      // Sort by created_at in descending order (newest first)
      const sortedEvents = events.sort((a, b) => b.created_at - a.created_at);
      setPosts(sortedEvents);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Feed</h1>
      
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
          {userFollows.length === 0 ? (
            <p className="text-gray-600">
              You're not following anyone yet. Explore the community to find people to follow!
            </p>
          ) : (
            <p className="text-gray-600">
              There are no posts from people you follow. Check back later or explore more accounts to follow.
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
