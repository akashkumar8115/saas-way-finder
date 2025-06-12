export const STANDARD_MAP_CONFIG = {
  minWidth: 800,
  minHeight: 600,
  maxWidth: 1920,
  maxHeight: 1080,
  aspectRatio: 16 / 9,
};

export const CANVAS_CONFIG = {
  dotRadius: 6,
  lineWidth: 3,
  animationSpeed: 2000,
  gridSize: 20,
};

export const SHAPE_DEFAULTS = {
  rectangle: {
    width: 100,
    height: 60,
  },
  circle: {
    radius: 40,
  },
};

export const CATEGORY_COLORS = {
  restaurant: 'bg-orange-100 text-orange-800',
  restroom: 'bg-blue-100 text-blue-800',
  store: 'bg-green-100 text-green-800',
  office: 'bg-purple-100 text-purple-800',
  meeting: 'bg-indigo-100 text-indigo-800',
  parking: 'bg-gray-100 text-gray-800',
  emergency: 'bg-red-100 text-red-800',
  elevator: 'bg-blue-100 text-blue-800',
  stairs: 'bg-green-100 text-green-800',
  escalator: 'bg-purple-100 text-purple-800',
  'emergency-exit': 'bg-red-100 text-red-800',
};
