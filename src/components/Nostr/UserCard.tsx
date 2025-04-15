
import React, { useState, useEffect } from "react";
import { Event } from "nostr-tools";
import { Link } from "react-router-dom";
import { useNostr } from "../../hooks/useNostr";
import { UserPlus, UserCheck, MapPin } from "lucide-react";
import { nip19 } from "nostr-tools";

interface UserCardProps {
  profileEvent: Event;
}

export const UserCard: React.FC<UserCardProps> = ({ profileEvent }) => {
  const { followUser, unfollowUser, userFollows, keys } = useNostr();
  const [profile, setProfile] = useState<any>({});
  const [npub, setNpub] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    try {
      const profileData = JSON.parse(profileEvent.content);
      setProfile(profileData);
      
      const encodedNpub = nip19.npubEncode(profileEvent.pubkey);
      setNpub(encodedNpub);
      
      // Check if we're following this profile
      setIsFollowing(userFollows.includes(profileEvent.pubkey));
    } catch (error) {
      console.error("Error parsing profile data:", error);
    }
  }, [profileEvent, userFollows]);
  
  const handleFollowToggle = async () => {
    if (!keys) return;
    
    if (profileEvent.pubkey === keys.publicKey) {
      return; // Can't follow yourself
    }
    
    setIsLoading(true);
    
    try {
      if (isFollowing) {
        const success = await unfollowUser(profileEvent.pubkey);
        if (success) {
          setIsFollowing(false);
        }
      } else {
        const success = await followUser(profileEvent.pubkey);
        if (success) {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const displayName = profile.name || profile.display_name || "Anonymous";
  const username = profile.nip05 || npub.slice(0, 8) + "..." + npub.slice(-4);
  const avatar = profile.picture || `https://avatars.dicebear.com/api/initials/${displayName.charAt(0)}.svg`;
  const about = profile.about || "";
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow transition-shadow">
      <div className="flex items-start">
        <Link to={`/profile/${npub}`} className="flex-shrink-0">
          <img 
            src={avatar} 
            alt={displayName} 
            className="h-12 w-12 rounded-full object-cover"
          />
        </Link>
        <div className="ml-3 flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <Link to={`/profile/${npub}`} className="font-semibold text-gray-900 hover:underline block">
                {displayName}
              </Link>
              <p className="text-sm text-gray-500">{username}</p>
              
              {profile.location && (
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {profile.location}
                </p>
              )}
            </div>
            
            {keys && profileEvent.pubkey !== keys.publicKey && (
              <button
                onClick={handleFollowToggle}
                disabled={isLoading}
                className={`px-3 py-1 rounded-full text-sm flex items-center ${
                  isFollowing 
                    ? "bg-gray-100 text-gray-800 hover:bg-gray-200" 
                    : "bg-gestalt-purple text-white hover:bg-gestalt-purple-dark"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-3 w-3 mr-1" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3 mr-1" />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>
          
          {about && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{about}</p>
          )}
        </div>
      </div>
    </div>
  );
};
