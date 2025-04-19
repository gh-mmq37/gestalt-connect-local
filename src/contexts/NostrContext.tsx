
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { SimplePool, Event, Filter, Sub } from "nostr-tools";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { NostrKeys, NostrContextType, Subscription } from "../types/nostr";
import { DEFAULT_RELAYS } from "../constants/nostrConstants";
import { 
  createNostrEvent, 
  parseProfileContent, 
  createProfileFilter,
  createPostFilter,
  createContactsFilter,
  createDirectMessageFilter,
  createHashtagSearchFilter,
  createContentSearchFilter,
  createMarketplaceFilter,
  createChannelsFilter
} from "../utils/nostrHelpers";

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

  useEffect(() => {
    const newPool = new SimplePool();
    setPool(newPool);

    return () => {
      newPool.close(relays);
    };
  }, []);

  useEffect(() => {
    if (onboardingData?.nostrKeys) {
      setKeys(onboardingData.nostrKeys);
    }
  }, [onboardingData]);

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
      
      // Get the event hash and sign using NIP-07 extension if available
      const event = await window.nostr?.signEvent(completeEvent) || completeEvent;
      
      // Publish to relays
      const pub = pool.publish(relays, event);
      
      await Promise.race(pub);
      
      return event;
    } catch (error) {
      console.error("Failed to publish event:", error);
      return null;
    }
  };

  const subscribeToEvents = (filters: Filter[], onEvent: (event: Event) => void): Subscription | null => {
    if (!pool) return null;

    try {
      // Subscribe to each filter individually
      const subs: Sub[] = [];
      
      filters.forEach(filter => {
        const sub = pool.sub(relays, [filter]);
        sub.on('event', onEvent);
        subs.push(sub);
      });
      
      // Return a composite subscription object
      return {
        unsub: () => {
          subs.forEach(sub => {
            sub.unsub();
          });
        },
        on: (event: string, callback: (event: Event) => void) => {
          if (event === 'event') {
            subs.forEach(sub => {
              sub.on('event', callback);
            });
          }
        },
        off: (event: string, callback: (event: Event) => void) => {
          if (event === 'event') {
            subs.forEach(sub => {
              // Since we can't directly remove specific handlers, we unsub
              sub.unsub();
            });
          }
        }
      };
    } catch (error) {
      console.error("Failed to subscribe to events:", error);
      return null;
    }
  };

  const getProfileEvents = async (pubkeys: string[]): Promise<Event[]> => {
    if (!pool || pubkeys.length === 0) return [];

    try {
      const filter = createProfileFilter(pubkeys);
      return await pool.list(relays, [filter]);
    } catch (error) {
      console.error("Failed to get profile events:", error);
      return [];
    }
  };

  const getPostEvents = async (limit = 50): Promise<Event[]> => {
    if (!pool || !keys?.publicKey) return [];

    try {
      const following = await getFollowing();
      const filter = createPostFilter({ 
        authors: following.length ? following : undefined,
        limit
      });
      
      return await pool.list(relays, [filter]);
    } catch (error) {
      console.error("Failed to get post events:", error);
      return [];
    }
  };

  const getEvent = async (id: string): Promise<Event | null> => {
    if (!pool) return null;

    try {
      const filter: Filter = { ids: [id] };
      const events = await pool.list(relays, [filter]);
      return events.length > 0 ? events[0] : null;
    } catch (error) {
      console.error("Failed to get event:", error);
      return null;
    }
  };

  const getFollowing = async (): Promise<string[]> => {
    if (!pool || !keys?.publicKey) return [];

    try {
      const filter = createContactsFilter(keys.publicKey);
      const events = await pool.list(relays, [filter]);

      if (!events.length) return [];

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
      
      const events = await pool.list(relays, [filter]);
      
      return events.map(event => event.pubkey);
    } catch (error) {
      console.error("Failed to get followers:", error);
      return [];
    }
  };

  const followUser = async (pubkey: string): Promise<boolean> => {
    if (!pool || !keys?.privateKey || !keys?.publicKey) return false;

    try {
      const currentFollowing = await getFollowing();
      
      if (currentFollowing.includes(pubkey)) return true;
      
      const newFollowing = [...currentFollowing, pubkey];
      
      const tags = newFollowing.map(pk => ['p', pk]);
      
      const event = await publishEvent({
        kind: 3,
        content: '',
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });
      
      if (event) {
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
      const currentFollowing = await getFollowing();
      
      const newFollowing = currentFollowing.filter(pk => pk !== pubkey);
      
      const tags = newFollowing.map(pk => ['p', pk]);
      
      const event = await publishEvent({
        kind: 3,
        content: '',
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });
      
      if (event) {
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
        if (profileDataFetched.has(pubkey)) {
          return;
        }
        pubkeys = [pubkey];
        
        setProfileDataFetched(prev => {
          const updated = new Set(prev);
          updated.add(pubkey);
          return updated;
        });
      } else {
        pubkeys = await getFollowing();
        
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
      
      if (currentBookmarks.includes(eventId)) return true;
      
      const newBookmarks = { ...bookmarks };
      newBookmarks[category] = [...currentBookmarks, eventId];
      
      setBookmarks(newBookmarks);
      
      if (!isPrivate) {
        await publishEvent({
          kind: 30001,
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

  const getChannels = async (): Promise<Event[]> => {
    if (!pool) return [];
    
    try {
      const filter = createChannelsFilter();
      return await pool.list(relays, [filter]);
    } catch (error) {
      console.error("Failed to get channels:", error);
      return [];
    }
  };

  const getMarketplaceItems = async (): Promise<Event[]> => {
    if (!pool) return [];
    
    try {
      const filter = createMarketplaceFilter();
      return await pool.list(relays, [filter]);
    } catch (error) {
      console.error("Failed to get marketplace items:", error);
      return [];
    }
  };

  const getDirectMessages = async (pubkey?: string): Promise<Event[]> => {
    if (!pool || !keys?.publicKey) return [];
    
    try {
      const targetPubkey = pubkey || keys.publicKey;
      const filter = createDirectMessageFilter(keys.publicKey, targetPubkey);
      
      return await pool.list(relays, [filter]);
    } catch (error) {
      console.error("Failed to get direct messages:", error);
      return [];
    }
  };

  const sendDirectMessage = async (recipientPubkey: string, content: string): Promise<boolean> => {
    if (!pool || !keys?.privateKey || !keys?.publicKey) return false;
    
    try {
      const event = await publishEvent({
        kind: 4,
        content,
        tags: [
          ['p', recipientPubkey]
        ],
      });
      
      return event !== null;
    } catch (error) {
      console.error("Failed to send direct message:", error);
      return false;
    }
  };

  const createMarketplaceListing = async (listing: any): Promise<boolean> => {
    if (!pool || !keys?.privateKey) return false;
    
    try {
      const event = await publishEvent({
        kind: 30017,
        content: JSON.stringify(listing),
        tags: [
          ['t', 'marketplace'],
          ['price', listing.price.toString()],
          ['title', listing.title]
        ],
      });
      
      return event !== null;
    } catch (error) {
      console.error("Failed to create marketplace listing:", error);
      return false;
    }
  };

  const searchContent = async (query: string, options: { kinds?: number[], limit?: number } = {}): Promise<Event[]> => {
    if (!pool || !query.trim()) return [];
    
    try {
      const filter = createContentSearchFilter(query, options);
      const events = await pool.list(relays, [filter]);
      
      // Client-side filtering since Nostr doesn't have native content search
      return events.filter(event => 
        event.content.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error("Failed to search content:", error);
      return [];
    }
  };

  const searchProfiles = async (query: string, limit = 20): Promise<Event[]> => {
    if (!pool || !query.trim()) return [];
    
    try {
      // Get all profile metadata we can find
      const filter: Filter = { kinds: [0], limit };
      const profileEvents = await pool.list(relays, [filter]);
      
      // Filter client-side based on profile data
      return profileEvents.filter(event => {
        try {
          const profile = JSON.parse(event.content);
          const npub = event.pubkey;
          
          return (
            profile.display_name?.toLowerCase().includes(query.toLowerCase()) ||
            profile.nip05?.toLowerCase().includes(query.toLowerCase()) ||
            profile.about?.toLowerCase().includes(query.toLowerCase()) ||
            npub.includes(query.toLowerCase())
          );
        } catch (e) {
          return false;
        }
      });
    } catch (error) {
      console.error("Failed to search profiles:", error);
      return [];
    }
  };

  const searchHashtags = async (tag: string, limit = 50): Promise<Event[]> => {
    if (!pool || !tag.trim()) return [];
    
    try {
      // Clean the tag (remove # if present)
      const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
      const filter = createHashtagSearchFilter(cleanTag, limit);
      
      return await pool.list(relays, [filter]);
    } catch (error) {
      console.error("Failed to search hashtags:", error);
      return [];
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
        getFollowers,
        profileData,
        refreshProfileData,
        userFollows,
        refreshFollows,
        saveProfileChanges,
        bookmarkPost,
        getBookmarks,
        getChannels,
        getMarketplaceItems,
        getDirectMessages,
        sendDirectMessage,
        createMarketplaceListing,
        searchContent,
        searchProfiles,
        searchHashtags
      }}
    >
      {children}
    </NostrContext.Provider>
  );
};
