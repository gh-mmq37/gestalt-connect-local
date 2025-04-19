
import { Event, Filter, nip19, getEventHash, getPublicKey } from "nostr-tools";
import { EVENT_KINDS } from "../constants/nostrConstants";

// Creates a Nostr event with proper structure
export const createNostrEvent = (kind: number, content: string, tags: string[][], privateKey: string, pubkey: string): Event => {
  const event: Event = {
    kind,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content,
    pubkey,
    id: '',
    sig: ''
  };

  // Assign id
  event.id = getEventHash(event);
  
  // For signing, we'll use the NIP-07 extension or a custom signer
  // This is now handled elsewhere since signEvent is no longer exported

  return event;
};

// Parse profile data from Nostr event content
export const parseProfileContent = (event: Event): any => {
  try {
    return JSON.parse(event.content);
  } catch (e) {
    console.error("Failed to parse profile content:", e);
    return {};
  }
};

// Extract hashtags from content
export const extractHashtags = (content: string): string[] => {
  const regex = /#(\w+)/g;
  const matches = content.match(regex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
};

// Format filter for fetching profile metadata
export const createProfileFilter = (pubkeys: string[]): Filter => {
  return {
    kinds: [EVENT_KINDS.METADATA],
    authors: pubkeys,
  };
};

// Format filter for fetching posts
export const createPostFilter = (options: { authors?: string[], limit?: number, since?: number } = {}): Filter => {
  const filter: Filter = {
    kinds: [EVENT_KINDS.TEXT_NOTE],
    limit: options.limit || 50,
  };
  
  if (options.authors && options.authors.length > 0) {
    filter.authors = options.authors;
  }
  
  if (options.since) {
    filter.since = options.since;
  }
  
  return filter;
};

// Format filter for fetching contacts (following list)
export const createContactsFilter = (pubkey: string): Filter => {
  return {
    kinds: [EVENT_KINDS.CONTACTS],
    authors: [pubkey],
  };
};

// Format filter for fetching direct messages
export const createDirectMessageFilter = (pubkey: string, otherPubkey?: string): Filter => {
  const filter: Filter = {
    kinds: [EVENT_KINDS.ENCRYPTED_DIRECT_MESSAGE],
  };
  
  if (otherPubkey) {
    filter.authors = [pubkey];
    filter['#p'] = [otherPubkey];
  } else {
    filter['#p'] = [pubkey];
  }
  
  return filter;
};

// Format filter for searching by hashtag
export const createHashtagSearchFilter = (tag: string, limit = 50): Filter => {
  return {
    kinds: [EVENT_KINDS.TEXT_NOTE, EVENT_KINDS.LONG_FORM_CONTENT],
    '#t': [tag],
    limit,
  };
};

// Format filter for searching content
export const createContentSearchFilter = (query: string, options: { kinds?: number[], limit?: number } = {}): Filter => {
  return {
    kinds: options.kinds || [EVENT_KINDS.TEXT_NOTE, EVENT_KINDS.LONG_FORM_CONTENT],
    limit: options.limit || 50,
  };
};

// Format filter for marketplace listings
export const createMarketplaceFilter = (): Filter => {
  return {
    kinds: [EVENT_KINDS.MARKETPLACE_LISTING],
    limit: 50,
  };
};

// Format filter for channels
export const createChannelsFilter = (): Filter => {
  return {
    kinds: [EVENT_KINDS.CHANNEL_CREATION],
    limit: 50,
  };
};
