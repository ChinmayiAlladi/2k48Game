import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  constructor() {}

  playSound(fileName: string): void {
    const audio = new Audio();
    audio.src = `assets/sounds/${fileName}`;
    audio.load();
    audio.play().catch(error => {
      console.error('Audio playback failed:', error);
    });
  }
  
  // playSoundForTile(value: number): void {
  //   const audio = new Audio(`assets/sounds/${value}.mp3`);
  //   audio.play().catch(e => console.error(`Failed to play sound for ${value}`, e));
  // }
}
