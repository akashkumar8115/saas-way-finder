"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { 
  Pencil, 
  Undo, 
  Redo, 
  Trash2, 
  Save, 
  Eye, 
  MapPin, 
  Tags,
  Globe,
  AlertTriangle,
  Building
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

interface Path {
  id: string;
  name: string;
  source: string;
  destination: string;
  points: { x: number; y: number }[];
  isPublished: boolean;
  sourceTagId?: string;
  destinationTagId?: string;
}

interface ToolbarProps {
  isDesignMode: boolean;
  isEditMode: boolean;
  isPreviewMode: boolean;
  isTagMode: boolean;
  isVerticalTagMode?: boolean;
  isPublished: boolean;
  onToggleDesignMode: () => void;
  onToggleTagMode: () => void;
  onToggleVerticalTagMode?: () => void;
  onTogglePreviewMode: () => void;
  onViewPublishedMap: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearPath: () => void;
  onSavePath: (source: string, destination: string) => void;
  onPublishMap: () => void;
  canUndo: boolean;
  hasCurrentPath: boolean;
  availableLocations: string[];
  selectedPath?: Path | null;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  isDesignMode,
  isEditMode,
  isPreviewMode,
  isTagMode,
  isVerticalTagMode = false,
  isPublished,
  onToggleDesignMode,
  onToggleTagMode,
  onToggleVerticalTagMode,
  onTogglePreviewMode,
  onViewPublishedMap,
  onUndo,
  onRedo,
  onClearPath,
  onSavePath,
  onPublishMap,
  canUndo,
  hasCurrentPath,
  availableLocations,
  selectedPath
}) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // Initialize source and destination when editing a path
  React.useEffect(() => {
    if (isEditMode && selectedPath) {
      setSource(selectedPath.source);
      setDestination(selectedPath.destination);
    } else if (!isEditMode) {
      setSource('');
      setDestination('');
    }
  }, [isEditMode, selectedPath]);

  const handleSave = () => {
    onSavePath(source, destination);
    if (!isEditMode) {
      setSource('');
      setDestination('');
    }
  };

  const handlePublishConfirm = () => {
    onPublishMap();
    setShowPublishDialog(false);
  };

  const getActiveMode = () => {
    if (isPreviewMode) return "Preview Mode";
    if (isVerticalTagMode) return "Vertical Connector Tagging";
    if (isTagMode) return "Location Tagging";
    if (isEditMode) return "Edit Path";
    if (isDesignMode) return "Design Mode";
    return "View Mode";
  };

  const getModeColor = () => {
    if (isPreviewMode) return "text-purple-600";
    if (isVerticalTagMode) return "text-indigo-600";
    if (isTagMode) return "text-orange-600";
    if (isEditMode) return "text-green-600";
    if (isDesignMode) return "text-blue-600";
    return "text-gray-600";
  };

  return (
    <>
      <div className="p-4 border-b bg-gray-50">
        {/* Mode Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`text-sm font-medium ${getModeColor()}`}>
              {getActiveMode()}
            </div>
            {isEditMode && selectedPath && (
              <div className="text-xs text-gray-500">
                Editing: {selectedPath.name}
              </div>
            )}
          </div>
          {isPublished && (
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Published
            </div>
          )}
        </div>

        {/* Main Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={onToggleDesignMode}
            variant={isDesignMode ? "default" : "outline"}
            size="sm"
            disabled={isPreviewMode || isTagMode || isVerticalTagMode || isEditMode}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Design
          </Button>

          <Button
            onClick={onToggleTagMode}
            variant={isTagMode ? "default" : "outline"}
            size="sm"
            disabled={isPreviewMode || isDesignMode || isVerticalTagMode || isEditMode}
          >
            <Tags className="h-4 w-4 mr-2" />
            Tag Locations
          </Button>

          {onToggleVerticalTagMode && (
            <Button
              onClick={onToggleVerticalTagMode}
              variant={isVerticalTagMode ? "default" : "outline"}
              size="sm"
              disabled={isPreviewMode || isDesignMode || isTagMode || isEditMode}
            >
              <Building className="h-4 w-4 mr-2" />
              Vertical Tags
            </Button>
          )}

          <Button
            onClick={onTogglePreviewMode}
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            disabled={isDesignMode || isTagMode || isVerticalTagMode || isEditMode}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          {isPublished && (
            <Button
              onClick={onViewPublishedMap}
              variant="outline"
              size="sm"
              className="text-green-600 border-green-300"
            >
              <Globe className="h-4 w-4 mr-2" />
              View Published
            </Button>
          )}
        </div>

        {/* Path Design Controls */}
        {(isDesignMode || isEditMode) && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                onClick={onUndo}
                disabled={!canUndo}
                variant="outline"
                size="sm"
              >
                <Undo className="h-4 w-4 mr-2" />
                Undo
              </Button>

              <Button
                onClick={onClearPath}
                disabled={!hasCurrentPath}
                variant="outline"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>

            {hasCurrentPath && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      From
                    </label>
                    {availableLocations.length > 0 ? (
                      <Select value={source} onValueChange={setSource}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLocations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Source location"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      To
                    </label>
                    {availableLocations.length > 0 ? (
                      <Select value={destination} onValueChange={setDestination}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLocations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={!source.trim() || !destination.trim()}
                  className="w-full"
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Path' : 'Save Path'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Publish Control - Show when not in special modes and there are paths to publish */}
        {!isPreviewMode && !isTagMode && !isDesignMode && !isEditMode && !isVerticalTagMode && (
          <div className="mt-4">
            <Button
              onClick={() => setShowPublishDialog(true)}
              className="w-full bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Globe className="h-4 w-4 mr-2" />
              Publish Map
            </Button>
          </div>
        )}
      </div>

      {/* Publish Confirmation Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Publish Map
            </DialogTitle>
            <DialogDescription>
              This will make your map and all its paths available for public use. 
              Users will be able to search for routes between the locations youv&apos;e defined.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-800 font-medium mb-1">
                  Make sure your map is ready:
                </p>
                <ul className="text-amber-700 text-xs space-y-1">
                  <li>• All paths are properly defined with clear source and destination points</li>
                  <li>• Location tags are accurately placed and named</li>
                  <li>• You&apos;ve tested the routes in preview mode</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPublishDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePublishConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              <Globe className="h-4 w-4 mr-2" />
              Publish Map
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
