# State Export/Import Guide

This guide shows you how to export, inspect, and verify game state in the Hex Game Engine.

## Quick Start

### Method 1: Using the Main App (http://localhost:5173/)

**In the Browser UI:**
1. Click "Export State" button (top-right)
2. A JSON file will be downloaded automatically

**Using Keyboard:**
- Press `E` key to export state

**In Browser Console:**
```javascript
// Get state as object
const state = hexEngine.getState();

// Pretty print state with analysis
hexEngine.inspectState();

// Download state as JSON file
hexEngine.exportState();
```

### Method 2: Using the State Test Page (http://localhost:5173/tests/state-test.html)

This dedicated test page provides a comprehensive interface for state management:

**Features:**
- Live game view with pan/zoom
- Capture state to textarea (view/edit JSON directly)
- Export state as file download
- Import state from file
- Compare multiple captured states
- Real-time logging of state operations

**Workflow:**
1. Open `http://localhost:5173/tests/state-test.html`
2. Interact with the game (pan, zoom)
3. Click "Capture State" to view JSON
4. Click "Export State" to download
5. Edit the JSON in textarea
6. Click "Import State" to load and validate

## State Structure

The exported JSON contains:

```json
{
  "version": "1.0.0",
  "timestamp": 1234567890,
  "checksum": -123456789,
  "grid": {
    "size": 30,
    "width": 25,
    "height": 25,
    "hexes": [
      {
        "hex": { "q": 0, "r": 0 },
        "terrain": "grass"
      }
      // ... more hexes
    ]
  },
  "viewport": {
    "x": 600,
    "y": 400,
    "scale": 1
  },
  "entities": [],
  "turn": 0
}
```

## State Components

### Version
- Format: Semantic versioning (major.minor.patch)
- Used for compatibility checks
- Current version: 1.0.0

### Timestamp
- Unix timestamp in milliseconds
- Records when state was captured
- Useful for sorting/organizing saves

### Checksum
- 32-bit hash of state content
- Validates state integrity on load
- Detects corruption or manual edits

### Grid Data
- **size**: Hex radius in pixels
- **width/height**: Grid dimensions in hexes
- **hexes**: Array of all hex data
  - Each hex contains coordinates (q, r) and terrain type
  - Terrain types: grass, water, mountain, desert, forest

### Viewport
- **x, y**: Camera position in pixels
- **scale**: Zoom level (0.5 to 3.0)

### Entities (Phase 2)
- Currently empty array
- Will contain unit/entity data in Phase 2

### Turn (Phase 2)
- Currently always 0
- Will track turn number in Phase 2

## Using the Browser Console

### Quick Inspection

```javascript
// Show formatted state info
hexEngine.inspectState();
```

Output example:
```
=== Current Game State ===
Version: 1.0.0
Timestamp: 10/25/2025, 10:32:14 PM
Checksum: -123456789

Grid:
  Size: 30 px
  Dimensions: 25x25
  Total hexes: 625
  Terrain distribution:
    grass: 125 (20.0%)
    water: 124 (19.8%)
    mountain: 126 (20.2%)
    desert: 125 (20.0%)
    forest: 125 (20.0%)

Viewport:
  Position: (600.00, 400.00)
  Scale: 1.00

Sample hexes (first 5):
  (q:0, r:0) = grass
  (q:0, r:1) = water
  (q:0, r:2) = mountain
  ...
```

### Get Raw State Object

```javascript
const state = hexEngine.getState();
console.log(state);

// Access specific parts
console.log(state.grid.hexes.length); // Number of hexes
console.log(state.viewport); // Camera position
console.log(state.checksum); // Integrity hash
```

### Export State

```javascript
// Download as JSON file
hexEngine.exportState();
```

## Verifying State Integrity

### Check Checksum

```javascript
const state = hexEngine.getState();
console.log('Checksum:', state.checksum);

// After loading a state from JSON
const loadedState = JSON.parse(jsonString);
console.log('Loaded checksum:', loadedState.checksum);
// If checksums match, state is intact
```

### Compare Two States

On the state test page:
1. Capture state multiple times (with changes between captures)
2. Click "Compare States" to see differences
3. Checksums will differ if any data changed

### Manual Validation

```javascript
const state = hexEngine.getState();

// Verify grid data
console.assert(state.grid.hexes.length === state.grid.width * state.grid.height, 'Hex count mismatch!');

// Verify terrain types are valid
const validTerrains = ['grass', 'water', 'mountain', 'desert', 'forest'];
state.grid.hexes.forEach(hex => {
  console.assert(validTerrains.includes(hex.terrain), `Invalid terrain: ${hex.terrain}`);
});

console.log('State validation passed!');
```

## Common Use Cases

### 1. Save Game Progress
```javascript
// Capture and download current state
hexEngine.exportState();
// File saves as: hex-game-state-<timestamp>.json
```

### 2. Share State with Team
```javascript
// Get state and copy to clipboard
const state = hexEngine.getState();
navigator.clipboard.writeText(JSON.stringify(state, null, 2));
console.log('State copied to clipboard!');
```

### 3. Debug Specific Grid Configuration
```javascript
// Inspect specific hexes
const state = hexEngine.getState();
const hexAt_5_5 = state.grid.hexes.find(h => h.hex.q === 5 && h.hex.r === 5);
console.log('Hex at (5,5):', hexAt_5_5);
```

### 4. Analyze Terrain Distribution
```javascript
const state = hexEngine.getState();
const terrainCount = {};

state.grid.hexes.forEach(hex => {
  terrainCount[hex.terrain] = (terrainCount[hex.terrain] || 0) + 1;
});

console.table(terrainCount);
```

## Testing State Persistence

### Test 1: Export and Verify Structure
1. Open browser console
2. Run: `hexEngine.inspectState()`
3. Verify all expected fields are present
4. Check that hex count matches grid dimensions

### Test 2: Checksum Validation
1. Capture state: `const state1 = hexEngine.getState()`
2. Pan/zoom the viewport
3. Capture again: `const state2 = hexEngine.getState()`
4. Compare: `state1.checksum !== state2.checksum` (should be true)
5. Reset viewport to original position
6. Capture: `const state3 = hexEngine.getState()`
7. Checksums should differ (timestamp changed)

### Test 3: JSON Round-Trip
1. Export state to file
2. Open file in text editor
3. Verify JSON is valid and readable
4. Load file on state test page
5. Verify checksum matches

## Troubleshooting

### "Engine not initialized" Error
Make sure the page has fully loaded before running console commands.

### Checksum Mismatch Warning
This means the state data was modified between capture and load. This is expected if:
- You manually edited the JSON
- The timestamp was updated
- Any game state changed

### Large File Size
Each hex stores coordinates and terrain type. A 25x25 grid (625 hexes) produces ~50KB JSON.
For larger grids (100x100 = 10,000 hexes), expect ~800KB files.

### Browser Download Blocked
Some browsers block automatic downloads. Check your browser's download settings.

## Future Enhancements (Phase 2+)

- State restoration (load saved states back into engine)
- State migration (upgrade old versions to new format)
- Compressed state format (reduce file size)
- State diff (show what changed between states)
- Auto-save functionality
- Cloud save integration

---

**Current Status:** Phase 1 - Export and validation working, restoration coming in Phase 2
