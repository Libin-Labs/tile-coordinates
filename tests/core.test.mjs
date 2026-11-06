import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_MERCATOR_LATITUDE,
  tileAt,
  tileBounds,
  toQuadkey,
  fromQuadkey,
} from '../dist/esm/index.js';
test('zoom zero, equator and dateline wrap', () => {
  assert.deepEqual(tileAt(0, 0, 0), { x: 0, y: 0, z: 0 });
  assert.deepEqual(tileAt(0, 0, 1), { x: 1, y: 1, z: 1 });
  assert.equal(tileAt(0, 180, 4).x, 0);
  assert.equal(tileAt(0, -180, 4).x, 0);
});
test('Mercator latitude clamp at both poles', () => {
  assert.equal(tileAt(90, 0, 30).y, 0);
  assert.equal(tileAt(-90, 0, 30).y, 2 ** 30 - 1);
  assert.deepEqual(tileAt(90, 20, 5), tileAt(MAX_MERCATOR_LATITUDE, 20, 5));
  assert.deepEqual(tileAt(-90, 20, 5), tileAt(-MAX_MERCATOR_LATITUDE, 20, 5));
});
test('tile bounds world and neighboring edges', () => {
  const b = tileBounds({ x: 0, y: 0, z: 0 });
  assert.equal(b.west, -180);
  assert.equal(b.east, 180);
  assert.ok(Math.abs(b.north - MAX_MERCATOR_LATITUDE) < 1e-12);
  const a = tileBounds({ x: 1, y: 1, z: 3 }),
    c = tileBounds({ x: 2, y: 1, z: 3 }),
    d = tileBounds({ x: 1, y: 2, z: 3 });
  assert.equal(a.east, c.west);
  assert.equal(a.south, d.north);
});
test('known quadkeys and exact zoom 30', () => {
  assert.equal(toQuadkey({ x: 3, y: 5, z: 3 }), '213');
  assert.deepEqual(fromQuadkey('213'), { x: 3, y: 5, z: 3 });
  assert.equal(toQuadkey({ x: 0, y: 0, z: 0 }), '');
  const t = { x: 2 ** 30 - 1, y: 2 ** 30 - 1, z: 30 };
  assert.equal(toQuadkey(t), '3'.repeat(30));
  assert.deepEqual(fromQuadkey('3'.repeat(30)), t);
});
test('independent known city XYZ fixtures without roundtrip assumptions', () => {
  assert.deepEqual(tileAt(51.5, -0.12, 12), { x: 2046, y: 1362, z: 12 });
  assert.deepEqual(tileAt(40.7128, -74.006, 10), { x: 301, y: 385, z: 10 });
  assert.deepEqual(tileAt(35.6895, 139.6917, 10), { x: 909, y: 403, z: 10 });
  assert.deepEqual(tileAt(-33.8688, 151.2093, 10), { x: 942, y: 614, z: 10 });
  const b = tileBounds({ x: 1, y: 1, z: 2 });
  assert.equal(b.west, -90);
  assert.equal(b.east, 0);
  assert.equal(b.south, 0);
  assert.ok(Math.abs(b.north - 66.51326044311186) < 1e-12);
});
test('bounds and invalid inputs', () => {
  for (const z of [-1, 31, 0.5, NaN]) assert.throws(() => tileAt(0, 0, z), RangeError);
  for (const t of [
    { x: -1, y: 0, z: 1 },
    { x: 2, y: 0, z: 1 },
    { x: 0, y: 0.1, z: 1 },
  ])
    assert.throws(() => tileBounds(t), RangeError);
  for (const key of ['4', 'a', '0'.repeat(31)]) assert.throws(() => fromQuadkey(key), RangeError);
  assert.throws(() => tileAt(91, 0, 1), RangeError);
  assert.throws(() => tileAt(0, Infinity, 1), RangeError);
});
test('ownership and longitude periodicity', () => {
  const t = { x: 3, y: 5, z: 3 },
    copy = { ...t };
  tileBounds(t);
  toQuadkey(t);
  assert.deepEqual(t, copy);
  assert.deepEqual(tileAt(20, 400, 15), tileAt(20, 40, 15));
});
test('seeded center containment and independent base-four digit oracle', () => {
  let seed = 417;
  const random = () => (seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32;
  for (let i = 0; i < 100; i++) {
    const z = Math.floor(random() * 31),
      n = 2 ** z,
      t = { x: Math.floor(random() * n), y: Math.floor(random() * n), z },
      b = tileBounds(t);
    assert.deepEqual(tileAt((b.north + b.south) / 2, (b.west + b.east) / 2, z), t);
    let x = t.x,
      y = t.y,
      key = '';
    for (let j = 0; j < z; j++) {
      key = String((x % 2) + 2 * (y % 2)) + key;
      x = Math.floor(x / 2);
      y = Math.floor(y / 2);
    }
    assert.equal(toQuadkey(t), key);
    assert.deepEqual(fromQuadkey(key), t);
  }
});
