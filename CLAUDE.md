# Hex Grid Game Engine Implementation Plan

## Project Overview
We're building a flexible, performant hex-based game engine for browser-first deployment with future mobile compatibility. The engine should support rapid prototyping of different gameplay mechanics while maintaining good performance with ~100 units on screen.

## Core Principles

### Development Philosophy
1. **YAGNI (You Aren't Gonna Need It)**: Only implement what's needed RIGHT NOW for the current feature
   - No "future-proofing" fields or methods
   - No premature optimization
   - It's OK to iterate and refactor - commit only what's necessary

2. **Extensible Architecture**: Use dependency injection and clean patterns for future flexibility
   - Constructor injection for dependencies
   - Interface-like patterns (duck typing)
   - Separation of concerns
   - But NEVER add unused parameters "for later"

3. **Tech Debt Tracking**: Note issues immediately, fix them in cleanup phase
   - Add `// TODO(phase X):` comments for known issues
   - Don't let tech debt pile up silently
   - Document WHY something is suboptimal if you can't fix it now
   - Create a mental/written list of cleanup tasks after feature implementation

4. **Iterate Cleanly**: Refactor during development, but commit only the final clean state
   - Don't create tomorrow's problems
   - Don't solve tomorrow's problems
   - Code should be readable and maintainable for what it DOES, not what it MIGHT do

5. **Self-Improvement Through Reflection**: Learn from each interaction
   - During cleanup phase, reflect on what went well and what didn't
   - Identify where instructions were misunderstood
   - Propose CLAUDE.md updates to prevent future mistakes
   - Take initiative in improving development workflow based on user feedback

### Technical Principles
6. **Performance-First Development**: Every feature must maintain 60fps with 100 units
7. **Continuous Debugging**: Built-in state inspection, logging, and developer tools from day one
8. **Documentation-Driven**: Always check Pixi.js docs and other library documentation before implementation
9. **State Sharing**: JSON serialization available at every development phase for developer collaboration
10. **Modular Architecture**: Game rules separate from engine, enabling rapid gameplay experimentation
11. **Always help the user test the implementation steps**

## Development Workflow (CI/CD)

### IMPORTANT: Always Follow This Workflow for New Features

When implementing new features, ALWAYS follow this workflow:

**1. Create Feature Branch**
```bash
git checkout -b feature/feature-name
# or
git checkout -b fix/bug-name
```

**2. Implement & Test Locally**
- Make incremental commits as you develop (ONE-LINER commit messages only!)
- Update CHANGELOG.md as features are completed
- Test thoroughly with `npm run dev`
- Commit often with descriptive messages
- NEVER squash until user explicitly instructs

**3. Deploy PR Preview for Review**
- Push feature branch: `git push -u origin feature/feature-name`
- Create Pull Request on GitHub
- GitHub Actions will automatically:
  - Build the project
  - Deploy preview to: `https://luca-gagliardini.github.io/hex-again/pr-preview/pr-{number}/`
  - Post comment on PR with preview URL
- Share preview URL with team for testing
- Make additional commits if needed (preview auto-updates)

**4. Cleanup Phase (BEFORE Squashing)**
IMPORTANT: Only proceed when user explicitly says "let's clean up" or similar:
- Review all code against initial scope - is everything delivered?
- Check for tech debt items - add TODO comments for future phases
- Check for potential refactoring - note in code or propose to user
- Update CHANGELOG.md with all changes (if not done incrementally)
- Reflect on development process:
  - What user feedback did I receive?
  - Where did I misunderstand instructions?
  - What patterns should I follow better?
- Propose CLAUDE.md updates based on learnings
- Wait for user approval before proceeding

**5. Squash Commits Before Merge**
ONLY when user explicitly instructs:
```bash
# Squash all feature commits into one clean commit
git reset --soft main
git commit -m "One-liner description of complete feature"
git push --force
```
IMPORTANT: Commit message MUST be one line only!

**6. Merge to Main**
- Merge the PR on GitHub (or locally with `git merge --ff-only`)
- Preview deployment auto-cleans up
- Production deploys automatically to `https://luca-gagliardini.github.io/hex-again/`

### Git History Rules
- ✅ **Linear history only** - use rebase, not merge commits
- ✅ **One commit per feature** on main - squash before merging
- ✅ **ONE-LINER commit messages** - brief, descriptive, single line only
- ✅ **Details in CHANGELOG.md** - never in commit message
- ✅ **Wait for user** - never assume we're done, user decides when to squash
- ❌ **No merge commits** on main branch
- ❌ **No work-in-progress commits** on main
- ❌ **No multi-line commit messages** - use CHANGELOG.md instead

### PR Preview URLs
- Production: `https://luca-gagliardini.github.io/hex-again/`
- PR Previews: `https://luca-gagliardini.github.io/hex-again/pr-preview/pr-{number}/`
- Previews auto-deploy on PR creation/update
- Previews auto-cleanup on PR close/merge

## Technical Stack
- **Rendering**: Pixi.js (WebGL with Canvas fallback)
  - ALWAYS consult: https://pixijs.download/release/docs/index.html
  - Use latest stable version (v7.x or v8.x)
- **Hex Grid Logic**: Custom implementation with Honeycomb.js as reference
- **Build System**: Vite with hot reload
- **State Management**: Custom immutable state system
- **Testing**: Vitest for unit tests, built-in performance profiler

## Architecture Overview

```
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
└── Action Logger
```

## Implementation Phases

### Phase 1: Foundation with Monitoring ✅ COMPLETE

**Objective**: Pixi.js setup with hex grid rendering and developer tools

**Deliverables**:
- Hex grid rendering (different terrain types via colors)
- Pan/zoom controls (mouse & touch)
- FPS counter and performance metrics
- Basic responsive design

**Performance Target**: 60fps with 500 empty hexes rendered

---

### Phase 2: Entity System with State Management ✅ COMPLETE

**Objective**: ECS implementation with full state serialization

**Deliverables**:
- Create/destroy units via UI
- Component inspector in debug panel
- Save/load game state
- Performance profiling per system

**Performance Target**: 60fps with 50 units

**Key Concepts**:
- Components are pure data structures
- Systems operate on entities with specific components
- EntityManager handles entity lifecycle
- StateManager provides JSON serialization/deserialization
- All state changes should be serializable for collaboration

---

### Phase 3: Interaction and Pathfinding

**Objective**: Smart pathfinding with visual feedback and terrain costs

**Deliverables**:
- Unit selection (click to select)
- Unit movement on grid (click to move)
- A* pathfinding with terrain costs
- Movement range visualization
- Attack range visualization
- Path preview on hover
- Pathfinding performance metrics

**Performance Target**: <10ms pathfinding for 20 hex distance

---

### Phase 4: Game Logic and Content Systems

**Objective**: Flexible gameplay systems with data-driven content configuration

**Deliverables**:
- Turn management with both sequential and simultaneous modes
- Action point allocation and spending
- Basic combat resolution
- Turn history with replay capability
- Action validation system
- **Data-driven content system**:
  - Extract terrain config to TerrainRegistry
  - Extract unit types to UnitRegistry
  - Config-driven visual themes (colors, sprites, patterns)
  - Support rapid design iteration without code changes

**Performance Target**: <5ms per action resolution

---

### Phase 5: Optimization and Polish

**Objective**: Performance optimization and quality-of-life improvements

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

```
/src
  /engine
    /core
      HexGrid.js         # Hex mathematics and grid management
      EntityManager.js   # ECS implementation
      StateManager.js    # State serialization/deserialization
    /systems
      RenderSystem.js    # Handles rendering entities
      MovementSystem.js  # Handles unit movement
    /rendering
      Renderer.js        # Main Pixi.js wrapper
      Viewport.js        # Pan/zoom handling
  /debug
    DebugOverlay.js      # Performance metrics display
    StateInspector.js    # State debugging tools
  /ui
    UI.js                # User interface elements
  main.js                # Application entry point

/assets
  /sprites

/tests
  /unit                  # Unit tests
  /performance           # Performance benchmarks
```

## Development Guidelines

### Performance Checklist (Check after each feature)
- [ ] Maintains 60fps with 100 units?
- [ ] No memory leaks in Chrome DevTools?
- [ ] Pathfinding under 10ms? (when applicable)
- [ ] State serialization under 100ms?
- [ ] Draw calls reasonable?

### Documentation Requirements
- ALWAYS check Pixi.js documentation before implementing rendering features
- Document performance implications in code comments
- Add TODO comments for tech debt discovered during implementation
- Note cleanup tasks for future phases

### State Management Rules
1. Every game state must be serializable to JSON
2. Include checksums for state validation
3. State should be version-aware for future migrations

### Code Patterns to Follow
```javascript
// GOOD: Dependency injection
class EntityManager {
  constructor(renderer) {
    this.renderer = renderer; // Injected dependency
  }
}

// BAD: Direct coupling
class EntityManager {
  constructor() {
    this.renderer = new Renderer(); // Hard-coded dependency
  }
}

// GOOD: Only what's needed
class Entity {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
  }
}

// BAD: Future-proofing
class Entity {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.speed = null; // "We might need this later"
    this.inventory = []; // Not used yet
    this.level = 1; // Unused field
  }
}
```

## Testing Strategy

### Unit Tests
- Test core logic (hex math, pathfinding algorithms)
- Test state serialization/deserialization
- Test entity manager operations

### Performance Tests
```javascript
describe('Performance Benchmarks', () => {
  test('Maintains 60fps with 100 units', async () => {
    // Implementation
  });

  test('State serialization under 100ms', () => {
    // Implementation
  });
});
```

## Quick Start Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Run tests (when implemented)
npm run test

# Preview production build
npm run preview
```

## Performance Monitoring Dashboard

Always visible in development mode:
- FPS counter (green >55, yellow 30-55, red <30)
- Unit count
- Visible hex count
- Draw calls
- Memory usage
- Frame time breakdown (update vs render)

## Success Metrics

- [ ] 60fps with 100 units consistently
- [ ] <100ms state save/load
- [ ] <10ms pathfinding for typical paths
- [ ] Zero memory leaks over 1-hour session
- [ ] Supports maps up to 100x100 hexes
- [ ] Works on 5-year-old mobile devices

---

**Remember**: Build only what you need, when you need it. Use extensible patterns that allow future growth without premature optimization. Track tech debt openly and address it systematically.
