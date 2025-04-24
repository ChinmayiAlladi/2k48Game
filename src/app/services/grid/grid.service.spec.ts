import { TestBed } from '@angular/core/testing';

import { GridService } from './grid.service';
import { Tile } from '../../types';

type MockTile = {
  x: number,
  y: number,
  i: string, // id
  v: number, // value
  m: [Tile, Tile] | null, // mergedFrom
  n: boolean, // isNew
};

// mock tile generator
const t = (value: Partial<MockTile>): Tile => {
  return {
    x: value.x || 0,
    y: value.y || 0,
    id: value.i || 'id',
    value: value.v || 2,
    mergedFrom: value.m || null,
    isNew: value.n || false,
  };
};

describe('GridService', () => {
  let service: GridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a random element from array', () => {
    expect(service.getRandom([1])).toBe(1);
    expect([1, 2, 3].indexOf(service.getRandom([1, 2, 3]))).toBeGreaterThan(-1);
  });

  it('should clear merge and movement information of tiles', () => {
    expect(service.clearMoveInformation([[null, null], [null, null]])).toEqual([[null, null], [null, null]]);
    expect(service.clearMoveInformation([[null, null, t({ m: 1, n: true } as any)], [null, null, null], [null, null, null]]))
      .toEqual([[null, null, t({})], [null, null, null], [null, null, null]]);
  });

  it('should return vector direction', () => {
    expect(service.getVectorDirection('down')).toEqual({ x: 0, y: 1 });
    expect(service.getVectorDirection('left')).toEqual({ x: -1, y: 0 });
    expect(service.getVectorDirection('right')).toEqual({ x: 1, y: 0 });
    expect(service.getVectorDirection('up')).toEqual({ x: 0, y: -1 });
  });

  it('should check if coords are in bounds', () => {
    expect(service.withinBounds({ x: -1, y: 0 }, 2)).toBeFalse();
    expect(service.withinBounds({ x: 0, y: 0 }, 2)).toBeTrue();
    expect(service.withinBounds({ x: 0, y: -1 }, 2)).toBeFalse();
    expect(service.withinBounds({ x: 3, y: 0 }, 2)).toBeFalse();
    expect(service.withinBounds({ x: 1, y: 0 }, 2)).toBeTrue();
    expect(service.withinBounds({ x: 1, y: 2 }, 2)).toBeFalse();
  });

  it('should build traversals', () => {
    // down
    expect(service.buildTraversals({ x: 0, y: 1 }, 1)).toEqual({ x: [0], y: [0] });
    expect(service.buildTraversals({ x: 0, y: 1 }, 2)).toEqual({ x: [0, 1], y: [1, 0] });
    expect(service.buildTraversals({ x: 0, y: 1 }, 3)).toEqual({ x: [0, 1, 2], y: [2, 1, 0] });
    expect(service.buildTraversals({ x: 0, y: 1 }, 4)).toEqual({ x: [0, 1, 2, 3], y: [3, 2, 1, 0] });

    // left
    expect(service.buildTraversals({ x: -1, y: 0 }, 1)).toEqual({ x: [0], y: [0] });
    expect(service.buildTraversals({ x: -1, y: 0 }, 2)).toEqual({ x: [0, 1], y: [0, 1] });
    expect(service.buildTraversals({ x: -1, y: 0 }, 3)).toEqual({ x: [0, 1, 2], y: [0, 1, 2] });
    expect(service.buildTraversals({ x: -1, y: 0 }, 4)).toEqual({ x: [0, 1, 2, 3], y: [0, 1, 2, 3] });

    // right
    expect(service.buildTraversals({ x: 1, y: 0 }, 1)).toEqual({ x: [0], y: [0] });
    expect(service.buildTraversals({ x: 1, y: 0 }, 2)).toEqual({ x: [1, 0], y: [0, 1] });
    expect(service.buildTraversals({ x: 1, y: 0 }, 3)).toEqual({ x: [2, 1, 0], y: [0, 1, 2] });
    expect(service.buildTraversals({ x: 1, y: 0 }, 4)).toEqual({ x: [3, 2, 1, 0], y: [0, 1, 2, 3] });

    // up
    expect(service.buildTraversals({ x: 0, y: -1 }, 1)).toEqual({ x: [0], y: [0] });
    expect(service.buildTraversals({ x: 0, y: -1 }, 2)).toEqual({ x: [0, 1], y: [0, 1] });
    expect(service.buildTraversals({ x: 0, y: -1 }, 3)).toEqual({ x: [0, 1, 2], y: [0, 1, 2] });
    expect(service.buildTraversals({ x: 0, y: -1 }, 4)).toEqual({ x: [0, 1, 2, 3], y: [0, 1, 2, 3] });
  });

  it('should check if grid has merges available', () => {
    expect(service.hasMergesAvailable([])).toBeFalse();
    expect(service.hasMergesAvailable([[], []])).toBeFalse();
    expect(service.hasMergesAvailable([[null, null], [null, null]])).toBeFalse();
    expect(service.hasMergesAvailable([[null, t({ v: 1 })], [t({ v: 2 }), null]])).toBeFalse();
    expect(service.hasMergesAvailable([[null, t({ v: 1 })], [t({ v: 1 }), null]])).toBeFalse();
    expect(service.hasMergesAvailable([[null, t({ v: 1 })], [null, t({ v: 1 })]])).toBeTrue();
    expect(service.hasMergesAvailable([[null, t({ v: 1 })], [null, t({ v: 2 })]])).toBeFalse();
    expect(service.hasMergesAvailable([[t({ v: 1 }), t({ v: 1 })], [null, t({ v: 2 })]])).toBeTrue();
  });

  it('should apply tile movements', () => {
    let grid = [[null, null, null, null], [null, null, { "x": 1, "y": 2, "id": "d378a015-3325-4d11-a34a-a436515c7dc6", "value": 2, "isNew": true }, null], [null, null, { "x": 2, "y": 2, "id": "14c2844a-31e3-46fb-9343-936f5b03a685", "value": 4, "isNew": true }, null], [null, null, null, null]];
    let expected = { "grid": [[null, null, null, null], [null, null, null, null], [{ "x": 2, "y": 0, "id": "06e4b50b-999e-4517-8b9f-bb8efa85bfd3", "value": 4, "isNew": true }, null, { "x": 2, "y": 2, "id": "d378a015-3325-4d11-a34a-a436515c7dc6", "value": 2, "isNew": false, "mergedFrom": null }, null], [null, null, { "x": 3, "y": 2, "id": "14c2844a-31e3-46fb-9343-936f5b03a685", "value": 4, "isNew": false, "mergedFrom": null }, null]], "movements": [{ "x": 3, "y": 2, "id": "14c2844a-31e3-46fb-9343-936f5b03a685", "value": 4, "isNew": false, "mergedFrom": null }, { "x": 2, "y": 2, "id": "d378a015-3325-4d11-a34a-a436515c7dc6", "value": 2, "isNew": false, "mergedFrom": null }], "changed": true, "score": 0 };
    let result = service.moveTile(grid, 'right');
    expect(result.changed).toEqual(true);
    expect(result.score).toBe(0);

    expect(result.grid[1][2]).toEqual(expected.grid[2][3]);
    expect(result.grid[3][2]).toEqual(expected.grid[3][2]);
  });
});
