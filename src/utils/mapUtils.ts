// import { Building, Floor } from '@/types/building';

// export interface SavedMap {
//     id: string;
//     name: string;
//     type: 'building' | 'single';
//     buildingId?: string;
//     floorId?: string;
//     imageUrl: string;
//     pathCount: number;
//     tagCount: number;
//     connectorCount: number;
//     lastModified: string;
//     isPublished: boolean;
//     createdAt: string;
// }

// export const generateMapId = (type: 'building' | 'single', buildingId?: string, floorId?: string): string => {
//     if (type === 'building' && buildingId && floorId) {
//         return `${buildingId}-${floorId}`;
//     }
//     return `single-${Date.now()}`;
// };

// export const getSavedMapsFromState = (
//     buildings: Building[],
//     paths: any[],
//     tags: any[],
//     verticalConnectors: any[],
//     mapImage: string,
//     mapName: string,
//     isPublished: boolean
// ): SavedMap[] => {
//     const maps: SavedMap[] = [];

//     // Add building-based maps
//     buildings.forEach(building => {
//         building.floors.forEach(floor => {
//             if (floor.imageUrl) {
//                 const floorPaths = paths.filter(p => p.floorId === floor.id);
//                 const floorTags = tags.filter(t => t.floorId === floor.id);
//                 const floorConnectors = verticalConnectors.filter(c => c.floorId === floor.id);

//                 maps.push({
//                     id: generateMapId('building', building.id, floor.id),
//                     name: `${building.name} - ${floor.label}`,
//                     type: 'building',
//                     buildingId: building.id,
//                     floorId: floor.id,
//                     imageUrl: floor.imageUrl,
//                     pathCount: floorPaths.length,
//                     tagCount: floorTags.length,
//                     connectorCount: floorConnectors.length,
//                     lastModified: floor.updatedAt || new Date().toISOString(),
//                     isPublished: floorPaths.some(p => p.isPublished) || false,
//                     createdAt: floor.createdAt || new Date().toISOString(),
//                 });
//             }
//         });
//     });

//     // Add single map if exists and no buildings
//     if (mapImage && buildings.length === 0) {
//         maps.push({
//             id: generateMapId('single'),
//             name: mapName || 'Untitled Map',
//             type: 'single',
//             imageUrl: mapImage,
//             pathCount: paths.length,
//             tagCount: tags.length,
//             connectorCount: verticalConnectors.length,
//             lastModified: new Date().toISOString(),
//             isPublished: isPublished,
//             createdAt: new Date().toISOString(),
//         });
//     }

//     // Sort by last modified (most recent first)
//     return maps.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
// };

// export const filterMaps = (maps: SavedMap[], searchTerm: string, filterType?: 'all' | 'building' | 'single' | 'published'): SavedMap[] => {
//     let filteredMaps = maps;

//     // Filter by type
//     if (filterType && filterType !== 'all') {
//         if (filterType === 'published') {
//             filteredMaps = filteredMaps.filter(map => map.isPublished);
//         } else {
//             filteredMaps = filteredMaps.filter(map => map.type === filterType);
//         }
//     }

//     // Filter by search term
//     if (searchTerm.trim()) {
//         const term = searchTerm.toLowerCase();
//         filteredMaps = filteredMaps.filter(map =>
//             map.name.toLowerCase().includes(term) ||
//             (map.type === 'building' && map.buildingId?.toLowerCase().includes(term))
//         );
//     }

//     return filteredMaps;
// };

// export const getMapStats = (maps: SavedMap[]) => {
//     const totalMaps = maps.length;
//     const publishedMaps = maps.filter(m => m.isPublished).length;
//     const buildingMaps = maps.filter(m => m.type === 'building').length;
//     const singleMaps = maps.filter(m => m.type === 'single').length;
//     const totalPaths = maps.reduce((sum, map) => sum + map.pathCount, 0);
//     const totalTags = maps.reduce((sum, map) => sum + map.tagCount, 0);

//     return {
//         totalMaps,
//         publishedMaps,
//         buildingMaps,
//         singleMaps,
//         totalPaths,
//         totalTags,
//     };
// };

// export const exportMapData = (map: SavedMap, paths: any[], tags: any[], connectors: any[]) => {
//     const mapData = {
//         map,
//         paths: paths.filter(p =>
//             map.type === 'building'
//                 ? p.floorId === map.floorId
//                 : !p.floorId
//         ),
//         tags: tags.filter(t =>
//             map.type === 'building'
//                 ? t.floorId === map.floorId
//                 : !t.floorId
//         ),
//         connectors: connectors.filter(c =>
//             map.type === 'building'
//                 ? c.floorId === map.floorId
//                 : !c.floorId
//         ),
//         exportedAt: new Date().toISOString(),
//     };

