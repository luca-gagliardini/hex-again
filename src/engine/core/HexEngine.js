import * as PIXI from 'pixi.js';
import { HexGrid } from './HexGrid.js';
import { StateManager } from './StateManager.js';
import { DebugOverlay } from '../../debug/DebugOverlay.js';
import { EntityManager } from './EntityManager.js';
import { RenderSystem } from '../systems/RenderSystem.js';
import { PositionComponent, RenderableComponent } from './Components.js';
import { TooltipManager, DebugHexFormatter } from '../../ui/TooltipManager.js';
import { ThemeManager } from '../../config/ThemeManager.js';
import { DefaultTheme } from '../../config/ThemeDefaults.js';

/**
 * HexEngine - Main game engine class
 * Manages Pixi.js application, game loop, and core systems
 */
export class HexEngine {
  constructor(config = {}) {
    this.config = {
      width: config.width || 1200,
      height: config.height || 800,
      hexSize: config.hexSize || 30,
      gridWidth: config.gridWidth || 25,
      gridHeight: config.gridHeight || 25,
      backgroundColor: config.backgroundColor || 0x1a1a1a,
      ...config
    };

    // Initialize Pixi.js application
    this.app = null;
    this.viewport = null;
    this.isRunning = false;

    // Core systems
    this.themeManager = new ThemeManager(DefaultTheme);
    this.hexGrid = null;
    this.stateManager = new StateManager();
    this.debugOverlay = null;
    this.entityManager = new EntityManager();
    this.renderSystem = null; // Initialized after hexGrid
    this.tooltipManager = new TooltipManager();

    // Performance tracking
    this.debugInfo = {
      unitCount: 0,
      visibleHexes: 0,
      totalHexes: 0,
      drawCalls: 0,
      updateTime: 0
    };

    // Pan/zoom state
    this.isDragging = false;
    this.hasDragged = false; // Track if user actually moved (not just mousedown)
    this.dragStart = { x: 0, y: 0 };
    this.viewportPos = { x: 0, y: 0 };
    this.scale = 1;
    this.minScale = 0.5;
    this.maxScale = 3;

    // Hex inspector state (for debug mode)
    this.inspectedHex = null; // { q, r } of currently inspected hex
    this.mouseDownPos = { x: 0, y: 0 }; // Track for click vs drag detection
    this.CLICK_THRESHOLD = 5; // Max pixels moved to count as click
  }

  /**
   * Initialize the engine
   */
  async initialize(container) {
    try {
      // Create Pixi application
      this.app = new PIXI.Application();

      await this.app.init({
        width: this.config.width,
        height: this.config.height,
        backgroundColor: this.config.backgroundColor,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true,
      });

      // Add canvas to container
      container.appendChild(this.app.canvas);

      // Create viewport container for pan/zoom
      this.viewport = new PIXI.Container();
      this.viewport.sortableChildren = true;
      this.app.stage.addChild(this.viewport);

      // Center viewport
      this.viewportPos.x = this.config.width / 2;
      this.viewportPos.y = this.config.height / 2;
      this.updateViewportTransform();

      // Initialize hex grid (with ThemeManager dependency injection)
      this.hexGrid = new HexGrid({
        size: this.config.hexSize,
        width: this.config.gridWidth,
        height: this.config.gridHeight
      }, this.themeManager);

      this.hexGrid.render();
      this.viewport.addChild(this.hexGrid.container);

      // Initialize render system
      this.renderSystem = new RenderSystem(this.entityManager, this.hexGrid);
      this.viewport.addChild(this.renderSystem.container);

      // Initialize debug overlay
      this.debugOverlay = new DebugOverlay(this.app);
      this.app.stage.addChild(this.debugOverlay.container);

      // Initialize tooltip manager
      this.tooltipManager.initialize();
      // TODO(phase 3): Make formatter swappable based on game mode (debug vs gameplay)
      this.tooltipManager.setFormatter(new DebugHexFormatter());

      // Update debug info
      this.debugInfo.totalHexes = this.hexGrid.getHexCount();

      // Setup input handlers
      this.setupInputHandlers();

      // Handle window resize
      window.addEventListener('resize', () => this.handleResize());

      console.log('HexEngine initialized successfully');
      console.log(`Grid: ${this.config.gridWidth}x${this.config.gridHeight} (${this.debugInfo.totalHexes} hexes)`);

      this.isRunning = true;

    } catch (error) {
      console.error('Failed to initialize HexEngine:', error);
      throw error;
    }
  }

