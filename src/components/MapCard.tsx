import React from 'react';
import { 
  Edit3, 
  Eye, 
  Trash2, 
  Calendar, 
  Route, 
  MoreVertical,
  MapPin,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MapCardProps {
  map: {
    id: string;
    name: string;
    type: 'building' | 'single';
    buildingId?: string;
    floorId?: string;
    imageUrl: string;
    pathCount: number;
    lastModified: string;
    isPublished: boolean;
  };
  onEdit: (map: any) => void;
  onDelete: (id: string) => void;
  onPreview?: (map: any) => void;
}

export const MapCard: React.FC<MapCardProps> = ({ 
  map, 
  onEdit, 
  onDelete, 
  onPreview 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 group">
      <div className="relative">
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img
            src={map.imageUrl}
            alt={map.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {map.isPublished && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
              Published
            </span>
          )}
          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md flex items-center">
            {map.type === 'building' ? (
              <>
                <Building className="h-3 w-3 mr-1" />
                Building
              </>
            ) : (
              <>
                <MapPin className="h-3 w-3 mr-1" />
                Single Map
              </>
            )}
          </span>
        </div>

        {/* More options button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-white rounded-full p-1 shadow-md">
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight">
            {map.name}
          </h3>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center">
              <Route className="h-4 w-4 mr-1 text-blue-500" />
              <span className="font-medium">{map.pathCount}</span>
              <span className="ml-1">path{map.pathCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
              <span>{new Date(map.lastModified).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex space-x-2 flex-1">
            <Button
              onClick={() => onEdit(map)}
              size="sm"
              variant="outline"
              className="flex items-center flex-1 justify-center hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              onClick={() => onPreview ? onPreview(map) : onEdit(map)}
              size="sm"
              variant="outline"
              className="flex items-center flex-1 justify-center hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
          <Button
            onClick={() => onDelete(map.id)}
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors p-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapCard;
