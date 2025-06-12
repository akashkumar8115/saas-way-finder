// import React from "react";
// import {
//   LayoutDashboard,
//   Images,
//   ListVideo,
//   Monitor,
//   Flag,
//   HelpCircleIcon,
//   Headset,
//   Settings,
//   UserCircle,
//   ClipboardMinus,
//   LogOut,
//   Users,
//   Shield,
//   Lock,
//   Database,
//   Group,
// } from "lucide-react";
// import DashboardContent from "@/app/dashboardcontent/page";
// // import Content from "@/src/app/content/page";
// // import Playlist from "@/src/app/playlist/page";
// // import ScreenPage from "@/src/app/screen/page";
// // import Groups from "@/src/app/group/page";
// import Reports from "@/app/reports/page";
// import Contact from "@/app/contact/page";
// import Setting from "@/app/setting/page";
// import Help from "@/app/help/page";
// import Profile from "@/app/profile/page";
// import Createadmin from "@/app/createadmin/page";
// import CrreateUser from "@/app/createuser/page";
// import CreateSuperAdmin from "@/app/createsuperadmin/page";

// // Define user role enum for better type safety
// export enum UserRole {
//   SUPER_ADMIN = 1,
//   ADMIN = 2,
//   MAINTAINER = 3,
//   XPI_TEAM = 4,
// }

// // Define navigation item interface
// export interface NavItem {
//   icon: React.ReactElement;
//   text: string;
//   id: string;
//   onClick?: () => void;
// }

// // Define theme color interface
// export interface ThemeColor {
//   hoverBg: string;
//   activeBg: string;
//   iconColor: string;
//   hoverIconColor: string;
//   hoverIconBg: string;
//   chevronHover: string;
// }

// // Define dashboard components type
// export type DashboardComponents = {
//   [key: string]: React.ReactElement;
// };

// // Get navigation items based on user role
// export const getNavItems = (userRole: UserRole | number): NavItem[] => {
//   // Common items for all roles
//   const commonItems: NavItem[] = [
//     {
//       icon: <ClipboardMinus className="h-5 w-5" />,
//       text: "Reports",
//       id: "reports",
//     },
//   ];

//   // Role-specific items
//   switch (userRole) {
//     case UserRole.SUPER_ADMIN: // Super Admin
//       return [
//         {
//           icon: <Lock className="h-5 w-5" />,
//           text: "Super Admin",
//           id: "dashboard",
//         },
//         ...commonItems,
//       ];

//     case UserRole.ADMIN: // Admin
//       return [
//         {
//           icon: <Users className="h-5 w-5" />,
//           text: "Manage Users",
//           id: "users",
//         },
//         ...commonItems,
//       ];

//     case UserRole.MAINTAINER: // Maintainer (Regular User)
//       return [
//         {
//           icon: <LayoutDashboard className="h-5 w-5" />,
//           text: "Dashboard",
//           id: "dashboard",
//         },
//         ...commonItems,
//       ];

//     case UserRole.XPI_TEAM: // xPi Team
//       return [
//         {
//           icon: <Lock className="h-5 w-5" />,
//           text: "Clients",
//           id: "dashboard",
//         },
//         ...commonItems,
//       ];

//     default:
//       return [
//         {
//           icon: <LayoutDashboard className="h-5 w-5" />,
//           text: "Dashboard",
//           id: "dashboard",
//         },
//         ...commonItems,
//       ];
//   }
// };

// // Get bottom navigation items
// export const getDownNavItems = (handleLogout: () => void): NavItem[] => [
//   {
//     icon: <Headset className="h-5 w-5" />,
//     text: "Contact",
//     id: "contact",
//   },
//   {
//     icon: <Settings className="h-5 w-5" />,
//     text: "Setting",
//     id: "setting",
//   },
//   {
//     icon: <HelpCircleIcon className="h-5 w-5" />,
//     text: "Help",
//     id: "help",
//   },
//   {
//     icon: <UserCircle className="h-5 w-5" />,
//     text: "Profile",
//     id: "profile",
//   },
//   {
//     icon: <LogOut className="h-5 w-5" />,
//     text: "Logout",
//     id: "logout",
//     onClick: handleLogout,
//   },
// ];

// // Get components based on user role
// export const getDashboardComponents = (
//   userRole: UserRole | number
// ): DashboardComponents => {
//   // Common components for all roles
//   const commonComponents: DashboardComponents = {
//     reports: <Reports />,
//     contact: <Contact />,
//     setting: <Setting />,
//     help: <Help />,
//     profile: <Profile />,
//   };

//   // Role-specific components
//   switch (userRole) {
//     case UserRole.SUPER_ADMIN: // Super Admin
//       return {
//         dashboard: <Createadmin />,
//         ...commonComponents,
//       };

//     case UserRole.ADMIN: // Admin
//       return {
//         dashboard: <CrreateUser />,
//         users: CrreateUser,
//         ...commonComponents,
//       };

//     case UserRole.MAINTAINER: // Maintainer (Regular User)
//       return {
//         dashboard: <DashboardContent />,
//         ...commonComponents,
//       };

//     case UserRole.XPI_TEAM: // xPi Team
//       return {
//         dashboard: <CreateSuperAdmin />,
//         ...commonComponents,
//       };

