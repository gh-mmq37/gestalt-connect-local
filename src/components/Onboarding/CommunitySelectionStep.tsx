
import React, { useState, useEffect } from "react";
import { MapPin, Compass, ArrowRight, AlertCircle } from "lucide-react";

interface CommunitySelectionStepProps {
  onNext: (data: { community: string; location: any }) => void;
}

export const CommunitySelectionStep: React.FC<CommunitySelectionStepProps> = ({ onNext }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [community, setCommunity] = useState("neighborhood");
  
  // Function to detect user's location
  const detectLocation = () => {
    setDetectingLocation(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setDetectingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real app, we would use reverse geocoding here
        // For now, just store the coordinates
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setDetectingLocation(false);
      },
      (error) => {
        setError("Unable to retrieve your location");
        console.error(error);
        setDetectingLocation(false);
      }
    );
  };
  
  // Manual location entry
  const [manualLocation, setManualLocation] = useState({
    city: "",
    neighborhood: "",
    country: "",
  });
  
  const handleManualLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setManualLocation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    setIsLoading(true);
    
    // Prepare location data based on method
    const locationData = manualEntry ? manualLocation : location;
    
    // Simulate API delay
    setTimeout(() => {
      onNext({
        community,
        location: locationData,
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <p className="text-gray-600">
        Gestalt is a local-first platform. Choose how you'd like to connect with your community.
      </p>
      
      {/* Location detection/entry */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-base font-medium text-gray-900 mb-3">Your Location</h3>
        
        {!manualEntry ? (
          <div className="space-y-4">
            {location ? (
              <div className="bg-white p-3 rounded border border-green-200">
                <div className="flex items-center text-green-600 mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Location detected</span>
                </div>
                <p className="text-sm text-gray-600">
                  Your approximate coordinates were detected. We'll use this to show relevant local content.
                </p>
              </div>
            ) : (
              <button
                onClick={detectLocation}
                disabled={detectingLocation}
                className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gestalt-purple"
              >
                {detectingLocation ? (
                  <>Detecting location...</>
                ) : (
                  <>
                    <Compass className="mr-2 h-5 w-5 text-gestalt-purple" />
                    Detect my location
                  </>
                )}
              </button>
            )}
            
            {error && (
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <div className="flex items-center text-red-600 mb-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Error</span>
                </div>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <button
              onClick={() => setManualEntry(true)}
              className="w-full text-gestalt-purple text-sm hover:underline"
            >
              Enter location manually instead
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={manualLocation.city}
                  onChange={handleManualLocationChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-gestalt-purple focus:border-gestalt-purple"
                />
              </div>
              <div>
                <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                  Neighborhood (optional)
                </label>
                <input
                  type="text"
                  id="neighborhood"
                  name="neighborhood"
                  value={manualLocation.neighborhood}
                  onChange={handleManualLocationChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-gestalt-purple focus:border-gestalt-purple"
                />
              </div>
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={manualLocation.country}
                onChange={handleManualLocationChange}
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-gestalt-purple focus:border-gestalt-purple"
              />
            </div>
            <button
              onClick={() => setManualEntry(false)}
              className="w-full text-gestalt-purple text-sm hover:underline"
            >
              Use automatic location detection instead
            </button>
          </div>
        )}
      </div>
      
      {/* Community scope selection */}
      <div>
        <h3 className="text-base font-medium text-gray-900 mb-3">Community Scope</h3>
        <p className="text-sm text-gray-600 mb-3">
          Choose which community level you'd like to start with:
        </p>
        
        <div className="flex flex-wrap gap-2">
          {["neighborhood", "city", "county", "state", "country"].map((scope) => (
            <button
              key={scope}
              onClick={() => setCommunity(scope)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                community === scope
                  ? "bg-gestalt-purple text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gestalt-purple/10 hover:text-gestalt-purple-dark"
              }`}
            >
              {scope.charAt(0).toUpperCase() + scope.slice(1)}
            </button>
          ))}
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          You can change your community scope anytime.
        </p>
      </div>
      
      <div className="pt-4">
        <button
          onClick={handleSubmit}
          disabled={isLoading || (!location && !manualEntry) || (manualEntry && !manualLocation.city)}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gestalt-purple hover:bg-gestalt-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gestalt-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Continue"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
