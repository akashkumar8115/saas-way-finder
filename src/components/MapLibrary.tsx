import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    Grid3X3,
    List,
    Building,
    MapPin,
    Route,
    Calendar,
    Eye,
    Download,
    Upload,
    Palette
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapCard } from '@/components/MapCard';
import { MapListItem } from '@/components/MapListItem';
import { MapUpload } from '@/components/MapUpload';
import { TemplateSelector } from '@/components/TemplateSelector';
import { SavedMap, filterMaps, getMapStats } from '@/utils/mapUtils';
import { MapTemplate, applyTemplateToMap } from '@/utils/mapTemplates';

interface MapLibraryProps {
    maps: SavedMap[];
    onEditMap: (map: SavedMap) => void;
    onPreviewMap: (map: SavedMap) => void;
    onDeleteMap: (mapId: string) => void;
    onImageUpload: (imageUrl: string) => void;
    onToggleBuildingMode: () => void;
    onApplyTemplate?: (template: MapTemplate) => void;
}

export const MapLibrary: React.FC<MapLibraryProps> = ({
    maps,
    onEditMap,
    onPreviewMap,
    onDeleteMap,
    onImageUpload,
    onToggleBuildingMode,
    onApplyTemplate,
}) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'building' | 'single' | 'published'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'modified' | 'paths'>('modified');
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);

    const filteredMaps = useMemo(() => {
        let filtered = filterMaps(maps, searchTerm, filterType);

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
    }, [maps, searchTerm, filterType, sortBy]);

    const stats = getMapStats(maps);

    const handleTemplateSelect = (template: MapTemplate) => {
        if (onApplyTemplate) {
            onApplyTemplate(template);
        }
        setShowTemplateSelector(false);
    };

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Map Library</h2>
                        <p className="text-gray-600">
                            Manage and organize your wayfinding maps
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Button
                            onClick={() => setShowTemplateSelector(true)}
                            variant="outline"
                        >
                            <Palette className="h-4 w-4 mr-2" />
                            Use Template
                        </Button>
                        <MapUpload onImageUpload={onImageUpload} />
                        <Button onClick={onToggleBuildingMode} variant="outline">
                            <Building className="h-4 w-4 mr-2" />
                            Create Building
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalMaps}</div>
                        <div className="text-sm text-blue-700">Total Maps</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.publishedMaps}</div>
                        <div className="text-sm text-green-700">Published</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.buildingMaps}</div>
                        <div className="text-sm text-purple-700">Buildings</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats.singleMaps}</div>
                        <div className="text-sm text-orange-700">Single Maps</div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-indigo-600">{stats.totalPaths}</div>
                        <div className="text-sm text-indigo-700">Total Paths</div>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-pink-600">{stats.totalTags}</div>
                        <div className="text-sm text-pink-700">Total Tags</div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 flex gap-4 items-center">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search maps..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Maps</option>
                            <option value="building">Buildings</option>
                            <option value="single">Single Maps</option>
                            <option value="published">Published</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="modified">Last Modified</option>
                            <option value="name">Name</option>
                            <option value="paths">Path Count</option>
                        </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            {filteredMaps.length} of {maps.length} maps
                        </span>
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Maps Display */}
            {filteredMaps.length === 0 ? (
                <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                    <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || filterType !== 'all' ? 'No maps found' : 'No maps yet'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || filterType !== 'all'
                            ? 'Try adjusting your search or filter criteria'
                            : 'Create your first map to get started with wayfinding'
                        }
                    </p>
                    {!searchTerm && filterType === 'all' && (
                        <div className="flex justify-center space-x-4">
                            <Button onClick={() => setShowTemplateSelector(true)} variant="outline">
                                <Palette className="h-4 w-4 mr-2" />
                                Use Template
                            </Button>
                            <MapUpload onImageUpload={onImageUpload} />
                            <Button onClick={onToggleBuildingMode} variant="outline">
                                <Building className="h-4 w-4 mr-2" />
                                Create Building
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {viewMode === 'grid' ? (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredMaps.map((map) => (
                                    <MapCard
                                        key={map.id}
                                        map={map}
                                        onEdit={() => onEditMap(map)}
                                        onPreview={() => onPreviewMap(map)}
                                        onDelete={() => onDeleteMap(map.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredMaps.map((map) => (
                                <MapListItem
                                    key={map.id}
                                    map={map}
                                    onEdit={() => onEditMap(map)}
                                    onPreview={() => onPreviewMap(map)}
                                    onDelete={() => onDeleteMap(map.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Bulk Actions */}
            {filteredMaps.length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            Bulk actions for selected maps
                        </span>
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => {
                                    // Export all maps functionality
                                    alert('Export all maps feature coming soon!');
                                }}
                                variant="outline"
                                size="sm"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export All
                            </Button>

                            <Button
                                onClick={() => {
                                    // Import maps functionality
                                    alert('Import maps feature coming soon!');
                                }}
                                variant="outline"
                                size="sm"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Import Maps
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Selector Modal */}
            <TemplateSelector
                isOpen={showTemplateSelector}
                onClose={() => setShowTemplateSelector(false)}
                onApplyTemplate={handleTemplateSelect}
            />
        </div>
    );
};

export default MapLibrary;

