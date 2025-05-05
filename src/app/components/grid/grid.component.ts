import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DEFAULT_GRID_SIZE } from '../../constants';
import { GridService } from '../../services/grid/grid.service';
import { ScoreService } from '../../services/score/score.service';
import { UtilService } from '../../services/util/util.service';
import { Coords2D, Grid, MoveDirection, Tile } from '../../types';
import { SoundService } from '../../services/sound/sound.service';

/** contains the grid for a game and controls */
@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent implements OnInit, OnDestroy {
  imageList = [2,4,8,16,32,64,128,256,512,1024,2048,4096];
  trackById(index: number, tile: any): any {
    return tile.id;
  }

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
    private soundService: SoundService,
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
    this.best = this.scoreService.getBestScore(true); // Taylor's version
    this.gameOver = false;
    this.score = 0;
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

  /** Version switch handler */
  switchVersion(event: Event): void {
    event.preventDefault();
    this.router.navigateByUrl('/basic');
  }
  /** About Developer handler */
  goToAbout(event: Event): void {
    event.preventDefault();
    this.router.navigateByUrl('/about');
  }
  /** Start the game */
  startGame(): void {
    this.soundService.playSound('intro.mp3');
    // Make sure we reset tile tracking when starting a new game
    this.soundService.resetAppearedTiles();
    this.gameStarted = true;
    // Add initial tiles and start the game
    this.grid = this.gridService.addNewTile(this.gridService.addNewTile(UtilService.deepClone(this.gridBg)));
    this.flatGrid = this.gridService.flatGrid(this.grid);
    this.changeDetectorRef.detectChanges();
  }

  /** start a new game */
  newGame(): void {
    this.soundService.playSound('intro.mp3');
    // Always reset the tracked tiles when starting a new game
    this.soundService.resetAppearedTiles();
    
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
    
    this.best = this.scoreService.getBestScore(true); // Taylor's version
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
      this.scoreService.saveBestScore(result.score + this.score, true); // Taylor's version
      
      // Check for new tile values that appeared from merges
      // Important: Do this after updating the grid but before changing the view
      this.checkForNewTileValues();
      
      this.changeDetectorRef.detectChanges();
      
      setTimeout(() => {
        this.flatGrid = this.gridService.flatGrid(this.grid);
        this.score += result.score;
        this.checkGameOver();
        this.changeDetectorRef.detectChanges();
      }, 250);
    }
  }

  /**
   * Check the grid for new tile values that have appeared
   * and play sounds for first appearances
   */
  private checkForNewTileValues(): void {
    // Create a flat array of all tiles for easier processing
    const allTiles = this.grid.flat().filter(tile => tile !== null);
    
    // Check each tile value to see if it's the first appearance
    for (const tile of allTiles) {
      if (tile && tile.value >= 4) { // We only have sounds for 4 and up
        // This will only play the sound if it's the first appearance
        this.soundService.playFirstAppearanceSound(tile.value);
      }
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
}