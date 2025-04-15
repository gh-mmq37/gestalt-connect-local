
import React, { useState } from "react";
import { 
  User, 
  Bell, 
  Shield, 
  LogOut, 
  Download, 
  Clock,
  MapPin
} from "lucide-react";

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  
  // Mock user data
  const userData = {
    name: "Jamie Smith",
    username: "@jamiesmith",
    location: "Portland, OR",
    bio: "Community organizer, local food enthusiast, and digital minimalist.",
    joinDate: "March 2025",
    privacySettings: {
      locationSharing: "neighborhood",
      profileVisibility: "local",
      activityStatus: true
    },
    notificationSettings: {
      localEvents: true,
      groupMessages: true,
      communityAlerts: true,
      mentions: true
    },
    digitalWellness: {
      dailyUsage: "32 min",
      weeklyAverage: "3.5 hours",
      breakReminders: true,
      wellnessNotifications: true
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gestalt-purple/10 p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gestalt-purple flex items-center justify-center text-white text-2xl font-bold">
              {userData.name.charAt(0)}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              <p className="text-gray-600">{userData.username}</p>
              <div className="flex items-center justify-center sm:justify-start mt-2 text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {userData.location}
              </div>
              <p className="mt-2 max-w-md">{userData.bio}</p>
              <p className="text-sm text-gray-500 mt-2">Joined {userData.joinDate}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === "profile"
                  ? "border-gestalt-purple text-gestalt-purple-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === "privacy"
                  ? "border-gestalt-purple text-gestalt-purple-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === "notifications"
                  ? "border-gestalt-purple text-gestalt-purple-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab("wellness")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === "wellness"
                  ? "border-gestalt-purple text-gestalt-purple-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Digital Wellness
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <p className="text-gray-600">
                Your profile information is visible to others based on your privacy settings.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={userData.name}
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={userData.username}
                    onChange={() => {}}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    value={userData.bio}
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={userData.location}
                    onChange={() => {}}
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Privacy Settings</h2>
              <p className="text-gray-600">
                Control how your information is shared and who can see your content.
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Location Sharing</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Determine how precisely your location is shared with others.
                  </p>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={userData.privacySettings.locationSharing}
                    onChange={() => {}}
                  >
                    <option value="exact">Exact Location</option>
                    <option value="neighborhood">Neighborhood Only</option>
                    <option value="city">City Only</option>
                    <option value="none">Don't Share Location</option>
                  </select>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Profile Visibility</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Control who can see your profile information.
                  </p>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={userData.privacySettings.profileVisibility}
                    onChange={() => {}}
                  >
                    <option value="local">Local Community Only</option>
                    <option value="connections">My Connections Only</option>
                    <option value="groups">My Groups Only</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Activity Status</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Show when you're active on the platform.
                  </p>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activity-status"
                      checked={userData.privacySettings.activityStatus}
                      onChange={() => {}}
                      className="h-4 w-4 text-gestalt-purple focus:ring-gestalt-purple border-gray-300 rounded"
                    />
                    <label
                      htmlFor="activity-status"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Show my activity status
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-between">
                <button className="flex items-center text-gray-700 font-medium hover:text-gestalt-purple">
                  <Download className="h-5 w-5 mr-2" />
                  Download My Data
                </button>
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          )}
          
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Notification Preferences</h2>
              <p className="text-gray-600">
                Choose what you want to be notified about and how you receive notifications.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h3 className="font-medium">Local Events</h3>
                    <p className="text-sm text-gray-600">
                      Get notified about upcoming events in your community.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notify-events"
                      checked={userData.notificationSettings.localEvents}
                      onChange={() => {}}
                      className="h-4 w-4 text-gestalt-purple focus:ring-gestalt-purple border-gray-300 rounded"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h3 className="font-medium">Group Messages</h3>
                    <p className="text-sm text-gray-600">
                      Get notified about new messages in your groups.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notify-messages"
                      checked={userData.notificationSettings.groupMessages}
                      onChange={() => {}}
                      className="h-4 w-4 text-gestalt-purple focus:ring-gestalt-purple border-gray-300 rounded"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h3 className="font-medium">Community Alerts</h3>
                    <p className="text-sm text-gray-600">
                      Get notified about important community alerts.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notify-alerts"
                      checked={userData.notificationSettings.communityAlerts}
                      onChange={() => {}}
                      className="h-4 w-4 text-gestalt-purple focus:ring-gestalt-purple border-gray-300 rounded"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="font-medium">Mentions</h3>
                    <p className="text-sm text-gray-600">
                      Get notified when someone mentions you.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notify-mentions"
                      checked={userData.notificationSettings.mentions}
                      onChange={() => {}}
                      className="h-4 w-4 text-gestalt-purple focus:ring-gestalt-purple border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          )}
          
          {activeTab === "wellness" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Digital Wellness</h2>
              <p className="text-gray-600">
                Tools to help you maintain a healthy relationship with technology.
              </p>
              
              <div className="bg-gestalt-gray p-4 rounded-md">
                <h3 className="font-medium mb-3">Usage Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded shadow-sm">
                    <h4 className="text-sm text-gray-500">Today's Usage</h4>
                    <p className="text-2xl font-semibold text-gestalt-purple-dark">
                      {userData.digitalWellness.dailyUsage}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded shadow-sm">
                    <h4 className="text-sm text-gray-500">Weekly Average</h4>
                    <p className="text-2xl font-semibold text-gestalt-purple-dark">
                      {userData.digitalWellness.weeklyAverage}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h3 className="font-medium">Break Reminders</h3>
                    <p className="text-sm text-gray-600">
                      Get reminders to take breaks after extended usage.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="break-reminders"
                      checked={userData.digitalWellness.breakReminders}
                      onChange={() => {}}
                      className="h-4 w-4 text-gestalt-purple focus:ring-gestalt-purple border-gray-300 rounded"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="font-medium">Wellness Notifications</h3>
                    <p className="text-sm text-gray-600">
                      Receive tips for digital wellness and healthy usage habits.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="wellness-notifications"
                      checked={userData.digitalWellness.wellnessNotifications}
                      onChange={() => {}}
                      className="h-4 w-4 text-gestalt-purple focus:ring-gestalt-purple border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gestalt-purple/10 p-6 rounded-md mt-6">
                <h3 className="font-medium mb-2">Mental Health Disclosure</h3>
                <p className="text-sm">
                  Regular social media use has been associated with both positive and negative mental health outcomes. 
                  Studies suggest that passive consumption can sometimes lead to feelings of inadequacy or FOMO 
                  (fear of missing out), while active engagement and meaningful connections can improve well-being.
                </p>
                <p className="text-sm mt-2">
                  Gestalt is designed to prioritize meaningful connections over passive consumption. 
                  We encourage you to be mindful of your usage patterns and how they affect your mental well-being.
                </p>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button className="flex items-center text-red-600 font-medium hover:text-red-700">
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </button>
          <p className="text-xs text-gray-500">
            Your data is stored locally and never sold to third parties.
          </p>
        </div>
      </div>
    </div>
  );
};
