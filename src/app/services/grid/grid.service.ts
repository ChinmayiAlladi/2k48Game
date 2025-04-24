import { Injectable } from '@angular/core';
import { DEFAULT_NEW_TILE } from '../../constants';
import { Coords2D, Grid, GridTile, MoveDirection, Tile, Traversals } from '../../types';
import { UtilService } from '../util/util.service';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  /** generate a new empty grid */
  newGrid(size: number): Grid {
    const grid: Grid = [];
    for (let x = 0; x < size; x++) {
      const row: GridTile[] = [];
      for (let y = 0; y < size; y++) {
        row.push(null);
      }
      grid.push(row);
    }
    return grid;
  }

  /** add a new tile in a random empty space */
  addNewTile(grid: Grid): Grid {
    const freeTiles = this.freeTiles(grid);
    if (freeTiles.length > 0) {
      const tile = this.getRandom(freeTiles);
      grid[tile.x][tile.y] = {
        ...tile,
        id: UtilService.id(),
        value: this.getRandom(DEFAULT_NEW_TILE),
        isNew: true,
      };
    }
    return grid;
  }

  /** returns a random element in array */
  getRandom<T>(arr: T[]): T {
    const length = arr.length;
    if (length <= 1) return arr[0];

    return arr[Math.floor(Math.random() * length)];
  }

  /** get free tiles of the grid */
  freeTiles(grid: Grid): Coords2D[] {
    const emptyTiles: Coords2D[] = [];
    this.forTiles(grid, (x, y, tile) => {
      if (tile === null) {
        emptyTiles.push({ x, y });
      }
    })
    return emptyTiles;
  }

  /** apply a function for every tile in grid */
  forTiles(grid: Grid, cb: (x: number, y: number, tile: GridTile) => void): void {
    const gridSize = grid.length; // grids should always be squares
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        cb(x, y, grid[x][y]);
      }
    }
  }

  /** move all tiles in a grid, and merge tiles with same value, also generate a score value of the movement */
  moveTile(grid: Grid, direction: MoveDirection): { grid: Grid, movements: Tile[], changed: boolean, score: number } {
    let moved: boolean = false;
    let changed: boolean = false;
    let score: number = 0;
    const gridSize = grid.length;
    const vector = this.getVectorDirection(direction);
    const traversals = this.buildTraversals(vector, gridSize);
    const movements: Tile[] = [];

    grid = this.clearMoveInformation(grid);

    traversals.x.forEach(x => {
      traversals.y.forEach(y => {
        const coords: Coords2D = { x, y };
        const tile = grid[coords.x][coords.y];
        if (tile) {
          const positions = this.findFarthestPosition(coords, vector, grid);

          // Only one merger per row traversal?
          if (positions.next && positions.next.value === tile.value && !positions.next.mergedFrom) {
            const merged: Tile = {
              ...positions.next,
              id: UtilService.id(),
              value: tile.value * 2,
              isNew: true,
              mergedFrom: [tile, positions.next],
            };

            grid[tile.x][tile.y] = null;
            grid[merged.x][merged.y] = merged;
            tile.x = positions.next.x;
            tile.y = positions.next.y;
            movements.push(positions.next);

            score += merged.value;
          } else { // move tile
            grid[tile.x][tile.y] = null;
            tile.x = positions.farthest.x;
            tile.y = positions.farthest.y;
            grid[tile.x][tile.y] = tile;
          }

          movements.push(tile);

          if (coords.x !== tile.x || coords.y !== tile.y) {
            moved = true;
          }
        }
      });
    });

    if (moved) {
      grid = this.addNewTile(grid);
      changed = true;
    }

    return { grid, movements, changed, score };
  }

  /** clear last move information of tiles, this is useful for animatons */
  clearMoveInformation(grid: Grid): Grid {
    const size = grid.length;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (grid[x][y]) {
          grid[x][y]!.mergedFrom = null;
          grid[x][y]!.isNew = false;
        }
      }
    }
    return grid;
  }

  /** generate a vector value for every direction to apply tile movements */
  getVectorDirection(direction: MoveDirection): Coords2D {
    switch (direction) {
      case 'down': return { x: 0, y: 1 };
      case 'left': return { x: -1, y: 0 };
      case 'right': return { x: 1, y: 0 };
      case 'up': return { x: 0, y: -1 };
    }
  }

  /** get farthest available position for tile movement */
  findFarthestPosition(coords: Coords2D, vector: Coords2D, grid: Grid): { farthest: Coords2D, next: GridTile } {
    const gridSize = grid.length;
    let previous: Coords2D;

    // Progress towards the vector direction until an obstacle is found
    do {
      previous = coords;
      coords = { x: previous.x + vector.x, y: previous.y + vector.y };

    } while (this.withinBounds(coords, gridSize) && grid[coords.x][coords.y] === null);

    return {
      farthest: previous,
      next: this.withinBounds(coords, gridSize) ? grid[coords.x][coords.y] : null,
    };
  }

  /** check if position is in bounds of the grid */
  withinBounds(position: Coords2D, size: number): boolean {
    return position.x >= 0 && position.x < size && position.y >= 0 && position.y < size;
  }

  /** genearte positions to iterate grid */
  buildTraversals(vector: Coords2D, size: number): Traversals {
    const traversals: Traversals = { x: [], y: [] };

    for (let pos = 0; pos < size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
  }

  /** generate a flat grid, this is only used in view */
  flatGrid(grid: Grid): Tile[] {
    const tiles: Tile[] = [];
    const size = grid.length;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        grid[x][y] && tiles.push(grid[x][y]!);
      }
    }
    return tiles;
  }

  /** override current tiles of a flat grid, this is used to make right animations */
  overrideFlatGrid(old: Tile[], current: Tile[]): Tile[] {
    const oldLength = old.length;
    for (let x = 0; x < oldLength; x++) {
      const tile = current.find(t => t.id === old[x].id);
      if (tile) {
        old[x].x = tile.x;
        old[x].y = tile.y;
      }
    }
    return old;
  }

  /** check if there is any valid merge in current grid */
  hasMergesAvailable(grid: Grid): boolean {
    const size = grid.length;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const tile = grid[x][y];
        if (tile) {
          const directions: MoveDirection[] = ['up', 'left', 'down', 'right'];
          for (let z = 0; z < 4; z++) {
            const vector = this.getVectorDirection(directions[z]);
            if (grid[x + vector.x]) {
              const other = grid[x + vector.x][y + vector.y];

              if (other && other.value === tile.value) {
                return true; // These two tiles can be merged
              }
            }
          }
        }
      }
    }
    return false;
  }
}
