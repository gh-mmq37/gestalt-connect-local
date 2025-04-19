
import React from 'react';
import { LogOut } from 'lucide-react';
import { useNostr } from '../../hooks/useNostr';
import { toast } from "@/components/ui/use-toast";

export const LogoutButton: React.FC = () => {
  const { logout } = useNostr();
  
  const handleLogout = () => {
    toast({
      title: "Logging out",
      description: "You have been securely logged out.",
    });
    logout();
  };
  
  return (
    <button
      onClick={handleLogout}
      className="flex items-center px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md"
    >
      <LogOut className="h-4 w-4 mr-2" />
      <span>Logout</span>
    </button>
  );
};
