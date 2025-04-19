
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { SimplePool, Event, Filter, nip19 } from "nostr-tools";
import { useLocalStorage } from "../hooks/useLocalStorage";

// Default relays
const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nostr.wine",
  "wss://nos.lol",
  "wss://relay.current.fyi"
];

interface NostrKeys {
  privateKey: string;
  publicKey: string;
  npub: string;
  nsec: string;
}

// Define the type for subscription
type Subscription = {
  unsub: () => void;
  on: (event: string, callback: (event: Event) => void) => void;
  off: (event: string, callback: (event: Event) => void) => void;
};

interface NostrContextType {
  pool: SimplePool | null;
  relays: string[];
  addRelay: (relay: string) => void;
  removeRelay: (relay: string) => void;
  keys: NostrKeys | null;
  publishEvent: (event: Partial<Event>) => Promise<Event | null>;
  subscribeToEvents: (filters: Filter[], onEvent: (event: Event) => void) => Subscription | null;
  getProfileEvents: (pubkeys: string[]) => Promise<Event[]>;
  getPostEvents: (limit?: number) => Promise<Event[]>;
  getEvent: (id: string) => Promise<Event | null>;
  followUser: (pubkey: string) => Promise<boolean>;
  unfollowUser: (pubkey: string) => Promise<boolean>;
  getFollowing: () => Promise<string[]>;
  getFollowers: (pubkey?: string) => Promise<string[]>;
  profileData: Record<string, any>;
  refreshProfileData: (pubkey?: string) => Promise<void>;
  userFollows: string[];
  refreshFollows: () => Promise<void>;
  saveProfileChanges: (profile: any) => Promise<boolean>;
  bookmarkPost: (eventId: string, isPrivate?: boolean) => Promise<boolean>;
  getBookmarks: () => Promise<{ public: string[], private: string[] }>;
}

export const NostrContext = createContext<NostrContextType | null>(null);

interface NostrProviderProps {
  children: ReactNode;
}

