/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 *
 * Reference: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 *
 * Quality score:
 *   0 — complete blackout
 *   1 — incorrect response; the correct one remembered
 *   2 — incorrect response; correct felt easy to recall
 *   3 — correct response with serious difficulty (treated as "Hard" in UI)
 *   4 — correct response after hesitation ("Good")
 *   5 — perfect response ("Easy")
 */

export interface SM2Input {
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  repetitions: number;
  easeFactor: number;   // EF
  interval: number;     // days
}

export interface SM2Output {
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewDate: Date;
}

export function sm2(input: SM2Input): SM2Output {
  const { quality, repetitions, easeFactor, interval } = input;

  let newRepetitions = repetitions;
  let newEaseFactor  = easeFactor;
  let newInterval    = interval;

  if (quality >= 3) {
    // Correct response — advance in the sequence
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      // Round to nearest integer — fractional days have no meaning here
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect response — reset to beginning of sequence
    newRepetitions = 0;
    newInterval    = 1;
  }

  // Recalculate EF using SM-2 formula
  // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Minimum EF is 1.3 (from original SM-2 spec)
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  // Compute absolute next review date from today + interval days
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  // Normalise to start of day for predictable comparisons
  nextReviewDate.setHours(0, 0, 0, 0);

  return {
    repetitions: newRepetitions,
    easeFactor:  parseFloat(newEaseFactor.toFixed(4)),
    interval:    newInterval,
    nextReviewDate,
  };
}
