import { useState, useEffect, useMemo } from 'react';
import { SavedMap, getSavedMapsFromState, filterMaps } from '@/utils/mapUtils';
import { Building } from '@/types/building';

interface UseMapLibraryProps {
  buildings: Building[];
  paths: any[];
  tags: any[];
  verticalConnectors: any[];
  mapImage: string;
  mapName: string;
  isPublished: boolean;
}

export const useMapLibrary = ({
  buildings,
  paths,
  tags,
  verticalConnectors,
  mapImage,
  mapName,
  isPublished,
}: UseMapLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'building' | 'single' | 'published'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'paths'>('modified');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Generate saved maps from current state
  const savedMaps = useMemo(() => {
    return getSavedMapsFromState(
      buildings,
      paths,
      tags,
      verticalConnectors,
      mapImage,
      mapName,
      isPublished
    );
  }, [buildings, paths, tags, verticalConnectors, mapImage, mapName, isPublished]);

  // Filter and sort maps
  const filteredMaps = useMemo(() => {
    let filtered = filterMaps(savedMaps, searchTerm, filterType);
    
    // Sort maps
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'modified':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'paths':
          return b.pathCount - a.pathCount;
               default:
          return 0;
      }
    });
    
    return filtered;
  }, [savedMaps, searchTerm, filterType, sortBy]);

  // Get map statistics
  const stats = useMemo(() => {
    const totalMaps = savedMaps.length;
    const publishedMaps = savedMaps.filter(m => m.isPublished).length;
    const buildingMaps = savedMaps.filter(m => m.type === 'building').length;
    const singleMaps = savedMaps.filter(m => m.type === 'single').length;
    const totalPaths = savedMaps.reduce((sum, map) => sum + map.pathCount, 0);
    const totalTags = savedMaps.reduce((sum, map) => sum + map.tagCount, 0);

    return {
      totalMaps,
      publishedMaps,
      buildingMaps,
      singleMaps,
      totalPaths,
      totalTags,
    };
  }, [savedMaps]);

  return {
    savedMaps,
    filteredMaps,
    stats,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
  };
};
