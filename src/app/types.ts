/** point in a 2d space */
export type Coords2D = {
    x: number;
    y: number;
};

/** tile value */
export interface Tile extends Coords2D {
    id: string;
    value: number;
    mergedFrom?: [Tile, Tile] | null;
    isNew: boolean;
};

/** movement of tiles */
export type MoveDirection = 'up' | 'down' | 'left' | 'right';

/** tile value of grid */
export type GridTile = Tile | null;

/** logic grid to make calculations */
export type Grid = GridTile[][];

/** directions to make movements of tiles */
export type Traversals = {
    x: number[],
    y: number[],
};
