# Dev Panel Guide

## Overview

All development and testing tools are consolidated into a single, collapsible dev panel accessed via **F2** or by clicking the "DEV" button in the top-right corner.

## Design Philosophy

**Clean by Default:**
- Main app loads with minimal UI (just the hex grid)
- Debug overlay hidden (press F1 to show FPS)
- Dev panel collapsed to a small icon
- Full development power available on demand

**Everything in One Place:**
- No separate test pages
- No scattered controls
- All tools accessible without leaving the main view

## Opening the Dev Panel

**Keyboard:** Press `F2`
**Mouse:** Click "DEV" button in top-right corner

The panel will expand showing all available development tools.

## Dev Panel Sections

### 1. Debug Overlay

Controls the performance overlay in the top-left corner.

**Buttons:**
- **Toggle (F1)** - Show/hide the debug overlay
- **Detailed (D)** - Switch between minimal (FPS only) and detailed mode

**Minimal Mode:**
```
FPS: 60
```

**Detailed Mode:**
```
FPS: 60 | Frame: 16.67ms
Units: 0 | Hexes: 625/625
Draw Calls: 1 | Update: 0.45ms
Memory: 35.2MB / 50.0MB
```

**Keyboard Shortcuts:**
- `F1` - Toggle visibility
- `D` - Toggle detailed mode

### 2. State Management

Export, import, and inspect game state.

**Buttons:**
- **Export** - Download current state as JSON file
- **Import** - Load state from JSON file (opens file picker)
- **View State** - Toggle state viewer/editor panel

**State Viewer (when toggled on):**
- **Textarea** - Shows/edits JSON state
- **Capture** - Capture current state to textarea
- **Load from Editor** - Validate state from textarea
- **Clear** - Clear the textarea

**Workflow:**
1. Click "View State" to open editor
2. Click "Capture" to grab current state
3. Edit JSON if desired
4. Click "Load from Editor" to validate
5. Use "Export" to save to file
6. Use "Import" to load from file

**State includes:**
- Grid configuration (size, dimensions)
- All hex data (coordinates, terrain)
- Viewport position and zoom
- Version and checksum for validation

### 3. Performance Testing

Run automated performance tests with different hex counts.

**Buttons:**
- **Toggle Test Panel** - Show/hide test controls
- **100 Hexes** - Test with ~100 hex grid
- **500 Hexes** - Test with ~500 hex grid
- **1000 Hexes** - Test with ~1000 hex grid
- **Clear** - Clear test results

**Test Results:**
Results appear in a scrollable log with color coding:
- 🟢 **Green (pass)** - Meets performance target
- 🟡 **Yellow (warn)** - Below target but acceptable
- 🔴 **Red (fail)** - Below acceptable threshold
- ⚪ **Gray (info)** - Information message

**Example Output:**
```
[10:45:23] Starting test with 500 hexes...
[10:45:23] Grid: 23x23 = 529 hexes (info)
[10:45:25] FPS: 61.2 (target: 60) (pass)
[10:45:25] Frame time: 16.34ms (pass)
```

**How It Works:**
1. Temporarily recreates grid with specified hex count
2. Waits 1 second for frame stabilization
3. Measures FPS over 2 seconds
4. Reports results with pass/fail
5. Note: Grid change is temporary, original restored after test

### 4. Quick Actions

Common actions with keyboard shortcuts.

**Buttons:**
- **Reset View (R)** - Reset viewport to center, zoom to 1.0
- **Print Perf (P)** - Print performance report to console

## Keyboard Shortcuts

All shortcuts work globally:

| Key | Action |
|-----|--------|
| `F1` | Toggle debug overlay |
| `F2` | Toggle dev panel |
| `D` | Toggle detailed debug mode |
| `R` | Reset viewport |
| `E` | Export state to file |
| `P` | Print performance to console |

## Console Commands

For power users, all functions are accessible via console:

```javascript
// State management
hexEngine.getState()          // Get current state object
hexEngine.inspectState()      // Pretty print state with analysis
hexEngine.exportState()       // Download state as JSON

// Performance
hexEngine.getPerformanceReport()  // Get perf metrics

// Manual control
toggleDevPanel()              // Open/close dev panel
toggleDebug()                 // Toggle debug overlay
toggleDetail()                // Toggle detailed mode
resetViewport()               // Reset view
```

## Use Cases

### Testing Performance

1. Press `F2` to open dev panel
2. Click "Toggle Test Panel" under Performance Test
3. Run test with desired hex count (100/500/1000)
4. Check results - should pass at 60fps
5. Click "Clear" to remove results

### Debugging State

1. Press `F2` to open dev panel
2. Click "View State" under State Management
3. Click "Capture" to grab current state
4. Inspect JSON in textarea
5. Click "Load from Editor" to validate
6. Make changes and test validation

### Exporting Game State

1. Press `F2` to open dev panel
2. Click "Export" under State Management
3. JSON file downloads automatically
4. Or use keyboard: Press `E` (works without opening panel)

### Importing Game State

1. Press `F2` to open dev panel
2. Click "Import" under State Management
3. Select JSON file
4. State loads and validates automatically
5. Check dev panel for success/error message

### Checking FPS

**Quick Check:**
1. Press `F1` to show FPS
2. Look at top-left corner
3. Green = good (>55fps), Yellow = okay (30-55fps), Red = bad (<30fps)

**Detailed Analysis:**
1. Press `F1` to show debug overlay
2. Press `D` to enable detailed mode
3. See frame time, memory, draw calls
4. Press `P` to print full report to console

## Tips

**Clean Workflow:**
- Keep dev panel collapsed during normal play
- Use `F1` for quick FPS checks
- Open panel (`F2`) only when needed
- Use keyboard shortcuts for speed

**State Management:**
- Always export before major changes
- Import states to compare versions
- Use state viewer to inspect internals
- Checksums validate file integrity

**Performance Testing:**
- Run tests after code changes
- Test with 500 hexes (Phase 1 target)
- Clear results between runs
- Watch for FPS drops in detailed mode

**Memory Management:**
- Enable detailed mode (`D`) to see memory
- Watch for steady increases (potential leaks)
- Chrome DevTools has more detailed profiling

## Troubleshooting

**Panel won't open:**
- Try `F2` key
- Click "DEV" in top-right
- Check browser console for errors

**State import fails:**
- Check JSON is valid (use JSON validator)
- Verify version compatibility
- Look at checksum validation message

**Performance test shows low FPS:**
- Close other browser tabs
- Disable browser extensions
- Check CPU throttling in DevTools
- Ensure hardware acceleration enabled

**State viewer empty:**
- Click "Capture" to load current state
- Or use "Import" to load from file
- Check console for errors

## Future Enhancements (Phase 2+)

Planned additions to dev panel:
- Entity inspector (view/edit game objects)
- Action history/replay
- Network simulator (for multiplayer testing)
- Custom terrain editor
- Fog of war toggle
- AI player controls

---

**Remember:** The dev panel is for development only. In production builds, it can be disabled or removed entirely.
