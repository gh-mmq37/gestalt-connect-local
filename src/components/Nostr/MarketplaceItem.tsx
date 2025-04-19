
import React from 'react';
import { ExternalLink, Tag } from 'lucide-react';
import { Event } from 'nostr-tools';
import { useNostr } from '../../hooks/useNostr';

interface MarketplaceItemProps {
  event: Event;
}

export const MarketplaceItem: React.FC<MarketplaceItemProps> = ({ event }) => {
  const { profileData } = useNostr();

  // Parse listing data from the event content
  const getListing = () => {
    try {
      return JSON.parse(event.content);
    } catch (e) {
      return {
        title: "Unknown Item",
        description: "Could not parse listing data",
        price: "Unknown",
        images: [],
      };
    }
  };

  const listing = getListing();
  const seller = profileData[event.pubkey] || {};
  
  // Get price from tags if available, or from content
  const priceTag = event.tags.find(tag => tag[0] === 'price');
  const price = priceTag ? priceTag[1] : listing.price;
  
  // Get title from tags if available, or from content
  const titleTag = event.tags.find(tag => tag[0] === 'title');
  const title = titleTag ? titleTag[1] : listing.title;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 overflow-hidden bg-gray-100">
        {listing.images && listing.images.length > 0 ? (
          <img 
            src={listing.images[0]} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image available
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg line-clamp-1">{title}</h3>
          <div className="bg-gestalt-purple text-white px-2 py-1 rounded text-sm font-medium">
            {price}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
          {listing.description}
        </p>
        
        <div className="mt-3 flex items-center text-xs text-gray-500">
          <div className="flex items-center">
            {seller.picture ? (
              <img 
                src={seller.picture} 
                alt={seller.display_name || "Seller"} 
                className="w-5 h-5 rounded-full mr-1"
              />
            ) : null}
            <span>
              {seller.display_name || event.pubkey.slice(0, 8) + '...'}
            </span>
          </div>
          
          {listing.tags && listing.tags.length > 0 ? (
            <div className="ml-auto flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              <span>{listing.tags.join(', ')}</span>
            </div>
          ) : null}
        </div>
        
        {listing.url ? (
          <a 
            href={listing.url} 
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center text-sm text-gestalt-purple hover:underline"
          >
            View details <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        ) : null}
      </div>
    </div>
  );
};
