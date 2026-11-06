import {
  MAX_MERCATOR_LATITUDE,
  tileAt,
  tileBounds,
  toQuadkey,
  fromQuadkey,
  type Tile,
  type TileBounds,
} from '@lp-labs/tile-coordinates';
const tile: Tile = tileAt(MAX_MERCATOR_LATITUDE, 0, 30);
const bounds: TileBounds = tileBounds(fromQuadkey(toQuadkey(tile)));
void bounds;
// @ts-expect-error Zoom is numeric.
tileAt(0, 0, '3');
// @ts-expect-error All tile coordinates required.
tileBounds({ x: 0, y: 0 });
