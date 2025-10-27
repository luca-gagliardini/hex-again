# Hex Game Engine - Phase 1 Complete

A performant, flexible hex-based game engine built with Pixi.js for browser-first deployment.

## 🚀 Deployment & CI/CD

This project uses GitHub Actions for automatic deployment:

**Production:**
- URL: https://luca-gagliardini.github.io/hex-again/
- Deploys automatically on push to `main`

**PR Preview Deployments:**
- Each PR gets its own preview URL: `https://luca-gagliardini.github.io/hex-again/pr-preview/pr-{number}/`
- Auto-updates on new commits to the PR
- Auto-cleanup when PR is closed/merged
- Bot comments on PR with preview link

### Development Workflow

**1. Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
# Make your changes
git add .
git commit -m "Add your feature"
git push -u origin feature/your-feature-name
```

**2. Open a Pull Request:**
- Go to GitHub and create a PR from your feature branch
- GitHub Actions will automatically build and deploy a preview
- Share the preview URL with your team for testing

**3. Update your PR:**
```bash
# Make more changes
git add .
git commit -m "Update feature"
git push
# Preview automatically updates!
```

**4. Merge (maintaining linear history):**
```bash
# Option A: Merge via GitHub UI (automatically uses fast-forward when possible)
# Click "Merge pull request" on GitHub

# Option B: Merge locally with rebase
git checkout main
git pull
git merge --ff-only feature/your-feature-name
git push
```

**Git History Policy:**
- ✅ Use **rebase** for a linear history (no merge commits)
- ✅ Squash related commits before merging
- ✅ Keep commit messages concise and descriptive
- ❌ No merge commits on main branch

### Squashing Commits

If you have multiple commits for one feature:
```bash
# Interactive rebase to squash commits
git rebase -i HEAD~3  # Squash last 3 commits

# Or reset and recommit
git reset --soft HEAD~3
git commit -m "Complete feature implementation"
git push --force
```

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
