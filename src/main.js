import { HexEngine } from './engine/core/HexEngine.js';
import { PositionComponent, RenderableComponent } from './engine/core/Components.js';
import { applyThemeToDOM, DefaultTheme } from './config/ThemeDefaults.js';

/**
 * Main entry point for the Hex Game Engine
 */

let engine = null;

async function init() {
  try {
    console.log('Initializing Hex Game Engine...');

    // Apply theme to document body (must be done before engine creation)
    applyThemeToDOM();

    // Get container
    const container = document.getElementById('game-container');

    // Create and initialize engine
    engine = new HexEngine({
      width: window.innerWidth,
      height: window.innerHeight,
      hexSize: 30,
      gridWidth: 15,
      gridHeight: 10,
      backgroundColor: 0x1a1a1a
    });

    await engine.initialize(container);

    // Start game loop
    engine.start();

    // Add console helpers
    addConsoleHelpers(engine);

    // Setup UI controls
    setupControls();

    // Setup unit spawning
    setupUnitSpawner(engine);

    // Setup theme UI
    setupThemeUI();

    // Populate theme inputs with current theme
    populateThemeInputs(DefaultTheme);

    console.log('Engine started successfully!');
    console.log('Controls: Mouse drag to pan, scroll to zoom');

  } catch (error) {
    console.error('Failed to initialize engine:', error);
  }
}

/**
 * Setup UI control handlers
 */
function setupControls() {
  // Import state file input
  const importInput = document.getElementById('import-state');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonString = event.target.result;
          const state = engine.stateManager.loadState(jsonString);

          // Restore state to engine
          engine.restoreState(state);

          // Show in textarea
          const textarea = document.getElementById('state-json');
          if (textarea) {
            textarea.value = JSON.stringify(state, null, 2);
          }

          console.log('State loaded and restored successfully:', state);
          addPerfResult(`State loaded: ${state.entities.length} entities, ${state.grid.hexes.length} hexes`, 'info');
        } catch (error) {
          console.error('Failed to load state:', error);
          addPerfResult(`Error: ${error.message}`, 'fail');
        }
      };
      reader.readAsText(file);

      // Clear input so same file can be loaded again
      e.target.value = '';
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (!engine) return;

    switch(e.key) {
      case 'F1':
        e.preventDefault();
        toggleDebug();
        break;

      case 'F2':
        e.preventDefault();
        toggleDevPanel();
        break;

      case 'F3':
        e.preventDefault();
        toggleThemePanel();
        break;

      case 'd':
      case 'D':
        toggleDetail();
        break;

      case 'r':
      case 'R':
        resetViewport();
        break;

      case 'p':
      case 'P':
        printPerf();
        break;

      case 'e':
      case 'E':
        exportState();
        break;
    }
  });

  console.log('✓ Controls initialized');
  console.log('');
  console.log('=== Keyboard Shortcuts ===');
  console.log('  F1 - Toggle debug overlay');
  console.log('  F2 - Toggle dev panel');
  console.log('  F3 - Toggle theme panel');
  console.log('   D - Toggle detailed debug mode');
  console.log('   R - Reset viewport');
  console.log('   E - Export state');
  console.log('   P - Print performance report');
  console.log('');
  console.log('=== Console Commands ===');
  console.log('  hexEngine.getState()      - Get current state object');
  console.log('  hexEngine.inspectState()  - Pretty print state');
  console.log('  hexEngine.exportState()   - Download state as JSON');
  console.log('');
  console.log('Tip: Press F2 for dev panel, F3 for theme editor');
}

// ============================================
// Global UI Functions (called from HTML)
// ============================================

window.toggleDevPanel = function() {
  const panel = document.getElementById('dev-panel');
  panel.classList.toggle('collapsed');
};

window.toggleThemePanel = function() {
  const panel = document.getElementById('theme-panel');
  panel.classList.toggle('collapsed');
};

window.toggleDebug = function() {
  if (engine) {
    engine.debugOverlay.toggle();

    // Update standalone debug button state
    const debugBtn = document.getElementById('debug-toggle-btn');
    const debugBtnText = document.getElementById('debug-btn-text');
    if (engine.debugOverlay.visible) {
      debugBtn.classList.add('active');
      debugBtnText.textContent = 'Debug: ON';
    } else {
      debugBtn.classList.remove('active');
      debugBtnText.textContent = 'Debug: OFF';
    }
  }
};

