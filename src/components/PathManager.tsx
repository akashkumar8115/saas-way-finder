
"use client";

import React from 'react';
import { Edit, Trash2, MapPin, Route, Globe, Ruler, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Path {
  id: string;
  name: string;
  source: string;
  destination: string;
  points: { x: number; y: number }[];
  isPublished: boolean;
}

interface PathManagerProps {
  paths: Path[];
  onEditPath: (path: Path) => void;
  onDeletePath: (pathId: string) => void;
}

export const PathManager: React.FC<PathManagerProps> = ({
  paths,
  onEditPath,
  onDeletePath
}) => {
  const publishedCount = paths.filter(p => p.isPublished).length;
  const draftCount = paths.length - publishedCount;

  // Calculate path statistics
  const getPathStats = (path: Path) => {
    if (path.points.length < 2) return { distance: 0, complexity: 'Simple' };
    
    // Calculate approximate path length (relative coordinates)
    let distance = 0;
    for (let i = 1; i < path.points.length; i++) {
      const prev = path.points[i - 1];
      const curr = path.points[i];
      distance += Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );
    }
    
    // Determine complexity based on waypoints
    let complexity = 'Simple';
    if (path.points.length > 5) complexity = 'Complex';
    else if (path.points.length > 3) complexity = 'Medium';
    
    return { distance: distance.toFixed(3), complexity };
  };

  const handleDeleteConfirm = (pathId: string, pathName: string) => {
    if (window.confirm(`Are you sure you want to delete the path "${pathName}"? This action cannot be undone.`)) {
      onDeletePath(pathId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Route className="h-5 w-5 mr-2 text-blue-600" />
            Path Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Paths</span>
            <Badge variant="secondary">{paths.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Published</span>
            <Badge className="bg-green-100 text-green-800">{publishedCount}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Drafts</span>
            <Badge variant="outline">{draftCount}</Badge>
          </div>
          {paths.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Waypoints</span>
                <Badge variant="secondary">
                  {(paths.reduce((sum, p) => sum + p.points.length, 0) / paths.length).toFixed(1)}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paths List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Saved Paths</CardTitle>
          {paths.length > 0 && (
            <p className="text-sm text-gray-500">
              Click edit to modify path coordinates and waypoints
            </p>
          )}
        </CardHeader>
        <CardContent>
          {paths.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm font-medium">No paths created yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Enter design mode to start creating navigation paths
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Tip:</strong> Create paths with precise waypoints for accurate navigation.
                  All coordinates are stored as relative positions for consistent display across different screen sizes.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {paths.map((path) => {
                const stats = getPathStats(path);
                return (
                  <div
                    key={path.id}
                    className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {path.name}
                        </h4>
                        <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
                          <div className="flex items-center">
                            <Target className="h-3 w-3 mr-1" />
                            <span>{path.points.length} waypoints</span>
                          </div>
                          <div className="flex items-center">
                            <Ruler className="h-3 w-3 mr-1" />
                            <span>{stats.complexity}</span>
                          </div>
                          {path.isPublished && (
                            <div className="flex items-center">
                              <Globe className="h-3 w-3 mr-1" />
                              <span>Published</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {path.isPublished && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Live
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-3 space-y-1">
                      <div className="flex items-center">
                        <span className="w-12 text-gray-500 font-medium">From:</span>
                        <span className="truncate">{path.source}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-12 text-gray-500 font-medium">To:</span>
                        <span className="truncate">{path.destination}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-12 text-gray-500 font-medium">Path:</span>
                        <span>{stats.distance} units</span>
                      </div>
                    </div>

                    {/* Path Preview - Mini visualization */}
                    <div className="mb-3 p-2 bg-gray-50 rounded border">
                      <div className="text-xs text-gray-500 mb-1">Path Preview:</div>
                      <div className="h-8 relative bg-white rounded border overflow-hidden">
                        <svg 
                          className="w-full h-full" 
                          viewBox="0 0 100 20"
                          preserveAspectRatio="xMidYMid meet"
                        >
                          {path.points.length > 1 && (
                            <>
                              {/* Path line */}
                              <polyline
                                points={path.points.map((point, index) => 
                                  `${(index / (path.points.length - 1)) * 90 + 5},10`
                                ).join(' ')}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="1"
                                className="opacity-70"
                              />
                              {/* Start point */}
                              <circle cx="5" cy="10" r="1.5" fill="#10b981" />
                              {/* End point */}
                              <circle cx="95" cy="10" r="1.5" fill="#ef4444" />
                              {/* Waypoints */}
                              {path.points.slice(1, -1).map((_, index) => (
                                <circle
                                  key={index}
                                  cx={((index + 1) / (path.points.length - 1)) * 90 + 5}
                                  cy="10"
                                  r="0.8"
                                  fill="#3b82f6"
                                />
                              ))}
                            </>
                          )}
                        </svg>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => onEditPath(path)}
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-8"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit Path
                      </Button>
                      <Button
                        onClick={() => handleDeleteConfirm(path.id, path.name)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:border-red-300 h-8"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Coordinate Details (Expandable) */}
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        View Coordinates ({path.points.length} points)
                      </summary>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div className="max-h-20 overflow-y-auto space-y-1">
                          {path.points.map((point, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-gray-600">
                                Point {index + 1}:
                              </span>
                              <span className="font-mono">
                                ({point.x.toFixed(1)}, {point.y.toFixed(1)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      {paths.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <Route className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Path Management Tips
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Edit paths to adjust waypoint positions for better accuracy</li>
                  <li>• Complex paths with more waypoints provide detailed navigation</li>
                  <li>• Published paths are available for route search in the main app</li>
                  <li>• Coordinates are automatically scaled for different screen sizes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
