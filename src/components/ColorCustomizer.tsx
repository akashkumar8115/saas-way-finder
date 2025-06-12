"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Palette, Route } from 'lucide-react';
import { TaggedLocation } from './LocationTagger';

interface Path {
  id: string;
  name: string;
  source: string;
  destination: string;
  points: { x: number; y: number }[];
  isPublished: boolean;
  sourceTagId?: string;
  destinationTagId?: string;
  color?: string;
}

interface ColorCustomizerProps {
  tags: TaggedLocation[];
  paths: Path[];
  onTagColorChange: (tagId: string, color: string) => void;
  onPathColorChange: (pathId: string, color: string) => void;
}

const PRESET_COLORS = [
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
];

export const ColorCustomizer: React.FC<ColorCustomizerProps> = ({
  tags,
  paths,
  onTagColorChange,
  onPathColorChange
}) => {
  const ColorPicker = ({ 
    currentColor, 
    onChange 
  }: { 
    currentColor?: string; 
    onChange: (color: string) => void;
  }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-6 h-6 rounded-full border-2 transition-all ${
            currentColor === color 
              ? 'border-gray-800 scale-110' 
              : 'border-gray-300 hover:border-gray-500'
          }`}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
      <input
        type="color"
        value={currentColor || '#f59e0b'}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded-full border-2 border-gray-300 cursor-pointer"
        title="Custom color"
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color Customizer
        </CardTitle>
        <CardDescription>
          Customize colors for tags and paths
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tag Colors */}
        {tags.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              Tag Colors
            </h4>
            <div className="space-y-3 max-h-32 overflow-y-auto">
              {tags.map((tag) => (
                <div key={tag.id} className="space-y-1">
                  <Label className="text-xs font-medium">{tag.name}</Label>
                  <ColorPicker
                    currentColor={tag.color}
                    onChange={(color) => onTagColorChange(tag.id, color)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Path Colors */}
        {paths.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Route className="w-3 h-3" />
              Path Colors
            </h4>
            <div className="space-y-3 max-h-32 overflow-y-auto">
              {paths.map((path) => (
                <div key={path.id} className="space-y-1">
                  <Label className="text-xs font-medium">{path.name}</Label>
                  <ColorPicker
                    currentColor={path.color}
                    onChange={(color) => onPathColorChange(path.id, color)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tags.length === 0 && paths.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            Create tags and paths to customize their colors
          </div>
        )}
      </CardContent>
    </Card>
  );
};

