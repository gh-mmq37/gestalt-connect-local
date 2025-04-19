
import { useState, useEffect } from 'react';
import { nip19 } from 'nostr-tools';

interface NostrExtensionKeys {
  publicKey: string;
  npub: string;
}

export const useNostrExtension = () => {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [extensionKeys, setExtensionKeys] = useState<NostrExtensionKeys | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if a Nostr extension is available
  useEffect(() => {
    const checkExtension = () => {
      if (window.nostr) {
        setIsAvailable(true);
      } else {
        setIsAvailable(false);
      }
    };

    checkExtension();

    // Listen for extension being added
    window.addEventListener('nostr:ready', () => {
      setIsAvailable(true);
    });

    return () => {
      window.removeEventListener('nostr:ready', () => {
        setIsAvailable(true);
      });
    };
  }, []);

  // Connect to the extension
  const connectExtension = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!window.nostr) {
        throw new Error('No Nostr extension available');
      }

      // Request public key from extension
      const publicKey = await window.nostr.getPublicKey();
      
      if (!publicKey) {
        throw new Error('Failed to get public key from extension');
      }

      // Generate npub
      const npub = nip19.npubEncode(publicKey);

      setExtensionKeys({
        publicKey,
        npub
      });

      return {
        publicKey,
        npub
      };
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Nostr extension');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAvailable,
    extensionKeys,
    isLoading,
    error,
    connectExtension
  };
};

// Add the window.nostr type definition
declare global {
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>;
      signEvent: (event: any) => Promise<any>;
    };
  }
}
