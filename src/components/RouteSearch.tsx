"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Search, Route, Navigation, Building, ArrowRight, MapPin } from 'lucide-react';

interface PathSegment {
  id: string;
  floorId: string;
  points: { x: number; y: number }[];
  connectorId?: string;
}

interface Path {
  id: string;
  name: string;
  source: string;
  destination: string;
  points: { x: number; y: number }[];
  isPublished: boolean;
  color?: string;
  isMultiFloor?: boolean;
  segments?: PathSegment[];
  sourceFloorId?: string;
  destinationFloorId?: string;
}

interface RouteSearchProps {
  paths: Path[];
  onRouteSelect: (path: Path | null, segmentIndex?: number) => void;
  availableLocations?: string[];
}

export const RouteSearch: React.FC<RouteSearchProps> = ({ 
  paths, 
  onRouteSelect,
  availableLocations = []
}) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [foundPath, setFoundPath] = useState<Path | null>(null);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSearch = () => {
    if (!source.trim() || !destination.trim()) {
      alert('Please enter both source and destination locations.');
      return;
    }

    console.log('Searching for path from', source, 'to', destination);
    console.log('Available paths:', paths);

    // Find exact match first
    let path = paths.find(p => 
      p.source.toLowerCase() === source.toLowerCase() && 
      p.destination.toLowerCase() === destination.toLowerCase()
    );

    // If no exact match, try reverse direction
    if (!path) {
      path = paths.find(p => 
        p.source.toLowerCase() === destination.toLowerCase() && 
        p.destination.toLowerCase() === source.toLowerCase()
      );
    }

    console.log('Found path:', path);

    if (path) {
      setFoundPath(path);
      setCurrentSegmentIndex(0);
      setIsNavigating(true);
      
      if (path.isMultiFloor) {
        console.log('Multi-floor path found with', path.segments?.length, 'segments');
        // Start with the first segment
        onRouteSelect(path, 0);
      } else {
        // Single floor path
        onRouteSelect(path);
      }
    } else {
      setFoundPath(null);
      setCurrentSegmentIndex(0);
      setIsNavigating(false);
      onRouteSelect(null);
      
      // Provide more helpful feedback
      const sourceExists = availableLocations.some(loc => 
        loc.toLowerCase() === source.toLowerCase()
      );
      const destExists = availableLocations.some(loc => 
        loc.toLowerCase() === destination.toLowerCase()
      );
      
      if (!sourceExists && !destExists) {
        alert(`Neither "${source}" nor "${destination}" were found. Please check the spelling or select from available locations.`);
      } else if (!sourceExists) {
        alert(`"${source}" was not found. Please check the spelling or select from available locations.`);
      } else if (!destExists) {
        alert(`"${destination}" was not found. Please check the spelling or select from available locations.`);
      } else {
        alert(`No route found between "${source}" and "${destination}". You may need to create this path first.`);
      }
    }
  };

  const handleClear = () => {
    setSource('');
    setDestination('');
    setFoundPath(null);
    setCurrentSegmentIndex(0);
    setIsNavigating(false);
    onRouteSelect(null);
  };

  const handleNextSegment = () => {
    if (foundPath?.isMultiFloor && foundPath.segments && currentSegmentIndex < foundPath.segments.length - 1) {
      const nextIndex = currentSegmentIndex + 1;
      setCurrentSegmentIndex(nextIndex);
      
      console.log('Switching to segment', nextIndex + 1, 'of', foundPath.segments.length);
      
      // Trigger floor switch and show next segment
      onRouteSelect(foundPath, nextIndex);
    }
  };

  const handlePrevSegment = () => {
    if (foundPath?.isMultiFloor && foundPath.segments && currentSegmentIndex > 0) {
      const prevIndex = currentSegmentIndex - 1;
      setCurrentSegmentIndex(prevIndex);
      
      console.log('Switching to segment', prevIndex + 1, 'of', foundPath.segments.length);
      
      // Trigger floor switch and show previous segment
      onRouteSelect(foundPath, prevIndex);
    }
  };

  const getCurrentSegmentInfo = () => {
    if (!foundPath?.isMultiFloor || !foundPath.segments) return null;
    
    const currentSegment = foundPath.segments[currentSegmentIndex];
    if (!currentSegment) return null;
    
    return {
      segment: currentSegment,
      isFirst: currentSegmentIndex === 0,
      isLast: currentSegmentIndex === foundPath.segments.length - 1,
      total: foundPath.segments.length
    };
  };

  const segmentInfo = getCurrentSegmentInfo();

  const getNavigationInstructions = () => {
    if (!foundPath?.isMultiFloor || !foundPath.segments) return null;
    
    const isFirst = currentSegmentIndex === 0;
    const isLast = currentSegmentIndex === foundPath.segments.length - 1;
    const total = foundPath.segments.length;
    
    if (isFirst) {
      return `Step ${currentSegmentIndex + 1} of ${total}: Follow the path from "${foundPath.source}" to the vertical connector. Then click "Next" to continue to the next floor.`;
    } else if (isLast) {
      return `Step ${currentSegmentIndex + 1} of ${total}: Follow the path from the vertical connector to "${foundPath.destination}". You have reached your destination!`;
    } else {
      return `Step ${currentSegmentIndex + 1} of ${total}: Follow the path to the next vertical connector. Then click "Next" to continue to the next floor.`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Route Search
        </CardTitle>
        <CardDescription>
          Find navigation paths between locations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="route-source">From</Label>
          {availableLocations.length > 0 ? (
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select starting location" />
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
              id="route-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Enter starting location"
            />
          )}
        </div>

        <div>
          <Label htmlFor="route-destination">To</Label>
          {availableLocations.length > 0 ? (
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger>
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
              id="route-destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination"
            />
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSearch} 
            disabled={!source.trim() || !destination.trim()}
            className="flex-1"
          >
            <Route className="h-4 w-4 mr-2" />
            Find Route
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
        </div>

        {foundPath && isNavigating && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 mb-3">
              <Navigation className="h-4 w-4" />
              <span className="font-medium">Navigation Active</span>
              {foundPath.isMultiFloor && (
                <Building className="h-4 w-4 ml-2" />
              )}
            </div>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-blue-900 mb-1">
                  {foundPath.name}
                </div>
                <div className="text-sm text-blue-700">
                  {foundPath.isMultiFloor ? (
                    <span>Multi-floor route ({foundPath.segments?.length} segments)</span>
                  ) : (
                    <span>Single-floor route ({foundPath.points.length} waypoints)</span>
                  )}
                </div>
              </div>

              {foundPath.isMultiFloor && foundPath.segments && (
                <>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">
                        Segment {currentSegmentIndex + 1} of {foundPath.segments.length}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handlePrevSegment}
                          disabled={currentSegmentIndex === 0}
                          className="h-7 px-2 text-xs"
                        >
                          ← Prev
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleNextSegment}
                          disabled={currentSegmentIndex === foundPath.segments.length - 1}
                          className="h-7 px-2 text-xs"
                        >
                          Next →
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                      {getNavigationInstructions()}
                    </div>
                  </div>

                  {segmentInfo && (
                    <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="h-3 w-3" />
                        <span className="font-medium">Current segment details:</span>
                      </div>
                      <div>{segmentInfo.segment.points.length} navigation points on this floor</div>
                      {segmentInfo.segment.connectorId && !segmentInfo.isLast && (
                        <div className="mt-1 text-blue-500">
                          This segment ends at a vertical connector - use &quot;Next&quot; to continue to the next floor
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {foundPath.color && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: foundPath.color }}
                  />
                  <span className="text-xs text-blue-600">Path Color</span>
                </div>
              )}
            </div>
          </div>
        )}

        {paths.length > 0 && !isNavigating && (
          <div className="mt-6">
            <h4 className="font-medium text-sm mb-2">Available Routes ({paths.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {paths.map((path) => (
                <div
                  key={path.id}
                  className="text-xs p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setSource(path.source);
                    setDestination(path.destination);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium flex items-center gap-1">
                      {path.source} → {path.destination}
                      {path.isMultiFloor && <Building className="h-3 w-3 text-blue-600" />}
                    </div>
                    {path.color && (
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: path.color }}
                      />
                    )}
                  </div>
                  <div className="text-gray-500">
                    {path.isMultiFloor && path.segments ? 
                      `${path.segments.length} segments across floors` : 
                      `${path.points.length} waypoints`
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