window.toggleDetail = function() {
  if (engine) {
    engine.debugOverlay.toggleDetailedMode();
  }
};

window.resetViewport = function() {
  if (engine) {
    engine.viewportPos.x = engine.config.width / 2;
    engine.viewportPos.y = engine.config.height / 2;
    engine.scale = 1;
    engine.updateViewportTransform();
    console.log('Viewport reset');
  }
};

window.printPerf = function() {
  if (engine) {
    console.log('Performance Report:', engine.getPerformanceReport());
  }
};

window.exportState = function() {
  if (engine) {
    engine.exportState();
    console.log('State exported');
  }
};

window.toggleStateViewer = function() {
  const viewer = document.getElementById('state-viewer');
  const btn = document.getElementById('toggle-state-viewer');
  viewer.classList.toggle('active');
  btn.classList.toggle('active');
};

window.captureState = function() {
  if (!engine) return;

  const state = engine.getState();
  const textarea = document.getElementById('state-json');
  textarea.value = JSON.stringify(state, null, 2);

  addPerfResult(`State captured: ${state.entities.length} entities, ${state.grid.hexes.length} hexes`, 'info');
  console.log('State captured to viewer');
};

window.loadStateFromTextarea = function() {
  const textarea = document.getElementById('state-json');
  const jsonString = textarea.value.trim();

  if (!jsonString) {
    addPerfResult('No state in editor', 'warn');
    return;
  }

  try {
    const state = engine.stateManager.loadState(jsonString);
    engine.restoreState(state);
    addPerfResult(`State loaded: v${state.version}, ${state.entities.length} entities`, 'pass');
    console.log('State loaded and restored:', state);
  } catch (error) {
    addPerfResult(`Invalid state: ${error.message}`, 'fail');
    console.error('Failed to load state:', error);
  }
};

window.clearState = function() {
  const textarea = document.getElementById('state-json');
  textarea.value = '';
  addPerfResult('State editor cleared', 'info');
};

window.togglePerfTest = function() {
  const test = document.getElementById('perf-test');
  const btn = document.getElementById('toggle-perf-test');
  test.classList.toggle('active');
  btn.classList.toggle('active');
};

window.runPerfTest = async function(hexCount) {
  addPerfResult(`Starting test with ${hexCount} hexes...`, 'info');

  // Calculate grid size
  const gridSize = Math.ceil(Math.sqrt(hexCount));

  // Temporarily update engine grid
  const originalWidth = engine.config.gridWidth;
  const originalHeight = engine.config.gridHeight;

  engine.config.gridWidth = gridSize;
  engine.config.gridHeight = gridSize;

  // Recreate grid
  engine.hexGrid = new (await import('./engine/core/HexGrid.js')).HexGrid({
    size: engine.config.hexSize,
    width: gridSize,
    height: gridSize
  });
  engine.hexGrid.render();

  // Update viewport
  engine.viewport.removeChildren();
  engine.viewport.addChild(engine.hexGrid.container);

  const actualHexes = engine.hexGrid.getHexCount();
  addPerfResult(`Grid: ${gridSize}x${gridSize} = ${actualHexes} hexes`, 'info');

  // Wait for frames to stabilize
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Measure FPS over 2 seconds
  const fps = await measureFPS(2000);
  const report = engine.getPerformanceReport();

  const passed = fps >= 60;
  addPerfResult(`FPS: ${fps.toFixed(1)} (target: 60)`, passed ? 'pass' : (fps >= 30 ? 'warn' : 'fail'));
  addPerfResult(`Frame time: ${report.avgFrameTime.toFixed(2)}ms`, report.avgFrameTime <= 16.67 ? 'pass' : 'warn');

  // Restore original grid
  engine.config.gridWidth = originalWidth;
  engine.config.gridHeight = originalHeight;
};

window.clearPerfResults = function() {
  const results = document.getElementById('perf-results');
  results.innerHTML = '';
};

