
import React, { useState } from "react";
import { useNostr } from "../../hooks/useNostr";
import { Image, Link2, AtSign, Hash, Send } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CreatePostProps {
  onPostCreated?: () => void;
  replyTo?: string;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated, replyTo }) => {
  const { publishEvent, keys, profileData } = useNostr();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userProfile = keys?.publicKey ? profileData[keys.publicKey] : null;
  const displayName = userProfile?.name || userProfile?.displayName || "You";
  const avatar = userProfile?.picture || `https://avatars.dicebear.com/api/initials/${displayName.charAt(0)}.svg`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !keys?.privateKey) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tags = [];
      
      // Add reply tag if this is a reply
      if (replyTo) {
        tags.push(["e", replyTo, "", "reply"]);
      }
      
      // Detect and add mentions
      const mentionRegex = /@(\w+)/g;
      let match;
      while ((match = mentionRegex.exec(content)) !== null) {
        // In a real app, you'd look up the pubkey for this username
        // tags.push(["p", pubkey]);
      }
      
      // Detect and add hashtags
      const hashtagRegex = /#(\w+)/g;
      while ((match = hashtagRegex.exec(content)) !== null) {
        tags.push(["t", match[1]]);
      }
      
      const event = await publishEvent({
        kind: 1,
        content,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });
      
      if (event) {
        setContent("");
        toast({
          title: "Post published!",
          description: "Your post has been successfully published to the Nostr network.",
          duration: 3000,
        });
        
        if (onPostCreated) {
          onPostCreated();
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Failed to publish post",
        description: "There was an error publishing your post. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start">
          <img 
            src={avatar}
            alt={displayName}
            className="h-10 w-10 rounded-full mr-3 object-cover"
          />
          <div className="flex-grow">
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gestalt-purple focus:border-gestalt-purple"
              placeholder={replyTo ? "Write your reply..." : "What's happening?"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex space-x-2">
                <button 
                  type="button"
                  className="text-gestalt-purple hover:bg-gestalt-purple/10 p-2 rounded-full"
                  title="Add image"
                >
                  <Image className="h-5 w-5" />
                </button>
                <button 
                  type="button"
                  className="text-gestalt-purple hover:bg-gestalt-purple/10 p-2 rounded-full"
                  title="Add link"
                >
                  <Link2 className="h-5 w-5" />
                </button>
                <button 
                  type="button"
                  className="text-gestalt-purple hover:bg-gestalt-purple/10 p-2 rounded-full"
                  title="Mention someone"
                >
                  <AtSign className="h-5 w-5" />
                </button>
                <button 
                  type="button"
                  className="text-gestalt-purple hover:bg-gestalt-purple/10 p-2 rounded-full"
                  title="Add hashtag"
                >
                  <Hash className="h-5 w-5" />
                </button>
              </div>
              
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                  !content.trim() || isSubmitting
                    ? "bg-gestalt-purple/40 cursor-not-allowed"
                    : "bg-gestalt-purple hover:bg-gestalt-purple-dark"
                } text-white transition-colors`}
              >
                <span>{replyTo ? "Reply" : "Post"}</span>
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
