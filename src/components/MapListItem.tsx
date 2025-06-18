import React from 'react';
import { 
  Edit3, 
  Eye, 
  Trash2, 
  Calendar, 
  Route, 
  MapPin,
  Building,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MapListItemProps {
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

export const MapListItem: React.FC<MapListItemProps> = ({ 
  map, 
  onEdit, 
  onDelete, 
  onPreview 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center p-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={map.imageUrl}
            alt={map.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 ml-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {map.name}
                </h3>
                <div className="flex items-center space-x-2">
                  {map.isPublished && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Published
                    </span>
                  )}
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
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
              </div>
              
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Route className="h-4 w-4 mr-1 text-blue-500" />
                  <span className="font-medium">{map.pathCount}</span>
                  <span className="ml-1">path{map.pathCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  <span>Modified {new Date(map.lastModified).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <Button
                onClick={() => onEdit(map)}
                size="sm"
                variant="outline"
                className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                onClick={() => onPreview ? onPreview(map) : onEdit(map)}
                size="sm"
                variant="outline"
                className="hover:bg-green-50 hover:border-green-300 hover:text-green-700"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                onClick={() => onDelete(map.id)}
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 p-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="p-2"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapListItem;