function addPerfResult(message, type = 'info') {
  const results = document.getElementById('perf-results');
  const entry = document.createElement('div');
  entry.className = `test-result ${type}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  results.appendChild(entry);
  results.scrollTop = results.scrollHeight;
}

async function measureFPS(duration) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    let frameCount = 0;

    function countFrame() {
      frameCount++;
      const elapsed = performance.now() - startTime;

      if (elapsed < duration) {
        requestAnimationFrame(countFrame);
      } else {
        const fps = (frameCount / elapsed) * 1000;
        resolve(fps);
      }
    }

    requestAnimationFrame(countFrame);
  });
}

/**
 * Setup unit spawning system
 */
let pendingUnitSpawn = null; // {shape, color}

function setupUnitSpawner(engine) {
  // Set up hex click handler
  engine.onHexClick = (hex) => {
    if (pendingUnitSpawn) {
      const { shape, color } = pendingUnitSpawn;

      // Create entity with Position and Renderable components
      const entityId = engine.entityManager.createEntity([
        new PositionComponent(hex.q, hex.r),
        new RenderableComponent(color, shape)
      ]);

      console.log(`Spawned ${shape} unit at (${hex.q}, ${hex.r}) - Entity ID: ${entityId}`);

      // Clear pending spawn
      pendingUnitSpawn = null;
      updateSpawnerUI(false);
    }
  };
}

function updateSpawnerUI(active) {
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.cursor = active ? 'crosshair' : 'grab';
  }
}

// Global function for HTML buttons
window.spawnUnit = function(shape, color) {
  if (!engine) return;

  pendingUnitSpawn = { shape, color };
  updateSpawnerUI(true);

  const shapeNames = { circle: 'circle', square: 'square', triangle: 'triangle' };
  console.log(`Click a hex to place ${shapeNames[shape]} unit`);
};

window.clearAllUnits = function() {
  if (!engine) return;

  const count = engine.entityManager.getEntityCount();
  engine.entityManager.clear();
  pendingUnitSpawn = null;
  updateSpawnerUI(false);

  console.log(`Cleared ${count} units`);
};

// ============================================
// Theme UI Functions
// ============================================

/**
 * Setup theme editor UI handlers
 */
function setupThemeUI() {
  // Wire up Apply button
  const applyBtn = document.getElementById('apply-theme');
  if (applyBtn) {
    applyBtn.addEventListener('click', applyTheme);
  }

  // Wire up Reset button
  const resetBtn = document.getElementById('reset-theme');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetTheme);
  }

  // Wire up Export button
  const exportBtn = document.getElementById('export-theme');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportTheme);
  }

  // Wire up Import input
  const importInput = document.getElementById('import-theme');
  if (importInput) {
    importInput.addEventListener('change', handleThemeImport);
  }

  console.log('✓ Theme UI initialized');
}

/**
 * Apply theme changes from UI inputs
 */
window.applyTheme = function() {
  if (!engine) return;

  // Read values from UI inputs
  const themeConfig = {
    palette: {
      background: hexToNumber(document.getElementById('color-background').value),
      backgroundHex: document.getElementById('color-background').value,
    },
    hexStyle: {
      strokeWidth: parseInt(document.getElementById('stroke-width').value) || 4,
      strokeColor: hexToNumber(document.getElementById('color-stroke').value),
    },
    terrain: {
      GRASS: {
        color: hexToNumber(document.getElementById('color-grass').value),
      },
      WATER: {
        color: hexToNumber(document.getElementById('color-water').value),
      },
      MOUNTAIN: {
        color: hexToNumber(document.getElementById('color-mountain').value),
      },
      DESERT: {
        color: hexToNumber(document.getElementById('color-desert').value),
      },
      FOREST: {
        color: hexToNumber(document.getElementById('color-forest').value),
      }
    }
  };

  // Apply theme
  engine.updateTheme(themeConfig);
  console.log('Theme applied:', themeConfig);
};

/**
 * Reset theme to defaults
 */
window.resetTheme = function() {
  if (!engine) return;

  // Reset using standard theme update flow
  engine.themeManager.resetTheme(DefaultTheme);
  engine.updateTheme(DefaultTheme);

  // Update UI inputs to match defaults
  populateThemeInputs(DefaultTheme);

  console.log('Theme reset to defaults');
};

/**
 * Export current theme as JSON file
 */
window.exportTheme = function() {
  if (!engine) return;

  const theme = engine.themeManager.exportTheme();
  const jsonString = JSON.stringify(theme, null, 2);

  // Create download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `theme-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  console.log('Theme exported');
};

