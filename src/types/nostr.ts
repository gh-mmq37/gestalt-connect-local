
import { Event, Filter } from "nostr-tools";

export interface NostrKeys {
  privateKey: string;
  publicKey: string;
  npub: string;
  nsec: string;
}

export interface NostrProfile {
  display_name?: string;
  picture?: string;
  banner?: string;
  about?: string;
  website?: string;
  nip05?: string;
  location?: string;
}

// Subscription type
export interface Subscription {
  unsub: () => void;
  on: (event: string, callback: (event: Event) => void) => void;
  off: (event: string, callback: (event: Event) => void) => void;
}

export interface BookmarkLists {
  public: string[];
  private: string[];
}

export interface NostrContextType {
  pool: any | null;
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
  getBookmarks: () => Promise<BookmarkLists>;
  getChannels: () => Promise<Event[]>;
  getMarketplaceItems: () => Promise<Event[]>;
  getDirectMessages: (pubkey?: string) => Promise<Event[]>;
  sendDirectMessage: (recipientPubkey: string, content: string) => Promise<boolean>;
  createMarketplaceListing: (listing: any) => Promise<boolean>;
  searchContent: (query: string, options?: { kinds?: number[], limit?: number }) => Promise<Event[]>;
  searchProfiles: (query: string, limit?: number) => Promise<Event[]>;
  searchHashtags: (tag: string, limit?: number) => Promise<Event[]>;
}
