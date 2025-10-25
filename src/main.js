import { HexEngine } from './engine/core/HexEngine.js';

/**
 * Main entry point for the Hex Game Engine
 */

let engine = null;

async function init() {
  try {
    console.log('Initializing Hex Game Engine...');

    // Get container
    const container = document.getElementById('game-container');

    // Create and initialize engine
    engine = new HexEngine({
      width: window.innerWidth,
      height: window.innerHeight,
      hexSize: 30,
      gridWidth: 25,
      gridHeight: 25,
      backgroundColor: 0x1a1a1a
    });

    await engine.initialize(container);

    // Start game loop
    engine.start();

    // Add console helpers
    addConsoleHelpers(engine);

    // Setup UI controls
    setupControls();

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

          // Show in textarea
          const textarea = document.getElementById('state-json');
          if (textarea) {
            textarea.value = JSON.stringify(state, null, 2);
          }

          console.log('State loaded successfully:', state);
          console.log('Note: Full state restoration will be implemented in Phase 2');
          addPerfResult(`State loaded: ${state.grid.hexes.length} hexes`, 'info');
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
  console.log('Tip: Press F2 to open dev panel');
}

// ============================================
// Global UI Functions (called from HTML)
// ============================================

window.toggleDevPanel = function() {
  const panel = document.getElementById('dev-panel');
  panel.classList.toggle('collapsed');
};

window.toggleDebug = function() {
  if (engine) {
    engine.debugOverlay.toggle();
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

  addPerfResult(`State captured: ${state.grid.hexes.length} hexes`, 'info');
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
    addPerfResult(`State validated: v${state.version}, checksum ${state.checksum}`, 'pass');
    console.log('State loaded and validated:', state);
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
 * Add helper methods to engine for console access
 */
function addConsoleHelpers(engine) {
  engine.getState = function() {
    return this.stateManager.captureState({
      hexGrid: this.hexGrid,
      viewport: this.viewport
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
    console.log('Viewport:');
    console.log('  Position:', `(${state.viewport.x.toFixed(2)}, ${state.viewport.y.toFixed(2)})`);
    console.log('  Scale:', state.viewport.scale.toFixed(2));
    console.log('');
    console.log('Sample hexes (first 5):');
    state.grid.hexes.slice(0, 5).forEach(hex => {
      console.log(`  (q:${hex.hex.q}, r:${hex.hex.r}) = ${hex.terrain}`);
    });
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
