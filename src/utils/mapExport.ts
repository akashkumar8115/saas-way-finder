import { SavedMap } from './mapUtils';
import { Building } from '@/types/building';

export interface MapExportData {
  version: string;
  exportedAt: string;
  map: SavedMap;
  paths: any[];
  tags: any[];
  verticalConnectors: any[];
  building?: Building;
  floor?: any;
}

export const exportMapToJSON = (
  map: SavedMap,
  paths: any[],
  tags: any[],
  verticalConnectors: any[],
  buildings: Building[]
): string => {
  const exportData: MapExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    map,
    paths: paths.filter(p => 
      map.type === 'building' 
        ? p.floorId === map.floorId 
        : !p.floorId
    ),
    tags: tags.filter(t => 
      map.type === 'building' 
        ? t.floorId === map.floorId 
        : !t.floorId
    ),
    verticalConnectors: verticalConnectors.filter(c => 
      map.type === 'building' 
        ? c.floorId === map.floorId 
        : !c.floorId
    ),
  };

  // Include building and floor data for building maps
  if (map.type === 'building' && map.buildingId && map.floorId) {
    const building = buildings.find(b => b.id === map.buildingId);
    const floor = building?.floors.find(f => f.id === map.floorId);
    
    if (building) {
      exportData.building = building;
    }
    if (floor) {
      exportData.floor = floor;
    }
  }

  return JSON.stringify(exportData, null, 2);
};

export const downloadMapAsJSON = (
  map: SavedMap,
  paths: any[],
  tags: any[],
  verticalConnectors: any[],
  buildings: Building[]
) => {
  const jsonData = exportMapToJSON(map, paths, tags, verticalConnectors, buildings);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${map.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importMapFromJSON = (jsonString: string): MapExportData | null => {
  try {
    const data = JSON.parse(jsonString) as MapExportData;
    
    // Validate the structure
    if (!data.version || !data.map || !Array.isArray(data.paths) || !Array.isArray(data.tags)) {
      throw new Error('Invalid map export format');
    }
    
    return data;
  } catch (error) {
    console.error('Failed to import map:', error);
    return null;
  }
};

export const exportAllMapsToJSON = (
  maps: SavedMap[],
  paths: any[],
  tags: any[],
  verticalConnectors: any[],
  buildings: Building[]
): string => {
  const allMapsData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    totalMaps: maps.length,
    maps: maps.map(map => ({
      map,
      paths: paths.filter(p => 
        map.type === 'building' 
          ? p.floorId === map.floorId 
          : !p.floorId
      ),
      tags: tags.filter(t => 
        map.type === 'building' 
          ? t.floorId === map.floorId 
          : !t.floorId
      ),
      verticalConnectors: verticalConnectors.filter(c => 
        map.type === 'building' 
          ? c.floorId === map.floorId 
          : !c.floorId
      ),
    })),
    buildings,
  };

  return JSON.stringify(allMapsData, null, 2);
};
