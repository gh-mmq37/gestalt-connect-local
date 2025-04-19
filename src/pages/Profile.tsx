import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNostr } from "../hooks/useNostr";
import { 
  User, 
  Link as LinkIcon,
  MapPin, 
  Calendar,
  Edit,
  UserPlus,
  UserCheck,
  MessageSquare,
  Loader2
} from "lucide-react";
import { NostrPost } from "../components/Nostr/NostrPost";
import { CreatePost } from "../components/Nostr/CreatePost";
import { Event, Filter } from "nostr-tools";
import { nip19 } from "nostr-tools";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";

export const Profile: React.FC = () => {
  const { npub } = useParams<{ npub: string }>();
  const { 
    keys, 
    profileData, 
    refreshProfileData, 
    pool, 
    relays, 
    userFollows, 
    followUser, 
    unfollowUser,
    publishEvent 
  } = useNostr();
  
  const [activeTab, setActiveTab] = useState("posts");
  const [targetPubkey, setTargetPubkey] = useState("");
  const [isUserProfile, setIsUserProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Event[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  
  useEffect(() => {
    const initProfile = async () => {
      try {
        if (npub) {
          const { type, data } = nip19.decode(npub);
          if (type === 'npub') {
            setTargetPubkey(data as string);
            setIsUserProfile(keys?.publicKey === data);
          }
        } else if (keys?.publicKey) {
          setTargetPubkey(keys.publicKey);
          setIsUserProfile(true);
        }
      } catch (error) {
        console.error("Error decoding npub:", error);
        toast({
          title: "Invalid profile",
          description: "This profile link is invalid.",
          variant: "destructive",
        });
      }
    };
    
    initProfile();
  }, [npub, keys]);
  
  useEffect(() => {
    if (targetPubkey) {
      setIsFollowing(userFollows.includes(targetPubkey));
      refreshProfileData(targetPubkey);
      fetchUserPosts();
    }
  }, [targetPubkey, userFollows]);
  
  const fetchUserPosts = async () => {
    if (!pool || !targetPubkey) return;
    
    setLoadingPosts(true);
    
    try {
      const filter: Filter = {
        kinds: [1],
        authors: [targetPubkey],
        limit: 30,
      };
      
      const events = await pool.querySync(relays, [filter]);
      
      const sortedEvents = events.sort((a, b) => b.created_at - a.created_at);
      setPosts(sortedEvents);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };
  
  function handleFollowToggle() {
    if (!keys || isUserProfile) return;
    
    setIsLoading(true);
    
    try {
      if (isFollowing) {
        const success = await unfollowUser(targetPubkey);
        if (success) {
          setIsFollowing(false);
        }
      } else {
        const success = await followUser(targetPubkey);
        if (success) {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  function handleUpdateProfile() {
    if (!isUserProfile || !keys) return;
    
    try {
      toast({
        title: "Coming Soon",
        description: "Profile editing will be available soon!",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }
  
  function getJoinedDate() {
    if (posts.length) {
      const earliestPost = [...posts].sort((a, b) => a.created_at - b.created_at)[0];
      return format(new Date(earliestPost.created_at * 1000), "MMMM yyyy");
    }
    return "Unknown";
  }
  
  const profile = targetPubkey ? profileData[targetPubkey] || {} : {};
  const displayName = profile.name || profile.display_name || "Anonymous";
  const username = profile.nip05 || (targetPubkey ? `${targetPubkey.slice(0, 8)}...${targetPubkey.slice(-4)}` : "");
  const avatar = profile.picture || `https://avatars.dicebear.com/api/initials/${displayName.charAt(0)}.svg`;
  const about = profile.about || "";
  const website = profile.website || "";
  const location = profile.location || "";
  
  return (
    <div className="max-w-4xl mx-auto">
      {targetPubkey ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gestalt-purple/10 p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gestalt-purple flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  displayName.charAt(0)
                )}
              </div>
              <div className="text-center sm:text-left flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">{displayName}</h1>
                    <p className="text-gray-600">{username}</p>
                  </div>
                  
                  {keys && (
                    isUserProfile ? (
                      <button
                        onClick={handleUpdateProfile}
                        className="px-4 py-2 bg-gestalt-purple text-white rounded-full hover:bg-gestalt-purple-dark flex items-center justify-center sm:justify-start"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </button>
                    ) : (
                      <button
                        onClick={handleFollowToggle}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-full flex items-center justify-center sm:justify-start ${
                          isFollowing 
                            ? "bg-gray-100 text-gray-800 hover:bg-gray-200" 
                            : "bg-gestalt-purple text-white hover:bg-gestalt-purple-dark"
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Follow
                          </>
                        )}
                      </button>
                    )
                  )}
                </div>
                
                {about && (
                  <p className="mt-2 max-w-md">{about}</p>
                )}
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3 text-sm text-gray-600">
                  {location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {location}
                    </div>
                  )}
                  
                  {website && (
                    <div className="flex items-center">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      <a 
                        href={website.startsWith('http') ? website : `https://${website}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gestalt-purple hover:underline"
                      >
                        {website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {getJoinedDate()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("posts")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "posts"
                    ? "border-gestalt-purple text-gestalt-purple-dark"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                Posts
              </button>
              <button
                onClick={() => setActiveTab("replies")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "replies"
                    ? "border-gestalt-purple text-gestalt-purple-dark"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Replies
              </button>
            </nav>
          </div>

          <div className="p-6">
            {isUserProfile && activeTab === "posts" && (
              <CreatePost onPostCreated={fetchUserPosts} />
            )}
            
            {loadingPosts ? (
              <div className="flex justify-center my-12">
                <Loader2 className="h-8 w-8 animate-spin text-gestalt-purple" />
              </div>
            ) : activeTab === "posts" ? (
              posts.length > 0 ? (
                <div className="space-y-6 mt-4">
                  {posts.map(post => (
                    <NostrPost key={post.id} event={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center my-12 p-6 bg-gestalt-purple/5 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                  <p className="text-gray-600">
                    {isUserProfile 
                      ? "Share your first post with the community!"
                      : `${displayName} hasn't posted anything yet.`}
                  </p>
                </div>
              )
            ) : (
              <div className="text-center my-12 p-6 bg-gestalt-purple/5 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-gray-600">
                  Replies section will be available soon!
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-gestalt-purple" />
        </div>
      )}
    </div>
  );
};
