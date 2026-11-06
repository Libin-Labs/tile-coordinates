# @lp-labs/tile-coordinates

Web Mercator XYZ tile addressing and base-four quadkeys at safe integer zooms, not arbitrary map projections.

Catalog ID 417. Version 0.1.0. Standalone, zero runtime, peer or sibling dependencies.
Node.js >=18; strict TypeScript; NodeNext ESM and CommonJS with separate declaration trees.

## Install

```sh
npm install @lp-labs/tile-coordinates
```

## Quickstart (JavaScript ESM)

```js
import { tileAt, tileBounds, toQuadkey, fromQuadkey } from '@lp-labs/tile-coordinates';
const tile = tileAt(51.5, -0.12, 12);
console.log(tile, tileBounds(tile));
console.log(fromQuadkey(toQuadkey(tile))); // same XYZ tile
```

CommonJS exposes the same named exports with `require('@lp-labs/tile-coordinates')`.
Use the bare package name in NodeNext TypeScript `.mts` and `.cts` consumers.
The package has no default export, global side effects, browser globals, network access or file access.

## Contracts, options, errors and customization

- `tileAt(latitude,longitude,z)` accepts finite latitude `[-90,90]`, longitude magnitude <= `1e12`, integer zoom `0..30`. Longitude wraps `[-180,180)` so +180 maps to the west edge. Latitude clamps to `±MAX_MERCATOR_LATITUDE` (`85.0511287798066`). Coordinates are integer XYZ, y increasing southward.
- `tileBounds` returns degrees `{west,south,east,north}`. East edge of the final column is +180, not wrapped; world bounds are Mercator extent rather than poles. Tile ownership uses floor (west/north inclusive under exact arithmetic), with edge clamping to valid indices.
- `toQuadkey` and `fromQuadkey` use 0/1/2/3 for NW/NE/SW/SE. Empty key is zoom zero, length <=30, digits only. No 32-bit bitwise operators or combined tile IDs; x/y and powers of two remain safe integers through zoom 30.
- `RangeError` rejects invalid zooms, unsafe/noninteger/out-of-range tile indices, nonfinite geographic inputs or malformed keys. Floating-point boundary rounding at very high zoom remains; no arbitrary precision guarantee.
- O(1) tile conversion/bounds, O(z) quadkeys, bounded to 30 digits; fresh outputs and no mutation. Customize zoom and geographic coordinates only; no TMS reversal, raster pixel or network service assumptions.

## Complete public declarations

All runtime exports, public types, options and return values follow. Readonly declarations
describe caller-facing ownership; results are not recursively frozen at runtime.

```ts
export declare const MAX_MERCATOR_LATITUDE = 85.0511287798066;
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
/** Web Mercator XYZ, longitude wraps [-180,180); latitude clamps to Mercator extent. */
export declare function tileAt(latitude: number, longitude: number, z: number): Tile;
export declare function tileBounds(tile: Tile): TileBounds;
/** Base-4 quadrant digits, empty string for zoom zero; no 32-bit bitwise truncation. */
export declare function toQuadkey(tile: Tile): string;
export declare function fromQuadkey(key: string): Tile;
```

## Development and verification

```sh
npm ci --offline --ignore-scripts --no-audit --no-fund
npm run build
npm run typecheck
npm test
npm run format:check
```

An offline install requires the pinned lockfile's development packages in the local npm cache.
Development-only dependencies: TypeScript ^5.9.3 and Prettier ^3.6.2.
Build emits `dist/esm` and `dist/cjs`, each with declarations; CommonJS has its own package boundary.
Tests cover finite bounds, degeneracy, ownership, work limits, deterministic results and independent reference checks.
Consumer fixtures exercise bare-package ESM/CJS declaration resolution with negative compile-time checks.
Only dist, README, LICENSE and package metadata are published. No automatic publishing is performed.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
