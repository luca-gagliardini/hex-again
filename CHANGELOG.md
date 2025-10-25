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

## [Unreleased]

### Planned for Phase 2
- Entity Component System (ECS)
- Unit creation and management
- Movement system with pathfinding
- Full state restoration (currently validation only)
- Component inspector
- Turn management system

Target: 60fps with 50 units moving simultaneously

---

[1.0.0]: https://github.com/yourusername/hex-game-engine/releases/tag/v1.0.0
