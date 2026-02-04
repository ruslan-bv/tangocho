// SM-2 Spaced Repetition Algorithm
// Based on the SuperMemo 2 algorithm by Piotr Wozniak

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
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }

    newRepetitions = repetitions + 1;

    // Adjust ease factor
    // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Ease factor minimum is 1.3
    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3;
    }
  }

  // Apply bonus for Easy rating
  if (rating === 4) {
    newInterval = Math.round(newInterval * 1.3);
  }

  // Maximum interval: 365 days
  if (newInterval > 365) {
    newInterval = 365;
  }

  return {
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    interval: newInterval,
    repetitions: newRepetitions
  };
}
