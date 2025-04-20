
import React from 'react';
import { LogOut } from 'lucide-react';
import { useNostr } from '../../hooks/useNostr';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

export const LogoutButton: React.FC = () => {
  const { logout } = useNostr();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logging out",
      description: "You have been securely logged out.",
    });
    // Navigate to the root which will redirect to onboarding
    navigate("/", { replace: true });
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
