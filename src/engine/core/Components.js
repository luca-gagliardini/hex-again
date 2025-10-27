/**
 * Component definitions for ECS
 * Components are pure data - no logic
 */

/**
 * PositionComponent - Hex grid position
 */
export class PositionComponent {
  constructor(q, r) {
    this.q = q;
    this.r = r;
  }

  serialize() {
    return { q: this.q, r: this.r };
  }

  static deserialize(data) {
    return new PositionComponent(data.q, data.r);
  }
}

/**
 * RenderableComponent - Visual representation
 */
export class RenderableComponent {
  constructor(color, shape = 'circle') {
    this.color = color;
    this.shape = shape; // 'circle', 'square', 'triangle'
    this.size = 20; // Size in pixels
    this.sprite = null; // Will be set by RenderSystem
  }

  serialize() {
    return {
      color: this.color,
      shape: this.shape,
      size: this.size
    };
  }

  static deserialize(data) {
    const component = new RenderableComponent(data.color, data.shape);
    component.size = data.size;
    return component;
  }
}
