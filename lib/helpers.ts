import { addDays, addWeeks, addMonths, format } from "date-fns";

export type CalendarReturn = {
  recallOne: string;
  recallTwo: string;
  recallThree: string;
  recallFour: string;
  recallFive: string;
  recallSix: string;
  recallSeven: string;
  recallEight: string;
  recallNine: string;
  recallTen: string;
}
export type Calendar = () => CalendarReturn;


/**
 * @name calendar
 * @category Calendar
 * @summary Get an active recall calendar 
 *
 * @description
 * Get an active recall calendar 
 *
 * @returns an object containing the new calendar
 * @throws {TypeError} - 0 arguments required
 *
 * @example
 * // Get a calendar since 12 March 2023:
 * const result = calendar()
 * //=> 
 * {
  recallOne: '15 March 2023',
  recallTwo: '19 March 2023',
  recallThree: '26 March 2023',
  recallFour: '09 April 2023',
  recallFive: '30 April 2023',
  recallSix: '30 May 2023',
  recallSeven: '30 July 2023',
  recallEight: '30 October 2023',
  recallNine: '29 February 2024',
  recallTen: '29 July 2024'
}
 */
export const calendar: Calendar = () => {
  const recallOne = addDays(Date.parse(Date()), 3);
  const recallTwo = addWeeks(recallOne, 1);
  const recallThree = addWeeks(recallTwo, 2);
  const recallFour = addWeeks(recallThree, 2);
  const recallFive = addWeeks(recallFour, 3);
  const recallSix = addMonths(recallFive, 1);
  const recallSeven = addMonths(recallSix, 2);
  const recallEight = addMonths(recallSeven, 3);
  const recallNine = addMonths(recallEight, 4);
  const recallTen = addMonths(recallNine, 5);

  const calendar: CalendarReturn = {
    recallOne: format(recallOne, "dd MMMM yyyy"),
    recallTwo: format(recallTwo, "dd MMMM yyyy"),
    recallThree: format(recallThree, "dd MMMM yyyy"),
    recallFour: format(recallFour, "dd MMMM yyyy"),
    recallFive: format(recallFive, "dd MMMM yyyy"),
    recallSix: format(recallSix, "dd MMMM yyyy"),
    recallSeven: format(recallSeven, "dd MMMM yyyy"),
    recallEight: format(recallEight, "dd MMMM yyyy"),
    recallNine: format(recallNine, "dd MMMM yyyy"),
    recallTen: format(recallTen, "dd MMMM yyyy"),
  };

  return calendar;
};
