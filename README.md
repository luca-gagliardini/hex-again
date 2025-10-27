# Hex Game Engine - Phase 1 Complete

A performant, flexible hex-based game engine built with Pixi.js for browser-first deployment.

## 🚀 CI/CD with PR Previews

This project includes automatic PR preview deployments! Each pull request gets its own preview URL for testing changes before merging.

## Phase 1: Foundation with Monitoring ✓

### Completed Features

- ✅ **Hex Grid System**: Axial coordinate system with full hex mathematics
- ✅ **Pixi.js Rendering**: Hardware-accelerated WebGL rendering with Canvas fallback
- ✅ **Performance Monitoring**: Toggleable FPS counter with minimal/detailed modes
- ✅ **Pan/Zoom Controls**: Mouse and touch-enabled viewport controls
- ✅ **State Management**: Full JSON export/import with validation and checksums
- ✅ **Responsive Design**: Adapts to window size changes
- ✅ **Clean UX**: Debug overlay hidden by default (F1 to toggle)

### Project Structure

```
/src
  /engine/core
    Hex.js              # Hex mathematics (axial coordinates)
    HexGrid.js          # Grid management and rendering
    HexEngine.js        # Main engine class
    StateManager.js     # State serialization
  /debug
    DebugOverlay.js     # Performance metrics display (toggleable)
  main.js               # Application entry point + dev panel

/public
  favicon.svg           # Hex icon

index.html              # Main app with integrated dev panel
```

### Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Controls

**Keyboard:**
- `F1` - Toggle debug overlay (minimal FPS counter)
- `F2` - Toggle dev panel (all tools and features)
- `D` - Toggle detailed debug mode
- `R` - Reset viewport
- `E` - Export state
- `P` - Print performance report

**Mouse:**
- Drag to pan
- Scroll to zoom

**Touch:**
- Single finger drag to pan
- Pinch to zoom

**Dev Panel (F2):**

All development tools are consolidated into one collapsible panel:

1. **Debug Overlay** - Toggle FPS counter (minimal/detailed modes)
2. **State Management** - Export, import, view/edit JSON state
3. **Performance Testing** - Run tests with different hex counts (100/500/1000)
4. **Quick Actions** - Reset view, print performance

**Browser Console:**
```javascript
hexEngine.inspectState()  // Pretty print current state
hexEngine.getState()      // Get state object
hexEngine.exportState()   // Download state as JSON
```

### Testing

All testing tools are built into the main app via the Dev Panel (F2):

**Performance Testing:**
- Press F2 to open dev panel
- Click "Toggle Test Panel" under Performance Test
- Run tests with 100, 500, or 1000 hexes
- Results show FPS, frame time, pass/fail
- **Phase 1 Target:** 60fps with 500 hexes ✓

**State Management:**
- Press F2 to open dev panel
- Use State Management section to:
  - Export state to JSON file
  - Import state from file
  - View/edit state in built-in editor
  - Validate state integrity

**No Separate Test Pages Needed** - Everything is in one place!

### Documentation

- **[DEV_PANEL_GUIDE.md](DEV_PANEL_GUIDE.md)** - Complete dev panel usage guide
- **[STATE_EXPORT_GUIDE.md](STATE_EXPORT_GUIDE.md)** - State management details
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[PHASE1_COMPLETE.md](PHASE1_COMPLETE.md)** - Phase 1 summary and metrics

Default grid: 25x25 = 625 hexes

### Technical Details

**Stack:**
- Pixi.js v8.14.0 (WebGL rendering)
- Vite v7.1.12 (build tool)
- Custom FPS counter (rolling average, color-coded)

**Rendering:**
- Single Graphics object for all hexes (optimal batching)
- Flat-top hexagon orientation
- 5 terrain types with different colors

**Coordinates:**
- Axial coordinate system (q, r)
- Efficient distance calculations
- Support for range queries and neighbors

### What's Next - Phase 2

- Entity Component System (ECS)
- Unit creation and management
- State save/load functionality
- Component inspector
- Performance profiling per system

Target: 60fps with 50 units moving simultaneously

### Debug Information

**Toggle with F1:**
- **Minimal mode**: FPS only (color-coded: green >55, yellow 30-55, red <30)
- **Detailed mode** (press D): FPS, frame time, hexes, draw calls, memory

**Dev Panel (F2):**
- All development tools in one collapsible panel
- Performance testing with automated pass/fail
- State viewer/editor with JSON validation
- Quick actions for common tasks

### Architecture Principles

1. **Performance-First**: Every feature maintains 60fps
2. **Continuous Debugging**: Built-in monitoring from day one
3. **State Sharing**: JSON serialization at every phase
4. **Modular Design**: Game rules separate from engine

---

Built following the implementation plan in `CLAUDE.md`
