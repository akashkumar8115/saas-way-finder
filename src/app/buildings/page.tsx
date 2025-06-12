// "use client";

// import React, { useState, useEffect } from "react";
// import { BuildingManager } from "@/components/BuildingManager";
// import { Building, Floor } from "@/types/building";
// import {
//   loadBuildingsFromStorage,
//   saveBuildingsToStorage,
//   createBuilding,
//   addFloorToBuilding,
//   removeFloorFromBuilding,
//   reorderFloorsInBuilding,
//   deleteBuilding,
// } from "@/lib/buildingData";
// import { Navigation, Building as BuildingIcon, ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/Button";
// import Link from "next/link";

// const ManageBuildingsPage = () => {
//   const [buildings, setBuildings] = useState<Building[]>([]);
//   const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

//   // Load buildings on component mount
//   useEffect(() => {
//     const savedBuildings = loadBuildingsFromStorage();
//     setBuildings(savedBuildings);
//   }, []);

//   // Save buildings whenever they change
//   useEffect(() => {
//     saveBuildingsToStorage(buildings);
//   }, [buildings]);

//   const handleBuildingCreate = (name: string) => {
//     const newBuilding = createBuilding(name);
//     setBuildings([...buildings, newBuilding]);
//     setSelectedBuilding(newBuilding);
//   };

//   const handleBuildingSelect = (building: Building) => {
//     setSelectedBuilding(building);
//   };

//   const handleBuildingDelete = (buildingId: string) => {
//     const updatedBuildings = deleteBuilding(buildings, buildingId);
//     setBuildings(updatedBuildings);
//     if (selectedBuilding?.id === buildingId) {
//       setSelectedBuilding(null);
//     }
//   };

//   const handleFloorAdd = (
//     buildingId: string,
//     floor: Omit<Floor, "id" | "createdAt">
//   ) => {
//     const updatedBuildings = addFloorToBuilding(buildings, buildingId, floor);
//     setBuildings(updatedBuildings);

//     const updatedBuilding = updatedBuildings.find((b) => b.id === buildingId);
//     if (updatedBuilding) {
//       setSelectedBuilding(updatedBuilding);
//     }
//   };

//   const handleFloorDelete = (buildingId: string, floorId: string) => {
//     const updatedBuildings = removeFloorFromBuilding(
//       buildings,
//       buildingId,
//       floorId
//     );
//     setBuildings(updatedBuildings);

//     const updatedBuilding = updatedBuildings.find((b) => b.id === buildingId);
//     if (updatedBuilding) {
//       setSelectedBuilding(updatedBuilding);
//     }
//   };

//   const handleFloorReorder = (buildingId: string, reorderedFloors: Floor[]) => {
//     const updatedBuildings = reorderFloorsInBuilding(
//       buildings,
//       buildingId,
//       reorderedFloors
//     );
//     setBuildings(updatedBuildings);

//     const updatedBuilding = updatedBuildings.find((b) => b.id === buildingId);
//     if (updatedBuilding) {
//       setSelectedBuilding(updatedBuilding);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center space-x-3">
//               <div className="bg-blue-600 p-2 rounded-lg">
//                 <Link href="/">
//                   <Navigation className="h-6 w-6 text-white" />
//                 </Link>
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">Building Management</h1>
//                 <p className="text-sm text-gray-500">
//                   Manage buildings and floors for your wayfinding system
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-2 text-sm text-gray-600">
//               <BuildingIcon className="h-4 w-4" />
//               <span>{buildings.length} buildings</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Back to Map Editor Button */}
//         <div className="mb-6">
//           <Link href="/pages">
//             <Button className="flex items-center space-x-2">
//               <ArrowLeft className="h-4 w-4" />
//               <span>Back to Map Editor</span>
//             </Button>
//           </Link>
//         </div>

//         {/* Building Manager Component */}
//         <div className="max-w-6xl mx-auto">
//           <BuildingManager
//             buildings={buildings}
//             selectedBuilding={selectedBuilding}
//             onBuildingSelect={handleBuildingSelect}
//             onBuildingCreate={handleBuildingCreate}
//             onBuildingDelete={handleBuildingDelete}
//             onFloorAdd={handleFloorAdd}
//             onFloorDelete={handleFloorDelete}
//             onFloorReorder={handleFloorReorder}
//             onExit={() => {}} // Not needed since we have the back button
//           />
//         </div>

//         {/* Quick Actions */}
//         <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="p-4 border rounded-lg">
//               <h4 className="font-medium text-gray-900 mb-2">Create Building</h4>
//               <p className="text-sm text-gray-600 mb-3">
//                 Add a new building to your wayfinding system
//               </p>
//               <Button 
//                 onClick={() => {
//                   const name = prompt("Enter building name:");
//                   if (name?.trim()) {
//                     handleBuildingCreate(name.trim());
//                   }
//                 }}
//                 size="sm"
//               >
//                 Create Building
//               </Button>
//             </div>
            
//             <div className="p-4 border rounded-lg">
//               <h4 className="font-medium text-gray-900 mb-2">Import Building</h4>
//               <p className="text-sm text-gray-600 mb-3">
//                 Import building data from a file
//               </p>
//               <Button variant="outline" size="sm" disabled>
//                 Coming Soon
//               </Button>
//             </div>
            
//             <div className="p-4 border rounded-lg">
//               <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
//               <p className="text-sm text-gray-600 mb-3">
//                 Export all building data as backup
//               </p>
//               <Button 
//                 variant="outline" 
//                 size="sm"
//                 onClick={() => {
//                   const dataStr = JSON.stringify(buildings, null, 2);
//                   const dataBlob = new Blob([dataStr], { type: 'application/json' });
//                   const url = URL.createObjectURL(dataBlob);
//                   const link = document.createElement('a');
//                   link.href = url;
//                   link.download = 'buildings-backup.json';
//                   link.click();
//                   URL.revokeObjectURL(url);
//                 }}
//               >
//                 Export JSON
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManageBuildingsPage;






"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LogoutConfirmationModal from "@/components/LogoutConfirmationModal";
import Buildings from "../pages/Building";

interface User {
  role_id: string;
}

interface AuthContextType {
  user: User | null;
  logout: () => Promise<boolean>;
}

export default function BuildingsPage() {
  const [activeComponent, setActiveComponent] = useState<string>("buildings");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState<boolean>(false);
  
  const { user, logout } = useAuth() as AuthContextType;
  const userRole: string | undefined = user?.role_id;

  // Update active component from localStorage on client-side only
  useEffect(() => {
    // Set buildings as active component
    setActiveComponent("buildings");
    localStorage.setItem("activeComponent", "buildings");
    
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
      {/* Buildings Content */}
      <div className="h-full">
        <Buildings />
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
