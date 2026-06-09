// SM-2 Spaced Repetition Algorithm
// Based on the SuperMemo 2 algorithm by Piotr Wozniak

import { config } from '../config.js';

const { minEaseFactor, maxInterval, easyBonus, firstInterval, secondInterval } = config.srs;

interface SRSResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

/**
 * Calculate the next review interval using SM-2 algorithm
 *
 * @param easeFactor - Current ease factor (default 2.5)
 * @param interval - Current interval in days
 * @param repetitions - Number of successful repetitions
 * @param rating - User's rating (1=Again, 2=Hard, 3=Good, 4=Easy)
 * @returns Updated SRS parameters
 */
export function calculateNextReview(
  easeFactor: number,
  interval: number,
  repetitions: number,
  rating: number
): SRSResult {
  // Convert rating to quality (0-5 scale used by SM-2)
  // 1=Again -> 0, 2=Hard -> 2, 3=Good -> 3, 4=Easy -> 5
  const quality = rating === 1 ? 0 : rating === 2 ? 2 : rating === 3 ? 3 : 5;

  let newEaseFactor = easeFactor;
  let newInterval = interval;
  let newRepetitions = repetitions;

  if (quality < 3) {
    // Failed - reset repetitions, short interval
    newRepetitions = 0;
    newInterval = rating === 1 ? 0 : 1; // Again = same day, Hard = 1 day
  } else {
    // Passed - calculate new interval
    if (repetitions === 0) {
      newInterval = firstInterval;
    } else if (repetitions === 1) {
      newInterval = secondInterval;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }

    newRepetitions = repetitions + 1;
  }

  // Adjust ease factor for every review, so repeated failures lower it
  // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < minEaseFactor) {
    newEaseFactor = minEaseFactor;
  }

  // Apply bonus for Easy rating
  if (rating === 4) {
    newInterval = Math.round(newInterval * easyBonus);
  }

  if (newInterval > maxInterval) {
    newInterval = maxInterval;
  }

  return {
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    interval: newInterval,
    repetitions: newRepetitions
  };
}
