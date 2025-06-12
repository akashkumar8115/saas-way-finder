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
import { MapPin, Circle, Square, Edit2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
export interface TaggedLocation {
  id: string;
  name: string;
  category: string;
  shape: "circle" | "rectangle";
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  logoUrl?: string;
  color?: string;
  floorId?: string; // Add floorId to associate tags with specific floors
}

interface LocationTaggerProps {
  isTagMode: boolean;
  selectedShapeType: "circle" | "rectangle";
  onShapeTypeChange: (shapeType: "circle" | "rectangle") => void;
  tags: TaggedLocation[];
  onEditTag?: (tag: TaggedLocation) => void;
  onDeleteTag?: (tagId: string) => void;
  currentFloorId?: string; // Add currentFloorId prop to filter tags
}

export const LocationTagger: React.FC<LocationTaggerProps> = ({
  isTagMode,
  selectedShapeType,
  onShapeTypeChange,
  tags,
  onEditTag,
  onDeleteTag,
  currentFloorId,
}) => {
  const [editingTag, setEditingTag] = useState<TaggedLocation | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    logoUrl: "",
  });

  // Filter tags by current floor
  const currentFloorTags = currentFloorId
    ? tags.filter((tag) => tag.floorId === currentFloorId || !tag.floorId)
    : tags;

  const handleEditStart = (tag: TaggedLocation) => {
    setEditingTag(tag);
    setEditForm({
      name: tag.name,
      category: tag.category,
      logoUrl: tag.logoUrl || "",
    });
  };

  const handleEditSave = () => {
    if (editingTag && onEditTag) {
      const updatedTag = {
        ...editingTag,
        name: editForm.name,
        category: editForm.category,
        logoUrl: editForm.logoUrl || undefined,
      };
      onEditTag(updatedTag);
      setEditingTag(null);
      setEditForm({ name: "", category: "", logoUrl: "" });
    }
  };

  const handleEditCancel = () => {
    setEditingTag(null);
    setEditForm({ name: "", category: "", logoUrl: "" });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setEditForm((prev) => ({ ...prev, logoUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      restaurant: "bg-orange-100 text-orange-800",
      restroom: "bg-blue-100 text-blue-800",
      store: "bg-green-100 text-green-800",
      office: "bg-purple-100 text-purple-800",
      meeting: "bg-indigo-100 text-indigo-800",
      parking: "bg-gray-100 text-gray-800",
      entrance: "bg-red-100 text-red-800",
      exit: "bg-yellow-100 text-yellow-800",
    };
    return colors[category.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Tagger
        </CardTitle>
        <CardDescription>
          Tag important locations on your map
          {currentFloorId && (
            <span className="block text-xs text-blue-600 mt-1">
              Current floor tags only
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTagMode && (
          <div>
            <Label>Shape Type</Label>
            <Select value={selectedShapeType} onValueChange={onShapeTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="circle">
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4" />
                    Circle
                  </div>
                </SelectItem>
                <SelectItem value="rectangle">
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    Rectangle
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {editingTag && (
          <div className="p-4 border rounded-lg bg-blue-50 space-y-3">
            <h4 className="font-medium text-sm">Edit Tag</h4>
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Location name"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={editForm.category}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="restroom">Restroom</SelectItem>
                  <SelectItem value="store">Store</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="meeting">Meeting Room</SelectItem>
                  <SelectItem value="parking">Parking</SelectItem>
                  <SelectItem value="entrance">Entrance</SelectItem>
                  <SelectItem value="exit">Exit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-logo">Logo (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {editForm.logoUrl && (
                <div className="mt-2">
                  <Image
                    src={editForm.logoUrl}
                    alt="Logo preview"
                    className="w-12 h-12 object-cover rounded border"
                  />
                </div>
              )}
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

        {currentFloorTags.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">
              Tagged Locations ({currentFloorTags.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {currentFloorTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {tag.logoUrl ? (
                      <Image
                        src={tag.logoUrl}
                        alt={tag.name}
                        className="w-6 h-6 object-cover rounded"
                      />
                    ) : tag.shape === "circle" ? (
                      <Circle className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {tag.name}
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getCategoryColor(tag.category)}`}
                      >
                        {tag.category}
                      </Badge>
                    </div>
                    {tag.color && (
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: tag.color }}
                        title={`Tag color: ${tag.color}`}
                      />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStart(tag)}
                      className="h-7 w-7 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    {onDeleteTag && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTag(tag.id)}
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

        {!isTagMode && currentFloorTags.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            Enable Tag Mode to start adding location tags
          </div>
        )}
      </CardContent>
    </Card>
  );
};
