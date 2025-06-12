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
// import { Building as BuildingIcon } from "lucide-react";
// import { Button } from "@/components/ui/Button";

// const Buildings: React.FC = () => {
//   const [buildings, setBuildings] = useState<Building[]>([]);
//   const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

//   // Load buildings on component mount
//   useEffect(() => {
//     const savedBuildings = loadBuildingsFromStorage();
//     setBuildings(savedBuildings);
//   }, []);

//   // Save buildings whenever they change
//   useEffect(() => {
//     if (buildings.length > 0) {
//       saveBuildingsToStorage(buildings);
//     }
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
//     <div className="h-full space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-3">
//           <div className="bg-blue-600 p-2 rounded-lg">
//             <BuildingIcon className="h-6 w-6 text-white" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Building Management</h1>
//             <p className="text-sm text-gray-500">
//               Manage buildings and floors for your wayfinding system
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center space-x-2 text-sm text-gray-600">
//           <BuildingIcon className="h-4 w-4" />
//           <span>{buildings.length} buildings</span>
//         </div>
//       </div>

//       {/* Building Manager Component */}
//       <div className="bg-white rounded-xl shadow-sm">
//         <BuildingManager
//           buildings={buildings}
//           selectedBuilding={selectedBuilding}
//           onBuildingSelect={handleBuildingSelect}
//           onBuildingCreate={handleBuildingCreate}
//           onBuildingDelete={handleBuildingDelete}
//           onFloorAdd={handleFloorAdd}
//           onFloorDelete={handleFloorDelete}
//           onFloorReorder={handleFloorReorder}
//           onExit={() => {}} // Not needed since we have the sidebar navigation
//         />
//       </div>

//       {/* Quick Actions */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="p-4 border rounded-lg">
//             <h4 className="font-medium text-gray-900 mb-2">Create Building</h4>
//             <p className="text-sm text-gray-600 mb-3">
//               Add a new building to your wayfinding system
//             </p>
//             <Button 
//               onClick={() => {
//                 const name = prompt("Enter building name:");
//                 if (name?.trim()) {
//                   handleBuildingCreate(name.trim());
//                 }
//               }}
//               size="sm"
//             >
//               Create Building
//             </Button>
//           </div>
          
//           <div className="p-4 border rounded-lg">
//             <h4 className="font-medium text-gray-900 mb-2">Import Building</h4>
//             <p className="text-sm text-gray-600 mb-3">
//               Import building data from a file
//             </p>
//             <Button variant="outline" size="sm" disabled>
//               Coming Soon
//             </Button>
//           </div>
          
//           <div className="p-4 border rounded-lg">
//             <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
//             <p className="text-sm text-gray-600 mb-3">
//               Export all building data as backup
//             </p>
//             <Button 
//               variant="outline" 
//               size="sm"
//               onClick={() => {
//                 const dataStr = JSON.stringify(buildings, null, 2);
//                 const dataBlob = new Blob([dataStr], { type: 'application/json' });
//                 const url = URL.createObjectURL(dataBlob);
//                 const link = document.createElement('a');
//                 link.href = url;
//                 link.download = 'buildings-backup.json';
//                 link.click();
//                 URL.revokeObjectURL(url);
//               }}
//             >
//               Export JSON
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Buildings;






"use client";

