import * as PIXI from 'pixi.js';
import { Hex } from './Hex.js';

/**
 * HexGrid manages the hexagonal grid layout and rendering
 * Uses flat-top hexagon orientation
 */
export class HexGrid {
  constructor(config = {}) {
    this.size = config.size || 30; // Hex radius in pixels
    this.width = config.width || 20; // Grid width in hexes
    this.height = config.height || 20; // Grid height in hexes

    // Hex layout constants (flat-top orientation)
    this.layout = {
      orientation: {
        f0: 3/2, f1: 0,
        f2: Math.sqrt(3)/2, f3: Math.sqrt(3),
        b0: 2/3, b1: 0,
        b2: -1/3, b3: Math.sqrt(3)/3,
        startAngle: 0
      },
      size: this.size,
      origin: { x: 0, y: 0 }
    };

    // Terrain types
    this.terrainTypes = {
      GRASS: { color: 0x4CAF50, name: 'grass', cost: 1 },
      WATER: { color: 0x2196F3, name: 'water', cost: 2 },
      MOUNTAIN: { color: 0x9E9E9E, name: 'mountain', cost: 3 },
      DESERT: { color: 0xFFEB3B, name: 'desert', cost: 1 },
      FOREST: { color: 0x1B5E20, name: 'forest', cost: 2 }
    };

    // Store hex data
    this.hexes = new Map(); // key -> {hex, terrain, sprite}
    this.container = new PIXI.Container();

    this.initializeGrid();
  }

  /**
   * Initialize grid with hexes
   */
  initializeGrid() {
    const terrainKeys = Object.keys(this.terrainTypes);

    for (let q = 0; q < this.width; q++) {
      for (let r = 0; r < this.height; r++) {
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
   */
  render() {
    // Clear existing graphics
    this.container.removeChildren();

    // Create single graphics object for all hexes (better performance)
    const graphics = new PIXI.Graphics();

    this.hexes.forEach((data, key) => {
      const { hex, terrain } = data;
      const corners = this.getHexCorners(hex);

      // Draw filled hex
      graphics.fill({ color: terrain.color, alpha: 0.8 });
      graphics.moveTo(corners[0].x, corners[0].y);

      for (let i = 1; i < corners.length; i++) {
        graphics.lineTo(corners[i].x, corners[i].y);
      }
      graphics.closePath();

      // Draw outline
      graphics.stroke({ width: 1, color: 0x000000, alpha: 0.3 });
      graphics.moveTo(corners[0].x, corners[0].y);

      for (let i = 1; i < corners.length; i++) {
        graphics.lineTo(corners[i].x, corners[i].y);
      }
      graphics.closePath();
    });

    this.container.addChild(graphics);
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
