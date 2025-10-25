/**
 * StateManager handles game state serialization and persistence
 * Ensures all state can be saved/loaded as JSON
 */
export class StateManager {
  constructor() {
    this.version = '1.0.0';
    this.stateHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Capture current game state
   */
  captureState(components) {
    const state = {
      version: this.version,
      timestamp: Date.now(),
      grid: components.hexGrid ? components.hexGrid.serialize() : null,
      entities: components.entityManager ? components.entityManager.serialize() : [],
      turn: components.turnManager ? components.turnManager.currentTurn : 0,
      viewport: components.viewport ? {
        x: components.viewport.x,
        y: components.viewport.y,
        scale: components.viewport.scale.x
      } : null
    };

    // Calculate checksum for validation
    state.checksum = this.calculateChecksum(state);

    return state;
  }

  /**
   * Save state history for undo/replay
   */
  saveToHistory(state) {
    this.stateHistory.push(state);

    // Limit history size
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }

  /**
   * Load state from JSON
   */
  loadState(jsonString) {
    try {
      const state = JSON.parse(jsonString);

      // Validate version
      if (!this.isVersionCompatible(state.version)) {
        throw new Error(`Incompatible state version: ${state.version}`);
      }

      // Validate checksum
      const expectedChecksum = this.calculateChecksum(state);
      if (state.checksum !== expectedChecksum) {
        console.warn('State checksum mismatch - data may be corrupted');
      }

      return state;
    } catch (error) {
      console.error('Failed to load state:', error);
      throw error;
    }
  }

  /**
   * Export state as downloadable JSON file
   */
  exportState(state, filename = 'hex-game-state.json') {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Calculate simple checksum for state validation
   * Uses JSON string length and content hash
   */
  calculateChecksum(state) {
    // Create a copy without checksum field
    const stateCopy = { ...state };
    delete stateCopy.checksum;

    const jsonString = JSON.stringify(stateCopy);
    let hash = 0;

    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return hash;
  }

  /**
   * Check if state version is compatible
   */
  isVersionCompatible(version) {
    // Simple version check - can be extended for migration logic
    const [major] = version.split('.');
    const [currentMajor] = this.version.split('.');

    return major === currentMajor;
  }

  /**
   * Get state history
   */
  getHistory() {
    return this.stateHistory;
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.stateHistory = [];
  }

  /**
   * Get previous state from history
   */
  getPreviousState() {
    return this.stateHistory[this.stateHistory.length - 1] || null;
  }
}
