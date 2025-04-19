
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
  Loader2,
  Users,
  Bookmark,
  MoreHorizontal,
  Copy
} from "lucide-react";
import { NostrPost } from "../components/Nostr/NostrPost";
import { CreatePost } from "../components/Nostr/CreatePost";
import { Event, Filter } from "nostr-tools";
import { nip19 } from "nostr-tools";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { EditProfileModal } from "../components/Nostr/EditProfileModal";

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
    getFollowers,
    publishEvent 
  } = useNostr();
  
  const [activeTab, setActiveTab] = useState("posts");
  const [targetPubkey, setTargetPubkey] = useState("");
  const [isUserProfile, setIsUserProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Event[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [followers, setFollowers] = useState<string[]>([]);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showFullNpub, setShowFullNpub] = useState(false);
  
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
      fetchFollowers();
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
      
      const events = await pool.querySync(relays, filter);
      
      const sortedEvents = events.sort((a, b) => b.created_at - a.created_at);
      setPosts(sortedEvents);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchFollowers = async () => {
    if (!targetPubkey) return;
    
    try {
      const followersList = await getFollowers(targetPubkey);
      setFollowers(followersList);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };
  
  const handleFollowToggle = async () => {
    if (!keys || isUserProfile) return;
    
    setIsLoading(true);
    
    try {
      if (isFollowing) {
        const success = await unfollowUser(targetPubkey);
        if (success) {
          setIsFollowing(false);
          setFollowers(prev => prev.filter(f => f !== keys.publicKey));
        }
      } else {
        const success = await followUser(targetPubkey);
        if (success) {
          setIsFollowing(true);
          setFollowers(prev => [...prev, keys.publicKey]);
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateProfile = () => {
    if (!isUserProfile || !keys) return;
    
    setShowEditProfileModal(true);
  };

  const handleCopyNpub = () => {
    if (!targetPubkey) return;
    
    try {
      const npubToCopy = nip19.npubEncode(targetPubkey);
      navigator.clipboard.writeText(npubToCopy);
      toast({
        title: "Copied to clipboard",
        description: "Npub has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Error copying npub:", error);
    }
  };
  
  function getJoinedDate() {
    if (posts.length) {
      const earliestPost = [...posts].sort((a, b) => a.created_at - b.created_at)[0];
      return format(new Date(earliestPost.created_at * 1000), "MMMM yyyy");
    }
    return "Unknown";
  }
  
  const profile = targetPubkey ? profileData[targetPubkey] || {} : {};
  const displayName = profile.name || profile.display_name || "Anonymous";
  
  let username = "";
  if (showFullNpub && targetPubkey) {
    try {
      username = nip19.npubEncode(targetPubkey);
    } catch (error) {
      username = targetPubkey;
    }
  } else {
    username = profile.nip05 || (targetPubkey ? `${targetPubkey.slice(0, 8)}...${targetPubkey.slice(-4)}` : "");
  }
  
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
                    <div className="flex items-center gap-2 text-gray-600">
                      <span 
                        className="cursor-pointer hover:text-gestalt-purple"
                        onClick={() => setShowFullNpub(!showFullNpub)}
                      >
                        {username}
                      </span>
                      <Copy 
                        className="h-4 w-4 cursor-pointer hover:text-gestalt-purple" 
                        onClick={handleCopyNpub}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <div className="flex items-center">
                        <span className="font-semibold">{userFollows.length}</span>
                        <span className="ml-1 text-gray-600">Following</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold">{followers.length}</span>
                        <span className="ml-1 text-gray-600">Followers</span>
                      </div>
                    </div>
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
                  <p className="mt-2 max-w-md break-words">{about}</p>
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
              <button
                onClick={() => setActiveTab("following")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "following"
                    ? "border-gestalt-purple text-gestalt-purple-dark"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                Following
              </button>
              <button
                onClick={() => setActiveTab("bookmarks")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "bookmarks" && isUserProfile
                    ? "border-gestalt-purple text-gestalt-purple-dark"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                disabled={!isUserProfile}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmarks
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
            ) : activeTab === "replies" ? (
              <div className="text-center my-12 p-6 bg-gestalt-purple/5 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-gray-600">
                  Replies section will be available soon!
                </p>
              </div>
            ) : activeTab === "following" ? (
              userFollows.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <p>Following list will be displayed here.</p>
                </div>
              ) : (
                <div className="text-center my-12 p-6 bg-gestalt-purple/5 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Not following anyone yet</h3>
                  <p className="text-gray-600">
                    {isUserProfile 
                      ? "Explore the community to find interesting people to follow!" 
                      : `${displayName} isn't following anyone yet.`}
                  </p>
                </div>
              )
            ) : activeTab === "bookmarks" && isUserProfile ? (
              <div className="text-center my-12 p-6 bg-gestalt-purple/5 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Bookmarks</h3>
                <p className="text-gray-600">
                  Your bookmarked posts will appear here.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-gestalt-purple" />
        </div>
      )}

      {showEditProfileModal && (
        <EditProfileModal 
          currentProfile={profileData[keys?.publicKey || ''] || {}}
          onClose={() => setShowEditProfileModal(false)}
          onSave={(profile) => {
            setShowEditProfileModal(false);
            refreshProfileData(keys?.publicKey);
          }}
        />
      )}
    </div>
  );
};