import React, { useState, useEffect } from "react";
import { BuildingManager } from "@/components/BuildingManager";
import { Building, Floor } from "@/types/building";
import {
  loadBuildingsFromStorage,
  saveBuildingsToStorage,
  createBuilding,
  addFloorToBuilding,
  removeFloorFromBuilding,
  reorderFloorsInBuilding,
  deleteBuilding,
  updateBuilding,
  updateFloorInBuilding,
} from "@/lib/buildingData";
import { Building as BuildingIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

const Buildings: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  // Load buildings on component mount
  useEffect(() => {
    const savedBuildings = loadBuildingsFromStorage();
    setBuildings(savedBuildings);
  }, []);

  // Save buildings whenever they change
  useEffect(() => {
    if (buildings.length > 0) {
      saveBuildingsToStorage(buildings);
    }
  }, [buildings]);

  const handleBuildingCreate = (name: string, address: string, description: string) => {
    const newBuilding = createBuilding(name, address, description);
    setBuildings([...buildings, newBuilding]);
    setSelectedBuilding(newBuilding);
  };

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
  };

  const handleBuildingDelete = (buildingId: string) => {
    const updatedBuildings = deleteBuilding(buildings, buildingId);
    setBuildings(updatedBuildings);
    if (selectedBuilding?.id === buildingId) {
      setSelectedBuilding(null);
    }
  };

  // Add these handler functions
    const handleBuildingUpdate = (buildingId: string, updates: { name?: string; address?: string; description?: string }) => {
        const updatedBuildings = updateBuilding(buildings, buildingId, updates);
        setBuildings(updatedBuildings);
        
        const updatedBuilding = updatedBuildings.find((b) => b.id === buildingId);
        if (updatedBuilding && selectedBuilding?.id === buildingId) {
        setSelectedBuilding(updatedBuilding);
        }
    };
  
  const handleFloorUpdate = (buildingId: string, floorId: string, updates: { label?: string; order?: number; imageUrl?: string }) => {
    const updatedBuildings = updateFloorInBuilding(buildings, buildingId, floorId, updates);
    setBuildings(updatedBuildings);
    
    const updatedBuilding = updatedBuildings.find((b) => b.id === buildingId);
    if (updatedBuilding && selectedBuilding?.id === buildingId) {
      setSelectedBuilding(updatedBuilding);
    }
  };

  const handleFloorAdd = (
    buildingId: string,
    floor: Omit<Floor, "id" | "createdAt">
  ) => {
    const updatedBuildings = addFloorToBuilding(buildings, buildingId, floor);
    setBuildings(updatedBuildings);

    const updatedBuilding = updatedBuildings.find((b) => b.id === buildingId);
    if (updatedBuilding) {
      setSelectedBuilding(updatedBuilding);
    }
  };

  const handleFloorDelete = (buildingId: string, floorId: string) => {
    const updatedBuildings = removeFloorFromBuilding(
      buildings,
      buildingId,
      floorId
    );
    setBuildings(updatedBuildings);

    const updatedBuilding = updatedBuildings.find((b) => b.id === buildingId);
    if (updatedBuilding) {
      setSelectedBuilding(updatedBuilding);
    }
  };

  const handleFloorReorder = (buildingId: string, reorderedFloors: Floor[]) => {
    const updatedBuildings = reorderFloorsInBuilding(
      buildings,
      buildingId,
      reorderedFloors
    );
    setBuildings(updatedBuildings);

    const updatedBuilding = updatedBuildings.find((b) => b.id === buildingId);
    if (updatedBuilding) {
      setSelectedBuilding(updatedBuilding);
    }
  };

  return (
    <div className="h-full space-y-6">
      {/* Building Manager Component */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <BuildingManager
          buildings={buildings}
          selectedBuilding={selectedBuilding}
          onBuildingSelect={handleBuildingSelect}
          onBuildingCreate={handleBuildingCreate}
          onBuildingDelete={handleBuildingDelete}
          onBuildingUpdate={handleBuildingUpdate}
          onFloorUpdate={handleFloorUpdate}
          onFloorAdd={handleFloorAdd}
          onFloorDelete={handleFloorDelete}
          onFloorReorder={handleFloorReorder}
          onExit={() => {}} // Not needed since we have the sidebar navigation
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Export all building data as backup
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const dataStr = JSON.stringify(buildings, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'buildings-backup.json';
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export JSON
            </Button>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Import Building</h4>
            <p className="text-sm text-gray-600 mb-3">
              Import building data from a file
            </p>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Statistics</h4>
            <p className="text-sm text-gray-600 mb-3">
              View building and floor statistics
            </p>
            <div className="text-sm text-gray-700">
              <div>Buildings: {buildings.length}</div>
              <div>Total Floors: {buildings.reduce((acc, b) => acc + b.floors.length, 0)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Buildings;