//     default:
//       return {
//         dashboard: <DashboardContent />,
//         ...commonComponents,
//       };
//   }
// };

// // Get dashboard title based on user role
// export const getDashboardTitle = (userRole: UserRole | number): string => {
//   switch (userRole) {
//     case UserRole.SUPER_ADMIN:
//       return "Super Admin";
//     case UserRole.ADMIN:
//       return "Admin Panel";
//     case UserRole.MAINTAINER:
//       return "Dashboard";
//     case UserRole.XPI_TEAM:
//       return "xPi Team";
//     default:
//       return "Dashboard";
//   }
// };

// // Get theme color based on user role
// export const getThemeColor = (userRole: UserRole | number): ThemeColor => {
//   switch (userRole) {
//     case UserRole.SUPER_ADMIN: // Super Admin - Blue
//     case UserRole.ADMIN: // Admin - Blue
//     case UserRole.XPI_TEAM: // xPi Team - Blue
//       return {
//         hoverBg: "hover:bg-blue-100",
//         activeBg: "bg-blue-100",
//         iconColor: "text-blue-500",
//         hoverIconColor: "hover:text-blue-600",
//         hoverIconBg: "hover:bg-blue-50",
//         chevronHover: "hover:text-blue-500",
//       };

//     case UserRole.MAINTAINER: // Maintainer - Indigo
//       return {
//         hoverBg: "hover:bg-indigo-100",
//         activeBg: "bg-indigo-100",
//         iconColor: "text-indigo-600",
//         hoverIconColor: "hover:text-indigo-700",
//         hoverIconBg: "hover:bg-indigo-50",
//         chevronHover: "hover:text-indigo-600",
//       };

//     default: // Default - Indigo
//       return {
//         hoverBg: "hover:bg-indigo-100",
//         activeBg: "bg-indigo-100",
//         iconColor: "text-indigo-600",
//         hoverIconColor: "hover:text-indigo-700",
//         hoverIconBg: "hover:bg-indigo-50",
//         chevronHover: "hover:text-indigo-600",
//       };
//   }
// };

// // Type guard to check if a value is a valid UserRole
// export const isValidUserRole = (role: any): role is UserRole => {
//   return Object.values(UserRole).includes(role);
// };

// // Helper function to get user role name
// export const getUserRoleName = (userRole: UserRole | number): string => {
//   switch (userRole) {
//     case UserRole.SUPER_ADMIN:
//       return "Super Admin";
//     case UserRole.ADMIN:
//       return "Admin";
//     case UserRole.MAINTAINER:
//       return "Maintainer";
//     case UserRole.XPI_TEAM:
//       return "xPi Team";
//     default:
//       return "Unknown Role";
//   }
// };










import React from "react";
import { 
  LayoutDashboard, 
  Map, 
  Building, 
  Users, 
  Building2, 
  Settings, 
  LogOut 
} from "lucide-react";

export type UserRole = string | number;

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

export interface ThemeColor {
  primary: string;
  secondary: string;
}

// Get navigation items based on user role
export const getNavItems = (userRole: UserRole): NavItem[] => {
  const baseItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "map-editor",
      label: "Map Editor",
      href: "/map-editor",
      icon: Map,
    },
    {
      id: "buildings",
      label: "Buildings",
      href: "/buildings",
      icon: Building,
    },
  ];

  // Add role-specific items
  if (userRole === "1" || userRole === 1) { // Super Admin
    baseItems.push(
      {
        id: "organizations",
        label: "Organizations",
        href: "/dashboard/organizations",
        icon: Building2,
      },
      {
        id: "users",
        label: "Users",
        href: "/dashboard/users",
        icon: Users,
      }
    );
  }

  return baseItems;
};

// Get bottom navigation items
export const getDownNavItems = (handleLogout: () => void): NavItem[] => [
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    id: "logout",
    label: "Logout",
    href: "#",
    icon: LogOut,
  },
];

// Get theme color based on user role
export const getThemeColor = (userRole: UserRole): ThemeColor => {
  switch (userRole) {
    case "1":
    case 1:
      return { primary: "blue", secondary: "blue" };
    case "2":
    case 2:
      return { primary: "green", secondary: "green" };
    case "3":
    case 3:
      return { primary: "purple", secondary: "purple" };
    default:
      return { primary: "blue", secondary: "blue" };
  }
};

// Get dashboard title based on user role
export const getDashboardTitle = (userRole: UserRole): string => {
  switch (userRole) {
    case "1":
    case 1:
      return "Super Admin";
    case "2":
    case 2:
      return "Admin Panel";
    case "3":
    case 3:
      return "User Dashboard";
    default:
      return "Dashboard";
  }
};

// Get dashboard components based on user role
export const getDashboardComponents = (userRole: UserRole) => {
  // This would return your actual dashboard components
  // For now, returning a placeholder
  return {
    dashboard: <div>Dashboard Content</div>,
    "map-editor": <div>Map Editor Content</div>,
    buildings: <div>Buildings Content</div>,
    organizations: <div>Organizations Content</div>,
    users: <div>Users Content</div>,
    settings: <div>Settings Content</div>,
  };
};

