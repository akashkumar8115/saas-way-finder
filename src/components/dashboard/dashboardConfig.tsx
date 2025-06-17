import React from "react";
import {
  LayoutDashboard,
  Images,
  ListVideo,
  Monitor,
  Flag,
  HelpCircleIcon,
  Headset,
  Settings,
  UserCircle,
  ClipboardMinus,
  LogOut,
  Users,
  Shield,
  Lock,
  Database,
  Group,
  Map,
  Building,
} from "lucide-react";

import DashboardContent from "@/app/dashboardcontent/page";
import Content from "@/app/content/page";
import Reports from "@/app/reports/page";
import Contact from "@/app/contact/page";
import Setting from "@/app/setting/page";
import Help from "@/app/help/page";
import Profile from "@/app/profile/page";
import Createadmin from "@/app/createadmin/page";
import CrreateUser from "@/app/createuser/page";
import CreateSuperAdmin from "@/app/createsuperadmin/page";
import Main from "@/app/main/page";

import MapEditor from "@/app/map-editor/page";
import BuildingsPage from "@/app/buildings/page";
import build from "next/dist/build";
// import BuildingManager from '@/app/components/BuildingManager';

// Types
export interface NavItem {
  icon: React.ReactElement;
  text: string;
  id: string;
  onClick?: () => void;
  badge?: string | number;
  isActive?: boolean;
}

export interface ThemeColor {
  hoverBg: string;
  activeBg: string;
  iconColor: string;
  hoverIconColor: string;
  hoverIconBg: string;
  chevronHover: string;
}

export type UserRole = 1 | 2 | 3 | 4;

// Get navigation items based on user role
export const getNavItems = (userRole: UserRole): NavItem[] => {
  // Common items for all roles
  const commonItems: NavItem[] = [
    {
      icon: <ClipboardMinus className="h-5 w-5" />,
      text: "Reports",
      id: "reports",
    },
    {
      icon: <Map className="h-5 w-5" />,
      text: "Map Viewer",
      id: "main",
    },
    {
      icon: <Map className="h-5 w-5" />,
      text: "Buildings",
      id: "buildings",
    },
    {
      icon: <Map className="h-5 w-5" />,
      text: "Map Editor",
      id: "map-editor",
    },
  ];

  // Role-specific items
  switch (userRole) {
    case 1: // Super Admin
      return [
        {
          icon: <Lock className="h-5 w-5" />,
          text: "Super Admin",
          id: "dashboard",
        },
        ...commonItems,
      ];

    case 2: // Admin
      return [
        {
          icon: <Users className="h-5 w-5" />,
          text: "Manage Users",
          id: "users",
        },
        ...commonItems,
      ];

    case 3: // Maintainer (Regular User)
      return [
        {
          icon: <LayoutDashboard className="h-5 w-5" />,
          text: "Dashboard",
          id: "dashboard",
        },
        {
          icon: <Images className="h-5 w-5" />,
          text: "Content",
          id: "content",
        },

        ...commonItems,
      ];

    case 4: // xPi Team
      return [
        {
          icon: <Lock className="h-5 w-5" />,
          text: "Clients",
          id: "dashboard",
        },
        ...commonItems,
      ];

    default:
      return [
        {
          icon: <LayoutDashboard className="h-5 w-5" />,
          text: "Dashboard",
          id: "dashboard",
        },
        ...commonItems,
      ];
  }
};

// Get bottom navigation items
export const getDownNavItems = (handleLogout: () => void): NavItem[] => [
  {
    icon: <Headset className="h-5 w-5" />,
    text: "Contact",
    id: "contact",
  },
  {
    icon: <Settings className="h-5 w-5" />,
    text: "Setting",
    id: "setting",
  },
  {
    icon: <HelpCircleIcon className="h-5 w-5" />,
    text: "Help",
    id: "help",
  },
  {
    icon: <UserCircle className="h-5 w-5" />,
    text: "Profile",
    id: "profile",
  },
  {
    icon: <LogOut className="h-5 w-5" />,
    text: "Logout",
    id: "logout",
    onClick: handleLogout,
  },
];

// Get components based on user role
export const getDashboardComponents = (
  userRole: UserRole
): Record<string, React.ReactElement> => {
  // Common components for all roles
  const commonComponents: Record<string, React.ReactElement> = {
    reports: <Reports />,
    contact: <Contact />,
    setting: <Setting />,
    help: <Help />,
    profile: <Profile />,
    // main: <Main />,
    buildings: <BuildingsPage />,
    "map-editor": <MapEditor />,
  };

  // Role-specific components
  switch (userRole) {
    case 1: // Super Admin
      return {
        dashboard: <Createadmin />,
        ...commonComponents,
      };

    case 2: // Admin
      return {
        dashboard: <CrreateUser />,
        users: <CrreateUser />,
        ...commonComponents,
      };

    case 3: // Maintainer (Regular User)
      return {
        dashboard: <DashboardContent />,
        content: <BuildingsPage />,
        ...commonComponents,
      };

    case 4: // xPi Team
      return {
        dashboard: <CreateSuperAdmin />,
        ...commonComponents,
      };

    default:
      return {
        dashboard: <DashboardContent />,
        ...commonComponents,
      };
  }
};

// Get dashboard title based on user role
export const getDashboardTitle = (userRole: UserRole): string => {
  switch (userRole) {
    case 1:
      return "Super Admin";
    case 2:
      return "Admin Panel";
    case 3:
      return "Dashboard";
    case 4:
      return "xPi Team";
    default:
      return "SaaS Way-Finder Dashboard";
  }
};

// Get theme color based on user role
export const getThemeColor = (userRole: UserRole): ThemeColor => {
  switch (userRole) {
    case 1: // Super Admin - Blue
    case 2: // Admin - Blue
    case 4: // xPi Team - Blue
      return {
        hoverBg: "hover:bg-blue-100",
        activeBg: "bg-blue-100",
        iconColor: "text-blue-500",
        hoverIconColor: "hover:text-blue-600",
        hoverIconBg: "hover:bg-blue-50",
        chevronHover: "hover:text-blue-500",
      };

    case 3: // Maintainer - Indigo
      return {
        hoverBg: "hover:bg-indigo-100",
        activeBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
        hoverIconColor: "hover:text-indigo-700",
        hoverIconBg: "hover:bg-indigo-50",
        chevronHover: "hover:text-indigo-600",
      };

    default: // Default - Indigo
      return {
        hoverBg: "hover:bg-indigo-100",
        activeBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
        hoverIconColor: "hover:text-indigo-700",
        hoverIconBg: "hover:bg-indigo-50",
        chevronHover: "hover:text-indigo-600",
      };
  }
};
