
import React, { useState, useEffect } from "react";
import { ArrowRight, Key, Shield, Info, ExternalLink, Copy, Eye, EyeOff, CheckCircle, Lock, Globe, Bridge } from "lucide-react";
import { nip19, getPublicKey, generateSecretKey } from 'nostr-tools';
import { toast } from '@/components/ui/use-toast';
import { useNostrExtension } from "../../hooks/useNostrExtension";
import { DEFAULT_RELAYS, FEDIVERSE_RELAY, BLUESKY_RELAY } from "../../constants/nostrConstants";

interface AccountSetupStepProps {
  onNext: (data: { accountType: string; nostrKeys: any; additionalRelays?: string[] }) => void;
}

export const AccountSetupStep: React.FC<AccountSetupStepProps> = ({ onNext }) => {
  const [accountType, setAccountType] = useState<"simple" | "advanced">("simple");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<{ privateKey: string; publicKey: string; npub: string; nsec: string } | null>(null);
  const [importedPrivateKey, setImportedPrivateKey] = useState("");
  const [importError, setImportError] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [keyCopied, setKeyCopied] = useState<"npub" | "nsec" | "none">("none");
  const [bridgeOptions, setBridgeOptions] = useState({
    fediverse: false,
    bluesky: false
  });
  
  const { isAvailable, extensionKeys, connectExtension, isLoading: isExtensionLoading } = useNostrExtension();
  
  // Generate Nostr keys for simple setup
  const generateNostrKeys = () => {
    try {
      // Generate a new secret key (private key)
      const secretKey = generateSecretKey();
      
      // Get the public key from the secret key
      const publicKey = getPublicKey(secretKey);
      
      // Encode as nsec/npub format
      const nsec = nip19.nsecEncode(secretKey);
      const npub = nip19.npubEncode(publicKey);
      
      setGeneratedKeys({
        privateKey: Buffer.from(secretKey).toString('hex'),
        publicKey,
        npub,
        nsec
      });
    } catch (error) {
      console.error("Error generating Nostr keys:", error);
    }
  };
  
  // Handle importing existing private key
  const handleImportKey = () => {
    try {
      if (!importedPrivateKey.trim()) {
        setImportError("Please enter a private key");
        return;
      }
      
      let secretKey: Uint8Array;
      let publicKey: string;
      let npub: string;
      let nsec: string;
      
      // Handle different key formats (nsec or hex)
      if (importedPrivateKey.startsWith('nsec1')) {
        try {
          const { data } = nip19.decode(importedPrivateKey);
          secretKey = data as Uint8Array;
          publicKey = getPublicKey(secretKey);
          npub = nip19.npubEncode(publicKey);
          nsec = importedPrivateKey;
        } catch (e) {
          throw new Error("Invalid nsec format");
        }
      } else {
        // Assume hex format
        try {
          secretKey = new Uint8Array(Buffer.from(importedPrivateKey, 'hex'));
          publicKey = getPublicKey(secretKey);
          npub = nip19.npubEncode(publicKey);
          nsec = nip19.nsecEncode(secretKey);
        } catch (e) {
          throw new Error("Invalid hex format");
        }
      }
      
      setGeneratedKeys({
        privateKey: Buffer.from(secretKey).toString('hex'),
        publicKey,
        npub,
        nsec
      });
      
      setImportError("");
    } catch (error) {
      console.error(error);
      setImportError("Invalid private key format");
    }
  };

  // Handle browser extension connection
  const handleConnectExtension = async () => {
    if (!isAvailable) {
      toast({
        title: "No Extension Found",
        description: "We couldn't detect a Nostr browser extension. Please install one like Alby or nos2x.",
        variant: "destructive"
      });
      return;
    }

    const keys = await connectExtension();
    if (keys) {
      toast({
        title: "Extension Connected",
        description: "Successfully connected to your Nostr extension.",
      });
    }
  };
  
  // Copy key to clipboard
  const copyToClipboard = (text: string, type: "npub" | "nsec") => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setKeyCopied(type);
        setTimeout(() => setKeyCopied("none"), 2000);
        
        toast({
          title: "Copied to clipboard",
          description: type === "npub" ? "Public key copied" : "Private key copied",
        });
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard",
          variant: "destructive"
        });
      });
  };
  
  // Handle Continue button
  const handleContinue = () => {
    setIsLoading(true);
    
    // Collect additional relays based on bridge options
    const additionalRelays: string[] = [];
    if (bridgeOptions.fediverse && !DEFAULT_RELAYS.includes(FEDIVERSE_RELAY)) {
      additionalRelays.push(FEDIVERSE_RELAY);
    }
    if (bridgeOptions.bluesky && !DEFAULT_RELAYS.includes(BLUESKY_RELAY)) {
      additionalRelays.push(BLUESKY_RELAY);
    }
    
    // Create user profile event to register on the protocol
    setTimeout(() => {
      onNext({
        accountType,
        nostrKeys: extensionKeys || generatedKeys,
        additionalRelays: additionalRelays.length > 0 ? additionalRelays : undefined
      });
      setIsLoading(false);
    }, 500);
  };
  
  // Generate keys on initial render for simple setup
  useEffect(() => {
    if (accountType === "simple" && !generatedKeys) {
      generateNostrKeys();
    }
  }, [accountType, generatedKeys]);

  // Use extension keys if available and selected
  useEffect(() => {
    if (accountType === "advanced" && extensionKeys) {
      setGeneratedKeys({
        publicKey: extensionKeys.publicKey,
        npub: extensionKeys.npub,
        privateKey: '', // We don't have access to private key from extension
        nsec: ''
      });
    }
  }, [accountType, extensionKeys]);

  return (
    <div className="space-y-6 animate-fade-in">
      <p className="text-gray-600">
        Gestalt uses the Nostr protocol to securely connect you with communities while keeping your data private.
      </p>
      
      {/* Account setup type toggle */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setAccountType("simple")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              accountType === "simple"
                ? "bg-gestalt-purple text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Simple Setup
          </button>
          <button
            onClick={() => setAccountType("advanced")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              accountType === "advanced"
                ? "bg-gestalt-purple text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Advanced Setup
          </button>
        </div>
        
        {accountType === "simple" ? (
          <div className="space-y-4">
            <div className="bg-white p-3 rounded border border-gray-200">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-gestalt-purple mr-2" />
                <h3 className="text-sm font-medium text-gray-900">Simple Account Setup</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                We've generated a secure Nostr key pair for you. These keys are stored locally on your device.
              </p>
              
              {generatedKeys && (
                <div className="rounded bg-gray-50 p-3 text-xs font-mono mt-2 mb-3 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-500 font-medium">Public Key (npub):</span>
                      <button 
                        onClick={() => copyToClipboard(generatedKeys.npub, "npub")}
                        className="text-gestalt-purple hover:bg-gestalt-purple/10 rounded p-1"
                        title="Copy public key"
                      >
                        {keyCopied === "npub" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="p-2 bg-white border border-gray-200 rounded break-all">
                      {generatedKeys.npub}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-500 font-medium">Private Key (nsec):</span>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                          className="text-gestalt-purple hover:bg-gestalt-purple/10 rounded p-1"
                          title={showPrivateKey ? "Hide private key" : "Show private key"}
                        >
                          {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        {showPrivateKey && (
                          <button 
                            onClick={() => copyToClipboard(generatedKeys.nsec, "nsec")}
                            className="text-gestalt-purple hover:bg-gestalt-purple/10 rounded p-1"
                            title="Copy private key"
                          >
                            {keyCopied === "nsec" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-2 bg-white border border-gray-200 rounded break-all relative">
                      {showPrivateKey ? (
                        generatedKeys.nsec
                      ) : (
                        <div className="flex items-center justify-center text-gray-400">
                          <Lock className="h-4 w-4 mr-2" />
                          <span>Click the eye icon to reveal</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-xs text-yellow-700">
                    <strong>Important:</strong> Save your private key (nsec) somewhere safe. We don't store it on our servers, and if lost, your account cannot be recovered.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-3 rounded border border-gray-200">
              <div className="flex items-center mb-2">
                <Key className="h-5 w-5 text-gestalt-purple mr-2" />
                <h3 className="text-sm font-medium text-gray-900">Advanced Account Setup</h3>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Import your existing Nostr private key or connect to a browser extension.
                </p>
                
                <div>
                  <label htmlFor="privateKey" className="block text-sm font-medium text-gray-700 mb-1">
                    Private Key (nsec or hex)
                  </label>
                  <input
                    type="password"
                    id="privateKey"
                    value={importedPrivateKey}
                    onChange={(e) => setImportedPrivateKey(e.target.value)}
                    placeholder="nsec1... or hex format"
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-gestalt-purple focus:border-gestalt-purple"
                  />
                  {importError && (
                    <p className="text-xs text-red-600 mt-1">{importError}</p>
                  )}
                </div>
                
                <button
                  onClick={handleImportKey}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gestalt-purple"
                >
                  Import Key
                </button>
                
                <div className="text-center">
                  <span className="text-sm text-gray-500">or</span>
                </div>
                
                <button
                  onClick={handleConnectExtension}
                  disabled={isExtensionLoading}
                  className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gestalt-purple"
                >
                  {isExtensionLoading ? (
                    <span>Connecting...</span>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4 text-gestalt-purple" />
                      Connect to Browser Extension
                    </>
                  )}
                </button>
                
                {generatedKeys && generatedKeys.npub && (
                  <div className="rounded bg-gray-50 p-3 text-xs mt-3">
                    <div className="mb-1">
                      <span className="text-gray-500 font-medium">Detected Public Key:</span>
                      <button 
                        onClick={() => copyToClipboard(generatedKeys.npub, "npub")}
                        className="ml-2 text-gestalt-purple hover:bg-gestalt-purple/10 rounded p-1"
                        title="Copy public key"
                      >
                        {keyCopied === "npub" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="font-mono break-all bg-white p-2 border border-gray-200 rounded">
                      {generatedKeys.npub}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Bridge options */}
        <div className="mt-4 bg-white p-3 rounded border border-gray-200">
          <div className="flex items-center mb-2">
            <Bridge className="h-5 w-5 text-gestalt-purple mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Protocol Bridges</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Connect to other social networks through Nostr bridges
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="fediverse-bridge"
                type="checkbox"
                checked={bridgeOptions.fediverse}
                onChange={() => setBridgeOptions(prev => ({...prev, fediverse: !prev.fediverse}))}
                className="h-4 w-4 text-gestalt-purple focus:ring-gestalt-purple border-gray-300 rounded"
              />
              <label htmlFor="fediverse-bridge" className="ml-2 block text-sm text-gray-700">
                Fediverse Bridge (Mastodon, Pleroma)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="bluesky-bridge"
                type="checkbox"
                checked={bridgeOptions.bluesky}
                onChange={() => setBridgeOptions(prev => ({...prev, bluesky: !prev.bluesky}))}
                className="h-4 w-4 text-gestalt-purple focus:ring-gestalt-purple border-gray-300 rounded"
              />
              <label htmlFor="bluesky-bridge" className="ml-2 block text-sm text-gray-700">
                Bluesky Bridge
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex items-start mt-4">
          <Info className="h-4 w-4 text-gestalt-purple mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-xs text-gray-500">
            Your Nostr keys are what give you control over your content and identity across the decentralized web.
            <a href="https://nostr.how" target="_blank" rel="noopener noreferrer" className="text-gestalt-purple hover:underline ml-1">
              Learn more about Nostr
            </a>
          </p>
        </div>
      </div>
      
      <div className="pt-4">
        <button
          onClick={handleContinue}
          disabled={isLoading || !generatedKeys}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gestalt-purple hover:bg-gestalt-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gestalt-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Continue"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
