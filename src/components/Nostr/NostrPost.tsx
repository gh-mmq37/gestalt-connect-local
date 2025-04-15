
import React, { useState, useEffect } from "react";
import { Event } from "nostr-tools";
import { Link } from "react-router-dom";
import { useNostr } from "../../hooks/useNostr";
import { Heart, MessageCircle, Repeat, Share2, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nip19 } from "nostr-tools";

interface NostrPostProps {
  event: Event;
}

export const NostrPost: React.FC<NostrPostProps> = ({ event }) => {
  const { profileData, refreshProfileData, keys, publishEvent } = useNostr();
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [npub, setNpub] = useState("");
  
  useEffect(() => {
    if (!profileData[event.pubkey]) {
      refreshProfileData(event.pubkey);
    }
    
    try {
      const encodedNpub = nip19.npubEncode(event.pubkey);
      setNpub(encodedNpub);
    } catch (error) {
      console.error("Error encoding pubkey to npub:", error);
    }
  }, [event.pubkey, profileData, refreshProfileData]);

  const profile = profileData[event.pubkey] || {};
  const displayName = profile.name || profile.displayName || "Anonymous";
  const avatar = profile.picture || `https://avatars.dicebear.com/api/initials/${displayName.charAt(0)}.svg`;
  const username = profile.nip05 || npub.slice(0, 8) + "..." + npub.slice(-4);
  
  const created = new Date(event.created_at * 1000);
  const timeAgo = formatDistanceToNow(created, { addSuffix: true });
  
  const handleLike = async () => {
    if (!keys) return;
    
    try {
      await publishEvent({
        kind: 7,
        content: "+",
        tags: [
          ["e", event.id],
          ["p", event.pubkey]
        ],
        created_at: Math.floor(Date.now() / 1000),
      });
      setLiked(true);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };
  
  const handleRepost = async () => {
    if (!keys) return;
    
    try {
      await publishEvent({
        kind: 6,
        content: "",
        tags: [
          ["e", event.id],
          ["p", event.pubkey]
        ],
        created_at: Math.floor(Date.now() / 1000),
      });
      setReposted(true);
    } catch (error) {
      console.error("Error reposting:", error);
    }
  };
  
  // Parse content for mentions, hashtags, and URLs
  const renderContent = (content: string) => {
    // Very basic parsing for demonstration
    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const withUrls = content.replace(urlRegex, url => `<a href="${url}" target="_blank" class="text-gestalt-purple hover:underline">${url}</a>`);
    
    // Replace hashtags
    const hashtagRegex = /#(\w+)/g;
    const withHashtags = withUrls.replace(hashtagRegex, (match, tag) => 
      `<a href="/search?q=${tag}" class="text-gestalt-purple hover:underline">${match}</a>`
    );
    
    return { __html: withHashtags };
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
      <div className="flex items-start">
        <Link to={`/profile/${npub}`} className="flex-shrink-0">
          <img 
            src={avatar} 
            alt={displayName} 
            className="h-10 w-10 rounded-full object-cover"
          />
        </Link>
        <div className="ml-3 flex-grow">
          <div className="flex items-center justify-between">
            <div>
              <Link to={`/profile/${npub}`} className="font-semibold text-gray-900 hover:underline">
                {displayName}
              </Link>
              <p className="text-sm text-gray-500">
                {username} · {timeAgo}
              </p>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://your-domain.com/e/${event.id}`);
                        setShowDropdown(false);
                      }}
                    >
                      Copy Link
                    </button>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        // Report or mute functionality
                        setShowDropdown(false);
                      }}
                    >
                      Report/Mute
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-2 text-gray-800">
            <div dangerouslySetInnerHTML={renderContent(event.content)} />
          </div>
          
          <div className="mt-3 flex items-center space-x-6 text-gray-500">
            <button 
              className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
              onClick={handleLike}
            >
              <Heart className="h-4 w-4" />
              <span className="text-xs">Like</span>
            </button>
            
            <button className="flex items-center space-x-1 hover:text-gestalt-purple">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">Reply</span>
            </button>
            
            <button 
              className={`flex items-center space-x-1 ${reposted ? 'text-green-500' : 'hover:text-green-500'}`}
              onClick={handleRepost}
            >
              <Repeat className="h-4 w-4" />
              <span className="text-xs">Repost</span>
            </button>
            
            <button className="flex items-center space-x-1 hover:text-gestalt-purple">
              <Share2 className="h-4 w-4" />
              <span className="text-xs">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
