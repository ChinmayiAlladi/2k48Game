import { Injectable } from '@angular/core';
import { BEST_SCORE_LS } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private readonly TS_VERSION_KEY = 'taylor-version';
  private readonly BASIC_VERSION_KEY = 'basic-version';

  /**
   * Get the best score for a specific game version
   * @param isTaylorVersion Whether to get score for Taylor's version or basic version
   */
  getBestScore(isTaylorVersion: boolean = true): number {
    if (typeof window !== 'undefined') {
      const versionKey = isTaylorVersion ? this.TS_VERSION_KEY : this.BASIC_VERSION_KEY;
      const key = `${BEST_SCORE_LS}-${versionKey}`;
      
      const data = Number(window.localStorage.getItem(key));
      if (!isNaN(data)) {
        return data;
      }
      
      // For backward compatibility, check the old key if no version-specific score exists
      if (isTaylorVersion) {
        const oldData = Number(window.localStorage.getItem(BEST_SCORE_LS));
        if (!isNaN(oldData)) {
          return oldData;
        }
      }
    }
    return 0;
  }

  /**
   * Save the best score for a specific game version
   * @param score Current score
   * @param isTaylorVersion Whether to save score for Taylor's version or basic version
   */
  saveBestScore(score: number, isTaylorVersion: boolean = true): void {
    if (typeof window !== 'undefined') {
      const versionKey = isTaylorVersion ? this.TS_VERSION_KEY : this.BASIC_VERSION_KEY;
      const key = `${BEST_SCORE_LS}-${versionKey}`;
      
      if (this.getBestScore(isTaylorVersion) < score) {
        window.localStorage.setItem(key, score.toString());
        
        // For backward compatibility, also update the old key for Taylor's version
        if (isTaylorVersion) {
          window.localStorage.setItem(BEST_SCORE_LS, score.toString());
        }
      }
    }
  }
}