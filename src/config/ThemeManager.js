/**
 * ThemeManager - Mutable theme management
 *
 * Manages the current theme configuration and provides methods to update it.
 * Theme changes trigger re-renders of affected components.
 *
 * Future-proofing:
 * - Theme structure is serializable (JSON -> YAML convertible)
 * - No hardcoded terrain types (flexible schema)
 * - Can import/export themes for file-based configs
 */
export class ThemeManager {
  /**
   * @param {Object} defaultTheme - Initial theme configuration
   */
  constructor(defaultTheme) {
    // Deep clone default theme to make it mutable
    this.currentTheme = JSON.parse(JSON.stringify(defaultTheme));
  }

  /**
   * Get current palette configuration
   * @returns {Object} palette config
   */
  getPalette() {
    return this.currentTheme.palette;
  }

  /**
   * Get current hex style configuration
   * @returns {Object} hexStyle config
   */
  getHexStyle() {
    return this.currentTheme.hexStyle;
  }

  /**
   * Get current terrain colors
   * @returns {Object} terrain config
   */
  getTerrain() {
    return this.currentTheme.terrain;
  }

  /**
   * Update theme with partial configuration
   * Supports deep merging of nested properties
   *
   * @param {Object} partialConfig - Partial theme configuration
   *
   * Examples:
   * - updateTheme({ palette: { background: 0x000000 } })
   * - updateTheme({ hexStyle: { strokeWidth: 6 } })
   * - updateTheme({ terrain: { GRASS: { color: 0xFF0000 } } })
   */
  updateTheme(partialConfig) {
    // Deep merge partial config into current theme
    if (partialConfig.palette) {
      this.currentTheme.palette = {
        ...this.currentTheme.palette,
        ...partialConfig.palette
      };
    }

    if (partialConfig.hexStyle) {
      this.currentTheme.hexStyle = {
        ...this.currentTheme.hexStyle,
        ...partialConfig.hexStyle
      };
    }

    if (partialConfig.terrain) {
      // Merge each terrain type individually to preserve other properties (name, cost)
      Object.keys(partialConfig.terrain).forEach(terrainType => {
        if (this.currentTheme.terrain[terrainType]) {
          this.currentTheme.terrain[terrainType] = {
            ...this.currentTheme.terrain[terrainType],
            ...partialConfig.terrain[terrainType]
          };
        } else {
          // New terrain type - add it
          this.currentTheme.terrain[terrainType] = partialConfig.terrain[terrainType];
        }
      });
    }
  }

  /**
   * Export current theme configuration
   * Returns serializable object ready for JSON/YAML export
   *
   * @returns {Object} Current theme configuration
   */
  exportTheme() {
    return JSON.parse(JSON.stringify(this.currentTheme));
  }

  /**
   * Import theme configuration
   * Replaces current theme entirely
   *
   * @param {Object} themeConfig - Complete theme configuration
   */
  importTheme(themeConfig) {
    this.currentTheme = JSON.parse(JSON.stringify(themeConfig));
  }

  /**
   * Reset theme to defaults
   *
   * @param {Object} defaultTheme - Default theme configuration
   */
  resetTheme(defaultTheme) {
    this.currentTheme = JSON.parse(JSON.stringify(defaultTheme));
  }
}