  /**
   * Setup input handlers for pan/zoom
   */
  setupInputHandlers() {
    const canvas = this.app.canvas;

    // Mouse wheel zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();

      // Close inspector on zoom
      if (this.inspectedHex) {
        this.inspectedHex = null;
        this.tooltipManager.hide();
      }

      const delta = -Math.sign(e.deltaY);
      const zoomFactor = 0.1;
      const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale + delta * zoomFactor));

      if (newScale !== this.scale) {
        this.scale = newScale;
        this.updateViewportTransform();
      }
    });

    // Mouse drag to pan
    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.hasDragged = false; // Reset drag tracking
      this.dragStart.x = e.clientX - this.viewportPos.x;
      this.dragStart.y = e.clientY - this.viewportPos.y;
      this.mouseDownPos.x = e.clientX;
      this.mouseDownPos.y = e.clientY;
      canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        // Close inspector on first actual drag movement
        if (!this.hasDragged && this.inspectedHex) {
          this.inspectedHex = null;
          this.tooltipManager.hide();
        }

        this.hasDragged = true; // Mark that user has dragged
        this.viewportPos.x = e.clientX - this.dragStart.x;
        this.viewportPos.y = e.clientY - this.dragStart.y;
        this.updateViewportTransform();
      }
      // Note: Removed hover tooltip behavior - now using click-based inspector
    });

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.hasDragged = false; // Reset drag tracking
      canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
      this.hasDragged = false; // Reset drag tracking
      canvas.style.cursor = 'default';
    });

    canvas.style.cursor = 'grab';

    // Hex click handler (for inspector and unit placement)
    canvas.addEventListener('click', (e) => {
      // Calculate distance moved since mousedown
      const distance = Math.sqrt(
        Math.pow(e.clientX - this.mouseDownPos.x, 2) +
        Math.pow(e.clientY - this.mouseDownPos.y, 2)
      );

      // Only process as click if movement < threshold (not a drag)
      if (distance > this.CLICK_THRESHOLD) return;

      const rect = canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      // Convert to world coordinates
      const worldX = (canvasX - this.viewportPos.x) / this.scale;
      const worldY = (canvasY - this.viewportPos.y) / this.scale;

      // Get hex at position
      const hex = this.hexGrid.pixelToHex(worldX, worldY);
      const hexData = this.hexGrid.getHex(hex.q, hex.r);

      if (!hexData) return;

      // Check if debug mode is active
      if (this.debugOverlay && this.debugOverlay.visible) {
        // DEBUG MODE: Toggle hex inspector
        this.toggleHexInspector(hex, hexData);
      } else if (this.onHexClick) {
        // GAME MODE: Unit placement or other game logic
        this.onHexClick(hex);
      }
    });

    // Touch support for mobile
    let lastTouchDistance = 0;
    let touchStartPos = { x: 0, y: 0 };

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent synthetic mouse events

      if (e.touches.length === 1) {
        this.isDragging = true;
        this.hasDragged = false; // Reset drag tracking
        this.dragStart.x = e.touches[0].clientX - this.viewportPos.x;
        this.dragStart.y = e.touches[0].clientY - this.viewportPos.y;
        // Track touch start position for tap detection
        touchStartPos.x = e.touches[0].clientX;
        touchStartPos.y = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        // Close inspector when starting pinch zoom
        if (this.inspectedHex) {
          this.inspectedHex = null;
          this.tooltipManager.hide();
        }

        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();

      if (e.touches.length === 1 && this.isDragging) {
        // Close inspector on first actual drag movement
        if (!this.hasDragged && this.inspectedHex) {
          this.inspectedHex = null;
          this.tooltipManager.hide();
        }

        this.hasDragged = true; // Mark that user has dragged
        this.viewportPos.x = e.touches[0].clientX - this.dragStart.x;
        this.viewportPos.y = e.touches[0].clientY - this.dragStart.y;
        this.updateViewportTransform();
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (lastTouchDistance > 0) {
          const delta = distance - lastTouchDistance;
          const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale + delta * 0.01));
          if (newScale !== this.scale) {
            this.scale = newScale;
            this.updateViewportTransform();
          }
        }

        lastTouchDistance = distance;
      }
    });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault(); // Prevent synthetic mouse events

      // Check if this was a tap (minimal movement) with single touch
      if (e.changedTouches.length === 1 && lastTouchDistance === 0) {
        const touch = e.changedTouches[0];
        const distance = Math.sqrt(
          Math.pow(touch.clientX - touchStartPos.x, 2) +
          Math.pow(touch.clientY - touchStartPos.y, 2)
        );

        // If movement < threshold, treat as tap
        if (distance <= this.CLICK_THRESHOLD) {
          const rect = canvas.getBoundingClientRect();
          const canvasX = touch.clientX - rect.left;
          const canvasY = touch.clientY - rect.top;

          // Convert to world coordinates
          const worldX = (canvasX - this.viewportPos.x) / this.scale;
          const worldY = (canvasY - this.viewportPos.y) / this.scale;

          // Get hex at position
          const hex = this.hexGrid.pixelToHex(worldX, worldY);
          const hexData = this.hexGrid.getHex(hex.q, hex.r);

          if (hexData) {
            // Check if debug mode is active
            if (this.debugOverlay && this.debugOverlay.visible) {
              // DEBUG MODE: Toggle hex inspector
              this.toggleHexInspector(hex, hexData);
            } else if (this.onHexClick) {
              // GAME MODE: Unit placement or other game logic
              this.onHexClick(hex);
            }
          }
        }
      }

      this.isDragging = false;
      this.hasDragged = false; // Reset drag tracking
      lastTouchDistance = 0;
    });
  }

  /**
   * Update viewport transform (pan/zoom)
   */
  updateViewportTransform() {
    this.viewport.position.set(this.viewportPos.x, this.viewportPos.y);
    this.viewport.scale.set(this.scale);
  }

  /**
   * Toggle hex inspector (debug mode)
   * Shows/hides inspector tooltip for clicked hex
   * @param {Object} hex - Hex coordinates { q, r }
   * @param {Object} hexData - Full hex data object
   */
  toggleHexInspector(hex, hexData) {
    if (!hex || !hexData) return;

    // Check if clicking same hex - toggle off
    if (this.inspectedHex &&
        this.inspectedHex.q === hex.q &&
        this.inspectedHex.r === hex.r) {
      // Close inspector
      this.inspectedHex = null;
      this.tooltipManager.hide();
      return;
    }

    // Show/switch to new hex
    this.inspectedHex = { q: hex.q, r: hex.r };

    // Get hex center position in world coordinates
    const pixelPos = this.hexGrid.hexToPixel(hex);

    // Convert to screen coordinates
    const screenX = pixelPos.x * this.scale + this.viewportPos.x;
    const screenY = pixelPos.y * this.scale + this.viewportPos.y;

    // Show pinned tooltip at hex center
    this.tooltipManager.showPinned(hexData, screenX, screenY);
  }

  /**
   * Handle window resize
   */
  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.app.renderer.resize(width, height);
    this.config.width = width;
    this.config.height = height;
  }

  /**
   * Main update loop
   * Called every frame by Pixi.js ticker
   */
  update() {
    if (!this.isRunning) return;

    const startTime = performance.now();

    // Performance profiling: RenderSystem
    const renderStart = performance.now();
    this.renderSystem.update();
    const renderTime = performance.now() - renderStart;

    // Update debug info
    this.debugInfo.visibleHexes = this.hexGrid.getHexCount();
    this.debugInfo.unitCount = this.entityManager.getEntityCount();

    // Draw calls estimation (Pixi v8 doesn't expose this directly)
    this.debugInfo.drawCalls = this.viewport.children.length + this.renderSystem.container.children.length;

    // System performance profiling
    this.debugInfo.systemTimes = {
      render: renderTime
    };

    // Component inspector: Get entity component info
    this.debugInfo.entities = [];
    this.entityManager.getAllEntities().forEach((componentMap, entityId) => {
      const components = Array.from(componentMap.keys());
      this.debugInfo.entities.push({
        id: entityId,
        components: components
      });
    });

    this.debugOverlay.update(this.debugInfo);

    const endTime = performance.now();
    this.debugInfo.updateTime = endTime - startTime;
  }

  /**
   * Start the game loop
   */
  start() {
    this.isRunning = true;
    this.app.ticker.add(() => this.update());
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.isRunning = false;
  }

  /**
   * Export current state
   */
  exportState() {
    const state = this.stateManager.captureState({
      hexGrid: this.hexGrid,
      viewport: this.viewport,
      entityManager: this.entityManager
    });

    this.stateManager.exportState(state);
    console.log('State exported successfully');
  }

  /**
   * Restore state from state object
   * @param {Object} state - State object to restore
   */
  restoreState(state) {
    const componentRegistry = {
      PositionComponent,
      RenderableComponent
    };

    this.stateManager.restoreState(state, {
      entityManager: this.entityManager,
      hexGrid: this.hexGrid,
      viewport: this.viewport
    }, componentRegistry);

    console.log('State restored successfully');
  }

  /**
   * Update theme across all systems
   * @param {Object} partialConfig - Partial theme configuration
   */
  updateTheme(partialConfig) {
    // Update theme manager
    this.themeManager.updateTheme(partialConfig);

    // Update DOM background and Pixi canvas background if palette changed
    if (partialConfig.palette?.background || partialConfig.palette?.backgroundHex) {
      const newBackground = this.themeManager.getPalette().backgroundHex;
      const newBackgroundNumber = this.themeManager.getPalette().background;

      // Update body background
      document.body.style.background = newBackground;

      // Update Pixi renderer background (this was missing!)
      if (this.app && this.app.renderer) {
        this.app.renderer.background.color = newBackgroundNumber;
      }
    }

    // Trigger hex grid re-render
    this.hexGrid.updateTheme();
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    return {
      ...this.debugOverlay.getReport(),
      ...this.debugInfo
    };
  }

  /**
   * Destroy the engine and cleanup
   */
  destroy() {
    this.isRunning = false;
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
    }
    window.removeEventListener('resize', () => this.handleResize());
  }
}
