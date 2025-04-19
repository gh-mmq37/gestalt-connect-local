
import React, { useState } from 'react';
import { X, Upload, User, Copy, Check } from 'lucide-react';
import { useNostr } from '../../hooks/useNostr';
import { toast } from '@/components/ui/use-toast';

interface EditProfileModalProps {
  currentProfile: any;
  onClose: () => void;
  onSave: (profile: any) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  currentProfile,
  onClose,
  onSave,
}) => {
  const { saveProfileChanges } = useNostr();
  const [formData, setFormData] = useState({
    display_name: currentProfile.display_name || '',
    picture: currentProfile.picture || '',
    banner: currentProfile.banner || '',
    about: currentProfile.about || '',
    website: currentProfile.website || '',
    nip05: currentProfile.nip05 || '',
    location: currentProfile.location || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setFormData(prev => ({ ...prev, picture: reader.result as string }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Filter out empty fields
      const updatedProfile = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '')
      );
      
      const success = await saveProfileChanges(updatedProfile);
      
      if (success) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
        });
        onSave(updatedProfile);
      } else {
        toast({
          title: 'Update Failed',
          description: 'Failed to update your profile. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'An error occurred while updating your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyNpub = (npub: string) => {
    navigator.clipboard.writeText(npub);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Copied',
      description: 'Public key copied to clipboard',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Profile picture */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center relative group">
                {(previewImage || formData.picture) ? (
                  <img
                    src={previewImage || formData.picture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
                <label
                  htmlFor="picture-upload"
                  className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                >
                  <Upload className="h-6 w-6 text-white" />
                </label>
              </div>
              <input
                id="picture-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <p className="text-sm text-gray-500">
                Click to upload a profile picture
              </p>
            </div>

            {/* Basic information */}
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Display Name"
              />
              <p className="mt-1 text-xs text-gray-500">
                This is the name displayed on your profile
              </p>
            </div>

            {/* About section */}
            <div>
              <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                About
              </label>
              <textarea
                id="about"
                name="about"
                rows={3}
                value={formData.about}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Tell others about yourself"
              />
            </div>

            {/* Website and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* NIP-05 Verification */}
            <div>
              <label htmlFor="nip05" className="block text-sm font-medium text-gray-700">
                NIP-05 Verification
              </label>
              <input
                type="text"
                id="nip05"
                name="nip05"
                value={formData.nip05}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="you@example.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                This is used for verification and search (similar to a username)
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-gestalt-purple text-white rounded-md hover:bg-gestalt-purple-dark flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
