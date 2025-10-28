# Changelog

All notable changes to the Hex Game Engine will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-25

### Phase 1: Foundation with Monitoring - COMPLETE

#### Added
- **Hex Grid System**
  - Axial coordinate system (q, r) with cubic coordinates
  - Distance calculations, neighbor queries, range queries
  - 5 terrain types (grass, water, mountain, desert, forest)
  - Flat-top hexagon orientation
  - 25x25 default grid (625 hexes)

- **Rendering Engine**
  - Pixi.js v8.14.0 integration
  - WebGL hardware acceleration with Canvas fallback
  - Single Graphics object for optimal batching
  - Pan/zoom viewport controls (mouse and touch)
  - Responsive design (adapts to window size)

- **Performance Monitoring**
  - Custom FPS counter with 60-frame rolling average
  - Color-coded performance (green >55, yellow 30-55, red <30)
  - Minimal mode (FPS only) and detailed mode (all metrics)
  - Toggle visibility with F1 key
  - Memory usage tracking (when available)

- **State Management**
  - Full JSON serialization of game state
  - Checksum validation for integrity
  - Version compatibility checking
  - Export state to downloadable JSON file
  - Import state from file with validation
  - Built-in state viewer/editor

- **Consolidated Dev Panel**
  - Single collapsible panel for all development tools (F2)
  - Debug overlay controls (toggle, minimal/detailed modes)
  - State management (export, import, view/edit, validate)
  - Performance testing (100/500/1000 hex tests)
  - Quick actions (reset view, print performance)
  - Clean by default (collapsed on startup)

- **Keyboard Shortcuts**
  - F1: Toggle debug overlay
  - F2: Toggle dev panel
  - D: Toggle detailed debug mode
  - R: Reset viewport
  - E: Export state
  - P: Print performance report

- **Console API**
  - `hexEngine.getState()` - Get current state object
  - `hexEngine.inspectState()` - Pretty print state with analysis
  - `hexEngine.exportState()` - Download state as JSON

- **Documentation**
  - README.md - Getting started and overview
  - CLAUDE.md - Full 5-phase implementation plan
  - DEV_PANEL_GUIDE.md - Complete dev panel usage
  - STATE_EXPORT_GUIDE.md - State management guide
  - TROUBLESHOOTING.md - Common issues and solutions
  - PHASE1_COMPLETE.md - Phase 1 summary and metrics

#### Performance
- **Achieved:** 60fps with 625 hexes (exceeds 500 hex target)
- Frame time: ~16ms average
- Update time: <1ms
- Memory usage: 30-40MB
- Draw calls: 1 (optimal batching)

#### Technical
- Dependencies: Pixi.js v8.14.0 (runtime), Vite v7.1.12 (dev)
- Removed: stats.js (replaced with custom FPS counter)
- Build system: Vite with hot module replacement
- Module system: ES modules
- Browser support: Modern browsers with WebGL

#### Developer Experience
- All tools in one dev panel (no separate test pages)
- Clean UI by default (debug hidden, panel collapsed)
- Comprehensive keyboard shortcuts
- Real-time performance testing
- Built-in state inspector with JSON editor
- Console commands for power users

### Notes
- Phase 1 scope complete and tested
- Ready for Phase 2: Entity Component System
- No known bugs or performance issues
- All documentation up to date

---

## [1.1.0] - 2025-10-27

### Phase 2: Entity System with State Management - COMPLETE

#### Added
- **Entity Component System (ECS)**
  - EntityManager for entity lifecycle management
  - Component-based architecture (PositionComponent, RenderableComponent)
  - RenderSystem for entity rendering with sprite cleanup
  - Entity querying system for component-based operations

- **Unit Spawner**
  - Interactive click-to-place unit placement
  - 5 unit types: red/green/blue circles, yellow square, purple triangle
  - Clear all units functionality
  - Visual feedback (crosshair cursor when placing)

- **State Persistence**
  - Full entity serialization/deserialization
  - Component registry pattern for type safety
  - Save/load entities with state validation
  - Enhanced state inspection showing entity count

- **Debug & Monitoring**
  - Component inspector in debug overlay (shows first 3 entities with components)
  - System performance profiling (RenderSystem timing tracked)
  - Entity count display in debug overlay
  - Enhanced state viewer with entity information

#### Changed
- Reduced default grid from 25x25 to 15x10 (150 hexes) for better testing
- Updated CLAUDE.md with YAGNI principles and clean architecture guidelines
- Moved unit movement feature from Phase 2 to Phase 3 (pathfinding required)
- Improved state capture feedback to show both entities and hexes

