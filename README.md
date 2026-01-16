# WWII Battles Globe

An interactive 3D globe visualization of major World War II battles with guided tours, filters, and offline support.

**🎓 Now integrated into [Cronx Academy](https://github.com/obaptiste/Cronx-Academy)** - See [CRONX_ACADEMY_INTEGRATION.md](./CRONX_ACADEMY_INTEGRATION.md) for details.

## Features

- **Interactive 3D Globe**: Rotate and explore Earth with battle markers positioned at actual locations
- **Timeline Navigation**: Year slider with cumulative mode to see battles over time
- **Guided Chapter Tours**: Pre-configured tours of major campaigns (Eastern Front, Pacific Theater, etc.)
- **Battle Layers**: Distinguish between large campaigns and individual engagements
- **Casualty Uncertainty**: Display casualty ranges when available
- **List View**: Tabular view of filtered battles with keyboard navigation
- **Accessibility**: Full keyboard support, screen reader friendly, high-contrast theme
- **Localization**: Multi-language support (English, French, Spanish)
- **Offline Support**: Service worker caches assets for offline use

## Quick Start

### Local Hosting

1. **Using Python (recommended)**:
   ```bash
   cd wwii-globe
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser

2. **Using Node.js**:
   ```bash
   npx serve .
   ```

3. **Using any static file server** - just serve the directory containing `index.html`

### Embedding as iFrame

```html
<iframe 
  src="path/to/wwii-globe/index.html" 
  width="100%" 
  height="600px" 
  frameborder="0"
  title="WWII Battles Globe"
></iframe>
```

The application is fully self-contained and works perfectly inside an iframe.

## Data Files

### battles.json

Define battles with this schema:

```json
{
  "id": "unique-battle-id",
  "name": "Battle Name",
  "date": "YYYY-MM-DD",
  "year": 1944,
  "theater": "Europe|Pacific|Africa|Asia|Atlantic|Arctic|Middle East",
  "type": "campaign|engagement",
  "lat": 49.3,
  "lon": -0.5,
  "location": "City, Country",
  "belligerents": ["Side A", "Side B"],
  "outcome": "Description of outcome",
  "casualties_est": 100000,
  "casualties_low": 80000,
  "casualties_high": 120000,
  "summary": "Brief description of the battle",
  "links": [
    {"label": "Wikipedia", "url": "https://..."}
  ]
}
```

**Key fields**:
- `type`: Use "campaign" for large operations, "engagement" for single battles
- `casualties_*`: Provide `casualties_low` and `casualties_high` for ranges, or just `casualties_est` for estimates
- All fields are optional except `id`, `name`, `year`, `lat`, `lon`

### chapters.json

Create guided tours:

```json
[
  {
    "id": "chapter-id",
    "title": "Chapter Title",
    "theater": "Europe",
    "steps": [
      {
        "focus": {"lat": 48.708, "lon": 44.514, "altitude": 2.0},
        "highlight_ids": ["stalingrad"],
        "narration": "Descriptive text about this step",
        "year": 1942
      }
    ],
    "autoplay_interval_ms": 3000
  }
]
```

**Step properties**:
- `focus`: Camera position (lat, lon, altitude where altitude is zoom level)
- `highlight_ids`: Array of battle IDs to emphasize
- `narration`: Text shown in the details panel
- `year`: Optional year to set the timeline to

### i18n.json

Add translations:

```json
{
  "en": {
    "title": "WWII Battles Globe",
    "search_placeholder": "Search battle, place, country…",
    ...
  },
  "fr": {
    "title": "Globe des Batailles de la Seconde Guerre Mondiale",
    ...
  }
}
```

The app will use the language code as the key. Add any UI strings you want translated.

## Features Guide

### Cumulative Timeline Mode

Toggle "Cumulative" to show all battles up to and including the selected year, rather than just battles from that specific year. Useful for seeing how the war expanded over time.

**Usage**: Check the "Cumulative" checkbox next to the year slider

### Chapter Tours

1. Select a chapter from the "Chapters" dropdown
2. Use Next/Prev buttons to step through the tour
3. Click the Play button (▶️) to auto-advance through steps
4. Each step repositions the camera and highlights relevant battles

**Creating custom chapters**: Edit `chapters.json` and add your own tours

### Battle Layers

- **Campaigns**: Large-scale military operations (shown as rings on the globe)
- **Engagements**: Individual battles or attacks (shown as spikes)

Use the checkboxes to show/hide each layer type.

### Casualty Ranges

When a battle has `casualties_low` and `casualties_high` values:
- The details panel shows the range (e.g., "80,000 – 120,000")
- A subtle visual cue appears on the globe (implementation: ring halo or whisker)

### List View

Click the "List View" tab in the side panel to see a sortable table of all filtered battles.

**Keyboard navigation**:
- Tab through rows
- Enter/Space to select a battle
- Arrow keys to navigate

### High Contrast Theme

Toggle "High Contrast" for better visibility. Colors change to meet WCAG AA standards:
- Black backgrounds
- High-contrast text (yellow on black for dark areas, black on white for panels)
- Enhanced focus indicators

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Year -/+ 1 |
| `Shift` + `←` / `→` | Year -/+ 5 |
| `/` | Focus search field |
| `Tab` | Navigate through interactive elements |
| `Enter` / `Space` | Select focused item |
| `?` | Show/hide help tooltip |

All interactive elements are keyboard accessible and have visible focus indicators.

## Accessibility Features

- **Semantic HTML**: Proper heading hierarchy, landmarks, and ARIA labels
- **Keyboard Navigation**: Full app functionality without a mouse
- **Screen Reader Support**: ARIA live regions for dynamic updates
- **Focus Management**: Focus moves logically, including to opened panels
- **High Contrast Mode**: Built-in theme for users with low vision
- **Reduced Motion**: Respects `prefers-reduced-motion` system setting
- **Alt Text & Labels**: All interactive elements properly labeled

## Offline Support

The app uses a service worker to cache:
- HTML, CSS, JavaScript
- Data files (battles.json, chapters.json, i18n.json)
- External libraries (via runtime caching)

**After the first load**, the app works offline with the cached data.

**Cache strategy**: Stale-while-revalidate
- Returns cached version immediately for fast load
- Updates cache in background from network
- Falls back to cache if offline

**Cache versioning**: Update `CACHE_VERSION` in `service-worker.js` to force cache refresh on next load.

## Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 11.3+)
- **Mobile**: Touch-optimized controls

**Requirements**:
- Modern browser with ES6 support
- WebGL for 3D rendering
- Service Worker API for offline (optional, gracefully degrades)

## Performance Notes

- **Battle count**: Tested with 1000+ markers with smooth performance
- **Large datasets**: If performance degrades:
  - Reduce point density in three-globe settings
  - Implement marker clustering
  - Show halos only on hover/selection
- **Mobile**: Reduced animation complexity on mobile devices
- **Reduced motion**: Animations disabled when system preference detected

## Customization

### Changing Globe Textures

Edit these URLs in `index.html`:

```javascript
state.globe
  .globeImageUrl('path/to/your/earth-texture.jpg')
  .bumpImageUrl('path/to/your/topology-map.png')
  .backgroundImageUrl('path/to/your/stars-background.png');
```

### Adjusting Colors

Theater colors are defined in `getTheaterColor()` function:

```javascript
const colors = {
  'Europe': '#e74c3c',
  'Pacific': '#3498db',
  // Add or modify colors
};
```

### Adding Custom Theaters

1. Add theater to dropdown in HTML
2. Add battles with new theater value in `battles.json`
3. Add color in `getTheaterColor()` function
4. Add translation keys in `i18n.json`

## Troubleshooting

### Globe doesn't appear
- Check browser console for errors
- Ensure CDN libraries loaded (check network tab)
- Try clearing cache and hard refresh (Ctrl+Shift+R)

### Offline mode not working
- Service workers require HTTPS (or localhost)
- Check if browser supports service workers
- Look for registration errors in console

### Data not loading
- Verify JSON files are valid (use JSONLint)
- Check file paths are correct
- Ensure files are served by HTTP server (not file://)

### Performance issues
- Reduce number of visible battles with filters
- Disable casualty range visualization
- Check browser hardware acceleration is enabled

## Development

### File Structure

```
wwii-globe/
├── index.html          # Main application
├── battles.json        # Battle data
├── chapters.json       # Guided tours
├── i18n.json          # Translations
├── service-worker.js  # Offline support
└── README.md          # This file
```

### Adding Features

The application architecture:

1. **State management**: `state` object holds all application state
2. **Data flow**: JSON files → state → globe rendering
3. **Event handlers**: Each UI control has a dedicated handler function
4. **Rendering**: `updateGlobeData()` filters and renders battle markers

### Testing Offline Mode

1. Load the app with developer tools open
2. Go to Application → Service Workers
3. Check "Offline" checkbox
4. Reload page - should work from cache

## Credits

- **Three.js**: 3D rendering library
- **three-globe**: Globe visualization component
- **Battle data**: Compiled from public historical sources
- **Earth textures**: NASA Visible Earth

## License

This project is intended for educational purposes. Battle data is sourced from public historical records.

## Support

For issues or questions:
1. Check this README for solutions
2. Verify your JSON files are valid
3. Check browser console for errors
4. Ensure you're using a modern browser

## Version History

- **v1.0.0** (2024): Initial release
  - Interactive 3D globe
  - Timeline with cumulative mode
  - Chapter tours
  - Campaign/engagement layers
  - Casualty uncertainty visualization
  - Accessibility features
  - Multi-language support
  - Offline functionality