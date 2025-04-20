
import React, { useState, useEffect } from "react";
import { MapPin, Compass, ArrowRight, AlertCircle, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

// Country and city data for dropdowns
const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", 
  "France", "Japan", "Brazil", "India", "Other"
];

// Most populous cities by country
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Other"],
  "Canada": ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Quebec City", "Winnipeg", "Hamilton", "Other"],
  "United Kingdom": ["London", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Bristol", "Edinburgh", "Leeds", "Sheffield", "Other"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Newcastle", "Canberra", "Other"],
  "Germany": ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Other"],
  "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Other"],
  "Japan": ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kawasaki", "Kyoto", "Other"],
  "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Other"],
  "India": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Jaipur", "Pune", "Ahmedabad", "Other"],
  "Other": ["Other"]
};

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
  const [skipLocation, setSkipLocation] = useState(false);
  
  // Manual location entry with dropdowns
  const [manualLocation, setManualLocation] = useState({
    country: "",
    city: "",
    neighborhood: "",
  });
  
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
        // Store coordinates
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        
        setLocation(locationData);
        setDetectingLocation(false);
        
        // Show toast on successful location detection
        toast({
          title: "Location detected",
          description: `Location found with ${Math.round(position.coords.accuracy)}m accuracy`,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError(
          error.code === 1
            ? "Location permission denied. Please enable location services or enter your location manually."
            : "Unable to retrieve your location. Please try again or enter it manually."
        );
        setDetectingLocation(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  
  // Handle country selection
  const handleCountryChange = (value: string) => {
    setManualLocation(prev => ({
      ...prev,
      country: value,
      city: "", // Reset city when country changes
    }));
  };

  // Handle city selection
  const handleCityChange = (value: string) => {
    setManualLocation(prev => ({
      ...prev,
      city: value,
    }));
  };
  
  // Handle neighborhood input
  const handleNeighborhoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualLocation(prev => ({
      ...prev,
      neighborhood: e.target.value,
    }));
  };

  // Skip location
  const handleSkipLocation = () => {
    setSkipLocation(true);
    setLocation(null);
    setManualLocation({
      country: "",
      city: "",
      neighborhood: "",
    });
    setManualEntry(false);
  };

  const handleSubmit = () => {
    setIsLoading(true);
    
    // Prepare location data based on method
    let locationData = null;
    
    if (!skipLocation) {
      locationData = manualEntry ? manualLocation : location;
    }
    
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
      
      {/* Skip location notice */}
      <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
        <div className="flex items-start">
          <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Location is optional. It only enables local community features and can be changed later.
          </p>
        </div>
      </div>
      
      {/* Location detection/entry */}
      {!skipLocation ? (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium text-gray-900">Your Location</h3>
            <button 
              onClick={handleSkipLocation}
              className="text-sm text-gestalt-purple hover:underline flex items-center"
            >
              Skip this step <X className="ml-1 h-3 w-3" />
            </button>
          </div>
          
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
              <div className="space-y-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <Select
                    value={manualLocation.country}
                    onValueChange={handleCountryChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {manualLocation.country && (
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <Select
                      value={manualLocation.city}
                      onValueChange={handleCityChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {CITIES_BY_COUNTRY[manualLocation.country]?.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        )) || (
                          <SelectItem value="Other">Other</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div>
                  <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                    Neighborhood (optional)
                  </label>
                  <input
                    type="text"
                    id="neighborhood"
                    value={manualLocation.neighborhood}
                    onChange={handleNeighborhoodChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-gestalt-purple focus:border-gestalt-purple"
                    placeholder="Enter your neighborhood"
                  />
                </div>
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
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <MapPin className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-base font-medium text-gray-600">Location Skipped</h3>
          </div>
          <p className="text-sm text-gray-500">
            You've chosen to skip location. You can always add it later in settings.
          </p>
          <button
            onClick={() => setSkipLocation(false)}
            className="mt-2 text-sm text-gestalt-purple hover:underline"
          >
            Add location information
          </button>
        </div>
      )}
      
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
          disabled={isLoading || (!skipLocation && !location && !manualEntry) || 
            (!skipLocation && manualEntry && (!manualLocation.country || !manualLocation.city))}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gestalt-purple hover:bg-gestalt-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gestalt-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Continue"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
