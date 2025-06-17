"use client";
import { useState, useCallback, useEffect, useRef, JSX } from "react";
import { useRouter } from "next/navigation";
// import { authService } from "@/app/api/(auth)/auth";
import {
  validateEmail,
  validateName,
} from "@/app/api/(auth)/validation/ValidationForm";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Shield,
  Bell,
  Settings,
  Key,
  Camera,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
// import { getAuthHeader } from "../api/(auth)/user/route";
import { useAuth } from "@/context/AuthContext";

// TypeScript interfaces
interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  timezone: string;
  organization: string;
}

interface SecurityInfo {
  lastPasswordChange: string;
  twoFactorEnabled: boolean;
  loginHistory: LoginHistoryItem[];
}

interface LoginHistoryItem {
  device: string;
  location: string;
  date: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  updates: boolean;
  newsletter: boolean;
}

interface UserData {
  personal: PersonalInfo;
  security: SecurityInfo;
  notifications: NotificationSettings;
}

interface ApiUserResponse {
  first_name?: string;
  email?: string;
  phone_number?: string;
  location?: string;
  joinDate?: string;
  timezone?: string;
  organization?: string;
  lastPasswordChange?: string;
  twoFactorEnabled?: boolean;
  loginHistory?: LoginHistoryItem[];
  notifications?: NotificationSettings;
}

type TabType = "personal" | "security" | "notifications" | "Team Member";

