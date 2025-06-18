# Way Finder - Map Editor Documentation

## Overview

The Way Finder Map Editor is a comprehensive tool for creating interactive wayfinding maps. It supports both single-floor maps and complex multi-floor buildings with vertical connectors.

## Features

### Core Functionality
- **Interactive Map Canvas**: Upload and edit maps with point-and-click path creation
- **Multi-Floor Buildings**: Manage complex buildings with multiple floors
- **Vertical Connectors**: Add elevators, stairs, escalators, and ramps
- **Location Tagging**: Mark important locations with customizable shapes and colors
- **Path Management**: Create, edit, and organize navigation paths
- **Template System**: Start with pre-configured layouts for common building types

### Advanced Features
- **Multi-Floor Paths**: Create navigation routes that span multiple floors
- **Color Customization**: Customize colors for paths, tags, and connectors
- **Export/Import**: Save and share map configurations
- **Preview Mode**: Test navigation experience before publishing
- **Map Library**: Organize and manage multiple maps

## Getting Started

### 1. Creating Your First Map

#### Option A: Single Map
1. Click "Upload Map Image" on the welcome screen
2. Select your floor plan or site map image
3. Enter a descriptive name for your map
4. Start adding locations and paths

#### Option B: Multi-Floor Building
1. Click "Create Multi-Floor Building"
2. Enter building details (name, description)
3. Add floors with their respective images
4. Configure vertical connectors between floors

### 2. Adding Locations

1. Click the "Tag Mode" button in the toolbar
2. Select a shape type (rectangle, circle, or polygon)
3. Draw shapes on your map to mark locations
4. Fill in location details (name, category, color)
5. Repeat for all important locations

### 3. Creating Navigation Paths

1. Click "Design Mode" in the toolbar
2. Click on the map to place path points
3. Connect locations by clicking near tagged areas
4. Use "Save Path" to store the route with source/destination labels
5. Edit existing paths using the "Edit" button in Path Manager

### 4. Multi-Floor Navigation

1. Ensure your building has vertical connectors (elevators, stairs)
2. Click "Multi-Floor Path" when in Design Mode
3. Create paths normally - click directly on connectors to switch floors
4. The system will automatically handle floor transitions

## Component Architecture

### Main Components

- **MapEditorPage**: Main container component
- **MapCanvas**: Interactive canvas for map editing
- **Toolbar**: Action buttons and mode controls
- **MapLibrary**: Organize and manage multiple maps
- **BuildingManager**: Multi-floor building configuration
- **PathManager**: Path creation and editing
- **LocationTagger**: Location marking and management

### State Management

The editor uses custom hooks for state management:
- `useMapEditor`: Main editor state
- `useMultiFloorPath`: Multi-floor navigation logic
- `useBuildingHandlers`: Building management
- `useRouteHandlers`: Route and navigation handling

### Data Flow

```
User Interaction → Event Handlers → State Updates → UI Re-render
                ↓
            Canvas Updates → Path Calculations → Visual Feedback
```

## Configuration

### Map Container Settings

```typescript
MAP_CONTAINER_CONFIG = {
  minHeight: 400,
  maxHeight: 800,
  maxWidth: 1200,
  aspectRatio: '16/10'
}
```

### Supported Image Formats
- PNG, JPG, JPEG, GIF, WebP
- Recommended: High-resolution PNG for best quality
- Maximum file size: 10MB

## API Integration

### Local Storage
Maps are automatically saved to browser local storage:
- Building configurations
- Path data
- Location tags
- User preferences

### Export Formats
- JSON: Complete map data with metadata
- Image: Static map with overlays (coming soon)
- PDF: Printable navigation guides (coming soon)

## Templates

### Available Templates
- **Office Building**: Reception, meeting rooms, amenities
- **Retail Store**: Departments, checkout, customer service
- **Hospital Floor**: Patient rooms, nursing stations, facilities
- **School Floor**: Classrooms, library, administrative areas

### Custom Templates
Create your own templates by:
1. Configuring a map with standard locations
2. Exporting the configuration
3. Saving as a reusable template

## Best Practices

### Map Preparation
- Use high-contrast images for better visibility
- Ensure text and details are readable at various zoom levels
- Include north arrow and scale if applicable

### Path Design
- Keep paths simple and intuitive
- Avoid unnecessary waypoints
- Test paths in Preview Mode before publishing

### Location Tagging
- Use consistent naming conventions
- Group similar locations with color coding
- Include accessibility information where relevant

### Multi-Floor Buildings
- Clearly mark vertical connectors
- Use consistent floor numbering
- Test multi-floor paths thoroughly

## Troubleshooting

### Common Issues

**Map not loading**
- Check image file format and size
- Ensure stable internet connection
- Clear browser cache and reload

**Paths not saving**
- Verify source and destination are properly tagged
- Check for JavaScript errors in browser console
- Ensure sufficient browser storage space

**Multi-floor navigation issues**
- Confirm vertical connectors are properly placed
- Verify connector shared IDs match between floors
- Test individual floor paths before creating multi-floor routes

### Performance Optimization

- Limit path complexity (< 50 points per path)
- Optimize image sizes before upload
- Regular cleanup of unused tags and paths
- Use templates for consistent performance

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Keyboard Shortcuts

- `Ctrl/Cmd + Z`: Undo last action
- `Escape`: Cancel current operation
- `Delete`: Remove selected element
- `Ctrl/Cmd + S`: Save current work

## Future Enhancements

- Real-time collaboration
- Mobile app integration
- Advanced analytics
- Voice navigation support
- Augmented reality features

## Support

For technical support or feature requests:
- GitHub Issues: [Repository URL]
- Documentation: [Docs URL]
- Community Forum: [Forum URL]
