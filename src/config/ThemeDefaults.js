/**
 * DefaultTheme - Default visual configuration
 * Serves as the base theme for the application
 *
 * Benefits:
 * - All colors defined in one place
 * - Used as defaults by ThemeManager
 * - Ensures visual consistency (e.g., background color matches hex strokes)
 *
 * TODO(phase 4): Add support for multiple themes (dark/light/custom)
 * TODO(phase 4): Extract to YAML for user-configurable themes
 */
export const DefaultTheme = {
  // Base palette - all colors reference this
  palette: {
    background: 0x1a1a1a,    // Main background color (used for body and hex strokes)
    backgroundHex: '#1a1a1a', // Same but as hex string for CSS
  },

  // Hex rendering style - minimalist design with background-colored strokes
  hexStyle: {
    strokeWidth: 4,           // Balanced stroke width for clean separation
    strokeColor: 0x1a1a1a,    // Same as background for minimalist "floating tiles" effect
    strokeAlpha: 1.0,         // Fully opaque strokes
    fillAlpha: 0.9,           // Slightly more opaque fills (was 0.85)
  },

  // Terrain colors - Japanese-inspired palette from ukiyo-e and traditional colors
  // References: Hokusai's prints, traditional Japanese natural pigments
  terrain: {
    GRASS: {
      color: 0x5B8930,      // Moegi (萌黄) - "Fresh onion green", young spring grass
      name: 'grass',
      cost: 1
    },
    WATER: {
      color: 0x261E47,      // Tetsukon (鉄紺) - "Iron navy", deep indigo blue
      name: 'water',
      cost: 2
    },
    MOUNTAIN: {
      color: 0x8C9FA0,      // Inspired by Kamenozoki - misty mountain blue-gray
      name: 'mountain',
      cost: 3
    },
    DESERT: {
      color: 0xE8D3A2,      // Kinari-iro (生成り色) - "Undyed silk", natural sand
      name: 'desert',
      cost: 1
    },
    FOREST: {
      color: 0x006638,      // Fukamidori (深緑) - "Deep green", evergreen forest
      name: 'forest',
      cost: 2
    }
  }
};

/**
 * Apply theme to document body
 * Call this during initialization to sync CSS with JS theme
 * Ensures background color is consistent between body and hex strokes
 */
export function applyThemeToDOM() {
  document.body.style.background = DefaultTheme.palette.backgroundHex;
}
