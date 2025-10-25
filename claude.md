# Hex Grid Game Engine Implementation Plan

## Project Overview
We're building a flexible, performant hex-based game engine for browser-first deployment with future mobile compatibility. The engine should support rapid prototyping of different gameplay mechanics while maintaining good performance with ~100 units on screen.

## Core Principles
1. **Performance-First Development**: Every feature must maintain 60fps with 100 units
2. **Continuous Debugging**: Built-in state inspection, logging, and developer tools from day one
3. **Documentation-Driven**: Always check Pixi.js docs and other library documentation before implementation
4. **State Sharing**: JSON serialization available at every development phase for developer collaboration
5. **Modular Architecture**: Game rules separate from engine, enabling rapid gameplay experimentation
6. **Always help the user test the implementation steps**

## Technical Stack
- **Rendering**: Pixi.js (WebGL with Canvas fallback)
  - ALWAYS consult: https://pixijs.download/release/docs/index.html
  - Use latest stable version (v7.x or v8.x)
- **Hex Grid Logic**: Custom implementation with Honeycomb.js as reference
- **Build System**: Vite or Webpack with hot reload
- **State Management**: Custom immutable state system
- **Testing**: Vitest for unit tests, built-in performance profiler

## Architecture Overview

\`\`\`
Game Layer (Swappable gameplay rules)
├── Turn Rules
├── Action Point Rules  
└── Victory Conditions

Engine Core (Stable foundation)
├── HexGrid System
├── Entity Component System (ECS)
├── Pathfinding (A*)
├── Range/Influence Calculator
└── State Manager

Rendering Layer
├── Pixi.js Application
├── Viewport Controller (pan/zoom)
├── Sprite Manager
└── Debug Overlay

Developer Tools (Always Active)
├── Performance Monitor (FPS, draw calls)
├── State Inspector
├── Action Logger
└── Network Simulator (for future multiplayer)
\`\`\`

## Implementation Approach

### Phase 1: Foundation with Monitoring (Week 1)

**Objective**: Pixi.js setup with hex grid rendering and developer tools

**Implementation**:
\`\`\`javascript
// 1. Core application setup
class HexEngine {
  constructor(config) {
    // ALWAYS check Pixi.js docs for Application options
    this.app = new PIXI.Application({
      width: config.width,
      height: config.height,
      antialias: true,
      res[48;51;230;867;1840tolution: window.devicePixelRatio || 1
    });
    
    // Performance monitoring from day one
    this.stats = new Stats(); // Use stats.js library
    this.debugInfo = {
      unitCount: 0,
      visibleHexes: 0,
      drawCalls: 0,
      lastFrameTime: 0
    };
    
    // State management built-in
    this.stateManager = new StateManager();
    this.stateHistory = []; // For undo/replay
  }
}

// 2. Hex grid mathematics (axial coordinates)
class Hex {
  constructor(q, r) {
    this.q = q;
    this.r = r;
    this.s = -q - r; // Cubic coordinate for certain calculations
  }
  
  // Key: distance calculations should be optimized
  distanceTo(other) {
    return (Math.abs(this.q - other.q) + 
            Math.abs(this.q + this.r - other.q - other.r) + 
            Math.abs(this.r - other.r)) / 2;
  }
}

// 3. Debug overlay (always visible in dev mode)
class DebugOverlay {
  constructor(app) {
    this.container = new PIXI.Container();
    this.fpsText = new PIXI.Text('', {fontSize: 12, fill: 0x00FF00});
    this.stateText = new PIXI.Text('', {fontSize: 12, fill: 0x00FF00});
    // Position in top-left corner
    this.container.addChild(this.fpsText);
    this.container.addChild(this.stateText);
  }
  
  update(debugInfo) {
    this.fpsText.text = \`FPS: \${debugInfo.fps} | Draw Calls: \${debugInfo.drawCalls}\`;
    this.stateText.text = \`Units: \${debugInfo.unitCount} | Visible Hexes: \${debugInfo.visibleHexes}\`;
  }
}
\`\`\`

**Deliverables**:
- Hex grid rendering (different terrain types via colors)
- Pan/zoom controls (mouse & touch)
- FPS counter and performance metrics
- State export button (download as JSON)
- Basic responsive design

**Performance Target**: 60fps with 500 empty hexes rendered

### Phase 2: Entity System with State Management (Week 2)

**Objective**: ECS implementation with full state serialization

**Implementation**:
\`\`\`javascript
// Component examples (pure data)
class PositionComponent {
  constructor(q, r) {
    this.q = q;
    this.r = r;
  }
  
  serialize() {
    return {type: 'position', q: this.q, r: this.r};
  }
  
  static deserialize(data) {
    return new PositionComponent(data.q, data.r);
  }
}

// Entity manager with built-in performance tracking
class EntityManager {
  constructor() {
    this.entities = new Map();
    this.componentsByType = new Map(); // For fast queries
    this.entityPool = []; // Object pooling for performance
  }
  
  createEntity(components = []) {
    const id = this.entityPool.pop() || generateId();
    const entity = {id, components: new Map()};
    
    // Track component distribution for performance analysis
    components.forEach(comp => {
      entity.components.set(comp.constructor.name, comp);
      this.trackComponent(comp.constructor.name);
    });
    
    this.entities.set(id, entity);
    return id;
  }
  
  // Performance-conscious querying
  getEntitiesWithComponents(...componentTypes) {
    // Use cached queries when possible
    const cacheKey = componentTypes.join(',');
    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey);
    }
    // ... query implementation
  }
}

// State manager for collaboration
class StateManager {
  captureState() {
    return {
      timestamp: Date.now(),
      turn: this.currentTurn,
      entities: this.entityManager.serialize(),
      grid: this.hexGrid.serialize(),
      checksum: this.calculateChecksum() // For validation
    };
  }
  
  loadState(jsonString) {
    const state = JSON.parse(jsonString);
    // Validate checksum
    // Deserialize entities
    // Restore grid
    return state;
  }
}
\`\`\`

**Deliverables**:
- Create/destroy units via UI
- Move units on grid (click to select, click to move)
- Component inspector in debug panel
- Save/load game state
- Performance profiling per system

**Performance Target**: 60fps with 50 units moving simultaneously

### Phase 3: Interaction and Pathfinding (Week 3)

**Objective**: Smart pathfinding with visual feedback and terrain costs

**Implementation Focus**:
\`\`\`javascript
// A* pathfinding optimized for hex grids
class HexPathfinder {
  constructor(grid) {
    this.grid = grid;
    this.openSet = new BinaryHeap(); // Priority queue for performance
    this.closedSet = new Set();
    this.pathCache = new LRUCache(100); // Cache recent paths
  }
  
  findPath(start, goal, unit) {
    // Check cache first
    const cacheKey = \`\${start.q},\${start.r}-\${goal.q},\${goal.r}-\${unit.type}\`;
    if (this.pathCache.has(cacheKey)) {
      return this.pathCache.get(cacheKey);
    }
    
    // A* implementation with early exit optimization
    // ...
    
    // Cache the result
    this.pathCache.set(cacheKey, path);
    return path;
  }
}

// Visual feedback system
class RangeDisplay {
  constructor(pixiApp) {
    this.graphics = new PIXI.Graphics();
    this.rangeSprites = []; // Pool of sprites for performance
  }
  
  showMovementRange(unit, hexGrid) {
    // Use sprite pooling to avoid creating/destroying objects
    const range = this.calculateReachableHexes(unit);
    range.forEach(hex => {
      const sprite = this.getPooledSprite();
      sprite.position = hexGrid.hexToPixel(hex);
      sprite.alpha = 0.3;
      sprite.tint = 0x00FF00;
    });
  }
}
\`\`\`

**Deliverables**:
- A* pathfinding with terrain costs
- Movement range visualization
- Attack range visualization  
- Path preview on hover
- Pathfinding performance metrics

**Performance Target**: <10ms pathfinding for 20 hex distance

### Phase 4: Game Logic Systems (Week 4)

**Objective**: Flexible turn management and combat systems

**Implementation Focus**:
\`\`\`javascript
// Flexible turn system supporting both modes
class TurnManager {
  constructor(mode = 'sequential') {
    this.mode = mode;
    this.actionQueue = [];
    this.turnHistory = [];
    this.currentTurn = 0;
  }
  
  // Command pattern for all actions (enables undo/replay)
  executeAction(action) {
    // Validate action
    if (!this.validateAction(action)) return false;
    
    // Record for history
    this.turnHistory[this.currentTurn].push(action);
    
    // Execute based on mode
    if (this.mode === 'sequential') {
      action.execute();
      this.checkEndTurn();
    } else {
      this.actionQueue.push(action);
    }
    
    return true;
  }
  
  // For simultaneous mode
  resolveSimultaneousTurn() {
    // Sort actions by priority
    this.actionQueue.sort((a, b) => a.priority - b.priority);
    
    // Execute all actions
    this.actionQueue.forEach(action => action.execute());
    
    // Clear queue
    this.actionQueue = [];
    this.currentTurn++;
  }
}

// Action point system
class ActionPointManager {
  constructor(config) {
    this.mode = config.mode; // 'global' or 'per-unit'
    this.points = new Map();
    this.costs = config.costs; // Action costs configuration
  }
  
  canAfford(entity, action) {
    const cost = this.costs[action.type] || 0;
    const available = this.mode === 'global' ? 
      this.points.get('player') : 
      this.points.get(entity);
    return available >= cost;
  }
}
\`\`\`

**Deliverables**:
- Turn management with both sequential and simultaneous modes
- Action point allocation and spending
- Basic combat resolution
- Turn history with replay capability
- Action validation system

**Performance Target**: <5ms per action resolution

### Phase 5: Optimization and Polish (Week 5)

**Objective**: Performance optimization and quality-of-life improvements

**Optimization Focus**:
\`\`\`javascript
// Culling system for large maps
class ViewportCuller {
  constructor(viewport) {
    this.viewport = viewport;
    this.visibleHexes = new Set();
    this.lastBounds = null;
  }
  
  update() {
    const bounds = this.viewport.getVisibleBounds();
    
    // Only recalculate if viewport changed significantly
    if (this.boundsChanged(bounds, this.lastBounds)) {
      this.visibleHexes.clear();
      // Calculate visible hexes
      this.hexGrid.getHexesInRect(bounds).forEach(hex => {
        this.visibleHexes.add(hex.key);
      });
      this.lastBounds = bounds;
    }
    
    return this.visibleHexes;
  }
}

// Sprite batching for units
class UnitRenderer {
  constructor(pixiApp) {
    // Use ParticleContainer for similar units
    this.containers = new Map(); // One per unit type
    this.spritePool = new Map();
  }
  
  renderUnits(units, visibleHexes) {
    units.forEach(unit => {
      // Skip if not visible
      if (!visibleHexes.has(unit.hex.key)) return;
      
      // Get or create sprite from pool
      const sprite = this.getPooledSprite(unit.type);
      sprite.position = this.hexToPixel(unit.hex);
      
      // Add to appropriate container for batching
      this.containers.get(unit.type).addChild(sprite);
    });
  }
}

// Performance profiler
class PerformanceProfiler {
  constructor() {
    this.metrics = new Map();
    this.frameBuffer = new Array(60); // Rolling 60-frame average
  }
  
  startMeasure(label) {
    this.metrics.set(label, performance.now());
  }
  
  endMeasure(label) {
    const duration = performance.now() - this.metrics.get(label);
    console.debug(\`\${label}: \${duration.toFixed(2)}ms\`);
    return duration;
  }
  
  getReport() {
    // Generate performance report for debugging
    return {
      fps: this.calculateFPS(),
      systemTimes: Array.from(this.metrics.entries()),
      recommendations: this.getOptimizationRecommendations()
    };
  }
}
\`\`\`

**Deliverables**:
- Viewport culling for large maps
- Sprite batching and object pooling
- Performance profiler with recommendations
- Memory usage monitor
- Optimized state serialization

**Performance Target**: 
- 60fps with 100 units on screen
- <50MB memory usage
- <100ms save/load time

## File Structure

\`\`\`
/src
  /engine
    /core
      HexGrid.js         # Hex mathematics and grid management
      EntityManager.js   # ECS implementation
      StateManager.js    # State serialization/deserialization
    /systems
      MovementSystem.js  # Handles unit movement
      CombatSystem.js    # Combat resolution
      ResourceSystem.js  # Resource gathering/management
    /pathfinding
      AStar.js          # A* implementation
      PathCache.js      # Path caching for performance
    /rendering
      Renderer.js       # Main Pixi.js wrapper
      ViewportController.js # Pan/zoom handling
      SpritePool.js     # Object pooling
  /game
    /config
      units.json        # Unit definitions
      terrain.json      # Terrain types and costs
      rules.json        # Game rules configuration
    /actions
      MoveAction.js     # Movement command
      AttackAction.js   # Attack command
      BuildAction.js    # Building command
  /debug
    DebugOverlay.js     # Performance metrics display
    StateInspector.js   # State debugging tools
    NetworkSimulator.js # For testing multiplayer locally
  /ui
    HUD.js             # Heads-up display
    UnitPanel.js       # Unit information panel
  main.js              # Application entry point
  
/assets
  /sprites
  /audio
  /fonts
  
/tests
  /unit              # Unit tests
  /performance       # Performance benchmarks
  /integration       # Integration tests
\`\`\`

## Development Guidelines

### Performance Checklist (Check after each feature)
- [ ] Maintains 60fps with 100 units?
- [ ] No memory leaks in Chrome DevTools?
- [ ] Pathfinding under 10ms?
- [ ] State serialization under 100ms?
- [ ] Draw calls under 50?

### Documentation Requirements
- ALWAYS check Pixi.js documentation before implementing rendering features
- Document performance implications in code comments
- Maintain a performance log with measurements after each feature

### State Management Rules
1. Every game state must be serializable to JSON
2. Include checksums for state validation
3. State files should include version numbers
4. Implement state migration for version compatibility

### Code Patterns to Follow
\`\`\`javascript
// GOOD: Object pooling for frequently created/destroyed objects
const sprite = this.spritePool.get() || new PIXI.Sprite();

// BAD: Creating new objects every frame
const sprite = new PIXI.Sprite();

// GOOD: Cache expensive calculations
const cacheKey = \`\${start}-\${end}\`;
if (this.pathCache.has(cacheKey)) return this.pathCache.get(cacheKey);

// BAD: Recalculating every time
const path = this.calculatePath(start, end);

// GOOD: Batch similar operations
this.particleContainer.addChild(...sprites);

// BAD: Individual operations in loops
sprites.forEach(s => this.container.addChild(s));
\`\`\`

## Testing Strategy

### Performance Tests (Automated)
\`\`\`javascript
describe('Performance Benchmarks', () => {
  test('Renders 100 units at 60fps', async () => {
    const engine = new HexEngine();
    for (let i = 0; i < 100; i++) {
      engine.createUnit({x: i % 10, y: Math.floor(i / 10)});
    }
    
    const fps = await measureFPS(engine, 1000); // Measure for 1 second
    expect(fps).toBeGreaterThanOrEqual(60);
  });
  
  test('Pathfinding completes under 10ms', () => {
    const start = performance.now();
    const path = pathfinder.findPath({q: 0, r: 0}, {q: 20, r: 20});
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(10);
  });
});
\`\`\`

### State Validation Tests
\`\`\`javascript
test('State serialization preserves game state', () => {
  const originalState = engine.captureState();
  const json = JSON.stringify(originalState);
  const loadedState = engine.loadState(json);
  
  expect(loadedState.checksum).toBe(originalState.checksum);
  expect(loadedState.entities.length).toBe(originalState.entities.length);
});
\`\`\`

## Quick Start Commands

\`\`\`bash
# Setup project
npm init vite@latest hex-game -- --template vanilla
cd hex-game
npm install pixi.js stats.js

# Development with hot reload
npm run dev

# Run performance tests
npm run test:performance

# Build for production
npm run build

# Profile memory usage
npm run profile:memory
\`\`\`

## Performance Monitoring Dashboard

Always visible in development mode:
- FPS counter (green >55, yellow 30-55, red <30)
- Unit count
- Visible hex count  
- Draw calls
- Memory usage
- Frame time breakdown (update vs render)
- Network latency simulator (for future multiplayer)

## Notes for Developers

1. **Performance is a feature**: Never merge code that drops below 60fps with 100 units
2. **State first**: Ensure state serialization works before adding new features
3. **Document measurements**: Record performance metrics in PR descriptions
4. **Test on weak hardware**: Use Chrome DevTools CPU throttling
5. **Mobile from day one**: Test touch controls regularly

## Future Expansions (Already Considered in Architecture)

- Multiplayer support (deterministic simulation ready)
- Mobile optimization (touch controls implemented)
- Fog of war (visibility system hooks in place)
- AI players (action system supports any controller)
- Procedural map generation (grid system is generation-agnostic)
- Different hex layouts (pointy-top vs flat-top)

## Success Metrics

- [ ] 60fps with 100 units consistently
- [ ] <100ms state save/load
- [ ] <10ms pathfinding for typical paths
- [ ] <50 draw calls per frame
- [ ] Zero memory leaks over 1-hour session
- [ ] Supports maps up to 100x100 hexes
- [ ] Works on 5-year-old mobile devices

---

Remember: The goal is a flexible engine for rapid gameplay prototyping. Performance and debugging capabilities must be built-in from the start, not added later.