//     return JSON.stringify(mapData, null, 2);
// };

import { Building, Floor } from '@/types/building';

export interface SavedMap {
  id: string;
  name: string;
  type: 'single' | 'building';
  buildingId?: string;
  floorId?: string;
  floorLabel?: string;
  imageUrl: string;
  pathCount: number;
  tagCount: number;
  connectorCount: number;
  isPublished: boolean;
  lastModified: string;
  createdAt: string;
  thumbnail?: string;
}

export const getSavedMapsFromState = (
  buildings: Building[] | null | undefined,
  paths: any[],
  tags: any[],
  verticalConnectors: any[],
  mapImage: string,
  mapName: string,
  isPublished: boolean
): SavedMap[] => {
  const maps: SavedMap[] = [];

  // Handle building maps
  if (buildings && Array.isArray(buildings) && buildings.length > 0) {
    buildings.forEach((building) => {
      if (building.floors && Array.isArray(building.floors)) {
        building.floors.forEach((floor) => {
          if (floor.imageUrl) {
            const floorPaths = paths.filter(p => p.floorId === floor.id) || [];
            const floorTags = tags.filter(t => t.floorId === floor.id) || [];
            const floorConnectors = verticalConnectors.filter(c => c.floorId === floor.id) || [];

            maps.push({
              id: `${building.id}-${floor.id}`,
              name: `${building.name} - ${floor.label}`,
              type: 'building',
              buildingId: building.id,
              floorId: floor.id,
              floorLabel: floor.label,
              imageUrl: floor.imageUrl,
              pathCount: floorPaths.length,
              tagCount: floorTags.length,
              connectorCount: floorConnectors.length,
              isPublished: floorPaths.some(p => p.isPublished) || false,
              lastModified: floor.updatedAt || new Date().toISOString(),
              createdAt: floor.createdAt || new Date().toISOString(),
            });
          }
        });
      }
    });
  }

  // Handle single map
  if (mapImage && mapName) {
    const singleMapPaths = paths.filter(p => !p.floorId) || [];
    const singleMapTags = tags.filter(t => !t.floorId) || [];
    const singleMapConnectors = verticalConnectors.filter(c => !c.floorId) || [];

    maps.push({
      id: 'single-map',
      name: mapName,
      type: 'single',
      imageUrl: mapImage,
      pathCount: singleMapPaths.length,
      tagCount: singleMapTags.length,
      connectorCount: singleMapConnectors.length,
      isPublished,
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  }

  return maps;
};

export const filterMaps = (
  maps: SavedMap[],
  searchTerm: string,
  filterType: 'all' | 'building' | 'single' | 'published'
): SavedMap[] => {
  if (!Array.isArray(maps)) {
    return [];
  }

  let filtered = maps.filter(map => {
    const matchesSearch = !searchTerm || 
      map.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'building' && map.type === 'building') ||
      (filterType === 'single' && map.type === 'single') ||
      (filterType === 'published' && map.isPublished);
    
    return matchesSearch && matchesFilter;
  });

  return filtered;
};

export const getMapStats = (maps: SavedMap[]) => {
  if (!Array.isArray(maps)) {
    return {
      totalMaps: 0,
      publishedMaps: 0,
      buildingMaps: 0,
      singleMaps: 0,
      totalPaths: 0,
      totalTags: 0,
    };
  }

  return {
    totalMaps: maps.length,
    publishedMaps: maps.filter(m => m.isPublished).length,
    buildingMaps: maps.filter(m => m.type === 'building').length,
    singleMaps: maps.filter(m => m.type === 'single').length,
    totalPaths: maps.reduce((sum, map) => sum + (map.pathCount || 0), 0),
    totalTags: maps.reduce((sum, map) => sum + (map.tagCount || 0), 0),
  };
};

export const createEmptyMap = (): SavedMap => ({
  id: `map-${Date.now()}`,
  name: 'Untitled Map',
  type: 'single',
  imageUrl: '',
  pathCount: 0,
  tagCount: 0,
  connectorCount: 0,
  isPublished: false,
  lastModified: new Date().toISOString(),
  createdAt: new Date().toISOString(),
});

export const duplicateMap = (map: SavedMap): SavedMap => ({
  ...map,
  id: `${map.id}-copy-${Date.now()}`,
  name: `${map.name} (Copy)`,
  isPublished: false,
  lastModified: new Date().toISOString(),
  createdAt: new Date().toISOString(),
});
