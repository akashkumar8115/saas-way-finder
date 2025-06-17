
// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation"; // Added for navigation after logout
// import { useAuth } from "@/context/AuthContext";
// import { Toaster, toast } from "react-hot-toast"; // Added Toaster for notifications
// import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
// import DashboardLayout from "@/components/dashboard/DashboardLayout";
// import LogoutConfirmationModal from "@/components/LogoutConfirmationModal";
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

// interface User {
//   role_id: string;
// }

// interface AuthContextType {
//   user: User | null;
//   logout: () => Promise<boolean>;
// }

// export default function BuildingsPage() {
//   const router = useRouter(); // Added for navigation
//   const [activeComponent, setActiveComponent] = useState<string>("buildings");
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [showLogoutConfirmation, setShowLogoutConfirmation] = useState<boolean>(false);
//   const [buildings, setBuildings] = useState<Building[]>([]);
//   const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

//   const { user, logout } = useAuth() as AuthContextType;
//   const userRole = user?.role_id || "user";

//   // Load buildings on component mount
//   useEffect(() => {
//     try {
//       const savedBuildings = loadBuildingsFromStorage() || []; // Fallback to empty array
//       setBuildings(savedBuildings);
//       setActiveComponent("buildings");
//       localStorage.setItem("activeComponent", "buildings");
//     } catch (error) {
//       console.error("Failed to load buildings:", error);
//       toast.error("Failed to load buildings data");
//       setBuildings([]); // Fallback to empty array on error
//     } finally {
//       const timer = setTimeout(() => setIsLoading(false), 300);
//       return () => clearTimeout(timer);
//     }
//     // Added userRole to dependencies since it's used in the effect
//   }, [userRole]);

//   // Save buildings whenever they change
//   useEffect(() => {
//     try {
//       saveBuildingsToStorage(buildings);
//     } catch (error) {
//       console.error("Failed to save buildings:", error);
//       toast.error("Failed to save buildings data");
//     }
//   }, [buildings]);

//   const handleComponentChange = (componentId: string) => {
//     setActiveComponent(componentId);
//     localStorage.setItem("activeComponent", componentId);
//   };

//   const handleLogout = () => {
//     setShowLogoutConfirmation(true);
//   };

//   const confirmLogout = async () => {
//     const loadingToast = toast.loading("Logging out...");
//     try {
//       const success = await logout();
//       if (success) {
//         toast.success("Logged out successfully", { id: loadingToast });
//         localStorage.clear(); // Clear all auth data
//         document.cookie = "digital-signage=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"; // Clear cookie
//         localStorage.setItem("activeComponent", "dashboard");
//         router.push("/login"); // Navigate to login page
//       } else {
//         toast.error("Failed to log out", { id: loadingToast });
//       }
//     } catch (error: unknown) {
//       const errorMessage =
//         error instanceof Error ? error.message : "An error occurred during logout";
//       toast.error(errorMessage, { id: loadingToast });
//     } finally {
//       setShowLogoutConfirmation(false);
//     }
//   };

//   // Building management handlers
//   const handleBuildingCreate = (name: string) => {
//     if (!name.trim()) {
//       toast.error("Building name is required");
//       return;
//     }
//     try {
//       const newBuilding = createBuilding(name);
//       setBuildings((prev) => [...prev, newBuilding]);
//       setSelectedBuilding(newBuilding);
//       toast.success(`Building "${name}" created successfully`);
//     } catch (error) {
//       console.error("Failed to create building:", error);
//       toast.error("Failed to create building");
//     }
//   };

//   const handleBuildingSelect = (building: Building) => {
//     setSelectedBuilding(building);
//   };

//   const handleBuildingDelete = (buildingId: string) => {
//     try {
//       const buildingToDelete = buildings.find((b) => b.id === buildingId);
//       if (!buildingToDelete) {
//         toast.error("Building not found");
//         return;
//       }
//       const updatedBuildings = deleteBuilding(buildings, buildingId);
//       setBuildings(updatedBuildings);
//       if (selectedBuilding?.id === buildingId) {
//         setSelectedBuilding(null);
//       }
//       toast.success(`Building "${buildingToDelete.name}" deleted successfully`);
//     } catch (error) {
//       console.error("Failed to delete building:", error);
//       toast.error("Failed to delete building");
//     }
//   };

//   const handleFloorAdd = (buildingId: string, floor: Floor) => {
//     if (!floor.name.trim()) {
//       toast.error("Floor name is required");
//       return;
//     }
//     try {
//       const updatedBuildings = addFloorToBuilding(buildings, buildingId, floor);
//       setBuildings(updatedBuildings);
//       toast.success(`Floor "${floor.name}" added to building "${selectedBuilding?.name}"`);
//     } catch (error) {
//       console.error("Failed to add floor:", error);
//       toast.error("Failed to add floor");
//     }
//   };

