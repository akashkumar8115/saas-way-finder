import React from 'react';
import { 
  MapPin, 
  Building, 
  Route, 
  Users, 
  BarChart3, 
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MapLibrary } from '@/components/MapLibrary';
import { getSavedMapsFromState } from '@/utils/mapUtils';

export interface DashboardComponent {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  gridCols?: number;
  priority?: number;
}

export const getDashboardComponents = (
  buildings: any[] = [],
  paths: any[] = [],
  tags: any[] = [],
  verticalConnectors: any[] = [],
  mapImage: string = '',
  mapName: string = '',
  isPublished: boolean = false,
  onEditMap?: (map: any) => void,
  onPreviewMap?: (map: any) => void,
  onDeleteMap?: (mapId: string) => void,
  onImageUpload?: (imageUrl: string) => void,
  onToggleBuildingMode?: () => void,
  onApplyTemplate?: (template: any) => void
): DashboardComponent[] => {
  
  // Safely get saved maps with error handling
  let savedMaps: any[] = [];
  try {
    savedMaps = getSavedMapsFromState(
      Array.isArray(buildings) ? buildings : [],
      Array.isArray(paths) ? paths : [],
      Array.isArray(tags) ? tags : [],
      Array.isArray(verticalConnectors) ? verticalConnectors : [],
      mapImage,
      mapName,
      isPublished
    );
  } catch (error) {
    console.error('Error getting saved maps in dashboard config:', error);
    savedMaps = [];
  }

  // Safe calculations with fallbacks
  const totalMaps = savedMaps.length;
  const publishedMaps = savedMaps.filter(m => m?.isPublished).length;
  const totalPaths = Array.isArray(paths) ? paths.length : 0;
  const totalTags = Array.isArray(tags) ? tags.length : 0;
  const totalBuildings = Array.isArray(buildings) ? buildings.length : 0;

  return [
    {
      id: 'quick-stats',
      title: 'Quick Stats',
      description: 'Overview of your wayfinding system',
      icon: <BarChart3 className="h-6 w-6" />,
      gridCols: 2,
      priority: 1,
      component: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalMaps}</div>
            <div className="text-sm text-blue-700">Total Maps</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{publishedMaps}</div>
            <div className="text-sm text-green-700">Published</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{totalPaths}</div>
            <div className="text-sm text-purple-700">Total Paths</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{totalTags}</div>
            <div className="text-sm text-orange-700">Total Tags</div>
          </div>
        </div>
      ),
    },
    {
      id: 'recent-maps',
      title: 'Recent Maps',
      description: 'Your recently modified maps',
      icon: <MapPin className="h-6 w-6" />,
      gridCols: 2,
      priority: 2,
      component: (
        <div className="space-y-3">
          {savedMaps.slice(0, 3).map((map) => (
            <div key={map.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{map.name}</h4>
                <p className="text-sm text-gray-500">
                  {map.pathCount} paths • {map.tagCount} tags
                  {map.isPublished && <span className="ml-2 text-green-600">• Published</span>}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPreviewMap?.(map)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditMap?.(map)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {savedMaps.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No maps created yet</p>
              <Button
                className="mt-4"
                onClick={() => window.location.href = '/map-editor'}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Map
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'map-library',
      title: 'Map Library',
      description: 'Manage all your maps and buildings',
      icon: <Building className="h-6 w-6" />,
      gridCols: 3,
      priority: 3,
      component: (
        <MapLibrary
          maps={savedMaps}
          onEditMap={onEditMap || (() => {})}
          onPreviewMap={onPreviewMap || (() => {})}
          onDeleteMap={onDeleteMap || (() => {})}
          onImageUpload={onImageUpload || (() => {})}
          onToggleBuildingMode={onToggleBuildingMode || (() => {})}
          onApplyTemplate={onApplyTemplate || (() => {})}
        />
      ),
    },
    {
      id: 'building-overview',
      title: 'Buildings Overview',
      description: 'Multi-floor building management',
      icon: <Building className="h-6 w-6" />,
      gridCols: 1,
      priority: 4,
      component: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{totalBuildings} Buildings</span>
            <Button
              size="sm"
              onClick={onToggleBuildingMode}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Building
            </Button>
          </div>
          
          {Array.isArray(buildings) && buildings.length > 0 ? (
            <div className="space-y-3">
              {buildings.slice(0, 3).map((building) => (
                <div key={building.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{building.name}</h4>
                      <p className="text-sm text-gray-500">
                        {Array.isArray(building.floors) ? building.floors.length : 0} floors
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditMap?.(building)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No buildings created yet</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={onToggleBuildingMode}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Building
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      description: 'Common tasks and shortcuts',
      icon: <Route className="h-6 w-6" />,
      gridCols: 1,
      priority: 5,
      component: (
        <div className="space-y-3">
          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={() => window.location.href = '/map-editor'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Map
          </Button>
          
          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={onToggleBuildingMode}
          >
            <Building className="h-4 w-4 mr-2" />
            Manage Buildings
          </Button>
          
          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={() => {
              // Navigate to published maps view
              window.location.href = '/map-editor?mode=preview';
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Published Maps
          </Button>
          
          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={() => {
              // Export functionality
              alert('Export feature coming soon!');
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      ),
    },
    {
      id: 'system-health',
      title: 'System Health',
      description: 'Performance and status indicators',
      icon: <BarChart3 className="h-6 w-6" />,
      gridCols: 1,
      priority: 6,
      component: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Storage Usage</span>
            <span className="text-sm font-medium">
              {(() => {
                try {
                  const used = JSON.stringify({ buildings, paths, tags, verticalConnectors }).length;
                  const usedKB = Math.round(used / 1024);
                  return `${usedKB} KB`;
                } catch {
                  return '0 KB';
                }
              })()}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Maps Status</span>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                {publishedMaps} Published
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                {totalMaps - publishedMaps} Draft
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Updated</span>
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">System Online</span>
            </div>
          </div>
        </div>
      ),
    },
  ];
};

export const getComponentById = (
  id: string,
  components: DashboardComponent[]
): DashboardComponent | undefined => {
  return components.find(component => component.id === id);
};

export const sortComponentsByPriority = (
  components: DashboardComponent[]
): DashboardComponent[] => {
  return [...components].sort((a, b) => (a.priority || 999) - (b.priority || 999));
};

export const filterComponentsBySearch = (
  components: DashboardComponent[],
  searchTerm: string
): DashboardComponent[] => {
  if (!searchTerm) return components;
  
  const term = searchTerm.toLowerCase();
  return components.filter(component =>
    component.title.toLowerCase().includes(term) ||
    component.description.toLowerCase().includes(term)
  );
};
