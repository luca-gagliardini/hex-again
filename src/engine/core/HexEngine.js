import * as PIXI from 'pixi.js';
import { HexGrid } from './HexGrid.js';
import { StateManager } from './StateManager.js';
import { DebugOverlay } from '../../debug/DebugOverlay.js';

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
    this.hexGrid = null;
    this.stateManager = new StateManager();
    this.debugOverlay = null;

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
    this.dragStart = { x: 0, y: 0 };
    this.viewportPos = { x: 0, y: 0 };
    this.scale = 1;
    this.minScale = 0.5;
    this.maxScale = 3;
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

      // Initialize hex grid
      this.hexGrid = new HexGrid({
        size: this.config.hexSize,
        width: this.config.gridWidth,
        height: this.config.gridHeight
      });

      this.hexGrid.render();
      this.viewport.addChild(this.hexGrid.container);

      // Initialize debug overlay
      this.debugOverlay = new DebugOverlay(this.app);
      this.app.stage.addChild(this.debugOverlay.container);

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
      this.dragStart.x = e.clientX - this.viewportPos.x;
      this.dragStart.y = e.clientY - this.viewportPos.y;
      canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.viewportPos.x = e.clientX - this.dragStart.x;
        this.viewportPos.y = e.clientY - this.dragStart.y;
        this.updateViewportTransform();
      }
    });

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
      canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
      canvas.style.cursor = 'default';
    });

    canvas.style.cursor = 'grab';

    // Touch support for mobile
    let lastTouchDistance = 0;

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.dragStart.x = e.touches[0].clientX - this.viewportPos.x;
        this.dragStart.y = e.touches[0].clientY - this.viewportPos.y;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();

      if (e.touches.length === 1 && this.isDragging) {
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

    canvas.addEventListener('touchend', () => {
      this.isDragging = false;
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

    // Update debug overlay
    this.debugInfo.visibleHexes = this.hexGrid.getHexCount();

    // Draw calls estimation (Pixi v8 doesn't expose this directly)
    // Estimate based on number of containers and graphics objects
    this.debugInfo.drawCalls = this.viewport.children.length;

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
      viewport: this.viewport
    });

    this.stateManager.exportState(state);
    console.log('State exported successfully');
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