/**
 * Handle theme import from file
 */
function handleThemeImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const themeConfig = JSON.parse(event.target.result);

      // Import and apply theme using standard update flow
      engine.themeManager.importTheme(themeConfig);
      engine.updateTheme(themeConfig);

      // Update UI inputs to match imported theme
      populateThemeInputs(themeConfig);
      console.log('Theme imported:', themeConfig);
    } catch (error) {
      console.error('Failed to import theme:', error);
    }
  };
  reader.readAsText(file);

  // Clear input
  e.target.value = '';
}

/**
 * Populate theme UI inputs with values
 */
function populateThemeInputs(theme) {
  document.getElementById('color-background').value = theme.palette.backgroundHex;
  document.getElementById('color-stroke').value = numberToHex(theme.hexStyle.strokeColor);
  document.getElementById('stroke-width').value = theme.hexStyle.strokeWidth;
  document.getElementById('color-grass').value = numberToHex(theme.terrain.GRASS.color);
  document.getElementById('color-water').value = numberToHex(theme.terrain.WATER.color);
  document.getElementById('color-mountain').value = numberToHex(theme.terrain.MOUNTAIN.color);
  document.getElementById('color-desert').value = numberToHex(theme.terrain.DESERT.color);
  document.getElementById('color-forest').value = numberToHex(theme.terrain.FOREST.color);
}

/**
 * Convert hex string (#RRGGBB) to number (0xRRGGBB)
 */
function hexToNumber(hexString) {
  return parseInt(hexString.replace('#', ''), 16);
}

/**
 * Convert number (0xRRGGBB) to hex string (#RRGGBB)
 */
function numberToHex(number) {
  return '#' + number.toString(16).padStart(6, '0');
}

/**
 * Add helper methods to engine for console access
 */
function addConsoleHelpers(engine) {
  engine.getState = function() {
    return this.stateManager.captureState({
      hexGrid: this.hexGrid,
      viewport: this.viewport,
      entityManager: this.entityManager
    });
  };

  engine.inspectState = function() {
    const state = this.getState();
    console.log('=== Current Game State ===');
    console.log('Version:', state.version);
    console.log('Timestamp:', new Date(state.timestamp).toLocaleString());
    console.log('Checksum:', state.checksum);
    console.log('');
    console.log('Grid:');
    console.log('  Size:', state.grid.size, 'px');
    console.log('  Dimensions:', `${state.grid.width}x${state.grid.height}`);
    console.log('  Total hexes:', state.grid.hexes.length);
    console.log('  Terrain distribution:');

    const terrainCount = {};
    state.grid.hexes.forEach(hex => {
      terrainCount[hex.terrain] = (terrainCount[hex.terrain] || 0) + 1;
    });
    Object.entries(terrainCount).forEach(([terrain, count]) => {
      console.log(`    ${terrain}: ${count} (${(count/state.grid.hexes.length*100).toFixed(1)}%)`);
    });

    console.log('');
    console.log('Entities:');
    console.log('  Total entities:', state.entities.length);
    if (state.entities.length > 0) {
      console.log('  Sample entities (first 3):');
      state.entities.slice(0, 3).forEach(entity => {
        const pos = entity.components.find(c => c.type === 'PositionComponent');
        const render = entity.components.find(c => c.type === 'RenderableComponent');
        if (pos && render) {
          console.log(`    Entity ${entity.entityId}: ${render.data.shape} at (${pos.data.q}, ${pos.data.r})`);
        }
      });
    }

    console.log('');
    console.log('Viewport:');
    console.log('  Position:', `(${state.viewport.x.toFixed(2)}, ${state.viewport.y.toFixed(2)})`);
    console.log('  Scale:', state.viewport.scale.toFixed(2));
    console.log('');
    console.log('Full state object:', state);
    return state;
  };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (engine) {
    engine.destroy();
  }
});

// Export for debugging (use getter to always reference current engine)
Object.defineProperty(window, 'hexEngine', {
  get: () => engine,
  configurable: true
});