export const NostrProvider: React.FC<NostrProviderProps> = ({ children }) => {
  const [pool, setPool] = useState<SimplePool | null>(null);
  const [relays, setRelays] = useLocalStorage("nostrRelays", DEFAULT_RELAYS);
  const [onboardingData] = useLocalStorage("onboardingData", null);
  const [keys, setKeys] = useState<NostrKeys | null>(null);
  const [profileData, setProfileData] = useState<Record<string, any>>({});
  const [userFollows, setUserFollows] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useLocalStorage("nostrBookmarks", { public: [], private: [] });
  const [profileDataFetched, setProfileDataFetched] = useState<Set<string>>(new Set());

  // Initialize the pool and keys
  useEffect(() => {
    const newPool = new SimplePool();
    setPool(newPool);

    // Clean up on unmount
    return () => {
      newPool.close(relays);
    };
  }, []);

  // Set keys when onboarding data changes
  useEffect(() => {
    if (onboardingData?.nostrKeys) {
      setKeys(onboardingData.nostrKeys);
    }
  }, [onboardingData]);

  // Refresh user's follows when keys change
  useEffect(() => {
    if (keys?.publicKey) {
      refreshFollows();
      refreshProfileData(keys.publicKey);
    }
  }, [keys]);

  const addRelay = (relay: string) => {
    if (!relays.includes(relay)) {
      const newRelays = [...relays, relay];
      setRelays(newRelays);
    }
  };

  const removeRelay = (relay: string) => {
    const newRelays = relays.filter(r => r !== relay);
    setRelays(newRelays);
  };

  const publishEvent = async (eventData: Partial<Event>): Promise<Event | null> => {
    if (!pool || !keys?.privateKey) return null;

    try {
      // Create a complete event with required fields
      const completeEvent: Event = {
        ...eventData as any,
        pubkey: keys.publicKey,
        id: '',
        sig: '',
        kind: eventData.kind || 1,
        created_at: eventData.created_at || Math.floor(Date.now() / 1000),
        content: eventData.content || '',
        tags: eventData.tags || []
      };
      
      // Publish event to relays
      const pub = pool.publish(relays, completeEvent);
      
      // Wait for at least one relay to confirm
      await Promise.race(pub);
      
      return completeEvent;
    } catch (error) {
      console.error("Failed to publish event:", error);
      return null;
    }
  };

  const subscribeToEvents = (filters: Filter[], onEvent: (event: Event) => void): Subscription | null => {
    if (!pool) return null;

    try {
      // Create subscription handlers
      const subscriptions: any[] = [];
      
      filters.forEach(filter => {
        // Use subscribe() instead of sub()
        const sub = pool.subscribe(relays, [filter]);
        sub.on('event', onEvent);
        subscriptions.push(sub);
      });
      
      // Return a unified subscription object
      return {
        unsub: () => {
          subscriptions.forEach(sub => {
            if (sub && typeof sub.unsub === 'function') {
              sub.unsub();
            }
          });
        },
        on: (_event: string, _callback: (event: Event) => void) => {},
        off: (_event: string, _callback: (event: Event) => void) => {}
      };
    } catch (error) {
      console.error("Failed to subscribe to events:", error);
      return null;
    }
  };

  const getProfileEvents = async (pubkeys: string[]): Promise<Event[]> => {
    if (!pool || pubkeys.length === 0) return [];

    try {
      // Create filter for profile events
      const filter: Filter = {
        kinds: [0],
        authors: pubkeys,
      };
      
      return await pool.querySync(relays, filter);
    } catch (error) {
      console.error("Failed to get profile events:", error);
      return [];
    }
  };

  const getPostEvents = async (limit = 50): Promise<Event[]> => {
    if (!pool || !keys?.publicKey) return [];

    try {
      // First get followed users
      const following = await getFollowing();
      
      // If not following anyone, just get recent global posts
      const filter: Filter = {
        kinds: [1],
        limit,
      };
      
      if (following.length) {
        filter.authors = following;
      }
      
      return await pool.querySync(relays, filter);
    } catch (error) {
      console.error("Failed to get post events:", error);
      return [];
    }
  };

  const getEvent = async (id: string): Promise<Event | null> => {
    if (!pool) return null;

    try {
      const filter: Filter = { ids: [id] };
      const events = await pool.querySync(relays, filter);
      return events.length > 0 ? events[0] : null;
    } catch (error) {
      console.error("Failed to get event:", error);
      return null;
    }
  };

  const getFollowing = async (): Promise<string[]> => {
    if (!pool || !keys?.publicKey) return [];

    try {
      const filter: Filter = {
        kinds: [3],
        authors: [keys.publicKey],
      };
      
      const events = await pool.querySync(relays, filter);

      if (!events.length) return [];

      // Sort by created_at to get the most recent
      const sortedEvents = events.sort((a, b) => b.created_at - a.created_at);
      const latestEvent = sortedEvents[0];
      
      const pubkeys = latestEvent.tags
        .filter(tag => tag[0] === 'p')
        .map(tag => tag[1]);
        
      return pubkeys;
    } catch (error) {
      console.error("Failed to get following:", error);
      return [];
    }
  };

  const getFollowers = async (pubkey?: string): Promise<string[]> => {
    if (!pool) return [];

    const targetPubkey = pubkey || keys?.publicKey;
    if (!targetPubkey) return [];

    try {
      const filter: Filter = {
        kinds: [3],
        '#p': [targetPubkey],
      };
      
      const events = await pool.querySync(relays, filter);
      
      return events.map(event => event.pubkey);
    } catch (error) {
      console.error("Failed to get followers:", error);
      return [];
    }
  };

  const followUser = async (pubkey: string): Promise<boolean> => {
    if (!pool || !keys?.privateKey || !keys?.publicKey) return false;

    try {
      // Get current following
      const currentFollowing = await getFollowing();
      
      // Check if already following
      if (currentFollowing.includes(pubkey)) return true;
      
      // Add the new pubkey
      const newFollowing = [...currentFollowing, pubkey];
      
      // Create new contact list event
      const tags = newFollowing.map(pk => ['p', pk]);
      
      // Publish the updated contact list
      const event = await publishEvent({
        kind: 3,
        content: '',
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });
      
      if (event) {
        // Update local state
        setUserFollows(newFollowing);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Failed to follow user:", error);
      return false;
    }
  };

  const unfollowUser = async (pubkey: string): Promise<boolean> => {
    if (!pool || !keys?.privateKey || !keys?.publicKey) return false;

    try {
      // Get current following
      const currentFollowing = await getFollowing();
      
      // Remove the pubkey
      const newFollowing = currentFollowing.filter(pk => pk !== pubkey);
      
      // Create new contact list event
      const tags = newFollowing.map(pk => ['p', pk]);
      
      // Publish the updated contact list
      const event = await publishEvent({
        kind: 3,
        content: '',
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });
      
      if (event) {
        // Update local state
        setUserFollows(newFollowing);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Failed to unfollow user:", error);
      return false;
    }
  };

  const refreshFollows = async (): Promise<void> => {
    if (keys?.publicKey) {
      const following = await getFollowing();
      setUserFollows(following);
    }
  };

  const refreshProfileData = async (pubkey?: string): Promise<void> => {
    if (!pool) return;

    try {
      let pubkeys: string[] = [];
      
      if (pubkey) {
        // If we've already fetched this profile recently, skip
        if (profileDataFetched.has(pubkey)) {
          return;
        }
        pubkeys = [pubkey];
        
        // Mark this pubkey as fetched
        setProfileDataFetched(prev => {
          const updated = new Set(prev);
          updated.add(pubkey);
          return updated;
        });
      } else {
        // Get all follows to fetch their profiles
        pubkeys = await getFollowing();
        
        // Add the user's own pubkey if available
        if (keys?.publicKey && !pubkeys.includes(keys.publicKey)) {
          pubkeys.push(keys.publicKey);
        }
      }
      
      if (pubkeys.length === 0) return;
      
      const profileEvents = await getProfileEvents(pubkeys);
      
      if (profileEvents.length === 0) return;
      
      const newProfileData = { ...profileData };
      
      profileEvents.forEach(event => {
        try {
          const content = JSON.parse(event.content);
          newProfileData[event.pubkey] = content;
        } catch (e) {
          console.error("Failed to parse profile content:", e);
        }
      });
      
      setProfileData(newProfileData);
    } catch (error) {
      console.error("Failed to refresh profile data:", error);
    }
  };

  const saveProfileChanges = async (profile: any): Promise<boolean> => {
    if (!pool || !keys?.privateKey) return false;

    try {
      const event = await publishEvent({
        kind: 0,
        content: JSON.stringify(profile),
        tags: [],
        created_at: Math.floor(Date.now() / 1000),
      });

      if (event) {
        // Update local profile data
        const newProfileData = { ...profileData };
        newProfileData[keys.publicKey] = profile;
        setProfileData(newProfileData);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to save profile changes:", error);
      return false;
    }
  };

  const bookmarkPost = async (eventId: string, isPrivate: boolean = false): Promise<boolean> => {
    if (!keys?.publicKey) return false;

    try {
      const category = isPrivate ? 'private' : 'public';
      const currentBookmarks = [...bookmarks[category]];
      
      // Check if already bookmarked
      if (currentBookmarks.includes(eventId)) return true;
      
      // Add new bookmark
      const newBookmarks = { ...bookmarks };
      newBookmarks[category] = [...currentBookmarks, eventId];
      
      // Save bookmarks
      setBookmarks(newBookmarks);
      
      // For public bookmarks, publish to the network
      if (!isPrivate) {
        await publishEvent({
          kind: 30001, // Bookmark list
          content: 'Bookmarks',
          tags: [
            ['d', 'bookmarks'],
            ['e', eventId]
          ],
        });
      }
      
      return true;
    } catch (error) {
      console.error("Failed to bookmark post:", error);
      return false;
    }
  };

  const getBookmarks = async (): Promise<{ public: string[], private: string[] }> => {
    return bookmarks;
  };

  return (
    <NostrContext.Provider
      value={{
        pool,
        relays,
        addRelay,
        removeRelay,
        keys,
        publishEvent,
        subscribeToEvents,
        getProfileEvents,
        getPostEvents,
        getEvent,
        followUser,
        unfollowUser,
        getFollowing,
        getFollowers,
        profileData,
        refreshProfileData,
        userFollows,
        refreshFollows,
        saveProfileChanges,
        bookmarkPost,
        getBookmarks,
      }}
    >
      {children}
    </NostrContext.Provider>
  );
};
