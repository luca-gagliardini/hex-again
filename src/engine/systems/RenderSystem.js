import * as PIXI from 'pixi.js';

/**
 * RenderSystem - Renders entities with PositionComponent and RenderableComponent
 * Handles sprite creation, updates, and cleanup
 */
export class RenderSystem {
  constructor(entityManager, hexGrid) {
    this.entityManager = entityManager;
    this.hexGrid = hexGrid;
    this.container = new PIXI.Container();
    this.container.zIndex = 100; // Render above hex grid
  }

  /**
   * Update - render all entities with Position and Renderable components
   */
  update() {
    const entities = this.entityManager.query('PositionComponent', 'RenderableComponent');
    const activeEntityIds = new Set();

    entities.forEach(({ entityId, components }) => {
      activeEntityIds.add(entityId);
      const position = components.get('PositionComponent');
      const renderable = components.get('RenderableComponent');

      // Create sprite if it doesn't exist
      if (!renderable.sprite) {
        renderable.sprite = this.createSprite(renderable);
        renderable.sprite.entityId = entityId; // Tag sprite with entity ID for cleanup
        this.container.addChild(renderable.sprite);
      }

      // Update sprite position based on hex coordinates
      const pixelPos = this.hexGrid.hexToPixel({ q: position.q, r: position.r });
      renderable.sprite.x = pixelPos.x;
      renderable.sprite.y = pixelPos.y;
    });

    // Clean up sprites for destroyed entities
    const spritesToRemove = [];
    this.container.children.forEach(sprite => {
      if (sprite.entityId !== undefined && !activeEntityIds.has(sprite.entityId)) {
        spritesToRemove.push(sprite);
      }
    });

    spritesToRemove.forEach(sprite => {
      this.container.removeChild(sprite);
      sprite.destroy();
    });

    // TODO(phase5): Implement sprite pooling for better performance
    // Currently creating/destroying sprites each time
  }

  /**
   * Create a sprite based on renderable component properties
   */
  createSprite(renderable) {
    const graphics = new PIXI.Graphics();

    switch (renderable.shape) {
      case 'circle':
        graphics.circle(0, 0, renderable.size / 2);
        graphics.fill({ color: renderable.color });
        graphics.stroke({ width: 2, color: 0x000000, alpha: 0.5 });
        break;

      case 'square':
        graphics.rect(-renderable.size / 2, -renderable.size / 2, renderable.size, renderable.size);
        graphics.fill({ color: renderable.color });
        graphics.stroke({ width: 2, color: 0x000000, alpha: 0.5 });
        break;

      case 'triangle':
        graphics.moveTo(0, -renderable.size / 2);
        graphics.lineTo(renderable.size / 2, renderable.size / 2);
        graphics.lineTo(-renderable.size / 2, renderable.size / 2);
        graphics.closePath();
        graphics.fill({ color: renderable.color });
        graphics.stroke({ width: 2, color: 0x000000, alpha: 0.5 });
        break;

      default:
        // Default to circle
        graphics.circle(0, 0, renderable.size / 2);
        graphics.fill({ color: renderable.color });
        graphics.stroke({ width: 2, color: 0x000000, alpha: 0.5 });
    }

    return graphics;
  }

  /**
   * Clean up all sprites
   */
  destroy() {
    this.container.removeChildren();
    this.container.destroy({ children: true });
  }
}
