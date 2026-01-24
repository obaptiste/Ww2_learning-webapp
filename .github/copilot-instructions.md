# WWII Battles Globe - AI Coding Agent Instructions

## Project Overview
A single-file vanilla JavaScript web application providing an interactive 3D globe visualization of major WWII battles. The app is self-contained in `index.html` (~1700 lines) with supporting JSON data files and a service worker for offline support. It's embeddable via iframe into the Cronx Academy learning platform.

**Key architectural principle:** No build step, no dependencies except CDN-hosted Three.js libraries. All code is vanilla JavaScript with inline CSS.

## Core Architecture

### State Management
- **Single state object** (line ~740): Centralized store tracking UI state, battle data, translations, playback state, chapter navigation
- **Pattern:** Functional updates - each handler function reads/writes `state` directly
- **Key properties:** `battles`, `chapters`, `translations`, `currentLang`, `selectedYear`, `selectedTheater`, `isCumulative`, `globe` (ThreeGlobeGlobe instance)

### Three-Tier Data Flow
1. **Load phase** (`loadData()`, line ~768): Async fetches from JSON files with graceful fallback to embedded sample data
2. **Render phase** (`updateGlobeData()`, line ~1200+): Filters battles based on current filters, updates Three.js globe points with casualties-based altitude
3. **Interaction phase** (`handleSearch()`, `handleYearChange()`, etc.): User inputs trigger state updates → `updateGlobeData()` re-renders

### Globalization (i18n)
- **Structure:** `i18n.json` contains `{ en: {...}, fr: {...}, es: {...} }` with UI string keys
- **Translation function** `t(key)`: Falls back to key name if translation missing; used everywhere except battle data
- **Language persistence:** Stored in `localStorage.getItem('language')`

## Key Implementation Patterns

### Battle Data Schema
```json
{
  "id": "unique-string",
  "name": "Battle Name",
  "year": 1942,
  "date": "YYYY-MM-DD",
  "lat": 48.708, "lon": 44.514,
  "type": "campaign|engagement",
  "theater": "Europe|Pacific|Africa|Asia|Atlantic|Arctic|Middle East",
  "casualties_est": 2000000,
  "casualties_low": 1800000,
  "casualties_high": 2500000,
  "summary": "...",
  "belligerents": ["..."],
  "location": "...",
  "outcome": "...",
  "links": [{"label": "Wikipedia", "url": "..."}]
}
```
**Only `id`, `name`, `year`, `lat`, `lon` are required**

### Chapter Tours Schema
Guided narrative tours with camera positions and battle highlights:
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
        "narration": "...",
        "year": 1942
      }
    ]
  }
]
```

### Core Functions to Know
- **`getFilteredBattles()`**: Returns battles matching current `year`, `theater`, `searchQuery`, layer visibility, cumulative mode
- **`updateGlobeData()`**: Applies filtered battles to globe, sets point colors (orange=campaign, blue=engagement), altitudes, labels
- **`updateListView()`**: Populates table view from filtered battles; implements keyboard navigation
- **`handleChapterSelect()` / `navigateChapter()`**: Chapter tour management with camera animation

### Accessibility
- **High contrast mode** (`data-theme="hc"`): CSS variables override colors; toggle at line ~962
- **Keyboard shortcuts** (`handleKeyboard()`): arrow keys navigate list, numbers activate chapters, Ctrl+F search
- **ARIA labels**: all controls have `role`, `aria-label`, `aria-labelledby` attributes
- **Focus management**: Tab order flows through controls → globe

### Offline Support
- **Service worker** (`service-worker.js`): Stale-while-revalidate strategy
- **STATIC_ASSETS** cache: `index.html`, JSON data files cached on install
- **RUNTIME_CACHE**: CDN resources (Three.js libraries) cached on first fetch
- **Graceful degradation**: If offline, uses fallback sample data

## Common Tasks & Patterns

### Adding a Battle
1. Add entry to `battles.json` matching schema above
2. Ensure `lat`, `lon`, `year` are correct; `type` determines marker color
3. If `casualties_low/high` provided, UI shows range; else uses `casualties_est`
4. App reloads JSON on startup; no rebuild needed

### Adding UI Text
1. Add key to **all** language objects in `i18n.json`: `{ "en": { "new_key": "..." }, "fr": { "new_key": "..." }, "es": {...} }`
2. Use `t('new_key')` in HTML/JS
3. Missing translation keys display as key name (fallback)

### Theater Filtering
- Theater values must match those in battles: `Europe`, `Pacific`, `Africa`, `Asia`, `Atlantic`, `Arctic`, `Middle East`
- Filtering happens in `getFilteredBattles()` - line ~1350+
- Add new theater: update both battles AND `<option>` elements in theater filter dropdown

### Three.js Customization
- **Globe initialized at line ~1043**: Uses `ThreeGlobeGlobe` (three-globe library v2.24.0)
- **Point styling**: Colors set via `pointColor()` (line ~1220+), altitudes via `pointAltitude()`
- **Click handling**: Raycaster intersection (line ~1100+); onClick currently disabled on three-globe object
- **Camera animation**: chapters use `state.globe.pointOfView()` for smooth transitions

## Deployment & Testing

### Local Development
```bash
# Python: cd to directory
python3 -m http.server 8000

# Node.js:
npx serve .
```
No build step required. Navigate to `http://localhost:8000`

### Embedding
Drop this iframe anywhere:
```html
<iframe src="path/to/wwii-globe/index.html" width="100%" height="600px" frameborder="0"></iframe>
```
Works perfectly in Cronx Academy at `/public/ww2-battles/index.html`

## Critical Gotchas
1. **No modules/imports**: All Three.js code is global; CDN scripts must load in order (three → three-globe)
2. **localStorage:** Language preference persists; clear to reset
3. **Casualty calculation:** Uses log10 for altitude to prevent extreme variance (Stalingrad ~2M vs Midway ~3K)
4. **Raycaster clicks:** Currently only highlights (doesn't open panel); onClick on three-globe disabled
5. **Timeline year:** Always integer 1939-1945; battles without valid year filtered out
6. **Cumulative mode:** Includes battles ≤ selected year, not just that year
7. **Chapter animation:** Uses `requestAnimationFrame` for smooth camera transitions; respects `prefers-reduced-motion`

## File Reference
- **`index.html`**: Everything (HTML, CSS, JS) - state/logic at lines 740-1600+
- **`battles.json`**: Battle GeoJSON points (required fields: id, name, year, lat, lon)
- **`chapters.json`**: Guided tour definitions (optional; graceful fallback if missing)
- **`i18n.json`**: Translation strings for all UI text (fallback: English only)
- **`service-worker.js`**: Offline caching (registered in `<head>`)
