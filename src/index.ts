export const MAX_MERCATOR_LATITUDE = 85.0511287798066;
export interface Tile {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}
export interface TileBounds {
  readonly west: number;
  readonly south: number;
  readonly east: number;
  readonly north: number;
}
function zoom(z: number): number {
  if (!Number.isInteger(z) || z < 0 || z > 30) throw new RangeError('Zoom must be integer 0..30');
  return 2 ** z;
}
function validate(t: Tile): number {
  const n = zoom(t.z);
  if (
    !Number.isSafeInteger(t.x) ||
    !Number.isSafeInteger(t.y) ||
    t.x < 0 ||
    t.y < 0 ||
    t.x >= n ||
    t.y >= n
  )
    throw new RangeError('Tile outside zoom bounds');
  return n;
}
/** Web Mercator XYZ, longitude wraps [-180,180); latitude clamps to Mercator extent. */
export function tileAt(latitude: number, longitude: number, z: number): Tile {
  const n = zoom(z);
  if (
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 1e12
  )
    throw new RangeError('Invalid latitude/longitude');
  const lon = ((((longitude + 180) % 360) + 360) % 360) - 180;
  const lat =
    (Math.max(-MAX_MERCATOR_LATITUDE, Math.min(MAX_MERCATOR_LATITUDE, latitude)) * Math.PI) / 180;
  return {
    x: Math.min(n - 1, Math.floor(((lon + 180) / 360) * n)),
    y: Math.max(
      0,
      Math.min(n - 1, Math.floor(((1 - Math.asinh(Math.tan(lat)) / Math.PI) / 2) * n)),
    ),
    z,
  };
}
export function tileBounds(tile: Tile): TileBounds {
  const n = validate(tile),
    latitude = (y: number) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
  return {
    west: (tile.x / n) * 360 - 180,
    east: ((tile.x + 1) / n) * 360 - 180,
    north: latitude(tile.y),
    south: latitude(tile.y + 1),
  };
}
/** Base-4 quadrant digits, empty string for zoom zero; no 32-bit bitwise truncation. */
export function toQuadkey(tile: Tile): string {
  validate(tile);
  let key = '';
  for (let i = tile.z - 1; i >= 0; i--) {
    const scale = 2 ** i;
    key += String((Math.floor(tile.x / scale) % 2) + 2 * (Math.floor(tile.y / scale) % 2));
  }
  return key;
}
export function fromQuadkey(key: string): Tile {
  if (typeof key !== 'string' || key.length > 30 || !/^[0-3]*$/.test(key))
    throw new RangeError('Quadkey requires 0..30 digits 0..3');
  let x = 0,
    y = 0;
  for (const digit of key) {
    const d = Number(digit);
    x = x * 2 + (d % 2);
    y = y * 2 + Math.floor(d / 2);
  }
  return { x, y, z: key.length };
}
