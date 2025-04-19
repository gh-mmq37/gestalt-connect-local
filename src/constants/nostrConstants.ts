
// Default relays
export const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band", 
  "wss://nostr.wine",
  "wss://nos.lol",
  "wss://relay.current.fyi"
];

export const FEDIVERSE_RELAY = "wss://mostr.pub";
export const BLUESKY_RELAY = "wss://relay.nostr.band";

// Event kinds
export const EVENT_KINDS = {
  METADATA: 0,
  TEXT_NOTE: 1,
  RECOMMEND_RELAY: 2,
  CONTACTS: 3,
  ENCRYPTED_DIRECT_MESSAGE: 4,
  DELETE: 5,
  REPOST: 6,
  REACTION: 7,
  BADGE_AWARD: 8,
  CHANNEL_CREATION: 40,
  CHANNEL_METADATA: 41,
  CHANNEL_MESSAGE: 42,
  CHANNEL_HIDE_MESSAGE: 43,
  CHANNEL_MUTE_USER: 44,
  MARKETPLACE_LISTING: 30017,
  LONG_FORM_CONTENT: 30023,
  COMMUNITY_POST: 34550
};
