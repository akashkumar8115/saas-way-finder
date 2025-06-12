import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Floor } from "@/types/building";

interface FloorSelectorProps {
  floors: Floor[];
  selectedFloor: Floor | null;
  onFloorSelect: (floor: Floor) => void;
}

export const FloorSelector: React.FC<FloorSelectorProps> = ({
  floors,
  selectedFloor,
  onFloorSelect,
}) => {
  if (floors.length === 0) {
    return <div className="text-sm text-gray-500">No floors available</div>;
  }

  const sortedFloors = floors.sort((a, b) => b.order - a.order);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between text-sm">
          <span className="truncate">
            {selectedFloor?.label || "Select Floor"}
          </span>
          <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-full min-w-[200px] bg-white border shadow-lg z-50"
        align="start"
        side="bottom"
      >
        {sortedFloors.map((floor) => (
          <DropdownMenuItem
            key={floor.id}
            onClick={() => onFloorSelect(floor)}
            className={`cursor-pointer hover:bg-gray-50 ${
              selectedFloor?.id === floor.id ? "bg-blue-50 text-blue-900" : ""
            }`}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="w-8 h-8 rounded border overflow-hidden flex-shrink-0">
                <img
                  src={floor.imageUrl}
                  alt={floor.label}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
              <span className="truncate text-sm">{floor.label}</span>
              {selectedFloor?.id === floor.id && (
                <div className="w-2 h-2 bg-blue-600 rounded-full ml-auto flex-shrink-0" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
