
import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  Bookmark, 
  Map, 
  User, 
  Heart,
  Menu,
  X,
  Search,
  Settings,
} from "lucide-react";
import { useNostr } from "../../hooks/useNostr";

const navItems = [
  { name: "Feed", path: "/feed", icon: Home },
  { name: "Community", path: "/community", icon: Users },
  { name: "Groups", path: "/groups", icon: Users },
  { name: "Interests", path: "/interests", icon: Bookmark },
  { name: "Explore", path: "/explore", icon: Map },
  { name: "Profile", path: "/profile", icon: User },
  { name: "Contribute", path: "/contribute", icon: Heart },
  { name: "Settings", path: "/settings", icon: Settings },
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { keys, profileData } = useNostr();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const userProfile = keys?.publicKey ? profileData[keys.publicKey] : null;
  const displayName = userProfile?.name || userProfile?.displayName || "Profile";

  return (
    <header className="bg-white shadow-sm dark:bg-gray-900 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/feed" className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gestalt-purple flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold text-gestalt-purple-dark">Gestalt</span>
            </Link>
          </div>

          {/* Search bar - visible on medium screens and up */}
          <div className="hidden md:block w-1/3 max-w-xs">
            <Link to="/search" className="relative w-full">
              <div className="flex items-center w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 hover:bg-gray-100 cursor-pointer">
                <Search className="h-4 w-4 mr-2" />
                <span>Search Nostr...</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-1 py-2 text-sm font-medium transition-colors border-b-2 ${
                    isActive
                      ? "border-gestalt-purple text-gestalt-purple-dark"
                      : "border-transparent text-gray-600 hover:text-gestalt-purple hover:border-gestalt-purple/40"
                  }`
                }
              >
                <item.icon className="w-4 h-4 mr-1" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Search icon - visible only on small screens */}
          <div className="md:hidden flex items-center mr-2">
            <Link 
              to="/search" 
              className="text-gray-500 hover:text-gestalt-purple focus:outline-none focus:text-gestalt-purple"
            >
              <Search className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-500 hover:text-gestalt-purple focus:outline-none focus:text-gestalt-purple"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg dark:bg-gray-900 animate-slide-in-right">
          <div className="pt-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-base font-medium ${
                    isActive
                      ? "bg-gestalt-purple/10 text-gestalt-purple-dark"
                      : "text-gray-600 hover:bg-gestalt-purple/5 hover:text-gestalt-purple-dark"
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
