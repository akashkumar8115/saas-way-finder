// "use client";

// import Index from "../pages/Index";

// export default function MapEditorPage() {
//   return <Index />;
// }



"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LogoutConfirmationModal from "@/components/LogoutConfirmationModal";
import Index from "../pages/Index";

interface User {
  role_id: string;
}

interface AuthContextType {
  user: User | null;
  logout: () => Promise<boolean>;
}

export default function MapEditorPage() {
  const [activeComponent, setActiveComponent] = useState<string>("map-editor");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState<boolean>(false);
  
  const { user, logout } = useAuth() as AuthContextType;
  const userRole: string | undefined = user?.role_id;

  // Update active component from localStorage on client-side only
  useEffect(() => {
    // Set map-editor as active component
    setActiveComponent("map-editor");
    localStorage.setItem("activeComponent", "map-editor");
    
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Handle component change
  const handleComponentChange = (componentId: string) => {
    setActiveComponent(componentId);
    localStorage.setItem("activeComponent", componentId);
  };

  // Handle logout
  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  // Perform the actual logout
  const confirmLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        toast.success("Logged out successfully");
        localStorage.setItem("activeComponent", "dashboard");
      } else {
        toast.error("Failed to log out");
      }
    } catch (error) {
      toast.error("An error occurred during logout");
    } finally {
      setShowLogoutConfirmation(false);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardLayout
      userRole={userRole}
      activeComponent={activeComponent}
      handleComponentChange={handleComponentChange}
      handleLogout={handleLogout}
    >
      {/* Map Editor Content */}
      <div className="h-full">
        <Index />
      </div>
      
      {showLogoutConfirmation && (
        <LogoutConfirmationModal
          onClose={() => setShowLogoutConfirmation(false)}
          onConfirm={confirmLogout}
          message="Are you sure you want to log out?"
        />
      )}
    </DashboardLayout>
  );
}
