import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { DEFAULT_GRID_SIZE } from '../../constants';
import { GridService } from '../../services/grid/grid.service';
import { ScoreService } from '../../services/score/score.service';
import { UtilService } from '../../services/util/util.service';
import { Coords2D, Grid, MoveDirection, Tile } from '../../types';

/** contains the grid for a game and controls */
@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent implements OnInit, OnDestroy {
  /** current game score */
  score: number = 0;

  /** best score value */
  best: number = 0;

  /** playing grid */
  grid: Grid = [];

  /** dummy grid to draw a background */
  gridBg: Grid = [];

  /** displayed grid, use a flat grid to enable tile animations */
  flatGrid: Tile[] = [];

  /** check if is game over */
  gameOver: boolean = false;

  /** detach window.document event */
  detachEvents: (() => void) | null = null;

  /** component constructor */
  constructor(
    private gridService: GridService,
    private changeDetectorRef: ChangeDetectorRef,
    private scoreService: ScoreService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) platformId: string,
  ) {
    if (isPlatformBrowser(platformId)) {
      this.newGame();
    }
  }

  // TODO: fix swipe control
  /** generate event listeners */
  ngOnInit(): void {
    // let touchStart: Coords2D | null = null;
    // let lastTouch: Coords2D | null = null;

    const action = (event: KeyboardEvent) => this.action(event);
    // const touchstart = (event: TouchEvent) => touchStart = this.getTouchPosition(event);
    // const touchmove = (event: TouchEvent) => lastTouch = this.getTouchPosition(event);
    // const touchend = () => this.touchend(touchStart, lastTouch);

    this.document.addEventListener('keydown', action);
    // this.document.addEventListener('touchstart', touchstart);
    // this.document.addEventListener('touchmove', touchmove);
    // this.document.addEventListener('touchend', touchend);

    this.detachEvents = () => {
      this.document.removeEventListener('keydown', action);
      // this.document.removeEventListener('touchstart', touchstart);
      // this.document.removeEventListener('touchmove', touchmove);
      // this.document.removeEventListener('touchend', touchend);
    };
  }

  /** clean up */
  ngOnDestroy(): void {
    this.detachEvents && this.detachEvents();
  }

  /** start a new game */
  newGame(): void {
    this.gridBg = this.gridService.newGrid(DEFAULT_GRID_SIZE);
    this.grid = this.gridService.addNewTile(this.gridService.addNewTile(UtilService.deepClone(this.gridBg)));
    this.flatGrid = this.gridService.flatGrid(this.grid);
    this.best = this.scoreService.getBestScore();
    this.gameOver = false;
    this.score = 0;
  }

  /** apply movement for tiles */
  move(direction: MoveDirection): void {
    if (!this.gameOver) {
      const result = this.gridService.moveTile(this.grid, direction);
      if (result.changed) {
        this.grid = result.grid;
        this.flatGrid = this.gridService.overrideFlatGrid(this.flatGrid, result.movements);
        this.scoreService.saveBestScore(result.score + this.score);
        this.changeDetectorRef.detectChanges();
        setTimeout(() => {
          this.flatGrid = this.gridService.flatGrid(this.grid);
          this.score += result.score;
          this.checkGameOver();
          this.changeDetectorRef.detectChanges();
        }, 250);
      }
    }
  }

  /** keyboard action to apply a movement */
  action(event: KeyboardEvent): void {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        event.preventDefault(); // avoid scroll with arrow keys
        this.move('up');
        break;
      case 'ArrowDown':
      case 'KeyS':
        event.preventDefault();
        this.move('down');
        break;
      case 'ArrowLeft':
      case 'KeyA':
        event.preventDefault();
        this.move('left');
        break;
      case 'ArrowRight':
      case 'KeyD':
        event.preventDefault();
        this.move('right');
        break;
    }
  }

  /** set flat grid after some time to sync animations */
  setFlatGridWithDelay(flatGrid: Tile[], time: number): void {
    setTimeout(() => {
      this.flatGrid = flatGrid;
      this.changeDetectorRef.detectChanges();
    }, time);
  }

  /** check if the game is over */
  checkGameOver(): void {
    this.gameOver = this.gridService.freeTiles(this.grid).length === 0 && !this.gridService.hasMergesAvailable(this.grid);
  }

  /** get touch position for touch event or null */
  // getTouchPosition(event: TouchEvent): Coords2D | null {
  //   return event.touches.length > 0 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  // }

  /** detect touch direction on touch end event */
  // touchend(touchStart: Coords2D | null, touchEnd: Coords2D | null): null {
  //   if (touchStart === null || touchEnd === null) return null;

  //   const diff: Coords2D = { x: touchStart.x - touchEnd.x, y: touchStart.y - touchEnd.y };

  //   if (Math.abs(diff.x) > Math.abs(diff.y)) {
  //     this.move(diff.x > 0 ? 'left' : 'right');
  //   } else {
  //     this.move(diff.y > 0 ? 'up' : 'down');
  //   }

  //   return null;
  // }
}
