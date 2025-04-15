
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
  X
} from "lucide-react";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Community", path: "/community", icon: Users },
  { name: "Groups", path: "/groups", icon: Users },
  { name: "Interests", path: "/interests", icon: Bookmark },
  { name: "Explore", path: "/explore", icon: Map },
  { name: "Profile", path: "/profile", icon: User },
  { name: "Contribute", path: "/contribute", icon: Heart },
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gestalt-purple flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold text-gestalt-purple-dark">Gestalt</span>
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
