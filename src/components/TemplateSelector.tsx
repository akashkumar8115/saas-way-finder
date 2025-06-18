import React, { useState } from 'react';
import { X, Search, Building, Store, Heart, GraduationCap, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MAP_TEMPLATES, MapTemplate, getTemplatesByCategory, applyTemplateToMap } from '@/utils/mapTemplates';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: MapTemplate) => void;
  currentFloorId?: string;
}

const categoryIcons = {
  office: Building,
  retail: Store,
  healthcare: Heart,
  education: GraduationCap,
  hospitality: Coffee,
  other: Building,
};

const categoryNames = {
  office: 'Office',
  retail: 'Retail',
  healthcare: 'Healthcare',
  education: 'Education',
  hospitality: 'Hospitality',
  other: 'Other',
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  currentFloorId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
 const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredTemplates = getTemplatesByCategory(selectedCategory === 'all' ? undefined : selectedCategory)
    .filter(template => 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const categories = ['all', ...Object.keys(categoryNames)];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
            <p className="text-gray-600">Start with a pre-configured layout for your map</p>
          </div>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search and Categories */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category === 'all' ? Building : categoryIcons[category as keyof typeof categoryIcons];
                const isSelected = selectedCategory === category;
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category === 'all' ? 'All' : categoryNames[category as keyof typeof categoryNames]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const CategoryIcon = categoryIcons[template.category];
                
                return (
                  <div
                    key={template.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onApplyTemplate(template)}
                  >
                    {/* Template Preview */}
                    <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <CategoryIcon className="h-12 w-12 text-blue-600" />
                    </div>

                    {/* Template Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {categoryNames[template.category]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      
                      {/* Template Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{template.tags.length} locations</span>
                        <span>{template.verticalConnectors?.length || 0} connectors</span>
                        <span>{template.samplePaths?.length || 0} sample paths</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Templates provide pre-configured locations and connectors that you can customize
            </p>
            <div className="flex space-x-3">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Create custom template option
                  alert('Custom template creation coming soon!');
                }}
                variant="outline"
              >
                Create Custom
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;

