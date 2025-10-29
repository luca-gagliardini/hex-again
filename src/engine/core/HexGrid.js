import * as PIXI from 'pixi.js';
import { Hex } from './Hex.js';

/**
 * HexGrid manages the hexagonal grid layout and rendering
 * Uses pointy-top hexagon orientation for rectangular layout
 */
export class HexGrid {
  constructor(config = {}, themeManager) {
    this.size = config.size || 30; // Hex radius in pixels
    this.width = config.width || 20; // Grid width in hexes
    this.height = config.height || 20; // Grid height in hexes

    // Hex layout constants (pointy-top orientation for horizontal rectangle)
    this.layout = {
      orientation: {
        f0: Math.sqrt(3), f1: Math.sqrt(3)/2,
        f2: 0, f3: 3/2,
        b0: Math.sqrt(3)/3, b1: -1/3,
        b2: 0, b3: 2/3,
        startAngle: 0.5
      },
      size: this.size,
      origin: { x: 0, y: 0 }
    };

    // Store ThemeManager reference (dependency injection)
    this.themeManager = themeManager;

    // Terrain types - from ThemeManager for dynamic theming
    // TODO(phase 4): Extract terrain config to data-driven TerrainRegistry system
    // TODO(phase 4): Make units, terrain, and UI config-driven for rapid design iteration
    // TODO(phase 4): Add pattern/texture/sprite support for terrain types
    // TODO(phase 4): Support multiple visual themes (units and terrain)
    this.terrainTypes = this.themeManager.getTerrain();

    // Store hex data
    this.hexes = new Map(); // key -> {hex, terrain, sprite}
    this.container = new PIXI.Container();

    this.initializeGrid();
  }

  /**
   * Initialize grid with hexes
   * Uses offset coordinates (col, row) to create a rectangular grid shape
   * Converts to axial coordinates (q, r) for internal storage
   * Using pointy-top hexagons with offset layout for horizontal rectangle alignment
   */
  initializeGrid() {
    const terrainKeys = Object.keys(this.terrainTypes);

    // Iterate in rectangular fashion: columns (left-right), rows (top-bottom)
    for (let col = 0; col < this.width; col++) {
      for (let row = 0; row < this.height; row++) {
        // Convert offset coordinates to axial for pointy-top hexagons
        // With this formula, q increases left-to-right, r increases top-to-bottom
        const q = col - Math.floor(row / 2);
        const r = row;

        const hex = new Hex(q, r);
        // Random terrain for now
        const terrainKey = terrainKeys[Math.floor(Math.random() * terrainKeys.length)];
        const terrain = this.terrainTypes[terrainKey];

        this.hexes.set(hex.key(), {
          hex,
          terrain,
          sprite: null // Will be created during rendering
        });
      }
    }
  }

  /**
   * Convert hex coordinates to pixel coordinates
   */
  hexToPixel(hex) {
    const M = this.layout.orientation;
    const size = this.layout.size;
    const origin = this.layout.origin;

    const x = (M.f0 * hex.q + M.f1 * hex.r) * size + origin.x;
    const y = (M.f2 * hex.q + M.f3 * hex.r) * size + origin.y;

    return { x, y };
  }

  /**
   * Convert pixel coordinates to hex coordinates
   */
  pixelToHex(x, y) {
    const M = this.layout.orientation;
    const size = this.layout.size;
    const origin = this.layout.origin;

    const pt = { x: (x - origin.x) / size, y: (y - origin.y) / size };
    const q = M.b0 * pt.x + M.b1 * pt.y;
    const r = M.b2 * pt.x + M.b3 * pt.y;

    return Hex.round(q, r);
  }

  /**
   * Get hex corners for drawing
   */
  getHexCorners(hex) {
    const center = this.hexToPixel(hex);
    const corners = [];
    const startAngle = this.layout.orientation.startAngle;

    for (let i = 0; i < 6; i++) {
      const angle = 2 * Math.PI * (startAngle + i) / 6;
      corners.push({
        x: center.x + this.size * Math.cos(angle),
        y: center.y + this.size * Math.sin(angle)
      });
    }

    return corners;
  }

  /**
   * Render all hexes to the container
   * Performance: Uses Graphics for better batching
   * Minimalist style: Background-colored strokes create "floating tiles" effect
   * TODO(phase 5): Group hexes by terrain type for batch rendering on large maps (>1000 hexes)
   */
  render() {
    // Clear existing graphics
    this.container.removeChildren();

    // Create single graphics object for all hexes (better performance)
    const graphics = new PIXI.Graphics();

    // Get current hex style from theme manager
    const hexStyle = this.themeManager.getHexStyle();

    this.hexes.forEach((data, key) => {
      const { hex, terrain } = data;
      const corners = this.getHexCorners(hex);

      // Draw filled hex with terrain-specific color
      graphics.beginPath();
      graphics.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i++) {
        graphics.lineTo(corners[i].x, corners[i].y);
      }
      graphics.closePath();

      // Use centralized theme for consistent styling
      graphics.fill({ color: terrain.color, alpha: hexStyle.fillAlpha });
      graphics.stroke({
        width: hexStyle.strokeWidth,
        color: hexStyle.strokeColor,  // Background color for minimalist effect
        alpha: hexStyle.strokeAlpha
      });
    });

    this.container.addChild(graphics);
  }

  /**
   * Update theme and re-render grid
   * Called when user changes theme via UI
   */
  updateTheme() {
    // Refresh terrain types reference
    this.terrainTypes = this.themeManager.getTerrain();

    // CRITICAL: Update terrain references in existing hexes
    // Each hex stores a reference to a terrain object, which needs to be updated
    // when colors change
    this.hexes.forEach((data, key) => {
      const terrainName = data.terrain.name;
      // Find matching terrain in updated terrainTypes
      const terrainKey = Object.keys(this.terrainTypes).find(
        key => this.terrainTypes[key].name === terrainName
      );
      if (terrainKey) {
        data.terrain = this.terrainTypes[terrainKey];
      }
    });

    // Re-render with new theme
    this.render();
  }

  /**
   * Get hex at specific coordinates
   */
  getHex(q, r) {
    const key = `${q},${r}`;
    return this.hexes.get(key);
  }

  /**
   * Get visible hexes within bounds (for culling)
   */
  getVisibleHexes(bounds) {
    const visible = [];

    this.hexes.forEach((data, key) => {
      const pos = this.hexToPixel(data.hex);
      if (pos.x >= bounds.left - this.size * 2 &&
          pos.x <= bounds.right + this.size * 2 &&
          pos.y >= bounds.top - this.size * 2 &&
          pos.y <= bounds.bottom + this.size * 2) {
        visible.push(data);
      }
    });

    return visible;
  }

  /**
   * Serialize grid state
   */
  serialize() {
    const hexData = [];
    this.hexes.forEach((data, key) => {
      hexData.push({
        hex: data.hex.serialize(),
        terrain: data.terrain.name
      });
    });

    return {
      size: this.size,
      width: this.width,
      height: this.height,
      hexes: hexData
    };
  }

  /**
   * Get total hex count
   */
  getHexCount() {
    return this.hexes.size;
  }
}
