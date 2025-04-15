
import React from "react";
import { useNostr } from "../hooks/useNostr";
import { Heart, Zap, Code, Coffee, ExternalLink } from "lucide-react";

export const Contribute: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contribute to Gestalt</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Help Build the Future of Local Community</h2>
        <p className="text-gray-600 mb-6">
          Gestalt is an open-source, community-driven project built on the Nostr protocol.
          There are many ways you can contribute to help make it better!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gestalt-purple/5 p-6 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gestalt-purple/20 flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-gestalt-purple" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Code Contributions</h3>
            <p className="text-gray-600 mb-4">
              Help develop new features, fix bugs, or improve performance.
              Our codebase is open source and welcomes contributors of all skill levels.
            </p>
            <a 
              href="https://github.com/gestalt-project/gestalt" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gestalt-purple hover:underline flex items-center"
            >
              View GitHub Repository
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          <div className="bg-gestalt-purple/5 p-6 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gestalt-purple/20 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-gestalt-purple" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Running a Relay</h3>
            <p className="text-gray-600 mb-4">
              Help strengthen the Nostr network by running a relay.
              More relays mean better reliability and accessibility for everyone.
            </p>
            <a 
              href="https://github.com/nostr-protocol/nostr-relay-registry" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gestalt-purple hover:underline flex items-center"
            >
              Learn about running a relay
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gestalt-purple/5 p-6 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gestalt-purple/20 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-gestalt-purple" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Community Building</h3>
            <p className="text-gray-600 mb-4">
              Help grow the community by organizing local Nostr meetups,
              creating educational content, or helping new users get started.
            </p>
            <a 
              href="https://www.nostr.how/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gestalt-purple hover:underline flex items-center"
            >
              Nostr Resources
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          <div className="bg-gestalt-purple/5 p-6 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gestalt-purple/20 flex items-center justify-center mb-4">
              <Coffee className="h-6 w-6 text-gestalt-purple" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Support the Project</h3>
            <p className="text-gray-600 mb-4">
              You can support Gestalt's development by contributing Bitcoin or Sats
              through Lightning Network to help fund ongoing development.
            </p>
            <a 
              href="#" 
              className="text-gestalt-purple hover:underline flex items-center"
            >
              Support via Lightning
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
        
        <div className="bg-gestalt-purple/10 p-6 rounded-lg">
          <h3 className="font-semibold mb-4">Our Vision</h3>
          <p className="text-gray-700 mb-4">
            We're building Gestalt to be a tool that strengthens local communities while respecting user privacy and autonomy.
            By leveraging the Nostr protocol, we're creating a platform that's resistant to censorship and centralized control.
          </p>
          <p className="text-gray-700">
            Every contribution, no matter how small, helps make this vision a reality. Thank you for being part of this journey!
          </p>
        </div>
      </div>
    </div>
  );
};