const Profile: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [image, setImage] = useState<string>(
    "https://e7.pngegg.com/pngimages/985/993/png-clipart-company-businessperson-board-of-directors-advanced-orthopaedic-centers-avtar-company-service-thumbnail.png"
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({
    personal: {
      name: "",
      email: "",
      phone: "",
      location: "",
      joinDate: "",
      timezone: "",
      organization: "",
    },
    security: {
      lastPasswordChange: "",
      twoFactorEnabled: false,
      loginHistory: [],
    },
    notifications: {
      email: false,
      push: false,
      desktop: false,
      updates: false,
      newsletter: false,
    },
  });

  const validateProfileData = (data: UserData): string[] => {
    const errors: string[] = [];
    const nameError = validateName(data.personal.name);
    if (nameError) errors.push(nameError);

    if (!validateEmail(data.personal.email)) {
      errors.push("Invalid email format");
    }

    if (!data.personal.phone.match(/^\+?[\d\s-]{10,}$/)) {
      errors.push("Invalid phone number format");
    }

    return errors;
  };

  const [user, setUser] = useState<any[]>([]);
  const didFetchProfile = useRef<boolean>(false);

  const fetchUsers = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/getUser", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: ApiUserResponse = await response.json();
      setUserData({
        personal: {
          name: data.first_name || "",
          email: data.email || "",
          phone: data.phone_number || "",
          location: data.location || "",
          joinDate: data.joinDate || "",
          timezone: data.timezone || "",
          organization: data.organization || "",
        },
        security: {
          lastPasswordChange: data.lastPasswordChange || "",
          twoFactorEnabled: data.twoFactorEnabled || false,
          loginHistory: data.loginHistory || [],
        },
        notifications: {
          email: data.notifications?.email || false,
          push: data.notifications?.push || false,
          desktop: data.notifications?.desktop || false,
          updates: data.notifications?.updates || false,
          newsletter: data.notifications?.newsletter || false,
        },
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to fetch user profile");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didFetchProfile.current) return;
    fetchUsers();
    didFetchProfile.current = true;
  }, [fetchUsers]);

  const handleSaveChanges = async (): Promise<void> => {
    const errors = validateProfileData(userData);
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    try {
      setIsLoading(true);
      // await authService.updateProfile(userData);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    // Implementation commented out as in original
    // const file = event.target.files?.[0];
    // if (file) {
    //   try {
    //     setIsLoading(true);
    //     // Implementation here
    //   } catch (error) {
    //     toast.error("Failed to upload image");
    //   } finally {
    //     setIsLoading(false);
    //   }
    // }
  };

  const handleInputChange = useCallback(
    (section: keyof UserData, field: string, value: string): void => {
      setUserData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    },
    []
  );

  const handleNotificationToggle = useCallback(
    (key: keyof NotificationSettings): void => {
      setUserData((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: !prev.notifications[key],
        },
      }));
    },
    []
  );

  const handleSecurityToggle = useCallback((): void => {
    setUserData((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        twoFactorEnabled: !prev.security.twoFactorEnabled,
      },
    }));
  }, []);

  const getIcon = useCallback((key: string): JSX.Element => {
    const icons: Record<
      string,
      React.ComponentType<{ size?: number; className?: string }>
    > = {
      name: User,
      email: Mail,
      phone: Phone,
      location: MapPin,
      joinDate: Calendar,
      department: Building,
      organization: Building,
      timezone: Calendar,
      security: Shield,
      notifications: Bell,
      default: Settings,
    };
    const IconComponent = icons[key] || icons.default;
    return <IconComponent size={20} className="text-blue-500" />;
  }, []);

  const renderPersonalInfo = (): JSX.Element => (
    <div className="space-y-6">
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <img
            src={image}
            alt="Profile"
            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-blue-200"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "https://e7.pngegg.com/pngimages/985/993/png-clipart-company-businessperson-board-of-directors-advanced-orthopaedic-centers-avtar-company-service-thumbnail.png";
            }}
          />
          {isEditing && (
            <button
              className="absolute bottom-0 right-0 p-1.5 md:p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              onClick={() => document.getElementById("file-input")?.click()}
              disabled={isLoading}
            >
              <Camera size={16} className="md:w-5 md:h-5" />
            </button>
          )}
        </div>

        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {userData?.personal &&
          Object.entries(userData.personal).map(([key, value]) => (
            <div
              key={key}
              className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-blue-100"
            >
              <div className="flex items-center space-x-2">
                {getIcon(key)}
                <label className="text-xs md:text-sm text-gray-500 capitalize">
                  {key}
                </label>
              </div>
              {isEditing ? (
                <Input
                  value={Array.isArray(value) ? value.join(", ") : value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("personal", key, e.target.value)
                  }
                  className="mt-1 text-sm md:text-base"
                  disabled={isLoading}
                />
              ) : (
                <div className="mt-1 text-sm md:text-base font-medium text-gray-800 break-words">
                  {Array.isArray(value) ? value.join(", ") : value || "Not set"}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );

  const renderSecurity = (): JSX.Element => (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-blue-100">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-800">
          Security Settings
        </h3>
        <div className="space-y-3 md:space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <p className="text-sm md:text-base font-medium text-gray-500">
                Two-Factor Authentication
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                Add an extra layer of security
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-2 sm:mt-0">
              <input
                type="checkbox"
                checked={userData.security.twoFactorEnabled}
                onChange={handleSecurityToggle}
                className="sr-only peer"
                disabled={isLoading}
              />
              <div className="w-9 h-5 md:w-11 md:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-blue-100">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-800">
          Recent Login Activity
        </h3>
        <div className="space-y-3 md:space-y-4">
          {userData.security.loginHistory &&
          userData.security.loginHistory.length > 0 ? (
            userData.security.loginHistory.map((login, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 md:py-3 border-b last:border-0"
              >
                <div>
                  <p className="text-sm md:text-base font-medium text-gray-500">
                    {login.device}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500">
                    {login.location}
                  </p>
                </div>
                <p className="text-xs md:text-sm text-gray-500">{login.date}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent login activity</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderNotifications = (): JSX.Element => (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-blue-100">
      <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6">
        Notification Preferences
      </h3>
      <div className="space-y-4 md:space-y-6">
        {Object.entries(userData.notifications).map(([key, value]) => (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4"
          >
            <div className="flex items-center space-x-2 md:space-x-3">
              {getIcon(key)}
              <div>
                <p className="text-sm md:text-base font-medium capitalize text-gray-800">
                  {key} Notifications
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-2 sm:mt-0">
              <input
                type="checkbox"
                checked={value}
                onChange={() =>
                  handleNotificationToggle(key as keyof NotificationSettings)
                }
                className="sr-only peer"
                disabled={isLoading}
              />
              <div className="w-9 h-5 md:w-11 md:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTeamMember = (): JSX.Element => (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-blue-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold">Team Members</h3>
        <Button variant="primary" className="w-full sm:w-auto">
          Add Member
        </Button>
      </div>
      <div className="text-sm text-gray-500">
        <p>No team members added yet.</p>
      </div>
    </div>
  );

  const toggleMobileMenu = (): void => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const tabs: TabType[] = [
    "personal",
    "security",
    "notifications",
    "Team Member",
  ];

  return (
    <div className="min-h-screen p-2 md:p-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-8 gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Profile Settings
          </h1>
          <Button
            variant="primary"
            onClick={isEditing ? handleSaveChanges : () => setIsEditing(true)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading
              ? "Loading..."
              : isEditing
              ? "Save Changes"
              : "Edit Profile"}
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Mobile menu button */}
          <div className="block sm:hidden border-b border-blue-100 p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700 capitalize">
                {activeTab}
              </span>
              <button
                onClick={toggleMobileMenu}
                className="text-gray-500 hover:text-gray-700"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="block sm:hidden border-b border-blue-100">
              <div className="flex flex-col">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-6 py-3 text-left text-sm font-medium ${
                      activeTab === tab
                        ? "text-blue-500 bg-blue-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop navigation */}
          <div className="hidden sm:flex justify-between items-center border-b border-blue-100">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 md:px-6 py-4 text-xs md:text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="py-4 md:py-0 pr-4 md:pr-6"></div>
          </div>

          {/* Content area */}
          <div className="p-4 md:p-6 pb-20">
            {isLoading && !isEditing ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-pulse text-blue-500">Loading...</div>
              </div>
            ) : (
              <>
                {activeTab === "personal" && renderPersonalInfo()}
                {activeTab === "security" && renderSecurity()}
                {activeTab === "notifications" && renderNotifications()}
                {activeTab === "Team Member" && renderTeamMember()}
              </>
            )}
          </div>
        </div>

        {/* Responsive footer with action buttons for mobile */}
        {isEditing && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:hidden">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveChanges}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
