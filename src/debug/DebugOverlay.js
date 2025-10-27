import * as PIXI from 'pixi.js';

/**
 * DebugOverlay displays performance metrics and game state information
 * Can be toggled on/off and has minimal/detailed modes
 */
export class DebugOverlay {
  constructor(app) {
    this.app = app;
    this.container = new PIXI.Container();
    this.container.zIndex = 10000; // Always on top

    // Debug state
    this.visible = false; // Start hidden for clean experience
    this.detailedMode = false; // Start in minimal mode

    // Create text style
    this.textStyle = new PIXI.TextStyle({
      fontFamily: 'Courier New, monospace',
      fontSize: 12,
      fill: 0x00FF00,
      stroke: { color: 0x000000, width: 3 },
      dropShadow: {
        color: 0x000000,
        blur: 2,
        angle: Math.PI / 6,
        distance: 2,
      }
    });

    // Create text objects
    this.fpsText = new PIXI.Text({ text: '', style: this.textStyle });
    this.fpsText.position.set(10, 10);

    this.stateText = new PIXI.Text({ text: '', style: this.textStyle });
    this.stateText.position.set(10, 28);

    this.performanceText = new PIXI.Text({ text: '', style: this.textStyle });
    this.performanceText.position.set(10, 46);

    this.memoryText = new PIXI.Text({ text: '', style: this.textStyle });
    this.memoryText.position.set(10, 64);

    this.systemsText = new PIXI.Text({ text: '', style: this.textStyle });
    this.systemsText.position.set(10, 82);

    this.entitiesText = new PIXI.Text({ text: '', style: { ...this.textStyle, fontSize: 10 } });
    this.entitiesText.position.set(10, 100);

    this.hintText = new PIXI.Text({
      text: 'Press D for detailed mode',
      style: { ...this.textStyle, fontSize: 10, fill: 0x888888 }
    });
    this.hintText.position.set(10, 82);

    // Add to container
    this.container.addChild(this.fpsText);
    this.container.addChild(this.stateText);
    this.container.addChild(this.performanceText);
    this.container.addChild(this.memoryText);
    this.container.addChild(this.systemsText);
    this.container.addChild(this.entitiesText);
    this.container.addChild(this.hintText);

    // Performance tracking
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.frameBuffer = new Array(60).fill(16.67); // ~60fps baseline
    this.bufferIndex = 0;

    // Initially hide
    this.updateVisibility();
  }

  /**
   * Update debug information
   * Call this every frame
   */
  update(debugInfo = {}) {
    if (!this.visible) return;

    const now = performance.now();
    const delta = now - this.lastTime;

    // Calculate FPS with rolling average
    this.frameBuffer[this.bufferIndex] = delta;
    this.bufferIndex = (this.bufferIndex + 1) % this.frameBuffer.length;

    const avgFrameTime = this.frameBuffer.reduce((a, b) => a + b, 0) / this.frameBuffer.length;
    this.fps = Math.round(1000 / avgFrameTime);

    this.lastTime = now;
    this.frameCount++;

    // Color code FPS (green >55, yellow 30-55, red <30)
    const fpsColor = this.fps > 55 ? 0x00FF00 : (this.fps > 30 ? 0xFFFF00 : 0xFF0000);
    this.fpsText.style.fill = fpsColor;

    // Minimal mode: Just FPS
    if (!this.detailedMode) {
      this.fpsText.text = `FPS: ${this.fps}`;
      return;
    }

    // Detailed mode: All metrics
    this.fpsText.text = `FPS: ${this.fps} | Frame: ${delta.toFixed(2)}ms`;
    this.stateText.text = `Units: ${debugInfo.unitCount || 0} | Hexes: ${debugInfo.visibleHexes || 0}/${debugInfo.totalHexes || 0}`;
    this.performanceText.text = `Draw Calls: ${debugInfo.drawCalls || 0} | Update: ${(debugInfo.updateTime || 0).toFixed(2)}ms`;

    // System performance profiling
    if (debugInfo.systemTimes) {
      const renderTime = (debugInfo.systemTimes.render || 0).toFixed(2);
      this.systemsText.text = `Systems: Render=${renderTime}ms`;
    } else {
      this.systemsText.text = 'Systems: N/A';
    }

    // Entity component inspector (show first 3 entities)
    if (debugInfo.entities && debugInfo.entities.length > 0) {
      const entityLines = debugInfo.entities.slice(0, 3).map(e => {
        const comps = e.components.map(c => c.split('Component')[0]).join(',');
        return `  E${e.id}: [${comps}]`;
      });
      this.entitiesText.text = `Entities:\n${entityLines.join('\n')}`;
    } else {
      this.entitiesText.text = 'Entities: None';
    }

    // Memory usage (if available)
    if (performance.memory) {
      const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
      const totalMB = (performance.memory.totalJSHeapSize / 1048576).toFixed(1);
      this.memoryText.text = `Memory: ${usedMB}MB / ${totalMB}MB`;
    } else {
      this.memoryText.text = 'Memory: N/A';
    }
  }

  /**
   * Toggle debug overlay visibility
   */
  toggle() {
    this.visible = !this.visible;
    this.updateVisibility();
    console.log(`Debug overlay: ${this.visible ? 'ON' : 'OFF'}`);
  }

  /**
   * Toggle between minimal and detailed mode
   */
  toggleDetailedMode() {
    if (!this.visible) {
      this.visible = true;
    }
    this.detailedMode = !this.detailedMode;
    this.updateVisibility();
    console.log(`Debug mode: ${this.detailedMode ? 'DETAILED' : 'MINIMAL'}`);
  }

  /**
   * Show overlay
   */
  show() {
    this.visible = true;
    this.updateVisibility();
  }

  /**
   * Hide overlay
   */
  hide() {
    this.visible = false;
    this.updateVisibility();
  }

  /**
   * Update container visibility based on state
   */
  updateVisibility() {
    this.container.visible = this.visible;

    // Show/hide detailed info
    this.stateText.visible = this.detailedMode;
    this.performanceText.visible = this.detailedMode;
    this.memoryText.visible = this.detailedMode;
    this.systemsText.visible = this.detailedMode;
    this.entitiesText.visible = this.detailedMode;
    this.hintText.visible = this.visible && !this.detailedMode;
  }

  /**
   * Get current FPS
   */
  getFPS() {
    return this.fps;
  }

  /**
   * Get performance report
   */
  getReport() {
    return {
      fps: this.fps,
      avgFrameTime: this.frameBuffer.reduce((a, b) => a + b, 0) / this.frameBuffer.length,
      frameCount: this.frameCount
    };
  }

  /**
   * Reset statistics
   */
  reset() {
    this.frameCount = 0;
    this.frameBuffer.fill(16.67);
    this.bufferIndex = 0;
  }
}
