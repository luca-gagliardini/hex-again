/**
 * Hex class using axial coordinates (q, r)
 * Supports hexagonal grid mathematics and conversions
 */
export class Hex {
  constructor(q, r) {
    this.q = q;
    this.r = r;
    this.s = -q - r; // Cubic coordinate for certain calculations
  }

  /**
   * Calculate distance to another hex using cube coordinates
   * Performance: O(1) - optimized for frequent calls
   */
  distanceTo(other) {
    return (Math.abs(this.q - other.q) +
            Math.abs(this.q + this.r - other.q - other.r) +
            Math.abs(this.r - other.r)) / 2;
  }

  /**
   * Get unique key for this hex (for Map/Set usage)
   */
  key() {
    return `${this.q},${this.r}`;
  }

  /**
   * Check if two hexes are equal
   */
  equals(other) {
    return this.q === other.q && this.r === other.r;
  }

  /**
   * Get neighbor in specified direction (0-5)
   * Directions: 0=E, 1=NE, 2=NW, 3=W, 4=SW, 5=SE
   */
  neighbor(direction) {
    const directions = [
      [+1,  0], [+1, -1], [ 0, -1],
      [-1,  0], [-1, +1], [ 0, +1]
    ];
    const dir = directions[direction];
    return new Hex(this.q + dir[0], this.r + dir[1]);
  }

  /**
   * Get all 6 neighbors
   */
  neighbors() {
    const result = [];
    for (let i = 0; i < 6; i++) {
      result.push(this.neighbor(i));
    }
    return result;
  }

  /**
   * Get all hexes within a given range
   * Performance: O(range²) - use with caution for large ranges
   */
  range(distance) {
    const results = [];
    for (let q = -distance; q <= distance; q++) {
      const r1 = Math.max(-distance, -q - distance);
      const r2 = Math.min(distance, -q + distance);
      for (let r = r1; r <= r2; r++) {
        results.push(new Hex(this.q + q, this.r + r));
      }
    }
    return results;
  }

  /**
   * Serialize to JSON
   */
  serialize() {
    return { q: this.q, r: this.r };
  }

  /**
   * Deserialize from JSON
   */
  static deserialize(data) {
    return new Hex(data.q, data.r);
  }

  /**
   * Linear interpolation between two hexes
   * Used for drawing lines/paths
   */
  static lerp(a, b, t) {
    return new Hex(
      a.q * (1 - t) + b.q * t,
      a.r * (1 - t) + b.r * t
    );
  }

  /**
   * Round fractional hex coordinates to nearest hex
   */
  static round(q, r) {
    let s = -q - r;

    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);

    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);

    if (qDiff > rDiff && qDiff > sDiff) {
      rq = -rr - rs;
    } else if (rDiff > sDiff) {
      rr = -rq - rs;
    }

    return new Hex(rq, rr);
  }
}
