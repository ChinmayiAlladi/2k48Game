import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  // Track which tile values have already appeared
  private appearedTileValues = new Set<number>();

  constructor() {}

  playSound(fileName: string): void {
    const audio = new Audio();
    audio.src = `assets/sounds/${fileName}`;
    audio.load();
    audio.play().catch(error => {
      console.error('Audio playback failed:', error);
    });
  }
  
  /**
   * Plays a sound for a specific tile value only if it's the first appearance
   * @param value The tile value (4, 8, 16, etc.)
   * @returns boolean indicating if the sound was played (first appearance)
   */
  playFirstAppearanceSound(value: number): boolean {
    // Check if this tile value has already appeared
    if (this.appearedTileValues.has(value)) {
      return false; // Already appeared before, don't play sound
    }
    
    // Mark this value as appeared
    this.appearedTileValues.add(value);
    
    // Play the corresponding sound file
    this.playSound(`${value}.mp3`);
    return true;
  }

  /**
   * Reset the tracking of appeared tile values (for new game)
   */
  resetAppearedTiles(): void {
    console.log('Resetting appeared tiles');
    this.appearedTileValues.clear();
  }
}