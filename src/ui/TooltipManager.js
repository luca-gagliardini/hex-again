/**
 * TooltipManager - Manages HTML tooltip display that follows mouse cursor
 * Supports different formatters for different contexts (debug, game, etc.)
 *
 * TODO(phase 3): Add destroy() method for cleanup
 * TODO(phase 3): Split formatters into /ui/formatters/ directory when we have 3+ formatters
 */
export class TooltipManager {
  constructor() {
    this.element = null;
    this.formatter = null;
    this.visible = false;
    this.offset = { x: 15, y: 15 }; // Offset from cursor
    this.padding = 10; // Distance from screen edges
  }

  /**
   * Initialize tooltip (call after DOM is ready)
   */
  initialize() {
    this.element = document.getElementById('game-tooltip');
    if (!this.element) {
      console.error('Tooltip element not found. Make sure #game-tooltip exists in HTML.');
    }
  }

  /**
   * Set the formatter for tooltip content
   * @param {Object} formatter - Object with format(data) method
   */
  setFormatter(formatter) {
    this.formatter = formatter;
  }

  /**
   * Show tooltip with data at mouse position
   * @param {Object} data - Data to display
   * @param {number} mouseX - Mouse X position (screen coordinates)
   * @param {number} mouseY - Mouse Y position (screen coordinates)
   */
  show(data, mouseX, mouseY) {
    if (!this.element || !this.formatter) return;

    // Format content using current formatter
    const html = this.formatter.format(data);
    this.element.innerHTML = html;

    // Update position
    this.updatePosition(mouseX, mouseY);

    // Show tooltip
    this.element.style.display = 'block';
    this.visible = true;
  }

  /**
   * Hide tooltip
   */
  hide() {
    if (!this.element) return;

    this.element.style.display = 'none';
    this.visible = false;
  }

  /**
   * Update tooltip position relative to mouse
   * Keeps tooltip within screen bounds
   */
  updatePosition(mouseX, mouseY) {
    if (!this.element) return;

    // Start with offset from cursor
    let x = mouseX + this.offset.x;
    let y = mouseY + this.offset.y;

    // Get tooltip dimensions (need to show it briefly to measure)
    const rect = this.element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Keep within screen bounds
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Check right edge
    if (x + width + this.padding > screenWidth) {
      x = mouseX - width - this.offset.x; // Show on left side of cursor
    }

    // Check bottom edge
    if (y + height + this.padding > screenHeight) {
      y = mouseY - height - this.offset.y; // Show above cursor
    }

    // Check left edge
    if (x < this.padding) {
      x = this.padding;
    }

    // Check top edge
    if (y < this.padding) {
      y = this.padding;
    }

    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }

  /**
   * Check if tooltip is currently visible
   */
  isVisible() {
    return this.visible;
  }
}

/**
 * DebugHexFormatter - Formats hex data for debug mode display
 */
export class DebugHexFormatter {
  format(hexData) {
    if (!hexData) return '';

    const { hex, terrain } = hexData;

    return `
      <div class="tooltip-section">
        <div class="tooltip-title">Hex Inspector</div>
        <div class="tooltip-row">
          <span class="tooltip-label">Coordinates:</span>
          <span class="tooltip-value">(q:${hex.q}, r:${hex.r})</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Terrain:</span>
          <span class="tooltip-value">${terrain.name}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Color:</span>
          <span class="tooltip-value">#${terrain.color.toString(16).padStart(6, '0').toUpperCase()}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Move Cost:</span>
          <span class="tooltip-value">${terrain.cost}</span>
        </div>
      </div>
    `;
  }
}
