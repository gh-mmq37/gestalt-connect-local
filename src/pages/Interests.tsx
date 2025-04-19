
import React, { useState, useEffect } from 'react';
import { useNostr } from '../hooks/useNostr';
import { Filter, Event } from 'nostr-tools';
import { Loader2, Hash, ChevronRight, Bookmark, Plus, X } from 'lucide-react';
import { NostrPost } from '../components/Nostr/NostrPost';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { toast } from '@/components/ui/use-toast';

export const Interests: React.FC = () => {
  const { pool, relays } = useNostr();
  const [savedInterests, setSavedInterests] = useLocalStorage<string[]>("savedInterests", []);
  const [loading, setLoading] = useState(false);
  const [trendingTags, setTrendingTags] = useState<{tag: string, count: number}[]>([]);
  const [taggedPosts, setTaggedPosts] = useState<Event[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [newInterest, setNewInterest] = useState("");
  
  useEffect(() => {
    fetchTrendingTags();
  }, []);
  
  useEffect(() => {
    if (selectedTag) {
      fetchPostsByTag(selectedTag);
    }
  }, [selectedTag]);
  
  const fetchTrendingTags = async () => {
    if (!pool) return;
    
    setLoading(true);
    
    try {
      // Get recent posts to analyze tags
      const filter: Filter = {
        kinds: [1],
        limit: 100,
      };
      
      const events = await pool.querySync(relays, filter);
      
      // Extract and count hashtags
      const tagCounts: Record<string, number> = {};
      
      events.forEach(event => {
        // Look for hashtags in the content
        const hashtagRegex = /#(\w+)/g;
        let match;
        while ((match = hashtagRegex.exec(event.content)) !== null) {
          const tag = match[1].toLowerCase();
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
        
        // Also check tags array for 't' tags
        event.tags.forEach(tag => {
          if (tag[0] === 't') {
            const tagName = tag[1].toLowerCase();
            tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
          }
        });
      });
      
      // Convert to array and sort by count
      const sortedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Take top 20 tags
      
      setTrendingTags(sortedTags);
    } catch (error) {
      console.error("Error fetching trending tags:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPostsByTag = async (tag: string) => {
    if (!pool) return;
    
    setLoading(true);
    setTaggedPosts([]);
    
    try {
      // First try to find posts with the tag in the tags array
      const filter: Filter = {
        kinds: [1],
        limit: 30,
        '#t': [tag],
      };
      
      let events = await pool.querySync(relays, filter);
      
      // If not enough posts, also search for hashtags in content
      if (events.length < 10) {
        const contentFilter: Filter = {
          kinds: [1],
          limit: 50,
        };
        
        const contentEvents = await pool.querySync(relays, contentFilter);
        
        // Filter for posts containing the hashtag in content
        const hashtagRegex = new RegExp(`#${tag}\\b`, 'i');
        const hashtagEvents = contentEvents.filter(event => 
          hashtagRegex.test(event.content)
        );
        
        // Merge and remove duplicates
        const allEvents = [...events, ...hashtagEvents];
        const uniqueEvents = Array.from(
          new Map(allEvents.map(event => [event.id, event])).values()
        );
        
        events = uniqueEvents;
      }
      
      // Sort by created_at in descending order (newest first)
      const sortedEvents = events.sort((a, b) => b.created_at - a.created_at);
      setTaggedPosts(sortedEvents);
    } catch (error) {
      console.error(`Error fetching posts for tag ${tag}:`, error);
    } finally {
      setLoading(false);
    }
  };
  
  const addInterest = (tag: string) => {
    if (!savedInterests.includes(tag)) {
      setSavedInterests([...savedInterests, tag]);
      toast({
        title: "Interest added",
        description: `#${tag} has been added to your interests.`,
      });
    }
  };
  
  const removeInterest = (tag: string) => {
    setSavedInterests(savedInterests.filter(t => t !== tag));
    
    if (selectedTag === tag) {
      setSelectedTag(null);
      setTaggedPosts([]);
    }
    
    toast({
      title: "Interest removed",
      description: `#${tag} has been removed from your interests.`,
    });
  };
  
  const handleSubmitNewInterest = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newInterest.trim()) return;
    
    // Remove # if user added it
    const cleanTag = newInterest.trim().replace(/^#/, '');
    
    addInterest(cleanTag);
    setNewInterest("");
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Interests</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-lg mb-4">Your Interests</h2>
            
            <form onSubmit={handleSubmitNewInterest} className="flex mb-4">
              <input
                type="text"
                placeholder="Add new interest..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-gestalt-purple focus:border-gestalt-purple"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-gestalt-purple text-white rounded-r-md hover:bg-gestalt-purple-dark"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>
            
            {savedInterests.length > 0 ? (
              <div className="space-y-2">
                {savedInterests.map(tag => (
                  <div 
                    key={tag}
                    className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${
                      selectedTag === tag ? 'bg-gestalt-purple/10' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedTag(tag)}
                  >
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-2 text-gestalt-purple" />
                      <span>{tag}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeInterest(tag);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Add interests to follow topics you care about.
              </p>
            )}
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Trending Topics</h3>
              {loading && !trendingTags.length ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gestalt-purple" />
                </div>
              ) : (
                <div className="space-y-1">
                  {trendingTags.slice(0, 10).map(({ tag, count }) => (
                    <div 
                      key={tag}
                      className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                      onClick={() => setSelectedTag(tag)}
                    >
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{tag}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2">{count}</span>
                        {!savedInterests.includes(tag) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addInterest(tag);
                            }}
                            className="text-gestalt-purple hover:bg-gestalt-purple/10 p-1 rounded-full"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          {selectedTag ? (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg flex items-center">
                  <Hash className="h-5 w-5 mr-2 text-gestalt-purple" />
                  {selectedTag}
                </h2>
                {!savedInterests.includes(selectedTag) && (
                  <button
                    onClick={() => addInterest(selectedTag)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gestalt-purple text-white rounded-md hover:bg-gestalt-purple-dark"
                  >
                    <Bookmark className="h-4 w-4 mr-1" />
                    <span>Save Interest</span>
                  </button>
                )}
              </div>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gestalt-purple" />
                </div>
              ) : taggedPosts.length > 0 ? (
                <div className="space-y-6">
                  {taggedPosts.map(post => (
                    <NostrPost key={post.id} event={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gestalt-purple/5 rounded-lg">
                  <Hash className="h-12 w-12 text-gestalt-purple mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No posts found</h3>
                  <p className="text-gray-600">
                    There are no recent posts with the #{selectedTag} hashtag.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Hash className="h-12 w-12 text-gestalt-purple mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Select an interest</h2>
              <p className="text-gray-600 mb-4">
                Choose an interest from your saved list or trending topics to view related content.
              </p>
              <p className="text-sm text-gray-500">
                Interests help you discover content and communities that match your passions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