#### Fixed
- Sprite cleanup when entities are destroyed (units now properly disappear)
- State inspection now includes entity component details

#### Performance
- **Target met:** 60fps with entities
- RenderSystem timing: <1ms for typical entity counts
- Sprite cleanup efficient (no memory leaks)
- Entity query performance: <0.1ms

#### Technical
- New files: EntityManager.js, Components.js, RenderSystem.js
- Architecture: Dependency injection, YAGNI compliant, clean separation of concerns
- TODOs properly scoped for future phases

#### Developer Experience
- Real-time component inspection in debug overlay
- System performance profiling built-in
- Enhanced console commands with entity info
- Clean code following established patterns

### Notes
- Phase 2 scope complete and tested
- Ready for Phase 3: Interaction and Pathfinding
- No known bugs or performance issues

---

## [1.2.0] - 2025-10-27

### Phase 2.5: Hex Inspector & Grid Improvements

#### Added
- **Hex Inspector Tooltip System**
  - HTML/CSS-based tooltip that follows mouse cursor
  - Shows hex coordinates (q, r), terrain type, color code, and move cost
  - Only active when debug overlay is enabled (F1)
  - Smart positioning (stays within screen bounds)
  - Extensible formatter pattern for future tooltip types (unit stats, action previews)
  - TODOs added for Phase 3 expansion (destroy method, formatter directory)

- **Terrain Visual Improvements**
  - Added terrain-specific stroke colors for better distinction
  - Brighter, more saturated fill colors
  - Thicker borders (width: 2) for clearer hex edges
  - Each terrain now has unique fill + stroke combination:
    - Grass: Bright green with dark green border
    - Water: Bright blue with deep blue border
    - Mountain: Light gray with dark gray border
    - Desert: Sandy yellow with orange border
    - Forest: Dark green with darker green border

#### Changed
- **Grid Layout Transformation**
  - Converted from flat-top to pointy-top hexagons
  - Changed from parallelogram to horizontal rectangle layout
  - Implemented offset→axial coordinate conversion for rectangular grids
  - q coordinates now go cleanly left-to-right
  - r coordinates now go cleanly top-to-bottom

- **Rendering Performance Optimization**
  - Refactored hex rendering to use `beginPath()` per hex
  - Reduced path commands from 16 to 9 per hex (~44% improvement)
  - Fixed terrain color mapping bug (fill colors now match terrain type)
  - Improved rendering clarity with higher alpha values (0.85 for fill, 0.9 for stroke)

#### Technical
- New files: `src/ui/TooltipManager.js` (149 lines)
- Updated: `HexGrid.js` (layout orientation, grid initialization, rendering)
- Updated: `HexEngine.js` (tooltip integration, mousemove handling)
- Updated: `DebugOverlay.js` (removed Pixi-based hex inspector)
- Updated: `index.html` (tooltip HTML/CSS)
- Updated: `CLAUDE.md` (Phase 4 expanded to include config-driven content system)

#### TODOs Added
- **Phase 3:** Tooltip destroy method, formatter directory split, decouple from debug overlay
- **Phase 4:** Data-driven TerrainRegistry, config-driven units/terrain/UI, texture support, theme system
- **Phase 5:** Group hexes by terrain type for batch rendering on large maps (>1000 hexes)

#### Performance
- **Achieved:** 60fps maintained with all improvements
- Rendering improvement: 44% fewer path commands per hex
- Tooltip rendering: No measurable performance impact (HTML/CSS, not in render loop)
- Memory: No increase (tooltip is single DOM element)

#### Developer Experience
- Hover any hex in debug mode to see full terrain information
- Tooltip automatically hides when dragging map
- Clean separation: tooltip system fully reusable for game features
- Architecture ready for Phase 3 unit tooltips

### Notes
- Phase 2.5 enhancements complete
- Grid now properly rectangular for better gameplay
- Terrain colors now match their types (bug fixed)
- Ready for Phase 3: Interaction and Pathfinding

---

## [Unreleased]

### Planned for Phase 3
- Unit selection (click to select)
- Unit movement on grid (click to move)
- A* pathfinding with terrain costs
- Movement range visualization
- Path preview on hover
- Attack range visualization

Target: <10ms pathfinding for 20 hex distance

---

[1.0.0]: https://github.com/yourusername/hex-game-engine/releases/tag/v1.0.0
