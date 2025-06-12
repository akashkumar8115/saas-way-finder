// import React from "react";
// import NavItem from "./NavItem";
// import { useRouter, usePathname } from "next/navigation";

// export interface NavigationItem {
//   id: string;
//   label: string;
//   href: string;
//   icon?: React.ComponentType<{ className?: string }>;
//   badge?: string | number;
//   children?: NavigationItem[];
// }

// interface SidebarNavigationProps {
//   className?: string;
//   onItemClick?: (item: NavigationItem) => void;
// }

// // Example navigation items - customize based on your needs
// const navigationItems: NavigationItem[] = [
//   {
//     id: "dashboard",
//     label: "Dashboard",
//     href: "/dashboard",
//   },
//   {
//     id: "buildings",
//     label: "Buildings",
//     href: "/buildings",
//   },
//   {
//     id: "map-editor",
//     label: "Map Editor",
//     href: "/map-editor",
//   },
//   {
//     id: "organizations",
//     label: "Organizations",
//     href: "/dashboard/organizations",
//   },
//   {
//     id: "users",
//     label: "Users",
//     href: "/dashboard/users",
//   },
//   {
//     id: "settings",
//     label: "Settings",
//     href: "/dashboard/settings",
//     children: [
//       {
//         id: "profile",
//         label: "Profile",
//         href: "/dashboard/settings/profile",
//       },
//       {
//         id: "security",
//         label: "Security",
//         href: "/dashboard/settings/security",
//       },
//     ],
//   },
// ];

// const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
//   className = "",
//   onItemClick,
// }) => {
//   const router = useRouter();
//   const pathname = usePathname(); // Get current pathname

//   const handleItemClick = (item: NavigationItem) => {
//     if (onItemClick) {
//       onItemClick(item);
//     }
//     if (item.href) {
//       router.push(item.href);
//     }
//   };

//   return (
//     <nav className={`h-full flex flex-col bg-white ${className}`}>
//       {/* Logo/Brand */}
//       <div className="p-6 border-b border-gray-200">
//         <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
//       </div>

//       {/* Navigation Items */}
//       <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
//         {navigationItems.map((item) => (
//           <NavItem
//             key={item.id}
//             item={item}
//             // Use pathname instead of router.pathname
//             isActive={pathname === item.href}
//             onClick={() => handleItemClick(item)}
//           />
//         ))}
//       </div>

//       {/* Footer */}
//       <div className="p-4 border-t border-gray-200">
//         <div className="text-sm text-gray-500">© 2024 Your Company</div>
//       </div>
//     </nav>
//   );
// };

// export default SidebarNavigation;



import React from "react";
import NavItem from "./NavItem";
import { useRouter, usePathname } from "next/navigation";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
}

interface SidebarNavigationProps {
  navItems: NavigationItem[];
  downNavItems: NavigationItem[];
  isCollapsed: boolean;
  themeColor: any;
  activeComponent: string;
  handleComponentChange: (componentId: string) => void;
  userRole: string | number;
  className?: string;
  onItemClick?: (item: NavigationItem) => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  navItems,
  downNavItems,
  isCollapsed,
  themeColor,
  activeComponent,
  handleComponentChange,
  userRole,
  className = "",
  onItemClick,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleItemClick = (item: NavigationItem) => {
    // Update active component
    handleComponentChange(item.id);
    
    // Call custom onItemClick if provided
    if (onItemClick) {
      onItemClick(item);
    }
    
    // Navigate to the route
    if (item.href) {
      router.push(item.href);
    }
  };

  const handleDownItemClick = (item: NavigationItem) => {
    // For down navigation items (like logout), don't change active component
    if (onItemClick) {
      onItemClick(item);
    }
    
    // Navigate to the route if it exists
    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeComponent === item.id || pathname === item.href}
            onClick={() => handleItemClick(item)}
            isCollapsed={isCollapsed}
            themeColor={themeColor}
          />
        ))}
      </div>

      {/* Bottom Navigation Items (Settings, Logout, etc.) */}
      {downNavItems && downNavItems.length > 0 && (
        <div className="border-t border-gray-200 px-3 py-4 space-y-1">
          {downNavItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeComponent === item.id || pathname === item.href}
              onClick={() => handleDownItemClick(item)}
              isCollapsed={isCollapsed}
              themeColor={themeColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarNavigation;
