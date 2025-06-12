"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Building, ArrowUp, AlertTriangle, Edit2, Trash2 } from "lucide-react";

export type VerticalConnectorType =
  | "elevator"
  | "stairs"
  | "escalator"
  | "emergency-exit";

export interface VerticalConnector {
  id: string;
  name: string;
  type: VerticalConnectorType;
  sharedId: string; // Same ID across floors for the same physical connector
  shape: "circle" | "rectangle";
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  color?: string;
  floorId: string;
  createdAt: string;
}

interface VerticalConnectorTaggerProps {
  isVerticalTagMode: boolean;
  selectedShapeType: "circle" | "rectangle";
  onShapeTypeChange: (shapeType: "circle" | "rectangle") => void;
  connectors: VerticalConnector[];
  onEditConnector?: (connector: VerticalConnector) => void;
  onDeleteConnector?: (connectorId: string) => void;
  currentFloorId: string;
}

export const VerticalConnectorTagger: React.FC<
  VerticalConnectorTaggerProps
> = ({
  isVerticalTagMode,
  selectedShapeType,
  onShapeTypeChange,
  connectors,
  onEditConnector,
  onDeleteConnector,
  currentFloorId,
}) => {
  const [editingConnector, setEditingConnector] =
    useState<VerticalConnector | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "elevator" as VerticalConnectorType,
    sharedId: "",
  });

  const handleEditStart = (connector: VerticalConnector) => {
    setEditingConnector(connector);
    setEditForm({
      name: connector.name,
      type: connector.type,
      sharedId: connector.sharedId,
    });
  };

  const handleEditSave = () => {
    if (editingConnector && onEditConnector) {
      const updatedConnector = {
        ...editingConnector,
        name: editForm.name,
        type: editForm.type,
        sharedId: editForm.sharedId,
      };
      onEditConnector(updatedConnector);
      setEditingConnector(null);
      setEditForm({ name: "", type: "elevator", sharedId: "" });
    }
  };

  const handleEditCancel = () => {
    setEditingConnector(null);
    setEditForm({ name: "", type: "elevator", sharedId: "" });
  };

  const getConnectorIcon = (type: VerticalConnectorType) => {
    switch (type) {
      case "elevator":
        return <Building className="h-4 w-4" />;
      case "stairs":
        return <Building className="h-4 w-4" />;
      case "escalator":
        return <ArrowUp className="h-4 w-4" />;
      case "emergency-exit":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const getConnectorColor = (type: VerticalConnectorType) => {
    const colors: { [key: string]: string } = {
      elevator: "bg-blue-100 text-blue-800",
      stairs: "bg-green-100 text-green-800",
      escalator: "bg-purple-100 text-purple-800",
      "emergency-exit": "bg-red-100 text-red-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const currentFloorConnectors = connectors.filter(
    (c) => c.floorId === currentFloorId
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Vertical Connectors
        </CardTitle>
        <CardDescription>
          Tag elevators, stairs, escalators, and emergency exits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVerticalTagMode && (
          <div>
            <Label>Shape Type</Label>
            <Select value={selectedShapeType} onValueChange={onShapeTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="circle">
                  <div className="flex items-center gap-2">Circle</div>
                </SelectItem>
                <SelectItem value="rectangle">
                  <div className="flex items-center gap-2">Rectangle</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {editingConnector && (
          <div className="p-4 border rounded-lg bg-blue-50 space-y-3">
            <h4 className="font-medium text-sm">Edit Vertical Connector</h4>
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Elevator A, Main Stairs"
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={editForm.type}
                onValueChange={(value: VerticalConnectorType) =>
                  setEditForm((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elevator">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Elevator
                    </div>
                  </SelectItem>
                  <SelectItem value="stairs">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Stairs
                    </div>
                  </SelectItem>
                  <SelectItem value="escalator">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      Escalator
                    </div>
                  </SelectItem>
                  <SelectItem value="emergency-exit">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Emergency Exit
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-shared-id">Shared ID</Label>
              <Input
                id="edit-shared-id"
                value={editForm.sharedId}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, sharedId: e.target.value }))
                }
                placeholder="e.g., ELV-A, STAIR-1 (must match across floors)"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEditSave}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleEditCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {currentFloorConnectors.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">
              Floor Connectors ({currentFloorConnectors.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {currentFloorConnectors.map((connector) => (
                <div
                  key={connector.id}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getConnectorIcon(connector.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {connector.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getConnectorColor(
                            connector.type
                          )}`}
                        >
                          {connector.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          ID: {connector.sharedId}
                        </span>
                      </div>
                    </div>
                    {connector.color && (
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: connector.color }}
                        title={`Connector color: ${connector.color}`}
                      />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStart(connector)}
                      className="h-7 w-7 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    {onDeleteConnector && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteConnector(connector.id)}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isVerticalTagMode && currentFloorConnectors.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            Enable Vertical Tag Mode to start adding connectors
          </div>
        )}
      </CardContent>
    </Card>
  );
};
