
import React, { useState } from "react";
import { ArrowRight, Key, Shield, Info, ExternalLink } from "lucide-react";
import { nip19, getPublicKey, generateSecretKey } from 'nostr-tools';

interface AccountSetupStepProps {
  onNext: (data: { accountType: string; nostrKeys: any }) => void;
}

export const AccountSetupStep: React.FC<AccountSetupStepProps> = ({ onNext }) => {
  const [accountType, setAccountType] = useState<"simple" | "advanced">("simple");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<{ privateKey: string; publicKey: string } | null>(null);
  const [importedPrivateKey, setImportedPrivateKey] = useState("");
  const [importError, setImportError] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  
  // Generate Nostr keys for simple setup
  const generateNostrKeys = () => {
    try {
      // Generate a new secret key (private key)
      const secretKey = generateSecretKey();
      
      // Convert the private key to hex format
      const privateKeyHex = Buffer.from(secretKey).toString('hex');
      
      // Get the public key from the secret key
      const publicKey = getPublicKey(secretKey);
      
      // Optionally encode as nsec/npub format
      const nsec = nip19.nsecEncode(secretKey);
      
      setGeneratedKeys({
        privateKey: nsec, // or privateKeyHex if you prefer hex format
        publicKey
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
      
      // Handle different key formats (nsec or hex)
      if (importedPrivateKey.startsWith('nsec1')) {
        try {
          const { data } = nip19.decode(importedPrivateKey);
          secretKey = data as Uint8Array;
        } catch (e) {
          throw new Error("Invalid nsec format");
        }
      } else {
        // Assume hex format
        try {
          secretKey = new Uint8Array(Buffer.from(importedPrivateKey, 'hex'));
        } catch (e) {
          throw new Error("Invalid hex format");
        }
      }
      
      // Get public key from the secret key
      const publicKey = getPublicKey(secretKey);
      
      setGeneratedKeys({
        privateKey: importedPrivateKey,
        publicKey
      });
      
      setImportError("");
    } catch (error) {
      console.error(error);
      setImportError("Invalid private key format");
    }
  };
  
  // Handle Continue button
  const handleContinue = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      onNext({
        accountType,
        nostrKeys: generatedKeys
      });
      setIsLoading(false);
    }, 500);
  };
  
  // Generate keys on initial render for simple setup
  React.useEffect(() => {
    if (accountType === "simple" && !generatedKeys) {
      generateNostrKeys();
    }
  }, [accountType, generatedKeys]);

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
                <div className="rounded bg-gray-50 p-2 text-xs font-mono mt-2 mb-3">
                  <div className="mb-2">
                    <span className="text-gray-500">Public Key:</span>
                    <div className="mt-1 truncate text-gray-900">
                      {generatedKeys.publicKey.substring(0, 16)}...{generatedKeys.publicKey.substring(generatedKeys.publicKey.length - 8)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Private Key:</span>
                      <button 
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="text-gestalt-purple hover:underline text-xs"
                      >
                        {showPrivateKey ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="mt-1 truncate text-gray-900">
                      {showPrivateKey ? (
                        <>{generatedKeys.privateKey.substring(0, 16)}...{generatedKeys.privateKey.substring(generatedKeys.privateKey.length - 8)}</>
                      ) : (
                        "••••••••••••••••••••••••••••••••"
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-start mt-3">
                <Info className="h-4 w-4 text-gestalt-purple mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  You should backup your private key somewhere safe. We don't store it on our servers, and if lost, you can't recover your account.
                </p>
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
                  className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gestalt-purple"
                >
                  <ExternalLink className="mr-2 h-4 w-4 text-gestalt-purple" />
                  Connect to Browser Extension
                </button>
                
                {generatedKeys && (
                  <div className="rounded bg-gray-50 p-2 text-xs mt-3">
                    <div className="mb-1">
                      <span className="text-gray-500 font-medium">Detected Public Key:</span>
                    </div>
                    <div className="font-mono truncate text-gray-900">
                      {generatedKeys.publicKey.substring(0, 16)}...{generatedKeys.publicKey.substring(generatedKeys.publicKey.length - 8)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
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
