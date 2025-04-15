
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SimplePool, Event, Filter, Sub } from "nostr-tools";
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

interface NostrContextType {
  pool: SimplePool | null;
  relays: string[];
  addRelay: (relay: string) => void;
  removeRelay: (relay: string) => void;
  keys: NostrKeys | null;
  publishEvent: (event: Partial<Event>) => Promise<Event | null>;
  subscribeToEvents: (filters: Filter[], onEvent: (event: Event) => void) => Sub | null;
  getProfileEvents: (pubkeys: string[]) => Promise<Event[]>;
  getPostEvents: (limit?: number) => Promise<Event[]>;
  getEvent: (id: string) => Promise<Event | null>;
  followUser: (pubkey: string) => Promise<boolean>;
  unfollowUser: (pubkey: string) => Promise<boolean>;
  getFollowing: () => Promise<string[]>;
  profileData: Record<string, any>;
  refreshProfileData: (pubkey?: string) => Promise<void>;
  userFollows: string[];
  refreshFollows: () => Promise<void>;
}

export const NostrContext = createContext<NostrContextType | null>(null);

export const useNostr = () => {
  const context = useContext(NostrContext);
  if (!context) {
    throw new Error("useNostr must be used within a NostrProvider");
  }
  return context;
};

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
      const event = await pool.publish(relays, eventData, keys.privateKey);
      return event;
    } catch (error) {
      console.error("Failed to publish event:", error);
      return null;
    }
  };

  const subscribeToEvents = (filters: Filter[], onEvent: (event: Event) => void): Sub | null => {
    if (!pool) return null;

    try {
      const sub = pool.sub(relays, filters);
      sub.on('event', onEvent);
      return sub;
    } catch (error) {
      console.error("Failed to subscribe to events:", error);
      return null;
    }
  };

  const getProfileEvents = async (pubkeys: string[]): Promise<Event[]> => {
    if (!pool) return [];

    try {
      return await pool.list(relays, [
        {
          kinds: [0],
          authors: pubkeys,
        },
      ]);
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
      const authors = following.length ? following : undefined;
      
      return await pool.list(relays, [
        {
          kinds: [1],
          authors,
          limit,
        },
      ]);
    } catch (error) {
      console.error("Failed to get post events:", error);
      return [];
    }
  };

  const getEvent = async (id: string): Promise<Event | null> => {
    if (!pool) return null;

    try {
      const events = await pool.list(relays, [{ ids: [id] }]);
      return events.length > 0 ? events[0] : null;
    } catch (error) {
      console.error("Failed to get event:", error);
      return null;
    }
  };

  const getFollowing = async (): Promise<string[]> => {
    if (!pool || !keys?.publicKey) return [];

    try {
      const events = await pool.list(relays, [
        {
          kinds: [3],
          authors: [keys.publicKey],
        },
      ]);

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
      const pubkeys = pubkey ? [pubkey] : (userFollows.length ? [...userFollows] : []);
      
      if (keys?.publicKey && !pubkeys.includes(keys.publicKey)) {
        pubkeys.push(keys.publicKey);
      }
      
      if (!pubkeys.length) return;
      
      const profileEvents = await getProfileEvents(pubkeys);
      
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
        profileData,
        refreshProfileData,
        userFollows,
        refreshFollows,
      }}
    >
      {children}
    </NostrContext.Provider>
  );
};