//   const handleFloorRemove = (buildingId: string, floorId: string) => {
//     try {
//       const updatedBuildings = removeFloorFromBuilding(buildings, buildingId, floorId);
//       setBuildings(updatedBuildings);
//       toast.success(`Floor removed from building "${selectedBuilding?.name}"`);
//     } catch (error) {
//       console.error("Failed to remove floor:", error);
//       toast.error("Failed to remove floor");
//     }
//   };

//   const handleFloorReorder = (buildingId: string, newOrder: string[]) => {
//     try {
//       const updatedBuildings = reorderFloorsInBuilding(buildings, buildingId, newOrder);
//       setBuildings(updatedBuildings);
//       toast.success(`Floors reordered in building "${selectedBuilding?.name}"`);
//     } catch (error) {
//       console.error("Failed to reorder floors:", error);
//       toast.error("Failed to reorder floors");
//     }
//   };

//   if (isLoading) {
//     return <DashboardSkeleton />;
//   }

//   return (
//     <>
//       <Toaster position="top-right" /> {/* Added Toaster for notifications */}
//       <DashboardLayout
//         userRole={userRole}
//         activeComponent={activeComponent}
//         handleComponentChange={handleComponentChange}
//         handleLogout={handleLogout}
//       >
//         {/* Buildings Content */}
//         <div className="h-full">
//           <BuildingManager
//             buildings={buildings}
//             selectedBuilding={selectedBuilding}
//             handleBuildingCreate={handleBuildingCreate}
//             handleBuildingSelect={handleBuildingSelect}
//             handleBuildingDelete={handleBuildingDelete}
//             handleFloorAdd={handleFloorAdd}
//             handleFloorRemove={handleFloorRemove}
//             handleFloorReorder={handleFloorReorder}
//           />
//         </div>

//         {showLogoutConfirmation && (
//           <LogoutConfirmationModal
//             onClose={() => setShowLogoutConfirmation(false)}
//             onConfirm={confirmLogout}
//             message="Are you sure you want to log out?"
//           />
//         )}
//       </DashboardLayout>
//     </>
//   );
// }




"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import LogoutConfirmationModal from "@/components/LogoutConfirmationModal";
import { BuildingManager } from "@/components/BuildingManager";
import { Building, Floor } from "@/types/building";
import { Button } from "@/components/ui/Button";
import { LogOut, ArrowLeft, Home } from "lucide-react";
import {
  loadBuildingsFromAPI,
  createBuilding,
  addFloorToBuilding,
  removeFloorFromBuilding,
  reorderFloorsInBuilding,
  deleteBuilding,
  updateBuilding,
  updateFloorInBuilding,
} from "@/lib/buildingData";

interface User {
  role_id: string;
  name?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  logout: () => Promise<boolean>;
}

