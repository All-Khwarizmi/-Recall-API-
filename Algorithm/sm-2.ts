import { z } from "zod";

const sm2InputZodSchema = z.object({
  interval: z.number(),
  repetitions: z.number(),
  easeFactor: z.number().min(1.3),
  quality: z.number().min(1).max(5),
});
const sm2OutputZodSchema = z.object({
  interval: z.number(),
  repetitions: z.number(),
  easeFactor: z.number(),
});
type Sm2ReturnType = z.infer<typeof sm2OutputZodSchema>;
type Sm2 = (
  interval: number,
  repetitions: number,
  easeFactor: number,
  quality: number
) => Sm2ReturnType;
/* *
 * The algorithm returns three outputs: interval, repetitions, and ease factor.
 * All three values should be saved and passed to the next call to SM-2 as inputs.
 *
 * Interval (integer)
 *
 * An integer number indicating the number of days to wait before the next review.
 *
 * Repetitions (integer)
 *
 * The number of times the information has been reviewed as of this review. repetitions should equal zero for the first review.
 *
 * This value is maintained between calls to the algorithm and used for calculating interval. * The number increments after each successful review. SM-2 will reset repetitions to zero if * quality is less than 3.
 *
 * Ease factor
 *
 * A floating point number (≥ 1.3) which is adjusted up or down based on how easily the information was remembered.
 *
 * This value is maintained between calls to the algorithm and is used for calculating interval.
 *
 *
 */
export const sm2: Sm2 = (quality, interval, repetitions, easeFactor) => {
  // Let's check if the data is ok. If not return the same input values
  const parsedData = sm2InputZodSchema.safeParse({
    quality,
    interval,
    repetitions,
    easeFactor,
  });
  if (!parsedData.success) return { interval, repetitions, easeFactor };

  // Let's make it a pure function and copy the values to new variables and at the end making it back to the same variables name into an new object
  let newInterval = interval;
  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;


  // Rest of the algo logic
  // Case 1: correct answer
  if (quality >= 3) {
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.floor(interval * easeFactor);
    }

    // Increment repetitions
    newRepetitions += 1;

  } else {
    // Case 2: incorrect answer
    newRepetitions = 0;
    newInterval = 1;
  }

  // Calculate new ease factor
  newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  let newReturnValuesObj: Sm2ReturnType = {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
  };
  return newReturnValuesObj;
};

const interval = 0;
const repetitions = 0;
const easeFactor = 2.5;
const quality = 0;

const sm2Test = sm2(quality, interval, repetitions, easeFactor);
console.log(sm2Test);
