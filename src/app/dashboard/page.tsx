"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Search,
  Filter,
  Grid,
  List,
  Settings,
  Bell,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMapEditor } from '@/hooks/useMapEditor';
import { getDashboardComponents, sortComponentsByPriority, filterComponentsBySearch } from '@/config/dashboardConfig';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'maps' | 'buildings' | 'analytics'>('all');

  // Get map editor state with error handling
  const {
    state,
    updateState,
    tags,
    buildings,
    setBuildings,
    selectedBuilding,
    setSelectedBuilding,
    selectedFloor,
    setSelectedFloor,
    verticalConnectors,
  } = useMapEditor();

  // Safely get dashboard components with error handling
  const dashboardComponents = useMemo(() => {
    try {
      return getDashboardComponents(
        Array.isArray(buildings) ? buildings : [],
        Array.isArray(state.paths) ? state.paths : [],
        Array.isArray(tags) ? tags : [],
        Array.isArray(verticalConnectors) ? verticalConnectors : [],
        state.mapImage || '',
        state.mapName || '',
        state.isPublished || false,
        // Map handlers
        (map) => {
          if (map.type === 'building') {
            const building = buildings.find(b => b.id === map.buildingId);
            const floor = building?.floors?.find(f => f.id === map.floorId);
            if (building && floor) {
              setSelectedBuilding(building);
              setSelectedFloor(floor);
              updateState({ mapImage: floor.imageUrl, isBuildingMode: false });
            }
          } else {
            updateState({ mapImage: map.imageUrl, mapName: map.name, isBuildingMode: false });
          }
          window.location.href = '/map-editor';
        },
        // Preview handler
        (map) => {
          if (map.type === 'building') {
            const building = buildings.find(b => b.id === map.buildingId);
            const floor = building?.floors?.find(f => f.id === map.floorId);
            if (building && floor) {
              setSelectedBuilding(building);
              setSelectedFloor(floor);
              updateState({ mapImage: floor.imageUrl, isPreviewMode: true });
            }
          } else {
            updateState({ mapImage: map.imageUrl, mapName: map.name, isPreviewMode: true });
          }
          window.location.href = '/map-editor';
        },
        // Delete handler
        (mapId) => {
          if (confirm('Are you sure you want to delete this map?')) {
            // Handle deletion logic here
            console.log('Deleting map:', mapId);
          }
        },
        // Image upload handler
        (imageUrl) => {
          updateState({ mapImage: imageUrl });
          window.location.href = '/map-editor';
        },
        // Building mode toggle
        () => {
          updateState({ isBuildingMode: true });
          window.location.href = '/map-editor';
        },
        // Template apply handler
        (template) => {
          console.log('Applying template:', template);
          // Handle template application
        }
      );
    } catch (error) {
      console.error('Error getting dashboard components:', error);
      return [];
    }
  }, [buildings, state, tags, verticalConnectors, setSelectedBuilding, setSelectedFloor, updateState]);

  // Filter and sort components
  const filteredComponents = useMemo(() => {
    try {
      let filtered = dashboardComponents;

      // Apply search filter
      if (searchTerm) {
        filtered = filterComponentsBySearch(filtered, searchTerm);
      }

      // Apply category filter
      if (selectedFilter !== 'all') {
        filtered = filtered.filter(component => {
          switch (selectedFilter) {
            case 'maps':
              return ['recent-maps', 'map-library'].includes(component.id);
            case 'buildings':
              return ['building-overview'].includes(component.id);
            case 'analytics':
              return ['quick-stats', 'system-health'].includes(component.id);
            default:
              return true;
          }
        });
      }

      return sortComponentsByPriority(filtered);
    } catch (error) {
      console.error('Error filtering components:', error);
      return [];
    }
  }, [dashboardComponents, searchTerm, selectedFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Way Finder Management Console</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/map-editor'}
              >
                Open Map Editor
              </Button>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-400" />
                <User className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search dashboard..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="maps">Maps</option>
                <option value="buildings">Buildings</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Dashboard Grid */}
        {filteredComponents.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
            }`}>
            {filteredComponents.map((component) => (
              <div
                key={component.id}
                className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200 ${viewMode === 'grid' && component.gridCols
                  ? `lg:col-span-${Math.min(component.gridCols, 4)}`
                  : ''
                  }`}
              >
                {/* Component Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {component.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {component.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {component.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Component Content */}
                <div className="p-4">
                  {component.component}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No Results Found
              </h2>
              <p className="text-gray-600 mb-8">
                {searchTerm
                  ? `No dashboard components match "${searchTerm}"`
                  : 'No components available for the selected filter'
                }
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stats Summary */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Array.isArray(buildings) ? buildings.length : 0}
              </div>
              <div className="text-sm text-blue-700">Buildings</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Array.isArray(state.paths) ? state.paths.length : 0}
              </div>
              <div className="text-sm text-green-700">Paths</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Array.isArray(tags) ? tags.length : 0}
              </div>
              <div className="text-sm text-purple-700">Tags</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Array.isArray(verticalConnectors) ? verticalConnectors.length : 0}
              </div>
              <div className="text-sm text-orange-700">Connectors</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Way Finder Dashboard • Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


