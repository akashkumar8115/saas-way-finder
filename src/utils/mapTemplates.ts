export interface MapTemplate {
  id: string;
  name: string;
  description: string;
  category: 'office' | 'retail' | 'healthcare' | 'education' | 'hospitality' | 'other';
  thumbnail: string;
  tags: Array<{
    name: string;
    category: string;
    shape: 'rectangle' | 'circle' | 'polygon';
    color: string;
  }>;
  verticalConnectors?: Array<{
    name: string;
    type: 'elevator' | 'stairs' | 'escalator' | 'ramp';
  }>;
  samplePaths?: Array<{
    source: string;
    destination: string;
    description: string;
  }>;
}

export const MAP_TEMPLATES: MapTemplate[] = [
  {
    id: 'office-building',
    name: 'Office Building',
    description: 'Standard office building with common areas and workspaces',
    category: 'office',
    thumbnail: '/templates/office-building.png',
    tags: [
      { name: 'Reception', category: 'entrance', shape: 'rectangle', color: '#3B82F6' },
      { name: 'Conference Room A', category: 'meeting', shape: 'rectangle', color: '#10B981' },
      { name: 'Conference Room B', category: 'meeting', shape: 'rectangle', color: '#10B981' },
      { name: 'Break Room', category: 'amenity', shape: 'rectangle', color: '#F59E0B' },
      { name: 'Restroom', category: 'facility', shape: 'rectangle', color: '#6B7280' },
      { name: 'Emergency Exit', category: 'safety', shape: 'rectangle', color: '#EF4444' },
    ],
    verticalConnectors: [
      { name: 'Main Elevator', type: 'elevator' },
      { name: 'Stairwell A', type: 'stairs' },
      { name: 'Stairwell B', type: 'stairs' },
    ],
    samplePaths: [
      { source: 'Reception', destination: 'Conference Room A', description: 'Main entrance to meeting room' },
      { source: 'Reception', destination: 'Break Room', description: 'Entrance to break area' },
    ],
  },
  {
    id: 'retail-store',
    name: 'Retail Store',
    description: 'Retail store layout with departments and customer services',
    category: 'retail',
    thumbnail: '/templates/retail-store.png',
    tags: [
      { name: 'Main Entrance', category: 'entrance', shape: 'rectangle', color: '#3B82F6' },
      { name: 'Customer Service', category: 'service', shape: 'rectangle', color: '#8B5CF6' },
      { name: 'Electronics', category: 'department', shape: 'rectangle', color: '#10B981' },
      { name: 'Clothing', category: 'department', shape: 'rectangle', color: '#10B981' },
      { name: 'Checkout', category: 'service', shape: 'rectangle', color: '#F59E0B' },
      { name: 'Restroom', category: 'facility', shape: 'rectangle', color: '#6B7280' },
    ],
    samplePaths: [
      { source: 'Main Entrance', destination: 'Electronics', description: 'Entrance to electronics section' },
      { source: 'Electronics', destination: 'Checkout', description: 'Electronics to payment' },
    ],
  },
  {
    id: 'hospital-floor',
    name: 'Hospital Floor',
    description: 'Hospital floor with patient rooms, nursing stations, and facilities',
    category: 'healthcare',
    thumbnail: '/templates/hospital-floor.png',
    tags: [
      { name: 'Nurses Station', category: 'service', shape: 'rectangle', color: '#3B82F6' },
      { name: 'Patient Room 101', category: 'room', shape: 'rectangle', color: '#10B981' },
      { name: 'Patient Room 102', category: 'room', shape: 'rectangle', color: '#10B981' },
      { name: 'ICU', category: 'critical', shape: 'rectangle', color: '#EF4444' },
      { name: 'Pharmacy', category: 'service', shape: 'rectangle', color: '#8B5CF6' },
      { name: 'Family Waiting Area', category: 'amenity', shape: 'rectangle', color: '#F59E0B' },
    ],
    verticalConnectors: [
      { name: 'Patient Elevator', type: 'elevator' },
      { name: 'Emergency Stairs', type: 'stairs' },
    ],
    samplePaths: [
      { source: 'Nurses Station', destination: 'Patient Room 101', description: 'Nurse to patient room' },
      { source: 'Pharmacy', destination: 'ICU', description: 'Medication delivery route' },
    ],
  },
  {
    id: 'school-floor',
    name: 'School Floor',
    description: 'Educational facility with classrooms and common areas',
    category: 'education',
    thumbnail: '/templates/school-floor.png',
    tags: [
      { name: 'Main Office', category: 'administration', shape: 'rectangle', color: '#3B82F6' },
      { name: 'Classroom 101', category: 'classroom', shape: 'rectangle', color: '#10B981' },
      { name: 'Classroom 102', category: 'classroom', shape: 'rectangle', color: '#10B981' },
      { name: 'Library', category: 'facility', shape: 'rectangle', color: '#8B5CF6' },
      { name: 'Cafeteria', category: 'amenity', shape: 'rectangle', color: '#F59E0B' },
      { name: 'Gymnasium', category: 'facility', shape: 'rectangle', color: '#06B6D4' },
    ],
    samplePaths: [
      { source: 'Main Office', destination: 'Classroom 101', description: 'Office to classroom' },
      { source: 'Library', destination: 'Cafeteria', description: 'Study area to lunch' },
    ],
  },
];

export const getTemplatesByCategory = (category?: string) => {
  if (!category || category === 'all') {
    return MAP_TEMPLATES;
  }
  return MAP_TEMPLATES.filter(template => template.category === category);
};

export const applyTemplateToMap = (
  template: MapTemplate,
  onTagsUpdate: (tags: any[]) => void,
  onConnectorsUpdate: (connectors: any[]) => void,
  currentFloorId?: string
) => {
  // Apply template tags
  const templateTags = template.tags.map(tag => ({
    id: `template-${Date.now()}-${Math.random()}`,
    name: tag.name,
    category: tag.category,
    shape: tag.shape,
    color: tag.color,
    floorId: currentFloorId,
    x: 0, // These would need to be positioned by the user
    y: 0,
    width: 100,
    height: 50,
    createdAt: new Date().toISOString(),
  }));

  // Apply template vertical connectors
  const templateConnectors = template.verticalConnectors?.map(connector => ({
    id: `connector-${Date.now()}-${Math.random()}`,
    name: connector.name,
    type: connector.type,
    floorId: currentFloorId,
    sharedId: `shared-${Date.now()}-${Math.random()}`,
    x: 0, // These would need to be positioned by the user
    y: 0,
    width: 60,
    height: 60,
    createdAt: new Date().toISOString(),
  })) || [];

  onTagsUpdate(templateTags);
  onConnectorsUpdate(templateConnectors);

  return {
    tags: templateTags,
    connectors: templateConnectors,
    samplePaths: template.samplePaths || [],
  };
};
