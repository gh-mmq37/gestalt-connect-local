
import React, { useState, useEffect } from "react";
import { useNostr } from "../hooks/useNostr";
import { Event } from "nostr-tools";
import { MarketplaceItem } from "../components/Nostr/MarketplaceItem";
import { Loader2, Search, Plus, Filter } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const Marketplace: React.FC = () => {
  const { getMarketplaceItems, createMarketplaceListing } = useNostr();
  const [listings, setListings] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewListingForm, setShowNewListingForm] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    price: "",
    images: [] as string[],
    tags: [] as string[]
  });

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const items = await getMarketplaceItems();
      setListings(items);
    } catch (error) {
      console.error("Failed to load marketplace items:", error);
      toast({
        title: "Error",
        description: "Failed to load marketplace listings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newListing.title || !newListing.price) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title and price",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const success = await createMarketplaceListing(newListing);
      
      if (success) {
        toast({
          title: "Listing created",
          description: "Your item has been listed on the marketplace",
        });
        setShowNewListingForm(false);
        setNewListing({
          title: "",
          description: "",
          price: "",
          images: [],
          tags: []
        });
        loadListings();
      } else {
        toast({
          title: "Failed to create listing",
          description: "There was an error creating your listing",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to create listing:", error);
      toast({
        title: "Error",
        description: "Failed to create your listing",
        variant: "destructive"
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewListing(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setNewListing(prev => ({
        ...prev,
        images: [...prev.images, reader.result as string]
      }));
    };
    
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const tagInput = document.getElementById('tag-input') as HTMLInputElement;
    if (tagInput && tagInput.value) {
      setNewListing(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.value]
      }));
      tagInput.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewListing(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredListings = searchTerm
    ? listings.filter(listing => {
        try {
          const content = JSON.parse(listing.content);
          return content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 content.description?.toLowerCase().includes(searchTerm.toLowerCase());
        } catch (e) {
          return false;
        }
      })
    : listings;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        
        <button
          onClick={() => setShowNewListingForm(!showNewListingForm)}
          className="bg-gestalt-purple text-white px-4 py-2 rounded-md flex items-center"
        >
          {showNewListingForm ? "Cancel" : "Create Listing"}
          {!showNewListingForm && <Plus className="ml-2 h-4 w-4" />}
        </button>
      </div>
      
      {showNewListingForm ? (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Create New Listing</h2>
          
          <form onSubmit={handleCreateListing} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newListing.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={newListing.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="text"
                id="price"
                name="price"
                value={newListing.price}
                onChange={handleChange}
                required
                placeholder="e.g. 0.01 BTC, 1000 sats, $50 USD"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newListing.images.map((img, index) => (
                  <div key={index} className="w-20 h-20 relative">
                    <img src={img} alt={`Listing image ${index+1}`} className="w-full h-full object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => setNewListing(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index)
                      }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gestalt-purple file:text-white hover:file:bg-gestalt-purple-dark"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newListing.tags.map((tag) => (
                  <div key={tag} className="bg-gray-100 px-2 py-1 rounded-md text-sm flex items-center">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  id="tag-input"
                  placeholder="Add a tag"
                  className="flex-1 border border-gray-300 rounded-md rounded-r-none p-2"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-gray-100 border border-gray-300 border-l-0 rounded-md rounded-l-none px-3"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                className="bg-gestalt-purple text-white px-4 py-2 rounded-md"
              >
                Create Listing
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search marketplace..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-10 py-2 border border-gray-300 rounded-md"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <button className="px-4 py-2 border border-gray-300 rounded-md flex items-center justify-center text-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gestalt-purple" />
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <p className="text-xl font-medium text-gray-600">No marketplace listings found</p>
              <p className="text-gray-500 mt-2">Be the first to create a listing!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map(listing => (
                <MarketplaceItem key={listing.id} event={listing} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
