import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DEFAULT_GRID_SIZE } from '../../constants';
import { GridService } from '../../services/grid/grid.service';
import { ScoreService } from '../../services/score/score.service';
import { UtilService } from '../../services/util/util.service';
import { Coords2D, Grid, MoveDirection, Tile } from '../../types';

/** contains the grid for a game and controls in basic version */
@Component({
  selector: 'app-basic-grid',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './basic-grid.component.html',
  styleUrl: './basic-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicGridComponent implements OnInit, OnDestroy {
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

  /** check if game has started */
  gameStarted: boolean = false;

  /** detach window.document event */
  detachEvents: (() => void) | null = null;

  /** component constructor */
  constructor(
    private gridService: GridService,
    private changeDetectorRef: ChangeDetectorRef,
    private scoreService: ScoreService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) platformId: string,
  ) {
    if (isPlatformBrowser(platformId)) {
      this.initializeEmptyGrid();
    }
  }

  /** Initialize empty grid without tiles */
  initializeEmptyGrid(): void {
    this.gridBg = this.gridService.newGrid(DEFAULT_GRID_SIZE);
    this.grid = UtilService.deepClone(this.gridBg);
    this.flatGrid = [];
    this.best = this.scoreService.getBestScore(false); // Basic version
    this.gameOver = false;
    this.score = 0;
  }

  /** For tracking tiles in ngFor */
  trackById(index: number, tile: any): any {
    return tile.id;
  }

  /** Version switch handler */
  switchVersion(event: Event): void {
    event.preventDefault();
    this.router.navigateByUrl('/');
  }
    /** About Developer handler */
    goToAbout(event: Event): void {
      event.preventDefault();
      this.router.navigateByUrl('basic/about-me');
    }
  /** generate event listeners */
  ngOnInit(): void {
    const action = (event: KeyboardEvent) => this.action(event);
    this.document.addEventListener('keydown', action);

    this.detachEvents = () => {
      this.document.removeEventListener('keydown', action);
    };
  }

  /** clean up */
  ngOnDestroy(): void {
    this.detachEvents && this.detachEvents();
  }

  /** Start the game */
  startGame(): void {
    this.gameStarted = true;
    // Add initial tiles and start the game
    this.grid = this.gridService.addNewTile(this.gridService.addNewTile(UtilService.deepClone(this.gridBg)));
    this.flatGrid = this.gridService.flatGrid(this.grid);
    this.changeDetectorRef.detectChanges();
  }

  /** start a new game */
  newGame(): void {
    this.gridBg = this.gridService.newGrid(DEFAULT_GRID_SIZE);
    
    if (this.gameStarted) {
      // If game was already started, add tiles
      this.grid = this.gridService.addNewTile(this.gridService.addNewTile(UtilService.deepClone(this.gridBg)));
      this.flatGrid = this.gridService.flatGrid(this.grid);
    } else {
      // Just initialize empty grid
      this.grid = UtilService.deepClone(this.gridBg);
      this.flatGrid = [];
    }
    
    this.best = this.scoreService.getBestScore(false); // Basic version
    this.gameOver = false;
    this.score = 0;
    this.changeDetectorRef.detectChanges();
  }

  /** apply movement for tiles */
  move(direction: MoveDirection): void {
    if (!this.gameStarted || this.gameOver) {
      return;
    }
    
    const result = this.gridService.moveTile(this.grid, direction);
    if (result.changed) {
      this.grid = result.grid;
      this.flatGrid = this.gridService.overrideFlatGrid(this.flatGrid, result.movements);
      this.scoreService.saveBestScore(result.score + this.score, false); // Basic version
      this.changeDetectorRef.detectChanges();
      setTimeout(() => {
        this.flatGrid = this.gridService.flatGrid(this.grid);
        this.score += result.score;
        this.checkGameOver();
        this.changeDetectorRef.detectChanges();
      }, 250);
    }
  }

  /** keyboard action to apply a movement */
  action(event: KeyboardEvent): void {
    if (!this.gameStarted || this.gameOver) {
      return;
    }
    
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

  /** check if the game is over */
  checkGameOver(): void {
    this.gameOver = this.gridService.freeTiles(this.grid).length === 0 && !this.gridService.hasMergesAvailable(this.grid);
  }
}