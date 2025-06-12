// import React, { useState } from "react";
// import Link from "next/link";
// import { NavigationItem } from "./SidebarNavigation";

// interface NavItemProps {
//   item: NavigationItem;
//   isActive?: boolean;
//   level?: number;
//   onClick?: () => void;
//   className?: string;
// }

// const NavItem: React.FC<NavItemProps> = ({
//   item,
//   isActive = false,
//   level = 0,
//   onClick,
//   className = "",
// }) => {
//   const [isExpanded, setIsExpanded] = useState<boolean>(false);
//   const hasChildren = item.children && item.children.length > 0;

//   const handleClick = (e: React.MouseEvent) => {
//     if (hasChildren) {
//       e.preventDefault();
//       setIsExpanded(!isExpanded);
//     }

//     if (onClick) {
//       onClick();
//     }
//   };

//   const baseClasses = `
//     flex items-center justify-between w-full px-3 py-2 text-left rounded-md
//     transition-colors duration-200 group
//     ${level > 0 ? "ml-4 text-sm" : "text-base"}
//     ${
//       isActive
//         ? "bg-blue-100 text-blue-700 font-medium"
//         : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
//     }
//     ${className}
//   `;

//   const content = (
//     <>
//       <div className="flex items-center flex-1">
//         {/* Icon */}
//         {item.icon && (
//           <item.icon
//             className={`mr-3 h-5 w-5 ${
//               isActive
//                 ? "text-blue-500"
//                 : "text-gray-400 group-hover:text-gray-500"
//             }`}
//           />
//         )}

//         {/* Label */}
//         <span className="truncate">{item.label}</span>

//         {/* Badge */}
//         {item.badge && (
//           <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//             {item.badge}
//           </span>
//         )}
//       </div>

//       {/* Expand/Collapse Icon */}
//       {hasChildren && (
//         <svg
//           className={`ml-2 h-4 w-4 transition-transform duration-200 ${
//             isExpanded ? "rotate-90" : ""
//           }`}
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M9 5l7 7-7 7"
//           />
//         </svg>
//       )}
//     </>
//   );

//   return (
//     <div>
//       {/* Main Item */}
//       {item.href && !hasChildren ? (
//         <Link href={item.href} className={baseClasses} onClick={handleClick}>
//           {content}
//         </Link>
//       ) : (
//         <button className={baseClasses} onClick={handleClick}>
//           {content}
//         </button>
//       )}

//       {/* Children */}
//       {hasChildren && isExpanded && (
//         <div className="mt-1 space-y-1">
//           {item.children!.map((child) => (
//             <NavItem
//               key={child.id}
//               item={child}
//               level={level + 1}
//               isActive={isActive}
//               onClick={onClick}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NavItem;




import React from "react";
import { NavigationItem } from "./SidebarNavigation";

interface NavItemProps {
  item: NavigationItem;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
  themeColor: any;
}

const NavItem: React.FC<NavItemProps> = ({
  item,
  isActive,
  onClick,
  isCollapsed,
  themeColor,
}) => {
  const IconComponent = item.icon;

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
        ${
          isActive
            ? `bg-${themeColor?.primary || 'blue'}-100 text-${themeColor?.primary || 'blue'}-700 border-r-2 border-${themeColor?.primary || 'blue'}-500`
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
        ${isCollapsed ? 'justify-center px-2' : 'justify-start'}
      `}
      title={isCollapsed ? item.label : undefined}
    >
      {IconComponent && (
        <IconComponent
          className={`
            h-5 w-5 flex-shrink-0
            ${isCollapsed ? '' : 'mr-3'}
            ${isActive ? `text-${themeColor?.primary || 'blue'}-600` : 'text-gray-400'}
          `}
        />
      )}
      
      {!isCollapsed && (
        <span className="truncate">{item.label}</span>
      )}
      
      {!isCollapsed && item.badge && (
        <span className={`
          ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full
          ${isActive ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-600'}
        `}>
          {item.badge}
        </span>
      )}
    </button>
  );
};

export default NavItem;
