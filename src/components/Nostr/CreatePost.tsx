
import React, { useState, useRef } from "react";
import { useNostr } from "../../hooks/useNostr";
import { Image, Link2, AtSign, Hash, Send, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CreatePostProps {
  onPostCreated?: () => void;
  replyTo?: string;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated, replyTo }) => {
  const { publishEvent, keys, profileData } = useNostr();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const userProfile = keys?.publicKey ? profileData[keys.publicKey] : null;
  const displayName = userProfile?.name || userProfile?.display_name || "You";
  const avatar = userProfile?.picture || `https://avatars.dicebear.com/api/initials/${displayName.charAt(0)}.svg`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!content.trim() && images.length === 0) || !keys?.privateKey) {
      toast({
        title: "Empty post",
        description: "Please add some text or images to your post.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tags = [];
      
      // Add reply tag if this is a reply
      if (replyTo) {
        tags.push(["e", replyTo, "", "reply"]);
      }
      
      // Add hashtags from content
      const hashtagRegex = /#(\w+)/g;
      let match;
      let uniqueTags = new Set<string>();
      
      while ((match = hashtagRegex.exec(content)) !== null) {
        if (!uniqueTags.has(match[1])) {
          tags.push(["t", match[1]]);
          uniqueTags.add(match[1]);
        }
      }
      
      // Prepare post content
      let finalContent = content;
      
      // Add images as URLs at the end of the content
      if (images.length > 0) {
        const imageUrls = images.join('\n');
        finalContent = content ? `${content}\n\n${imageUrls}` : imageUrls;
      }
      
      const event = await publishEvent({
        kind: 1,
        content: finalContent,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });
      
      if (event) {
        setContent("");
        setImages([]);
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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map(file => {
        return URL.createObjectURL(file);
      });
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index]);
    newImages.splice(index, 1);
    setImages(newImages);
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
            
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Upload ${index + 1}`} 
                      className="h-20 w-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex space-x-2">
                <button 
                  type="button"
                  className="text-gestalt-purple hover:bg-gestalt-purple/10 p-2 rounded-full"
                  title="Add image"
                  onClick={handleImageClick}
                >
                  <Image className="h-5 w-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
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
                disabled={isSubmitting || (!content.trim() && images.length === 0)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                  isSubmitting || (!content.trim() && images.length === 0)
                    ? "bg-gestalt-purple/40 cursor-not-allowed"
                    : "bg-gestalt-purple hover:bg-gestalt-purple-dark"
                } text-white transition-colors`}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-1"></div>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <span>{replyTo ? "Reply" : "Post"}</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
