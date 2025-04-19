
import React, { useState, useEffect } from "react";
import { Event } from "nostr-tools";
import { Link } from "react-router-dom";
import { useNostr } from "../../hooks/useNostr";
import { Heart, MessageCircle, Repeat, Share2, MoreHorizontal, Bookmark, Flag, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nip19 } from "nostr-tools";
import { toast } from "@/components/ui/use-toast";

interface NostrPostProps {
  event: Event;
}

export const NostrPost: React.FC<NostrPostProps> = ({ event }) => {
  const { profileData, refreshProfileData, keys, publishEvent, bookmarkPost } = useNostr();
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [npub, setNpub] = useState("");
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  
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
  const displayName = profile.name || profile.display_name || "Anonymous";
  const avatar = profile.picture || `https://avatars.dicebear.com/api/initials/${displayName.charAt(0)}.svg`;
  const username = profile.nip05 || (npub ? npub.slice(0, 8) + "..." + npub.slice(-4) : "");
  
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
      toast({
        title: "Post liked",
        description: "You liked this post.",
      });
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
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
      toast({
        title: "Post reposted",
        description: "You reposted this post to your followers.",
      });
    } catch (error) {
      console.error("Error reposting:", error);
      toast({
        title: "Error",
        description: "Failed to repost. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async (isPrivate: boolean = false) => {
    if (!keys) return;
    
    try {
      const success = await bookmarkPost(event.id, isPrivate);
      if (success) {
        setBookmarked(true);
        toast({
          title: isPrivate ? "Privately bookmarked" : "Bookmarked",
          description: isPrivate 
            ? "This post has been saved to your private bookmarks." 
            : "This post has been saved to your bookmarks.",
        });
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
      toast({
        title: "Error",
        description: "Failed to bookmark post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequest = async () => {
    if (!keys || event.pubkey !== keys.publicKey) return;
    
    try {
      await publishEvent({
        kind: 5,
        content: "Deleted post",
        tags: [
          ["e", event.id]
        ],
        created_at: Math.floor(Date.now() / 1000),
      });
      toast({
        title: "Deletion request sent",
        description: "Your deletion request has been published to the network.",
      });
    } catch (error) {
      console.error("Error sending deletion request:", error);
      toast({
        title: "Error",
        description: "Failed to request deletion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowDropdown(false);
    }
  };
  
  // Parse content for mentions, hashtags, URLs, and media
  const parseContent = () => {
    let content = event.content;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hashtagRegex = /#(\w+)/g;
    const imageUrlRegex = /(https?:\/\/\S+\.(jpg|jpeg|png|gif|webp)(\?[^"'')\s]+)?)/gi;
    
    // Extract image URLs
    const imageUrls: string[] = [];
    let match;
    while ((match = imageUrlRegex.exec(content)) !== null) {
      imageUrls.push(match[0]);
    }
    
    // Replace URLs with clickable links
    const withUrls = content.replace(urlRegex, url => {
      // Don't wrap image URLs, we'll handle them separately
      if (imageUrls.includes(url)) {
        return url;
      }
      return `<a href="${url}" target="_blank" class="text-gestalt-purple hover:underline">${url}</a>`;
    });
    
    // Replace hashtags
    const withHashtags = withUrls.replace(hashtagRegex, (match, tag) => 
      `<a href="/search?q=${tag}" class="text-gestalt-purple hover:underline">${match}</a>`
    );
    
    return {
      html: withHashtags,
      imageUrls: imageUrls,
    };
  };
  
  const parsedContent = parseContent();
  
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
        <div className="ml-3 flex-grow overflow-hidden">
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
                        const noteId = nip19.noteEncode(event.id);
                        navigator.clipboard.writeText(`nostr:${noteId}`);
                        setShowDropdown(false);
                        toast({
                          title: "Copied to clipboard",
                          description: "Note ID has been copied to your clipboard.",
                        });
                      }}
                    >
                      Copy Note ID
                    </button>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        handleBookmark(false);
                        setShowDropdown(false);
                      }}
                    >
                      Bookmark
                    </button>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        handleBookmark(true);
                        setShowDropdown(false);
                      }}
                    >
                      Private Bookmark
                    </button>
                    {event.pubkey === keys?.publicKey && (
                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={handleDeleteRequest}
                      >
                        Delete Post
                      </button>
                    )}
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        // Report functionality
                        setShowDropdown(false);
                        toast({
                          title: "Report submitted",
                          description: "Thank you for your report. We'll review this content.",
                        });
                      }}
                    >
                      Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-2 text-gray-800 break-words">
            <div dangerouslySetInnerHTML={{ __html: parsedContent.html }} />
            
            {parsedContent.imageUrls.length > 0 && (
              <div className="mt-3">
                {parsedContent.imageUrls.map((url, index) => (
                  <div 
                    key={`${event.id}-img-${index}`} 
                    className="mt-2 rounded-lg overflow-hidden"
                  >
                    <img 
                      src={url} 
                      alt="Post attachment" 
                      className={`max-w-full rounded cursor-pointer ${isImageExpanded ? 'h-auto' : 'max-h-96 object-cover'}`}
                      onClick={() => setIsImageExpanded(!isImageExpanded)}
                    />
                  </div>
                ))}
              </div>
            )}
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
            
            <button 
              className={`flex items-center space-x-1 ${bookmarked ? 'text-gestalt-purple' : 'hover:text-gestalt-purple'}`}
              onClick={() => handleBookmark(false)}
            >
              <Bookmark className="h-4 w-4" />
              <span className="text-xs">Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