export default function BuildingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState<boolean>(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  const { user, logout } = useAuth() as AuthContextType;
  const userRole = user?.role_id || "user";

  // Load buildings from API on component mount
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        setIsLoading(true);
        console.log("Loading buildings from API...");
        const buildingsData = await loadBuildingsFromAPI();
        console.log("Loaded buildings:", buildingsData);
        setBuildings(Array.isArray(buildingsData) ? buildingsData : []);
      } catch (error) {
        console.error("Failed to load buildings:", error);
        toast.error("Failed to load buildings data");
        setBuildings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBuildings();
  }, [userRole]);

  // Reload buildings helper function
  const reloadBuildings = async () => {
    try {
      const buildingsData = await loadBuildingsFromAPI();
      setBuildings(Array.isArray(buildingsData) ? buildingsData : []);
    } catch (error) {
      console.error("Failed to reload buildings:", error);
    }
  };

  // Building management handlers - All API-based
  const handleBuildingCreate = async (name: string, address: string, description: string) => {
    if (!name.trim()) {
      toast.error("Building name is required");
      return;
    }
    
    try {
      const newBuilding = await createBuilding(name, address, description);
      if (newBuilding) {
        await reloadBuildings();
        setSelectedBuilding(newBuilding);
      }
    } catch (error) {
      console.error("Failed to create building:", error);
      toast.error("Failed to create building");
    }
  };

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
  };

  const handleBuildingUpdate = async (
    buildingId: string,
    updates: { name?: string; address?: string; description?: string }
  ) => {
    try {
      const updatedBuilding = await updateBuilding(buildingId, updates);
      if (updatedBuilding) {
        setBuildings((prev) =>
          prev.map((building) =>
            building.building_id === buildingId ? updatedBuilding : building
          )
        );
        
        if (selectedBuilding?.building_id === buildingId) {
          setSelectedBuilding(updatedBuilding);
        }
        
        await reloadBuildings();
      }
    } catch (error) {
      console.error("Failed to update building:", error);
      toast.error("Failed to update building");
    }
  };

  const handleBuildingDelete = async (buildingId: string) => {
    try {
      const buildingToDelete = buildings.find((b) => b.building_id === buildingId);
      if (!buildingToDelete) {
        toast.error("Building not found");
        return;
      }
      
      const success = await deleteBuilding(buildingId);
      if (success) {
        setBuildings((prev) => prev.filter((b) => b.building_id !== buildingId));
        
        if (selectedBuilding?.building_id === buildingId) {
          setSelectedBuilding(null);
        }
        
        await reloadBuildings();
      }
    } catch (error) {
      console.error("Failed to delete building:", error);
      toast.error("Failed to delete building");
    }
  };

  const handleFloorAdd = async (
    buildingId: string,
    floor: Omit<Floor, "floor_id" | "datetime" | "status" | "building_id">
  ) => {
    if (!floor.label.trim()) {
      toast.error("Floor name is required");
      return;
    }
    
    try {
      const newFloor = await addFloorToBuilding(buildingId, floor);
      if (newFloor) {
        await reloadBuildings();
        
        const updatedBuildings = await loadBuildingsFromAPI();
        const updatedBuilding = updatedBuildings?.find(b => b.building_id === buildingId);
        if (selectedBuilding?.building_id === buildingId && updatedBuilding) {
          setSelectedBuilding(updatedBuilding);
        }
      }
    } catch (error) {
      console.error("Failed to add floor:", error);
      toast.error("Failed to add floor");
    }
  };

  const handleFloorUpdate = async (
    buildingId: string,
    floorId: string,
    updates: { label?: string; order?: number; imageUrl?: string }
  ) => {
    try {
      const updatedFloor = await updateFloorInBuilding(buildingId, floorId, updates);
      if (updatedFloor) {
        await reloadBuildings();
        
        const updatedBuildings = await loadBuildingsFromAPI();
        const updatedBuilding = updatedBuildings?.find(b => b.building_id === buildingId);
        if (selectedBuilding?.building_id === buildingId && updatedBuilding) {
          setSelectedBuilding(updatedBuilding);
        }
      }
    } catch (error) {
      console.error("Failed to update floor:", error);
      toast.error("Failed to update floor");
    }
  };

  const handleFloorDelete = async (buildingId: string, floorId: string) => {
    try {
      const success = await removeFloorFromBuilding(buildingId, floorId);
      if (success) {
        await reloadBuildings();
        
        const updatedBuildings = await loadBuildingsFromAPI();
        const updatedBuilding = updatedBuildings?.find(b => b.building_id === buildingId);
        if (selectedBuilding?.building_id === buildingId && updatedBuilding) {
          setSelectedBuilding(updatedBuilding);
        }
      }
    } catch (error) {
      console.error("Failed to remove floor:", error);
      toast.error("Failed to remove floor");
    }
  };

  const handleFloorReorder = async (buildingId: string, floors: Floor[]) => {
    try {
      const reorderedFloors = await reorderFloorsInBuilding(buildingId, floors);
      if (reorderedFloors) {
        await reloadBuildings();
        
        const updatedBuildings = await loadBuildingsFromAPI();
        const updatedBuilding = updatedBuildings?.find(b => b.building_id === buildingId);
        if (selectedBuilding?.building_id === buildingId && updatedBuilding) {
          setSelectedBuilding(updatedBuilding);
        }
      }
    } catch (error) {
      console.error("Failed to reorder floors:", error);
      toast.error("Failed to reorder floors");
    }
  };

  const handleExit = () => {
    setSelectedBuilding(null);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left side - Navigation */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  <h1 className="text-xl font-semibold text-gray-900">
                    Building Management
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <BuildingManager
                buildings={buildings}
                selectedBuilding={selectedBuilding}
                onBuildingSelect={handleBuildingSelect}
                onBuildingCreate={handleBuildingCreate}
                onBuildingUpdate={handleBuildingUpdate}
                onBuildingDelete={handleBuildingDelete}
                onFloorAdd={handleFloorAdd}
                onFloorUpdate={handleFloorUpdate}
                onFloorDelete={handleFloorDelete}
                onFloorReorder={handleFloorReorder}
                onExit={handleExit}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
